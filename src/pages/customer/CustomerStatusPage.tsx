import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatus } from '../../context/StatusContext';
import { StatusStoryViewer } from '../../components/common/StatusStoryViewer';
import { ImageViewerModal } from '../../components/common/ImageViewerModal';
import { fetchGallery } from '../../services/supabaseService';
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
  SlidersHorizontal,
  Wrench,
  Package,
  ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Maximize2
} from 'lucide-react';

export const CustomerStatusPage: React.FC = () => {
  const { activeStories, incrementSeenCount } = useStatus();
  const navigate = useNavigate();

  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [userLikedMap, setUserLikedMap] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

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

  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const [activeFolderItem, setActiveFolderItem] = useState<any | null>(null);
  const [folderPhotoIndex, setFolderPhotoIndex] = useState(0);

  const folderPushedRef = React.useRef(false);

  useEffect(() => {
    if (!activeFolderItem) {
      folderPushedRef.current = false;
      return;
    }

    if (!folderPushedRef.current) {
      window.history.pushState({ modalType: 'folderAlbum' }, '');
      folderPushedRef.current = true;
    }

    const handlePopState = () => {
      folderPushedRef.current = false;
      setActiveFolderItem(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeFolderItem]);

  const handleCloseFolder = () => {
    if (folderPushedRef.current) {
      folderPushedRef.current = false;
      window.history.back();
    } else {
      setActiveFolderItem(null);
    }
  };

  const categories = [
    'All',
    'Kalappai',
    'Steel Gates',
    'Lathe Works',
    'Windows Grill',
    'Steel Doors',
    'Machine Works',
    'New Installations'
  ];

  useEffect(() => {
    fetchGallery().then((items) => {
      if (items && items.length > 0) {
        setGalleryItems(
          items.map((i) => ({
            id: i.id,
            title: i.title,
            category: i.category,
            mediaUrl: i.mediaUrl,
            images: (i as any).images || [i.mediaUrl],
            isFolder: (i as any).isFolder || ((i as any).images && (i as any).images.length > 1) || false,
            date: i.createdAt ? i.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          }))
        );
      } else {
        setGalleryItems([]);
      }
      setGalleryLoading(false);
    });
  }, []);

  const filteredGallery = galleryItems.filter(
    (item) => selectedTag === 'All' || item.category === selectedTag
  );

  const galleryImageUrls = filteredGallery.map((g) => g.mediaUrl);

  const handleCardClick = (item: any, idx: number) => {
    if (item.isFolder && item.images && item.images.length > 1) {
      setActiveFolderItem(item);
      setFolderPhotoIndex(0);
    } else {
      setViewerIndex(idx);
      setViewerOpen(true);
    }
  };

  // ─── DEDICATED FOLDER ALBUM FULL PAGE VIEW ───
  if (activeFolderItem) {
    const folderImages: string[] = activeFolderItem.images || [activeFolderItem.mediaUrl];
    const currentPhoto = folderImages[folderPhotoIndex] || activeFolderItem.mediaUrl;

    const handleNextPhoto = () => {
      setFolderPhotoIndex((prev) => (prev + 1) % folderImages.length);
    };

    const handlePrevPhoto = () => {
      setFolderPhotoIndex((prev) => (prev - 1 + folderImages.length) % folderImages.length);
    };

    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased pb-24 space-y-6">
        
        {/* Top Sticky Folder Navigation Bar */}
        <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-[64px] z-30 px-4 sm:px-6 py-4 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={handleCloseFolder}
              className="bg-gray-100 hover:bg-[#111111] hover:text-white text-gray-800 text-xs font-heading font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all shrink-0 active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Gallery
            </button>

            <div className="text-right sm:text-left flex-1 min-w-0">
              <span className="text-[10px] font-mono text-[#F97316] font-bold uppercase tracking-widest block">
                📁 FOLDER ALBUM VIEW • {activeFolderItem.category}
              </span>
              <h2 className="font-heading font-black text-base sm:text-xl text-[#111111] truncate">
                {activeFolderItem.title}
              </h2>
            </div>

            <span className="bg-[#F97316] text-white text-xs font-mono font-bold px-3 py-1 rounded-full shrink-0">
              {folderPhotoIndex + 1} / {folderImages.length}
            </span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          
          {/* Main Featured Photo Stage with Next / Prev Overlay Controls */}
          <div className="bg-white rounded-[26px] border border-gray-200 p-4 sm:p-6 shadow-md relative space-y-4">
            <div className="relative aspect-4/3 sm:aspect-16/9 bg-white rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-gray-100 group">
              
              <img
                src={currentPhoto}
                alt={`Photo ${folderPhotoIndex + 1}`}
                onClick={() => {
                  setViewerIndex(folderPhotoIndex);
                  setViewerOpen(true);
                }}
                className="max-h-[60vh] w-auto object-contain cursor-pointer group-hover:scale-102 transition-transform duration-300"
              />

              {/* Prev Button */}
              {folderImages.length > 1 && (
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-[#F97316] text-white transition-all shadow-lg active:scale-95 z-20"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Next Button */}
              {folderImages.length > 1 && (
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-[#F97316] text-white transition-all shadow-lg active:scale-95 z-20"
                  aria-label="Next Photo"
                >
                  <ChevronRight size={24} />
                </button>
              )}

              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                <Maximize2 size={14} className="text-[#F97316]" /> Click for 360° Rotate & Zoom
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
              <div>
                <h3 className="font-heading font-black text-base text-[#111111]">
                  {activeFolderItem.title} (Photo {folderPhotoIndex + 1})
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Uploaded on {activeFolderItem.date} • Category: {activeFolderItem.category}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPhoto}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-heading font-black text-gray-800 flex items-center gap-1"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-xs font-heading font-black text-white flex items-center gap-1 shadow-xs"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Folder Thumbnails Carousel Row */}
          <div className="bg-white p-4 rounded-[22px] border border-gray-200 space-y-2 shadow-xs">
            <span className="text-xs font-heading font-black text-gray-400 uppercase tracking-wider block">
              Folder Photos Carousel ({folderImages.length})
            </span>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
              {folderImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setFolderPhotoIndex(idx)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 shrink-0 bg-white p-1 transition-all flex items-center justify-center ${
                    folderPhotoIndex === idx
                      ? 'border-[#F97316] ring-2 ring-[#F97316]/30 scale-95 shadow-md'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Full-Screen Rotator Modal */}
        <ImageViewerModal
          images={folderImages}
          initialIndex={folderPhotoIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          title={`${activeFolderItem.title} (${folderPhotoIndex + 1}/${folderImages.length})`}
        />

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased pb-24 space-y-6">
      
      {/* 1. TOP HEADER CARD (MATCHING ORDERS PAGE STYLE) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-white p-4 sm:p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#111111]">WORKSHOP STORIES</h1>
                <span className="bg-[#F97316] text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                  {activeStories.length} Live Stories
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                24h Live stories, real-time manufacturing progress & completed customer orders
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Stories or Gallery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <button
                onClick={() => setFilterSheetOpen(!filterSheetOpen)}
                className={`px-4 py-2.5 rounded-xl text-xs font-heading font-extrabold flex items-center gap-2 transition-colors shrink-0 cursor-pointer ${
                  selectedTag !== 'All' ? 'bg-[#F97316] text-white' : 'bg-[#111111] text-white hover:bg-gray-800'
                }`}
              >
                <SlidersHorizontal size={14} /> Filter
              </button>
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          {filterSheetOpen && (
            <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1 self-center mr-1">
                <Filter size={12} /> Category:
              </span>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 2. TOP 24H LIVE WORKSHOP STORIES (CIRCLE BUBBLES ROW) */}
        <div className="bg-white p-4 rounded-[26px] border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-black text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#F97316]" /> 24h Live Workshop Stories
            </h3>
            <span className="text-[11px] font-mono text-gray-400">Tap circle to view story full-screen</span>
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
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-white relative flex items-center justify-center">
                    <img
                      src={story.mediaUrl}
                      alt={story.title}
                      className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500"
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

        {/* 3. CATEGORY FILTERS (PLACED RIGHT AFTER THE STORY CARD) */}
        <div className="bg-white p-3 rounded-[22px] border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-black text-gray-400 uppercase tracking-wider">
              Filter Gallery Category:
            </span>
            <span className="text-xs font-mono font-bold text-[#F97316]">{selectedTag}</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedTag(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-heading font-extrabold shrink-0 transition-all ${
                  selectedTag === cat
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4. WORKSHOP GALLERY SHOWCASE GRID (FOLDER & SINGLE CARDS) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-black text-base uppercase text-[#111111] flex items-center gap-2">
              <ImageIcon size={18} className="text-[#F97316]" /> WORKSHOP GALLERY ({filteredGallery.length})
            </h2>
            <span className="text-xs font-mono text-gray-500">Category: {selectedTag}</span>
          </div>

          {galleryLoading ? (
            <div className="py-12 text-center text-xs font-mono text-gray-500 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin text-[#F97316]" /> Loading live workshop gallery...
            </div>
          ) : filteredGallery.length === 0 ? (
            <div className="bg-white rounded-[22px] p-12 text-center border border-gray-200 shadow-xs space-y-3">
              <ImageIcon size={48} className="mx-auto text-gray-300" />
              <h3 className="font-heading font-black text-lg text-[#111111]">No Gallery Items for '{selectedTag}'</h3>
              <p className="text-xs text-gray-500">Select 'All' from category filter buttons above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGallery.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item, idx)}
                  className="bg-white rounded-[22px] border border-gray-200 overflow-hidden shadow-xs hover:border-[#F97316] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative"
                >
                  {/* Image Card Container */}
                  <div className="relative aspect-square bg-white overflow-hidden flex items-center justify-center border-b border-gray-100 p-2">
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category Tag */}
                    <span className="absolute top-2 left-2 bg-[#111111]/85 backdrop-blur-md text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                      {item.category}
                    </span>

                    {/* Folder Badge if Multiple Images */}
                    {item.isFolder && (
                      <span className="absolute top-2 right-2 bg-[#F97316] text-white text-[9px] font-heading font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        📁 {item.images?.length || 2} Photos Folder
                      </span>
                    )}
                  </div>

                  <div className="p-3 space-y-1">
                    <h3 className="font-heading font-black text-xs text-[#111111] group-hover:text-[#F97316] transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400 font-mono">
                      <span>{item.date}</span>
                      <span className="text-[#F97316] font-bold group-hover:underline">
                        {item.isFolder ? 'Open Folder 📁' : 'Full View 🔍'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 6. FULL-SCREEN STORY VIEWER MODAL */}
      {activeStoryIndex !== null && (
        <StatusStoryViewer
          stories={activeStories}
          initialIndex={activeStoryIndex}
          isOpen={true}
          onClose={() => setActiveStoryIndex(null)}
          onStorySeen={incrementSeenCount}
        />
      )}

      {/* 7. FULL-SCREEN GALLERY IMAGE VIEWER MODAL WITH ROTATE & ZOOM */}
      <ImageViewerModal
        images={galleryImageUrls}
        initialIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={filteredGallery[viewerIndex]?.title}
      />

    </div>
  );
};
