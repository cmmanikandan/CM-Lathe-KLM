import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StatusStory, HomeBanner } from '../types';
import { supabase } from '../services/supabase';
import { fetchActiveStories, insertStory, deleteStoryById } from '../services/supabaseService';

const defaultBanners: HomeBanner[] = [
  {
    id: 'b-1',
    title: 'TRACTOR KALAPPAI & CULTIVATORS',
    subtitle: 'Forged lathe-machined tines engineered for heavy agricultural soil.',
    tag: 'AGRICULTURAL MACHINERY',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'b-2',
    title: 'STAINLESS STEEL & MS MAIN GATES',
    subtitle: 'Custom architectural gates crafted with laser cut panels & heavy duty bearings.',
    tag: 'MAIN SAFETY GATES',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'b-3',
    title: 'PRECISION LATHE MACHINE WORKS',
    subtitle: 'Expert lathe turning, shaft grinding & machine repairs in Kallimandhayam.',
    tag: 'LATHE TURNING WORKS',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80'
  }
];

interface StatusContextType {
  stories: StatusStory[];
  activeStories: StatusStory[];
  banners: HomeBanner[];
  loading: boolean;
  addStory: (mediaUrl: string, mediaType: 'image' | 'video', title: string, tag: StatusStory['tag'], subtitle?: string) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  incrementSeenCount: (id: string) => void;
  addBanner: (title: string, subtitle: string, tag: string, image: string, linkUrl?: string) => void;
  deleteBanner: (id: string) => void;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stories, setStories] = useState<StatusStory[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Banners state stored in localStorage
  const [banners, setBanners] = useState<HomeBanner[]>(() => {
    try {
      const saved = localStorage.getItem('ml_home_banners');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultBanners;
  });

  useEffect(() => {
    localStorage.setItem('ml_home_banners', JSON.stringify(banners));
  }, [banners]);

  const addBanner = (title: string, subtitle: string, tag: string, image: string, linkUrl?: string) => {
    const newBanner: HomeBanner = {
      id: 'b-' + Date.now(),
      title,
      subtitle,
      tag,
      image,
      linkUrl,
      createdAt: new Date().toISOString()
    };
    setBanners((prev) => [newBanner, ...prev]);
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchActiveStories();
      setStories(data);
    } catch (err) {
      console.error('StatusContext fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel('stories-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'status_stories' }, () => refresh())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  const activeStories = stories.filter((s) => new Date(s.expiresAt).getTime() > Date.now());

  const addStory = async (
    mediaUrl: string, mediaType: 'image' | 'video', title: string,
    tag: StatusStory['tag'], subtitle?: string
  ) => {
    const now = new Date();
    const story: StatusStory = {
      id: 'st-' + Date.now(), mediaUrl, mediaType, title, subtitle, tag,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      seenCount: 0,
    };
    await insertStory(story);
    await refresh();
  };

  const deleteStory = async (id: string) => {
    await deleteStoryById(id);
    setStories((prev) => prev.filter((s) => s.id !== id));
  };

  const incrementSeenCount = (id: string) => {
    setStories((prev) => prev.map((s) => s.id === id ? { ...s, seenCount: s.seenCount + 1 } : s));
    supabase.from('status_stories').select('seen_count').eq('id', id).single().then(({ data }) => {
      if (data) {
        supabase.from('status_stories').update({ seen_count: (data.seen_count as number) + 1 }).eq('id', id);
      }
    });
  };

  return (
    <StatusContext.Provider
      value={{
        stories,
        activeStories,
        banners,
        loading,
        addStory,
        deleteStory,
        incrementSeenCount,
        addBanner,
        deleteBanner
      }}
    >
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => {
  const ctx = useContext(StatusContext);
  if (!ctx) throw new Error('useStatus must be used within StatusProvider');
  return ctx;
};
