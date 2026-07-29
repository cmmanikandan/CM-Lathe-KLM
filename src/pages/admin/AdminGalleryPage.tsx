import React, { useState, useEffect } from 'react';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { fetchGallery, insertGalleryItem, deleteGalleryItem, GalleryItem as DBGalleryItem } from '../../services/supabaseService';
import {
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Upload,
  CheckCircle2,
  Sparkles,
  Folder,
  FolderOpen,
  Star,
  Loader2,
  X,
  Check
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

export const AdminGalleryPage: React.FC = () => {
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Steel Gates');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newDescription, setNewDescription] = useState('');
  const [isFolderFormat, setIsFolderFormat] = useState(false);
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
        // Default initial items
        setGalleryList([
          {
            id: 'gal-1',
            title: '9-Tine Hardened Kalappai Assembly',
            category: 'Kalappai',
            mediaType: 'image',
            mediaUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
            description: 'Lathe machined cultivator tines forged for red soil.',
            folderImages: ['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'],
            isFeatured: true,
            isHidden: false,
            uploadDate: '2026-07-25',
          },
          {
            id: 'gal-2',
            title: 'CNC Laser Cut SS 304 Main Safety Gate Folder',
            category: 'Steel Gates',
            mediaType: 'image',
            mediaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
            description: 'Architectural safety gate with heavy bearing hinges.',
            folderImages: [
              'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
            ],
            isFeatured: true,
            isHidden: false,
            uploadDate: '2026-07-22',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load gallery from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

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
        console.error(err);
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
        console.error(err);
      }
    }

    const updatedFolderImages = [...activeFolderItem.folderImages, ...addedUrls];
    const updatedItem: GalleryItem = {
      ...activeFolderItem,
      folderImages: updatedFolderImages,
    };

    // Save to State & Supabase
    setGalleryList((prev) => prev.map((item) => (item.id === activeFolderItem.id ? updatedItem : item)));
    setActiveFolderItem(updatedItem);

    // Save in DB
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

  const toggleHide = (id: string) => {
    setGalleryList((prev) => prev.map((i) => (i.id === id ? { ...i, isHidden: !i.isHidden } : i)));
  };

  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this gallery item/folder?')) {
      await deleteGalleryItem(id);
      setGalleryList((prev) => prev.filter((i) => i.id !== id));
      if (activeFolderItem?.id === id) setActiveFolderItem(null);
    }
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

  const deletePhotoFromFolder = async (folderItem: GalleryItem, targetUrl: string) => {
    if (folderItem.folderImages.length <= 1) {
      alert('Cannot delete the last image in the folder album.');
      return;
    }
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
  };

  const filteredItems = galleryList.filter((item) => {
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto">
      
      {/* Header & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#111111] flex items-center gap-2">
            <ImageIcon size={24} className="text-[#F97316]" /> GALLERY & ALBUM MANAGEMENT
          </h1>
          <p className="text-xs text-gray-500">Upload photos directly, manage cover images & add photos to folder albums</p>
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
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-extrabold shrink-0 border transition-all cursor-pointer ${
                categoryFilter === cat ? 'bg-[#111111] text-white border-[#111111]' : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery & Folder Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isFolder = item.folderImages.length > 1;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-xs space-y-3 p-3 transition-all hover:border-[#F97316] ${
                item.isHidden ? 'opacity-50 border-dashed border-gray-300' : 'border-gray-200'
              }`}
            >
              <div
                onClick={() => setActiveFolderItem(item)}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer group"
              >
                <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                
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

                {isFolder && (
                  <div className="absolute bottom-2 right-2 bg-blue-600/90 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                    <Folder size={12} /> {item.folderImages.length} Photos
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3
                  onClick={() => setActiveFolderItem(item)}
                  className="font-heading font-extrabold text-xs text-[#111111] line-clamp-1 cursor-pointer hover:text-[#F97316]"
                >
                  {item.title}
                </h3>
                <p className="text-[11px] text-gray-500 line-clamp-2">{item.description || 'No description'}</p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                <button
                  onClick={() => setActiveFolderItem(item)}
                  className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <FolderOpen size={13} /> {isFolder ? 'Open Folder' : 'View Media'}
                </button>

                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-red-600 hover:text-red-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📁 FOLDER ALBUM VIEWER & ADD IMAGES MODAL */}
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
                  Existing Photos in Folder ({activeFolderItem.folderImages.length})
                </span>
                <span className="text-gray-500 font-mono text-[10px]">
                  ⭐ Tap "Set Main Cover" to change album thumbnail
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1 bg-gray-50 rounded-2xl border border-gray-200">
                {activeFolderItem.folderImages.map((imgUrl, idx) => {
                  const isCover = activeFolderItem.mediaUrl === imgUrl;
                  return (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-300 bg-black">
                      <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

                      {isCover && (
                        <span className="absolute top-1.5 left-1.5 bg-[#F97316] text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                          <Star size={10} /> Main Cover
                        </span>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        {!isCover && (
                          <button
                            onClick={() => setCoverInFolder(activeFolderItem, imgUrl)}
                            className="bg-[#F97316] hover:bg-[#EA580C] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm cursor-pointer"
                          >
                            Set Main Cover
                          </button>
                        )}
                        <button
                          onClick={() => deletePhotoFromFolder(activeFolderItem, imgUrl)}
                          className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} /> Delete
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
                    <Plus size={16} className="text-[#F97316]" /> Add More Images to This Folder
                  </h4>
                  <p className="text-[11px] text-amber-700">Select new photos to upload directly into this album folder.</p>
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
                    <span>Uploading photos to folder...</span>
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
                <p className="text-xs text-gray-500">Live in workshop gallery with cover image set.</p>
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

    </div>
  );
};
