import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatus } from '../../context/StatusContext';
import { StatusStoryViewer } from '../../components/common/StatusStoryViewer';
import {
  Flame,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Phone,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Tag,
  Filter,
  Search,
  Wrench,
  Package,
  ImageIcon
} from 'lucide-react';

export const CustomerStatusPage: React.FC = () => {
  const { activeStories, incrementSeenCount } = useStatus();
  const navigate = useNavigate();

  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [userLikedMap, setUserLikedMap] = useState<Record<string, boolean>>({});

  const toggleLike = (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    setUserLikedMap((prev) => {
      const currentlyLiked = prev[storyId];
      const newLikedState = !currentlyLiked;
      setLikesMap((prevLikes) => ({
        ...prevLikes,
        [storyId]: (prevLikes[storyId] || 0) + (newLikedState ? 1 : -1)
      }));
      return { ...prev, [storyId]: newLikedState };
    });
  };

  const handleShare = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Story link copied!');
    }
  };

  const tags = ['All', 'Work Progress', 'Completed Orders', 'New Products', 'Offers', 'Announcements'];

  const filteredFeedStories = activeStories.filter((s) => {
    if (selectedTag === 'All') return true;
    return s.tag.toLowerCase().includes(selectedTag.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased pb-24 space-y-6">
      
      {/* 1. STICKY GLASS HEADER */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/80 sticky top-[64px] z-30 px-4 sm:px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-orange-100 text-[#F97316]">
                <Flame size={18} className="animate-pulse" />
              </span>
              <h1 className="font-heading font-black text-xl sm:text-2xl text-[#111111]">WORKSHOP STORIES</h1>
              <span className="bg-[#F97316] text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-full uppercase">
                Live 24h
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Live workshop progress, completed lathe projects, special offers & announcements</p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-extrabold shrink-0 transition-all ${
                  selectedTag === tag
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 2. TOP STORY CIRCLES ROW (WHATSAPP / INSTAGRAM STYLE) */}
        <div className="bg-white p-4 rounded-[26px] border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-black text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#F97316]" /> Recent Workshop Stories
            </h3>
            <span className="text-[11px] font-mono text-gray-400">Tap to view full-screen</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
            {activeStories.map((story, idx) => (
              <div
                key={story.id}
                onClick={() => {
                  setActiveStoryIndex(idx);
                  incrementSeenCount(story.id);
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group select-none"
              >
                {/* 80x80 Gradient Ring Circle */}
                <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#F97316] via-amber-500 to-[#111111] shadow-md group-hover:scale-105 transition-transform duration-300 relative">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-gray-100 relative">
                    <img
                      src={story.mediaUrl}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 bg-[#F97316] text-white text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border border-white">
                    24h
                  </span>
                </div>

                <span className="text-[11px] font-heading font-bold text-[#111111] max-w-[80px] truncate text-center group-hover:text-[#F97316] transition-colors">
                  {story.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. RECENT UPDATES CONTENT FEED (16:9 MEDIA CARDS) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-black text-base uppercase text-[#111111] flex items-center gap-2">
              <Clock size={18} className="text-[#F97316]" /> RECENT WORKSHOP UPDATES FEED
            </h2>
            <span className="text-xs font-mono text-gray-500">Showing {filteredFeedStories.length} Updates</span>
          </div>

          {filteredFeedStories.length === 0 ? (
            <div className="bg-white rounded-[22px] p-12 text-center border border-gray-200 shadow-xs space-y-3">
              <Flame size={48} className="mx-auto text-gray-300" />
              <h3 className="font-heading font-black text-lg text-[#111111]">No Stories Matching Tag</h3>
              <p className="text-xs text-gray-500">Try selecting 'All' from top category filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeedStories.map((story, idx) => {
                const isLiked = userLikedMap[story.id];
                const likesCount = likesMap[story.id] || (12 + idx * 3);
                return (
                  <div
                    key={story.id}
                    onClick={() => {
                      setActiveStoryIndex(idx);
                      incrementSeenCount(story.id);
                    }}
                    className="bg-white rounded-[24px] border border-gray-200 overflow-hidden shadow-xs hover:border-[#F97316] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* 16:9 Aspect Ratio Media Container */}
                      <div className="aspect-video bg-gray-100 overflow-hidden relative">
                        <img
                          src={story.mediaUrl}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-heading font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {story.tag}
                        </span>
                        <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Eye size={12} className="text-[#F97316]" /> {story.seenCount} views
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-2">
                        <h3 className="font-heading font-black text-base text-[#111111] group-hover:text-[#F97316] transition-colors leading-tight">
                          {story.title}
                        </h3>
                        {story.subtitle && (
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {story.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Actions & Social Footer */}
                    <div className="p-4 pt-0 space-y-3 border-t border-gray-100 mt-2">
                      <div className="flex items-center justify-between pt-2 text-xs">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => toggleLike(e, story.id)}
                            className="flex items-center gap-1 text-gray-600 hover:text-red-500 font-mono text-xs font-bold transition-colors"
                          >
                            <Heart size={16} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                            <span>{likesCount}</span>
                          </button>

                          <button
                            onClick={(e) => handleShare(e, story.title)}
                            className="flex items-center gap-1 text-gray-500 hover:text-black font-mono text-xs transition-colors"
                          >
                            <Share2 size={16} />
                            <span>Share</span>
                          </button>
                        </div>

                        <span className="text-[10px] font-mono text-gray-400">
                          {new Date(story.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>

                      {/* Quick Action Links */}
                      <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                        <a
                          href="https://wa.me/919659286268"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-[11px] font-heading font-black py-2 rounded-xl flex items-center justify-center gap-1 shadow-xs"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>

                        <button
                          onClick={() => navigate('/customer/gallery')}
                          className="bg-[#111111] hover:bg-[#F97316] text-white text-[11px] font-heading font-black py-2 rounded-xl flex items-center justify-center gap-1 shadow-xs transition-colors"
                        >
                          <ImageIcon size={14} /> View Gallery
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* 4. FULL-SCREEN STORY VIEWER MODAL */}
      {activeStoryIndex !== null && (
        <StatusStoryViewer
          stories={activeStories}
          initialIndex={activeStoryIndex}
          isOpen={true}
          onClose={() => setActiveStoryIndex(null)}
          onStorySeen={incrementSeenCount}
        />
      )}

    </div>
  );
};
