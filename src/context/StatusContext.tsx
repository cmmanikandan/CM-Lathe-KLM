import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StatusStory, HomeBanner } from '../types';
import { supabase } from '../services/supabase';
import {
  fetchActiveStories,
  fetchHeroBanners,
  insertHeroBanner,
  deleteHeroBanner,
  insertStory,
  deleteStoryById,
  saveStoryToLocal,
  deleteStoryFromLocal,
  HeroBanner,
} from '../services/supabaseService';

interface StatusContextType {
  stories: StatusStory[];
  activeStories: StatusStory[];
  banners: HomeBanner[];
  loading: boolean;
  addStory: (mediaUrl: string, mediaType: 'image' | 'video', title: string, tag: StatusStory['tag'], subtitle?: string) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  incrementSeenCount: (id: string) => void;
  addBanner: (title: string, subtitle: string, tag: string, image: string, linkUrl?: string) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  refreshBanners: () => Promise<void>;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stories, setStories] = useState<StatusStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<HomeBanner[]>([]);

  // Refresh banners from Supabase / localStorage persistence
  const refreshBanners = useCallback(async () => {
    try {
      const heroList = await fetchHeroBanners();
      setBanners(
        heroList.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          tag: b.tag,
          image: b.image,
          linkUrl: b.ctaLink,
          createdAt: b.createdAt,
        }))
      );
    } catch (e) {
      console.error('Failed to load hero banners in StatusContext:', e);
    }
  }, []);

  useEffect(() => {
    refreshBanners();
  }, [refreshBanners]);

  const addBanner = async (title: string, subtitle: string, tag: string, image: string, linkUrl?: string) => {
    const newB: HeroBanner = {
      id: 'banner-' + Date.now(),
      title,
      subtitle,
      tag,
      image,
      ctaLink: linkUrl,
      isActive: true,
      displayOrder: banners.length + 1,
      createdAt: new Date().toISOString(),
    };
    await insertHeroBanner(newB);
    await refreshBanners();
  };

  const deleteBanner = async (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    await deleteHeroBanner(id);
    await refreshBanners();
  };

  const refreshStories = useCallback(async () => {
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
    refreshStories();
    const channel = supabase
      .channel('stories-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'status_stories' }, () => refreshStories())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshStories]);

  const activeStories = stories.filter((s) => new Date(s.expiresAt).getTime() > Date.now());

  const incrementSeenCount = (id: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, seenCount: (s.seenCount || 0) + 1 } : s))
    );
  };

  const addStory = async (
    mediaUrl: string,
    mediaType: 'image' | 'video',
    title: string,
    tag: StatusStory['tag'],
    subtitle?: string
  ) => {
    const newStory: StatusStory = {
      id: 'story-' + Date.now(),
      mediaUrl,
      mediaType,
      title,
      tag,
      subtitle,
      seenCount: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    saveStoryToLocal(newStory);
    setStories((prev) => [newStory, ...prev]);
    try {
      await insertStory(newStory);
    } catch (e) {}
    await refreshStories();
  };

  const deleteStory = async (id: string) => {
    deleteStoryFromLocal(id);
    setStories((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteStoryById(id);
    } catch (e) {}
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
        deleteBanner,
        refreshBanners,
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
