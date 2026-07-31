import React, { useState, useEffect } from 'react';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import {
  fetchGallery,
  insertGalleryItem,
  deleteGalleryItem,
  fetchHeroBanners,
  insertHeroBanner,
  deleteHeroBanner,
  HeroBanner,
  GalleryItem as DBGalleryItem,
} from '../../services/supabaseService';
import { ImageViewerModal } from '../../components/common/ImageViewerModal';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  Search,
  Upload,
  CheckCircle2,
  Folder,
  FolderOpen,
  Star,
  Loader2,
  X,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  description: string;
  folderImages: string[];
  isFeatured: boolean;
  isHidden: boolean;
  uploadDate: string;
}

interface DeleteConfirmState {
  show: boolean;
  targetType: 'item' | 'photo';
  itemId?: string;
  photoUrl?: string;
  itemTitle?: string;
}

export const AdminGalleryPage: React.FC = () => {
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Full Screen Lightbox Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerTitle, setViewerTitle] = useState('');

  // Confirmation Delete Popup Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Steel Gates');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newDescription, setNewDescription] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [mainCoverIndex, setMainCoverIndex] = useState<number>(0);
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Upload Progress
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState(false);

  // Active Folder View Modal State
  const [activeFolderItem, setActiveFolderItem] = useState<GalleryItem | null>(null);
  const [folderUploading, setFolderUploading] = useState(false);
  const [folderUploadProgress, setFolderUploadProgress] = useState(0);

  const categories = ['All', 'Steel Gates', 'Windows Grill', 'Steel Doors', 'Kalappai', 'Lathe Works', 'Fabrication', 'Machine Works'];

  const loadGallery = async () => {
    setLoading(true);
    try {
      const items = await fetchGallery();
      if (items && items.length > 0) {
        setGalleryList(
          items.map((i) => {
            let parsedFolder: string[] = [];
            try {
              if (i.description && i.description.includes('__FOLD_IMGS__')) {
                const parts = i.description.split('__FOLD_IMGS__');
                parsedFolder = JSON.parse(parts[1]);
              }
            } catch (e) {
              parsedFolder = [i.mediaUrl];
            }

            return {
              id: i.id,
              title: i.title,
              category: i.category,
              mediaType: i.mediaType,
              mediaUrl: i.mediaUrl,
              description: i.description ? i.description.split('__FOLD_IMGS__')[0] : '',
              folderImages: parsedFolder.length > 0 ? parsedFolder : [i.mediaUrl],
              isFeatured: i.isFeatured,
              isHidden: false,
              uploadDate: i.createdAt ? i.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
            };
          })
        );
      } else {
        // No dummy items, show empty state cleanly
        setGalleryList([]);
      }
    } catch (err) {
      console.error('Failed to load gallery from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  // Hero Banners Tab State
  const [activeTab, setActiveTab] = useState<'gallery' | 'banners'>('gallery');
  const [heroBannersList, setHeroBannersList] = useState<HeroBanner[]>([]);
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerTag, setBannerTag] = useState('AGRICULTURAL MACHINERY');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerCtaText, setBannerCtaText] = useState('Explore Catalog');
  const [bannerCtaLink, setBannerCtaLink] = useState('/products');
  const [bannerUploading, setBannerUploading] = useState(false);

  const loadBanners = async () => {
    const banners = await fetchHeroBanners();
    setHeroBannersList(banners);
  };

  useEffect(() => {
    loadGallery();
    loadBanners();
  }, []);

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setBannerImage(url);
    } catch (err) {
      console.error(err);
    } finally {
      setBannerUploading(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle || !bannerImage) {
      alert('Please enter banner title and upload an image.');
      return;
    }
    const newB: HeroBanner = {
      id: `banner-${Date.now()}`,
      title: bannerTitle,
      subtitle: bannerSubtitle,
      tag: bannerTag,
      image: bannerImage,
      ctaText: bannerCtaText,
      ctaLink: bannerCtaLink,
      isActive: true,
      displayOrder: heroBannersList.length + 1,
      createdAt: new Date().toISOString(),
    };
    await insertHeroBanner(newB);
    await loadBanners();
    setShowAddBannerModal(false);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerImage('');
  };

  const handleToggleBanner = async (b: HeroBanner) => {
    const updated = { ...b, isActive: !b.isActive };
    await insertHeroBanner(updated);
    await loadBanners();
  };

  const handleDeleteBanner = async (id: string) => {
    await deleteHeroBanner(id);
    await loadBanners();
  };

  // Open Lightbox Image Viewer
  const openImageViewer = (images: string[], index: number = 0, title: string = '') => {
    setViewerImages(images);
    setViewerIndex(index);
    setViewerTitle(title);
    setViewerOpen(true);
  };

  // Trigger Delete Confirmation Popup for Gallery Item or Album Folder
  const promptDeleteItem = (item: GalleryItem) => {
    setDeleteConfirm({
      show: true,
      targetType: 'item',
      itemId: item.id,
      itemTitle: item.title,
    });
  };

  // Trigger Delete Confirmation Popup for a specific Photo inside a Folder Album
  const promptDeletePhotoFromFolder = (folderItem: GalleryItem, photoUrl: string) => {
    if (folderItem.folderImages.length <= 1) {
      alert('Cannot delete the only photo in an album. Delete the entire folder instead.');
      return;
    }
    setDeleteConfirm({
      show: true,
      targetType: 'photo',
      itemId: folderItem.id,
      photoUrl: photoUrl,
      itemTitle: folderItem.title,
    });
  };

  // Execute Confirmed Delete Action
  const executeConfirmedDelete = async () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.targetType === 'item' && deleteConfirm.itemId) {
      const targetId = deleteConfirm.itemId;
      await deleteGalleryItem(targetId);
      setGalleryList((prev) => prev.filter((i) => i.id !== targetId));
      if (activeFolderItem?.id === targetId) setActiveFolderItem(null);
    } else if (deleteConfirm.targetType === 'photo' && deleteConfirm.itemId && deleteConfirm.photoUrl && activeFolderItem) {
      const targetUrl = deleteConfirm.photoUrl;
      const folderItem = activeFolderItem;
      const updatedFolder = folderItem.folderImages.filter((url) => url !== targetUrl);
      const newCover = folderItem.mediaUrl === targetUrl ? updatedFolder[0] : folderItem.mediaUrl;
      const updatedItem = { ...folderItem, mediaUrl: newCover, folderImages: updatedFolder };

      setGalleryList((prev) => prev.map((i) => (i.id === folderItem.id ? updatedItem : i)));
      setActiveFolderItem(updatedItem);

      const dbDescription = `${updatedItem.description}__FOLD_IMGS__${JSON.stringify(updatedFolder)}`;
      await insertGalleryItem({
        id: updatedItem.id,
        title: updatedItem.title,
        category: updatedItem.category,
        mediaType: updatedItem.mediaType,
        mediaUrl: newCover,
        description: dbDescription,
        isFeatured: updatedItem.isFeatured,
        createdAt: new Date().toISOString(),
      });
    }

    setDeleteConfirm(null);
  };

  // Multi-file upload for main upload modal
  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(10);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadToCloudinary(files[i]);
        newUrls.push(url);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (err) {
        console.error('Cloudinary Upload error:', err);
      }
    }

    setUploadedPhotos((prev) => [...prev, ...newUrls]);
    setUploading(false);
    setUploadProgress(100);
  };

  // Upload photos directly into an EXISTING opened folder
  const handleAddPhotosToExistingFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeFolderItem) return;
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setFolderUploading(true);
    setFolderUploadProgress(20);
    const addedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadToCloudinary(files[i]);
        addedUrls.push(url);
        setFolderUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (err) {
        console.error('Cloudinary Folder Upload error:', err);
      }
    }

    const updatedFolderImages = [...activeFolderItem.folderImages, ...addedUrls];
    const updatedItem: GalleryItem = {
      ...activeFolderItem,
      folderImages: updatedFolderImages,
    };

    setGalleryList((prev) => prev.map((item) => (item.id === activeFolderItem.id ? updatedItem : item)));
    setActiveFolderItem(updatedItem);

    // Save/Upsert in DB
    const dbDescription = `${updatedItem.description}__FOLD_IMGS__${JSON.stringify(updatedFolderImages)}`;
    await insertGalleryItem({
      id: updatedItem.id,
      title: updatedItem.title,
      category: updatedItem.category,
      mediaType: updatedItem.mediaType,
      mediaUrl: updatedItem.mediaUrl,
      description: dbDescription,
      isFeatured: updatedItem.isFeatured,
      createdAt: new Date().toISOString(),
    });

    setFolderUploading(false);
    setFolderUploadProgress(100);
  };

  // Create new gallery item / folder
  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) {
      alert('Work Title is required.');
      return;
    }
    if (uploadedPhotos.length === 0) {
      alert('Please upload at least 1 image file.');
      return;
    }

    const coverUrl = uploadedPhotos[mainCoverIndex] || uploadedPhotos[0];
    const folderPhotos = uploadedPhotos;
    const dbDescription = `${newDescription}__FOLD_IMGS__${JSON.stringify(folderPhotos)}`;

    const newItem: DBGalleryItem = {
      id: `gal-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      mediaType: newMediaType,
      mediaUrl: coverUrl,
      description: dbDescription,
      isFeatured,
      createdAt: new Date().toISOString(),
    };

    const saved = await insertGalleryItem(newItem);

    const item: GalleryItem = {
      id: saved?.id || newItem.id,
      title: saved?.title || newItem.title,
      category: saved?.category || newItem.category,
      mediaType: saved?.mediaType || newItem.mediaType,
      mediaUrl: coverUrl,
      description: newDescription,
      folderImages: folderPhotos,
      isFeatured: saved?.isFeatured ?? newItem.isFeatured,
      isHidden: false,
      uploadDate: new Date().toISOString().split('T')[0],
    };

    setGalleryList((prev) => [item, ...prev]);
    setSuccessMsg(true);

    setTimeout(() => {
      setSuccessMsg(false);
      setShowUploadModal(false);
      setNewTitle('');
      setUploadedPhotos([]);
      setNewDescription('');
      setMainCoverIndex(0);
      setUploadProgress(0);
    }, 1500);
  };

  const setCoverInFolder = async (folderItem: GalleryItem, coverUrl: string) => {
    const updatedItem = { ...folderItem, mediaUrl: coverUrl };
    setGalleryList((prev) => prev.map((i) => (i.id === folderItem.id ? updatedItem : i)));
    setActiveFolderItem(updatedItem);

    const dbDescription = `${updatedItem.description}__FOLD_IMGS__${JSON.stringify(updatedItem.folderImages)}`;
    await insertGalleryItem({
      id: updatedItem.id,
      title: updatedItem.title,
      category: updatedItem.category,
      mediaType: updatedItem.mediaType,
      mediaUrl: coverUrl,
      description: dbDescription,
      isFeatured: updatedItem.isFeatured,
      createdAt: new Date().toISOString(),
    });
  };

  const filteredItems = galleryList.filter((item) => {
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans pb-24">
      
      {/* Top Banner Header */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <ImageIcon size={16} /> WORKSHOP PORTFOLIO • GALLERY & ALBUMS
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">
              GALLERY & ALBUM MANAGEMENT
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setUploadedPhotos([]);
                setMainCoverIndex(0);
                setUploadProgress(0);
                setShowUploadModal(true);
              }}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus size={16} /> Upload New Gallery Work
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <h1 className="font-heading font-black text-2xl text-[#111111] flex items-center gap-2">
                <ImageIcon size={24} className="text-[#F97316]" /> GALLERY & ALBUM MANAGEMENT
              </h1>
            </div>

        <button
          onClick={() => {
            setUploadedPhotos([]);
            setMainCoverIndex(0);
            setUploadProgress(0);
            setShowUploadModal(true);
          }}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus size={16} /> Upload New Gallery Work
        </button>
      </div>

      {/* Analytics Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-gray-400 text-[11px] font-heading font-bold uppercase block">Total Works</span>
          <p className="font-heading font-black text-2xl text-[#111111]">{galleryList.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-gray-400 text-[11px] font-heading font-bold uppercase block">Featured Showcase</span>
          <p className="font-heading font-black text-2xl text-[#F97316]">
            {galleryList.filter((i) => i.isFeatured).length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-gray-400 text-[11px] font-heading font-bold uppercase block">Folder Albums</span>
          <p className="font-heading font-black text-2xl text-blue-600">
            {galleryList.filter((i) => i.folderImages.length > 1).length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-gray-400 text-[11px] font-heading font-bold uppercase block">Categories</span>
          <p className="font-heading font-black text-2xl text-purple-600">{categories.length - 1}</p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search gallery..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none font-bold"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-extrabold shrink-0 border transition-all cursor-pointer ${
                categoryFilter === cat ? 'bg-[#111111] text-white border-[#111111]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery & Folder Cards Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <Loader2 size={32} className="animate-spin mx-auto text-[#F97316]" />
          <p className="text-xs font-bold text-gray-500">Loading gallery items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs space-y-3">
          <ImageIcon size={44} className="mx-auto text-gray-300" />
          <h3 className="font-heading font-black text-base text-[#111111]">No Gallery Works Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery || categoryFilter !== 'All'
              ? 'No items match your search filter.'
              : 'Your gallery is empty. Click "Upload New Gallery Work" to upload photos and folder albums.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isFolder = item.folderImages.length > 1;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs space-y-3 p-3 transition-all hover:border-[#F97316] flex flex-col justify-between"
              >
                {/* Image / Folder Card Cover Thumbnail */}
                <div
                  onClick={() => {
                    if (isFolder) {
                      setActiveFolderItem(item);
                    } else {
                      openImageViewer(item.folderImages, 0, item.title);
                    }
                  }}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer group"
                >
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    <span className="bg-black/70 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {item.isFeatured && (
                      <span className="bg-[#F97316] text-white text-[9px] font-black px-2 py-0.5 rounded">
                        FEATURED
                      </span>
                    )}
                  </div>

                  {isFolder ? (
                    <div className="absolute bottom-2 right-2 bg-blue-600/90 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                      <Folder size={12} /> {item.folderImages.length} Photos
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-black text-[11px] font-black px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                        <Eye size={14} className="text-[#F97316]" /> View Photo
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3
                    onClick={() => {
                      if (isFolder) {
                        setActiveFolderItem(item);
                      } else {
                        openImageViewer(item.folderImages, 0, item.title);
                      }
                    }}
                    className="font-heading font-extrabold text-xs text-[#111111] line-clamp-1 cursor-pointer hover:text-[#F97316]"
                  >
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 line-clamp-2">{item.description || 'No description'}</p>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                  {isFolder ? (
                    <button
                      onClick={() => setActiveFolderItem(item)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <FolderOpen size={13} /> Open Folder Album
                    </button>
                  ) : (
                    <button
                      onClick={() => openImageViewer(item.folderImages, 0, item.title)}
                      className="text-[#F97316] hover:text-[#EA580C] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={13} /> View Full Image
                    </button>
                  )}

                  <button
                    onClick={() => promptDeleteItem(item)}
                    className="text-red-600 hover:text-red-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 📁 FOLDER ALBUM VIEWER MODAL */}
      {activeFolderItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[22px] max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-gray-200 font-sans my-8">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#F97316] uppercase tracking-wider block">
                  {activeFolderItem.category} Album
                </span>
                <h3 className="font-heading font-black text-lg text-[#111111] flex items-center gap-2">
                  <FolderOpen size={20} className="text-[#F97316]" /> {activeFolderItem.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{activeFolderItem.description}</p>
              </div>

              <button
                onClick={() => setActiveFolderItem(null)}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Existing Images Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800">
                  Photos in Album ({activeFolderItem.folderImages.length})
                </span>
                <span className="text-gray-500 font-mono text-[10px]">
                  🔍 Tap image to expand full view • ⭐ Set main cover
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1 bg-gray-50 rounded-2xl border border-gray-200">
                {activeFolderItem.folderImages.map((imgUrl, idx) => {
                  const isCover = activeFolderItem.mediaUrl === imgUrl;
                  return (
                    <div
                      key={idx}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-gray-300 bg-black cursor-pointer"
                      onClick={() => openImageViewer(activeFolderItem.folderImages, idx, activeFolderItem.title)}
                    >
                      <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

                      {isCover && (
                        <span className="absolute top-1.5 left-1.5 bg-[#F97316] text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 z-10">
                          <Star size={10} /> Main Cover
                        </span>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageViewer(activeFolderItem.folderImages, idx, activeFolderItem.title);
                          }}
                          className="bg-white hover:bg-gray-100 text-black text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} className="text-[#F97316]" /> View Full Image
                        </button>

                        {!isCover && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCoverInFolder(activeFolderItem, imgUrl);
                            }}
                            className="bg-[#F97316] hover:bg-[#EA580C] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm cursor-pointer"
                          >
                            Set Main Cover
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            promptDeletePhotoFromFolder(activeFolderItem, imgUrl);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} /> Delete Photo
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add New Photos directly into this Folder */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-black text-xs text-amber-900 flex items-center gap-1.5">
                    <Plus size={16} className="text-[#F97316]" /> Add More Images to This Folder Album
                  </h4>
                  <p className="text-[11px] text-amber-700">Upload new photos directly into this folder.</p>
                </div>

                <label className="bg-[#111111] hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload size={14} className="text-[#F97316]" /> Select Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddPhotosToExistingFolder}
                    className="hidden"
                  />
                </label>
              </div>

              {folderUploading && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-mono font-bold text-amber-900">
                    <span>Uploading photos to folder album...</span>
                    <span>{folderUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#F97316] h-full transition-all duration-300"
                      style={{ width: `${folderUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setActiveFolderItem(null)}
                className="bg-[#111111] hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📤 UPLOAD NEW GALLERY WORK / FOLDER MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200 font-sans my-8">
            {successMsg ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 size={40} className="mx-auto text-green-600" />
                <h3 className="font-heading font-black text-lg text-[#111111]">Gallery Work Published!</h3>
                <p className="text-xs text-gray-500">Saved to Supabase live workshop gallery.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="font-heading font-black text-base text-[#111111] flex items-center gap-2">
                    <Upload size={18} className="text-[#F97316]" /> UPLOAD GALLERY WORK / FOLDER
                  </h3>
                  <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-black">✕</button>
                </div>

                <form onSubmit={handleCreateGalleryItem} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Work Title *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. 9-Tine Kalappai for Kallimandhayam Farmer"
                      className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-300 text-xs font-medium outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Category *</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-300 text-xs font-medium outline-none"
                      >
                        {categories.filter((c) => c !== 'All').map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Media Type</label>
                      <select
                        value={newMediaType}
                        onChange={(e: any) => setNewMediaType(e.target.value)}
                        className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-300 text-xs font-medium outline-none"
                      >
                        <option value="image">Photo Image</option>
                        <option value="video">Short Video</option>
                      </select>
                    </div>
                  </div>

                  {/* Upload Files Input & Progress */}
                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2">
                    <label className="font-bold text-gray-800 block">Select Image Files to Upload *</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMultipleFilesUpload}
                      className="w-full bg-white p-2 rounded-xl border border-gray-300 text-xs cursor-pointer"
                    />

                    {uploading && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] font-mono font-bold text-[#F97316]">
                          <span>Uploading files...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#F97316] h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Images Preview Grid & Set Cover Selection */}
                  {uploadedPhotos.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 text-xs">
                          Uploaded Previews ({uploadedPhotos.length})
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          ⭐ Select "Set Main Cover" for main photo
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-2 bg-gray-100 rounded-xl max-h-48 overflow-y-auto">
                        {uploadedPhotos.map((url, idx) => {
                          const isMain = mainCoverIndex === idx;
                          return (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 bg-black">
                              <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                              
                              {isMain && (
                                <span className="absolute top-1 left-1 bg-[#F97316] text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow">
                                  Main Cover
                                </span>
                              )}

                              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                {!isMain && (
                                  <button
                                    type="button"
                                    onClick={() => setMainCoverIndex(idx)}
                                    className="bg-[#F97316] text-white text-[9px] font-bold px-2 py-1 rounded shadow cursor-pointer"
                                  >
                                    Set Main Cover
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx));
                                    if (mainCoverIndex >= uploadedPhotos.length - 1) {
                                      setMainCoverIndex(0);
                                    }
                                  }}
                                  className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Work Description</label>
                    <textarea
                      rows={2}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Details about fabrication materials, bearings & dimensions..."
                      className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-300 text-xs outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded accent-[#F97316]"
                    />
                    <label htmlFor="featured" className="font-bold text-gray-700">Feature on Homepage Gallery Preview</label>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || uploadedPhotos.length === 0}
                    className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:bg-gray-400 text-white font-heading font-black text-xs py-3 rounded-xl shadow-md mt-2 cursor-pointer"
                  >
                    Publish Gallery Media
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ⚠️ DELETE CONFIRMATION POPUP MODAL */}
      {deleteConfirm && deleteConfirm.show && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-2xl border border-gray-200 text-center font-sans">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-black text-lg text-[#111111]">
                Confirm Deletion
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {deleteConfirm.targetType === 'item' ? (
                  <>Are you sure you want to delete <span className="font-bold text-black">{deleteConfirm.itemTitle}</span>? This action cannot be undone.</>
                ) : (
                  <>Are you sure you want to remove this photo from <span className="font-bold text-black">{deleteConfirm.itemTitle}</span> album?</>
                )}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 FULLSCREEN LIGHTBOX IMAGE VIEWER MODAL */}
      <ImageViewerModal
        images={viewerImages}
        initialIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={viewerTitle}
      />

      </div>
    </div>
  );
};
