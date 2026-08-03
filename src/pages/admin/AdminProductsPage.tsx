import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProducts } from '../../context/ProductContext';
import { Product, ProductVariant } from '../../types';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { GenericDeleteModal } from '../../components/common/GenericDeleteModal';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Search,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Filter,
  Copy,
  Eye,
  EyeOff,
  Archive,
  Download,
  UploadCloud,
  Layers,
  Sparkles,
  Sliders,
  DollarSign,
  Tag,
  Star,
  Heart,
  BarChart2,
  Info,
  Check,
  X,
  FileText,
  Video,
  Box,
  Globe,
  Settings,
  Truck,
  Wrench,
  ChevronRight,
  Maximize2,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    duplicateProduct,
    deleteProduct,
    bulkDeleteProducts,
    bulkUpdateStatus,
    bulkUpdateCategory,
    bulkUpdatePrice,
    bulkUpdateStock,
    addCategory,
    deleteCategory
  } = useProducts();

  // Navigation Sub-Tab State
  const [activeTab, setActiveTab] = useState<
    'all' | 'add' | 'categories' | 'brands' | 'variants' | 'inventory' | 'reviews' | 'wishlist' | 'gallery' | 'import_export'
  >('all');

  // Selected Products for Bulk Operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [deletingProd, setDeletingProd] = useState<Product | null>(null);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStockStatus, setFilterStockStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price_high' | 'price_low' | 'views' | 'wishlist' | 'rating'>('newest');

  // Bulk Edit Modals State
  const [bulkCategoryModal, setBulkCategoryModal] = useState(false);
  const [bulkCategoryValue, setBulkCategoryValue] = useState(categories[0] || 'Windows Grill');
  const [bulkPriceModal, setBulkPriceModal] = useState(false);
  const [bulkPriceAdjustment, setBulkPriceAdjustment] = useState(0);
  const [bulkStockModal, setBulkStockModal] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState(10);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // ── FORM STATE (FOR 14-SECTION ENTERPRISE FORM) ──
  const [formName, setFormName] = useState('');
  const [formShortName, setFormShortName] = useState('');
  const [formProductCode, setFormProductCode] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('Windows Grill');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formProductType, setFormProductType] = useState<'Ready Stock' | 'Made To Order' | 'Custom Fabrication'>('Ready Stock');
  const [formStatus, setFormStatus] = useState<'Published' | 'Draft' | 'Hidden' | 'Archived'>('Published');

  const [formPrice, setFormPrice] = useState<number>(0);
  const [formDiscountType, setFormDiscountType] = useState<'none' | 'amount' | 'percentage'>('none');
  const [formDiscountValue, setFormDiscountValue] = useState<number>(0);
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formGstPercent, setFormGstPercent] = useState<number>(18);
  const [formIsTaxIncluded, setFormIsTaxIncluded] = useState(true);
  const [formUnit, setFormUnit] = useState('Piece');
  const [formStock, setFormStock] = useState<number>(0);

  // Dynamic Product Feature Tags State
  const [formTags, setFormTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');

  const PRESET_TAGS = [
    'Heavy Duty Steel',
    'CNC Lathe Finished',
    'Rust Resistant',
    'Precision Alignment',
    'High Tensile Strength',
    'Tractor Tested',
    'Weatherproof Coating',
    'Factory Warranty',
    'Customizable Dimensions',
    'Low Maintenance',
    'Hardened Steel Tines',
    'Heavy Duty Bearings',
    'Seamless Weld Construction',
    'On-Site Fitting Available',
    'Ready Factory Stock'
  ];

  const [formShortDescription, setFormShortDescription] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTechnicalDescription, setFormTechnicalDescription] = useState('');
  const [formFeaturesText, setFormFeaturesText] = useState('');
  const [formApplicationsText, setFormApplicationsText] = useState('');
  const [formMaintenanceInstructions, setFormMaintenanceInstructions] = useState('');
  const [formWarrantyDetails, setFormWarrantyDetails] = useState('');
  const [formInstallationDetails, setFormInstallationDetails] = useState('');

  const [formMaterial, setFormMaterial] = useState('');
  const [formSteelGrade, setFormSteelGrade] = useState('');
  const [formThickness, setFormThickness] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formSize, setFormSize] = useState('');
  const [formFinish, setFormFinish] = useState('');
  const [formIsRustResistant, setFormIsRustResistant] = useState(true);
  const [formIsWeatherResistant, setFormIsWeatherResistant] = useState(true);

  // Images state (up to 20 images)
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Video & Document URLs
  const [formWorkshopVideoUrl, setFormWorkshopVideoUrl] = useState('');
  const [formInstallationVideoUrl, setFormInstallationVideoUrl] = useState('');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formCadPdfUrl, setFormCadPdfUrl] = useState('');
  const [formManualPdfUrl, setFormManualPdfUrl] = useState('');

  // SEO & Custom Order Config
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formSeoKeywords, setFormSeoKeywords] = useState('');
  const [formEnableCustomOrder, setFormEnableCustomOrder] = useState(true);
  const [formAllowNotes, setFormAllowNotes] = useState(true);
  const [formAllowDrawingUpload, setFormAllowDrawingUpload] = useState(true);

  // Badges
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsBestSelling, setFormIsBestSelling] = useState(false);
  const [formIsNewArrival, setFormIsNewArrival] = useState(false);
  const [formIsPremium, setFormIsPremium] = useState(false);
  const [formIsIndustrial, setFormIsIndustrial] = useState(false);
  const [formBadgeText, setFormBadgeText] = useState('');

  // Variants state
  const [formVariants, setFormVariants] = useState<ProductVariant[]>([]);

  // Reset form to completely clean state for adding a new product
  const resetForm = () => {
    setEditingProd(null);
    setFormName('');
    setFormShortName('');
    setFormProductCode('');
    setFormSku('');
    setFormSlug('');
    setFormCategory(categories[0] || 'Windows Grill');
    setFormSubCategory('');
    setFormBrand('');
    setFormProductType('Ready Stock');
    setFormStatus('Published');

    setFormPrice(0);
    setFormDiscountType('none');
    setFormDiscountValue(0);
    setFormCostPrice(0);
    setFormGstPercent(18);
    setFormIsTaxIncluded(true);
    setFormUnit('Piece');
    setFormStock(0);
    setFormTags([]);
    setCustomTagInput('');

    setFormShortDescription('');
    setFormDescription('');
    setFormTechnicalDescription('');
    setFormFeaturesText('');
    setFormApplicationsText('');
    setFormMaintenanceInstructions('');
    setFormWarrantyDetails('');
    setFormInstallationDetails('');

    setFormMaterial('');
    setFormSteelGrade('');
    setFormThickness('');
    setFormColor('');
    setFormSize('');
    setFormFinish('');
    setFormIsRustResistant(true);
    setFormIsWeatherResistant(true);

    setFormImages([]);
    setFormWorkshopVideoUrl('');
    setFormInstallationVideoUrl('');
    setFormYoutubeUrl('');
    setFormCadPdfUrl('');
    setFormManualPdfUrl('');

    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormSeoKeywords('');

    setFormIsFeatured(false);
    setFormIsBestSelling(false);
    setFormIsNewArrival(false);
    setFormIsPremium(false);
    setFormIsIndustrial(false);
    setFormBadgeText('');

    setFormVariants([]);
  };

  // Statistics KPI counts
  const totalCount = products.length;
  const publishedCount = products.filter((p) => !p.status || p.status === 'Published').length;
  const draftCount = products.filter((p) => p.status === 'Draft').length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const hiddenCount = products.filter((p) => p.status === 'Hidden' || p.status === 'Archived').length;

  // Filtered & Sorted Products List
  const displayedProducts = useMemo(() => {
    return products
      .filter((p) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(query) ||
          (p.sku && p.sku.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query) ||
          (p.specifications?.material && p.specifications.material.toLowerCase().includes(query));

        const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
        const matchesStatus =
          filterStatus === 'All' ||
          (filterStatus === 'Published' && (!p.status || p.status === 'Published')) ||
          (filterStatus === 'Draft' && p.status === 'Draft') ||
          (filterStatus === 'Hidden' && p.status === 'Hidden') ||
          (filterStatus === 'Archived' && p.status === 'Archived');

        const matchesStock =
          filterStockStatus === 'All' ||
          (filterStockStatus === 'InStock' && p.stock > 0) ||
          (filterStockStatus === 'OutOfStock' && p.stock === 0) ||
          (filterStockStatus === 'LowStock' && p.stock > 0 && p.stock <= 5);

        return matchesSearch && matchesCategory && matchesStatus && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'views') return b.views - a.views;
        if (sortBy === 'wishlist') return (b.wishlistCount || 0) - (a.wishlistCount || 0);
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // Newest default
      });
  }, [products, searchQuery, filterCategory, filterStatus, filterStockStatus, sortBy]);

  // Select all checkbox handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(displayedProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingImage(true);
      const file = files[0];
      const uploadedUrl = await uploadToCloudinary(file);
      if (formImages.length < 20) {
        setFormImages([...formImages, uploadedUrl]);
      }
    } catch (err) {
      alert('Cloudinary upload error. Check network connection.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Populate form for editing existing product
  const handleStartEdit = (prod: Product) => {
    setEditingProd(prod);
    setFormName(prod.name);
    setFormShortName(prod.shortName || '');
    setFormProductCode(prod.productCode || `PROD-${prod.id.slice(-4)}`);
    setFormSku(prod.sku || `ML-SKU-${prod.id.slice(-4)}`);
    setFormSlug(prod.slug || prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    setFormCategory(prod.category);
    setFormSubCategory(prod.subCategory || 'Standard');
    setFormBrand(prod.brand || 'MANIKANDAN LATHE');
    setFormProductType(prod.productType || (prod.isReadyStock ? 'Ready Stock' : 'Made To Order'));
    setFormStatus(prod.status || 'Published');

    const origP = prod.originalPrice || prod.price;
    setFormPrice(origP);
    const dType = prod.discountType || (prod.discountPrice && prod.discountPrice < prod.price ? 'amount' : 'none');
    setFormDiscountType(dType);
    const dVal = prod.discountValue !== undefined ? prod.discountValue : (prod.discountPrice && prod.discountPrice < prod.price ? (prod.price - prod.discountPrice) : 0);
    setFormDiscountValue(dVal);
    setFormCostPrice(prod.costPrice || 0);
    setFormGstPercent(prod.gstPercent || 18);
    setFormIsTaxIncluded(prod.isTaxIncluded ?? true);
    setFormUnit(prod.unit || 'Piece');
    setFormStock(prod.stock);
    setFormTags(prod.tags || []);

    setFormDescription(prod.description);
    setFormShortDescription(prod.shortDescription || prod.description.slice(0, 100));
    setFormTechnicalDescription(prod.technicalDescription || '');
    setFormFeaturesText(prod.featuresList ? prod.featuresList.join('\n') : '');
    setFormApplicationsText(prod.applicationsList ? prod.applicationsList.join('\n') : '');
    setFormMaintenanceInstructions(prod.maintenanceInstructions || '');
    setFormWarrantyDetails(prod.warrantyDetails || '');
    setFormInstallationDetails(prod.installationDetails || '');

    setFormMaterial(prod.specifications?.material || '');
    setFormSteelGrade(prod.specifications?.grade || '');
    setFormThickness(prod.specifications?.thickness || '');
    setFormColor(prod.specifications?.color || '');
    setFormSize(prod.specifications?.size || '');
    setFormFinish(prod.specifications?.finish || '');

    setFormImages(prod.images || []);
    setFormVariants(prod.variants || []);
    setFormIsBestSelling(!!prod.isBestSelling);
    setFormIsFeatured(!!prod.isRecommended);
    setFormBadgeText(prod.badgeText || '');

    setActiveTab('add');
  };

  // Submit Add/Edit Product Form
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) {
      alert('Please enter Product Name.');
      return;
    }

    const origPrice = Math.max(0, formPrice);
    if (origPrice <= 0) {
      alert('Please enter a valid Original Price greater than 0.');
      return;
    }

    let calcDiscountAmount = 0;
    if (formDiscountType === 'amount') {
      if (formDiscountValue > origPrice) {
        alert('Discount cannot be greater than the original price.');
        return;
      }
      calcDiscountAmount = Math.max(0, formDiscountValue);
    } else if (formDiscountType === 'percentage') {
      if (formDiscountValue > 100) {
        alert('Discount percentage cannot exceed 100%.');
        return;
      }
      const pct = Math.max(0, formDiscountValue);
      calcDiscountAmount = (origPrice * pct) / 100;
    }

    const finalPrice = Math.max(0, origPrice - calcDiscountAmount);
    const profit = finalPrice - formCostPrice;
    const calculatedProfitMargin = finalPrice > 0 ? Number(((profit / finalPrice) * 100).toFixed(1)) : 0;

    const fullProductData: Omit<Product, 'id' | 'views'> = {
      name: formName,
      shortName: formShortName || formName,
      productCode: formProductCode || `PROD-${Date.now().toString().slice(-4)}`,
      sku: formSku || `ML-SKU-${Date.now().toString().slice(-4)}`,
      slug: formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: formCategory,
      subCategory: formSubCategory,
      brand: formBrand,
      productType: formProductType,
      status: formStatus,

      price: origPrice,
      originalPrice: origPrice,
      discountType: formDiscountType,
      discountValue: formDiscountValue,
      discountAmount: calcDiscountAmount,
      finalSellingPrice: finalPrice,
      discountPrice: calcDiscountAmount > 0 ? finalPrice : undefined,
      costPrice: formCostPrice,
      profitMargin: calculatedProfitMargin,
      tags: formTags,
      gstPercent: formGstPercent,
      isTaxIncluded: formIsTaxIncluded,
      unit: formUnit,
      stock: formStock,
      isReadyStock: formProductType === 'Ready Stock',
      isMadeToOrder: formProductType === 'Made To Order',
      images: formImages,

      description: formDescription,
      shortDescription: formShortDescription,
      technicalDescription: formTechnicalDescription,
      featuresList: formFeaturesText.split('\n').filter(Boolean),
      applicationsList: formApplicationsText.split('\n').filter(Boolean),
      maintenanceInstructions: formMaintenanceInstructions,
      warrantyDetails: formWarrantyDetails,
      installationDetails: formInstallationDetails,

      specifications: {
        material: formMaterial,
        grade: formSteelGrade,
        thickness: formThickness,
        color: formColor,
        size: formSize,
        finish: formFinish,
        isRustResistant: formIsRustResistant,
        isWeatherResistant: formIsWeatherResistant
      },
      variants: formVariants,
      videos: formWorkshopVideoUrl ? [{ title: 'Workshop Video', url: formWorkshopVideoUrl, type: 'Workshop' }] : [],
      seo: { title: formSeoTitle || formName, description: formSeoDescription || formShortDescription, keywords: formSeoKeywords },

      rating: editingProd?.rating || 4.9,
      reviewCount: editingProd?.reviewCount || 1,
      isBestSelling: formIsBestSelling,
      isRecommended: formIsFeatured,
      badgeText: formBadgeText
    };

    if (editingProd) {
      updateProduct(editingProd.id, fullProductData);
    } else {
      addProduct(fullProductData);
    }

    setEditingProd(null);
    setActiveTab('all');
  };

  // Add Variant Row
  const handleAddVariantRow = () => {
    const newV: ProductVariant = {
      id: 'v-' + Date.now(),
      name: `${formVariants.length + 5} Feet Variant`,
      code: `VAR-${formVariants.length + 5}FT`,
      price: Math.round(formPrice * (1 + formVariants.length * 0.15)),
      stock: 10,
      weight: `${200 + formVariants.length * 50} kg`
    };
    setFormVariants([...formVariants, newV]);
  };

  // Delete Variant Row
  const handleDeleteVariantRow = (vid: string) => {
    setFormVariants(formVariants.filter((v) => v.id !== vid));
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    let csv = 'ID,Name,SKU,Category,Price,OfferPrice,Stock,Status,Rating,Views\n';
    displayedProducts.forEach((p) => {
      csv += `"${p.id}","${p.name}","${p.sku || ''}","${p.category}",${p.price},${p.discountPrice || p.price},${p.stock},"${p.status || 'Published'}",${p.rating},${p.views}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MANIKANDAN_LATHE_PRODUCTS_${Date.now()}.csv`;
    link.click();
  };

  // Live calculations for current form state
  const currentOrigPrice = Math.max(0, formPrice);
  let currentDiscountAmount = 0;
  if (formDiscountType === 'amount') {
    currentDiscountAmount = Math.max(0, Math.min(formDiscountValue, currentOrigPrice));
  } else if (formDiscountType === 'percentage') {
    const pct = Math.max(0, Math.min(100, formDiscountValue));
    currentDiscountAmount = (currentOrigPrice * pct) / 100;
  }
  const currentFinalSellingPrice = Math.max(0, currentOrigPrice - currentDiscountAmount);
  const currentDiscountPct = currentOrigPrice > 0 ? (currentDiscountAmount / currentOrigPrice) * 100 : 0;
  const currentProfit = currentFinalSellingPrice - formCostPrice;
  const currentProfitMarginPct = currentFinalSellingPrice > 0 ? (currentProfit / currentFinalSellingPrice) * 100 : 0;
  const isSellingBelowCost = formCostPrice > 0 && currentFinalSellingPrice < formCostPrice;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans antialiased pb-24">
      
      {/* ── TOP LUXURY ADMIN TITLE HEADER ── */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#F97316] text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                ENTERPRISE MANAGEMENT
              </span>
              <span className="text-xs text-gray-400 font-mono">Product Inventory & Catalog System</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">
              PRODUCT MANAGEMENT SYSTEM
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetForm();
                setActiveTab('add');
              }}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> Add New Product
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-gray-800 hover:bg-gray-700 text-white font-heading font-black text-xs px-4 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95"
            >
              <Download size={15} /> Export Catalog CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        


        {/* ── ALL PRODUCTS DATAGRID & BULK ACTIONS ── */}
        {activeTab !== 'add' && (
          <div className="space-y-6">

            {/* ── ADD PRODUCT BUTTON ROW ── */}
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-black text-lg text-[#111111] uppercase tracking-wide flex items-center gap-2">
                <Package size={20} className="text-[#F97316]" /> Product Catalog
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('add');
                }}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-1">
                <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">Total Catalog Products</span>
                <span className="font-heading font-black text-2xl text-[#111111] block">{totalCount}</span>
              </div>
              <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-1">
                <span className="text-[11px] font-mono text-green-600 font-bold uppercase block">Live Published</span>
                <span className="font-heading font-black text-2xl text-green-700 block">{publishedCount}</span>
              </div>
              <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-1">
                <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">Work In Progress Drafts</span>
                <span className="font-heading font-black text-2xl text-gray-600 block">{draftCount}</span>
              </div>
              <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-1">
                <span className="text-[11px] font-mono text-red-600 font-bold uppercase block">Out of Stock Alerts</span>
                <span className="font-heading font-black text-2xl text-red-600 block">{outOfStockCount}</span>
              </div>
              <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-1">
                <span className="text-[11px] font-mono text-amber-600 font-bold uppercase block">Hidden & Archived</span>
                <span className="font-heading font-black text-2xl text-amber-600 block">{hiddenCount}</span>
              </div>
            </div>

            {/* SEARCH, FILTER & BULK CONTROLS BAR */}
            <div className="bg-white p-4 rounded-[24px] border border-gray-200 shadow-xs space-y-4 font-sans">
              <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
                
                {/* Search Input */}
                <div className="relative flex-1 min-w-[260px]">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Name, SKU, Code, Category, Material..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 text-xs text-[#111111] pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#F97316] outline-none font-medium"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 outline-none"
                  >
                    <option value="All">All Categories</option>
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Published">Published Only</option>
                    <option value="Draft">Draft Only</option>
                    <option value="Hidden">Hidden Only</option>
                    <option value="Archived">Archived Only</option>
                  </select>

                  <select
                    value={filterStockStatus}
                    onChange={(e) => setFilterStockStatus(e.target.value)}
                    className="bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 outline-none"
                  >
                    <option value="All">All Stock Levels</option>
                    <option value="InStock">In Stock (&gt;0)</option>
                    <option value="LowStock">Low Stock (1-5)</option>
                    <option value="OutOfStock">Out of Stock (0)</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-bold text-[#F97316] outline-none"
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="views">Most Viewed</option>
                    <option value="wishlist">Most Wishlisted</option>
                    <option value="rating">Highest Rated ★</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions Bar (Appears when products are checked) */}
              {selectedIds.length > 0 && (
                <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
                  <span className="font-heading font-black text-[#F97316]">
                    ✓ {selectedIds.length} Products Selected for Batch Actions
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => bulkUpdateStatus(selectedIds, 'Published')}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Publish All
                    </button>
                    <button
                      onClick={() => bulkUpdateStatus(selectedIds, 'Hidden')}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Hide All
                    </button>
                    <button
                      onClick={() => setBulkCategoryModal(true)}
                      className="bg-[#111111] hover:bg-gray-800 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Change Category
                    </button>
                    <button
                      onClick={() => setBulkPriceModal(true)}
                      className="bg-[#111111] hover:bg-gray-800 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Update Prices (%)
                    </button>
                    <button
                      onClick={() => setBulkStockModal(true)}
                      className="bg-[#111111] hover:bg-gray-800 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Update Stock
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${selectedIds.length} selected products?`)) {
                          bulkDeleteProducts(selectedIds);
                          setSelectedIds([]);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Bulk Delete
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT DATAGRID TABLE */}
            <div className="bg-white rounded-[26px] border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1100px] text-xs font-mono">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase">
                      <th className="py-3.5 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={selectedIds.length > 0 && selectedIds.length === displayedProducts.length}
                          className="rounded text-[#F97316]"
                        />
                      </th>
                      <th className="py-3.5 px-4">Product Info</th>
                      <th className="py-3.5 px-4">SKU / Code</th>
                      <th className="py-3.5 px-4">Category & Material</th>
                      <th className="py-3.5 px-4 text-right">Price</th>
                      <th className="py-3.5 px-4 text-center">Stock</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Analytics</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {displayedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-gray-500 font-mono">
                          No products found matching filters. Click <strong>Add New Product</strong> to create items.
                        </td>
                      </tr>
                    ) : (
                      displayedProducts.map((p) => {
                        const isChecked = selectedIds.includes(p.id);
                        return (
                          <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${isChecked ? 'bg-orange-50/50' : ''}`}>
                            <td className="py-3.5 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleSelect(p.id)}
                                className="rounded text-[#F97316]"
                              />
                            </td>

                            <td className="py-3.5 px-4 font-bold text-[#111111]">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={p.images[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'}
                                  alt={p.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="font-heading font-black text-xs text-[#111111] truncate block">{p.name}</span>
                                  <span className="text-[10px] text-gray-400 block font-mono">ID: {p.id}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-gray-600 font-mono">
                              <span className="font-bold block">{p.sku || `SKU-${p.id.slice(-4)}`}</span>
                              <span className="text-[10px] text-gray-400 block">{p.productCode || 'PROD-STD'}</span>
                            </td>

                            <td className="py-3.5 px-4 text-gray-700">
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold block w-fit mb-0.5">{p.category}</span>
                              <span className="text-[10px] text-gray-500 block truncate">{p.specifications?.material || 'Steel'}</span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              {(() => {
                                const finalPrice = p.finalSellingPrice !== undefined ? p.finalSellingPrice : (p.discountPrice || p.price);
                                const origPrice = p.originalPrice || p.price;
                                const hasDiscount = finalPrice < origPrice;
                                return (
                                  <>
                                    <span className="font-heading font-black text-sm text-[#F97316] block">₹{finalPrice.toLocaleString('en-IN')}</span>
                                    {hasDiscount && (
                                      <span className="text-[10px] text-gray-400 line-through font-mono block">₹{origPrice.toLocaleString('en-IN')}</span>
                                    )}
                                  </>
                                );
                              })()}
                            </td>

                            <td className="py-3.5 px-4 text-center font-bold">
                              {p.stock > 0 ? (
                                <span className="text-green-700 font-mono">{p.stock} {p.unit}s</span>
                              ) : (
                                <span className="text-red-600 font-mono font-black">Out of Stock</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              {p.status === 'Draft' ? (
                                <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Draft</span>
                              ) : p.status === 'Hidden' ? (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Hidden</span>
                              ) : p.status === 'Archived' ? (
                                <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Archived</span>
                              ) : (
                                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Published</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center text-[11px] text-gray-500">
                              <div>👁️ {p.views || 0} views</div>
                              <div className="text-amber-500 font-bold">★ {p.rating || 4.9}</div>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setDetailProduct(p)}
                                  className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                                  title="View Full Details & Analytics"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  onClick={() => handleStartEdit(p)}
                                  className="p-2 text-[#F97316] hover:bg-orange-50 rounded-lg transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  onClick={() => duplicateProduct(p.id)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Duplicate Product"
                                >
                                  <Copy size={15} />
                                </button>
                                <button
                                  onClick={() => setDeletingProd(p)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ── TAB 2: 14-SECTION ENTERPRISE ADD / EDIT PRODUCT FORM ── */}
        {activeTab === 'add' && (
          <form onSubmit={handleSaveProductForm} className="space-y-8 font-sans">
            <div className="bg-white p-6 sm:p-8 rounded-[26px] border border-gray-200 shadow-xs space-y-8">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h2 className="font-heading font-black text-xl text-[#111111] uppercase flex items-center gap-2">
                    <Sparkles size={20} className="text-[#F97316]" /> {editingProd ? `Edit Product: ${editingProd.name}` : 'Create New Factory Product'}
                  </h2>
                  <p className="text-xs text-gray-500 font-mono">14-Section Production Ready Specifications Form</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  ← Back to Catalog
                </button>
              </div>

              {/* SECTION 1: GENERAL INFORMATION */}
              <div className="space-y-4">
                <h3 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Tag size={16} className="text-[#F97316]" /> 1. General Information & Identity
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                  <div className="md:col-span-2">
                    <label className="font-bold text-gray-700 block mb-1">Full Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. 7-Tine Heavy Duty Tractor Kalappai"
                      className="w-full bg-gray-50 p-3 rounded-xl border border-gray-300 font-bold outline-none focus:border-[#F97316]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">SKU / Model Number *</label>
                    <input
                      type="text"
                      required
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="e.g. ML-KAL-7T-2026"
                      className="w-full bg-gray-50 p-3 rounded-xl border border-gray-300 font-mono font-bold outline-none focus:border-[#F97316]"
                    />
                  </div>

                  {/* Full Product Description Textarea */}
                  <div className="md:col-span-3">
                    <label className="font-bold text-gray-700 block mb-1">
                      Full Product Description * <span className="text-gray-400 font-normal font-mono">(Displayed on Customer Product Detail Page)</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Write comprehensive product description, materials used, lathe specs, warranty, suitability for Tamil Nadu soil/farms..."
                      className="w-full bg-gray-50 p-3 rounded-xl border border-gray-300 font-sans text-xs outline-none focus:border-[#F97316]"
                    />
                  </div>

                  {/* Short Summary Description */}
                  <div className="md:col-span-3">
                    <label className="font-bold text-gray-700 block mb-1">
                      Short Summary / Highlights <span className="text-gray-400 font-normal font-mono">(1-2 sentences for product cards)</span>
                    </label>
                    <input
                      type="text"
                      value={formShortDescription}
                      onChange={(e) => setFormShortDescription(e.target.value)}
                      placeholder="e.g. Forged lathe-machined tines engineered for tough agricultural tilling..."
                      className="w-full bg-gray-50 p-3 rounded-xl border border-gray-300 outline-none focus:border-[#F97316]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Primary Category *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-gray-50 p-3 rounded-xl border border-gray-300 font-bold outline-none focus:border-[#F97316]"
                    >
                      {categories.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Sub Category</label>
                    <input
                      type="text"
                      value={formSubCategory}
                      onChange={(e) => setFormSubCategory(e.target.value)}
                      placeholder="e.g. Forged Attachments"
                      className="w-full bg-gray-50 p-3 rounded-xl border border-gray-300 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Manufacturing Type</label>
                    <select
                      value={formProductType}
                      onChange={(e) => setFormProductType(e.target.value as any)}
                      className="w-full bg-gray-50 p-3 rounded-xl border border-gray-300 font-bold text-[#F97316] outline-none"
                    >
                      <option value="Ready Stock">Ready Stock</option>
                      <option value="Made To Order">Made To Order</option>
                      <option value="Custom Fabrication">Custom Fabrication</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRICING, DISCOUNT & MARGIN */}
              <div className="space-y-6 bg-gray-50/60 p-5 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={18} className="text-[#F97316]" /> 2. PRICING, DISCOUNT & MARGIN
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">Single Source of Truth for Product Pricing</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs font-sans items-start">
                  {/* Original Price */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="font-bold text-gray-800 block">Original Price (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        required
                        min={1}
                        value={formPrice || ''}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        placeholder="e.g. 40000"
                        className="w-full bg-white pl-8 pr-4 py-3 rounded-xl border border-gray-300 font-mono font-black text-sm text-[#111111] outline-none focus:border-[#F97316] shadow-xs"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono block">Normal/base selling price before discount</span>
                  </div>

                  {/* Discount Type Selector */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="font-bold text-gray-800 block">Discount Type</label>
                    <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-gray-300">
                      <button
                        type="button"
                        onClick={() => {
                          setFormDiscountType('none');
                          setFormDiscountValue(0);
                        }}
                        className={`py-2 text-[11px] font-heading font-bold rounded-lg transition-all cursor-pointer ${
                          formDiscountType === 'none'
                            ? 'bg-[#111111] text-white shadow-xs'
                            : 'text-gray-600 hover:text-black hover:bg-gray-100'
                        }`}
                      >
                        No Discount
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormDiscountType('amount')}
                        className={`py-2 text-[11px] font-heading font-bold rounded-lg transition-all cursor-pointer ${
                          formDiscountType === 'amount'
                            ? 'bg-[#F97316] text-white shadow-xs'
                            : 'text-gray-600 hover:text-black hover:bg-gray-100'
                        }`}
                      >
                        ₹ Amount
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormDiscountType('percentage')}
                        className={`py-2 text-[11px] font-heading font-bold rounded-lg transition-all cursor-pointer ${
                          formDiscountType === 'percentage'
                            ? 'bg-[#F97316] text-white shadow-xs'
                            : 'text-gray-600 hover:text-black hover:bg-gray-100'
                        }`}
                      >
                        % Percentage
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono block">Select ₹ flat discount or % percentage</span>
                  </div>

                  {/* Discount Value */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="font-bold text-gray-800 block">
                      Discount Value {formDiscountType === 'amount' ? '(₹)' : formDiscountType === 'percentage' ? '(%)' : ''}
                    </label>
                    <div className="relative">
                      {formDiscountType === 'amount' && (
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">₹</span>
                      )}
                      <input
                        type="number"
                        disabled={formDiscountType === 'none'}
                        value={formDiscountType === 'none' ? 0 : (formDiscountValue || '')}
                        onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                        placeholder={formDiscountType === 'amount' ? 'e.g. 3000' : formDiscountType === 'percentage' ? 'e.g. 7.5' : 'No Discount'}
                        className={`w-full bg-white py-3 rounded-xl border font-mono font-bold text-sm outline-none transition-all ${
                          formDiscountType === 'amount' ? 'pl-8 pr-4' : 'px-4'
                        } ${
                          formDiscountType === 'none'
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'text-[#F97316] border-gray-300 focus:border-[#F97316]'
                        }`}
                      />
                    </div>
                    {formDiscountType === 'amount' && formDiscountValue > currentOrigPrice && (
                      <span className="text-[11px] text-red-600 font-bold block animate-fade-in">
                        ⚠ Discount cannot be greater than the original price.
                      </span>
                    )}
                    {formDiscountType === 'percentage' && formDiscountValue > 100 && (
                      <span className="text-[11px] text-red-600 font-bold block animate-fade-in">
                        ⚠ Discount percentage cannot exceed 100%.
                      </span>
                    )}
                  </div>

                  {/* Final Selling Price (READ ONLY AUTO CALCULATED) */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-900 block">Final Selling Price (₹)</label>
                      <span className="bg-orange-100 text-[#F97316] text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase">
                        AUTO CALCULATED
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#F97316] text-sm">₹</span>
                      <input
                        type="text"
                        readOnly
                        value={currentFinalSellingPrice.toLocaleString('en-IN')}
                        className="w-full bg-orange-50/70 pl-8 pr-4 py-3 rounded-xl border-2 border-orange-200 font-mono font-black text-base text-[#F97316] shadow-xs cursor-default outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono block">
                      Customer selling price (Original - Discount)
                    </span>
                  </div>

                  {/* Cost Price */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="font-bold text-gray-800 block">Cost Price (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={formCostPrice || ''}
                        onChange={(e) => setFormCostPrice(Number(e.target.value))}
                        placeholder="e.g. 24050"
                        className="w-full bg-white pl-8 pr-4 py-3 rounded-xl border border-gray-300 font-mono text-sm font-bold outline-none focus:border-[#F97316]"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono block">Actual manufacturing / purchase cost to MANIKANDAN LATHE</span>
                  </div>

                  {/* Unit of Measurement */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="font-bold text-gray-800 block">Unit of Measurement</label>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="w-full bg-white p-3 rounded-xl border border-gray-300 font-bold outline-none focus:border-[#F97316]"
                    >
                      <option value="Piece">Piece</option>
                      <option value="Set">Set</option>
                      <option value="Kg">Kg</option>
                      <option value="SqFt">Square Feet</option>
                      <option value="Feet">Feet</option>
                      <option value="Meter">Meter</option>
                      <option value="Job">Job / Custom</option>
                    </select>
                    <span className="text-[10px] text-gray-400 font-mono block">Selling unit denomination</span>
                  </div>
                </div>

                {/* Loss Warning Banner */}
                {isSellingBelowCost && (
                  <div className="bg-red-50 border-2 border-red-300 p-4 rounded-2xl flex items-center justify-between gap-3 text-red-950 font-sans shadow-xs animate-pulse">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={24} className="text-red-600 shrink-0" />
                      <div>
                        <span className="font-heading font-black text-xs text-red-700 uppercase tracking-wider block">
                          ⚠ SELLING BELOW COST WARNING
                        </span>
                        <span className="text-xs font-medium text-red-900">
                          Final Selling Price (₹{currentFinalSellingPrice.toLocaleString('en-IN')}) is lower than Cost Price (₹{formCostPrice.toLocaleString('en-IN')}).
                          Estimated Loss: <strong className="font-mono text-red-700">-₹{Math.abs(currentProfit).toLocaleString('en-IN')}</strong>
                        </span>
                      </div>
                    </div>
                    <span className="bg-red-200 text-red-900 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase shrink-0">
                      Loss Allowed on Save
                    </span>
                  </div>
                )}

                {/* PRICE SUMMARY CARD */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <h4 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Sparkles size={15} className="text-[#F97316]" /> Live Price, Profit & Margin Summary
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-500 font-mono block uppercase">Original Base Price</span>
                      <span className="font-heading font-black text-base text-[#111111]">
                        ₹{currentOrigPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-500 font-mono block uppercase">Discount Amount</span>
                      <span className="font-heading font-black text-base text-[#F97316]">
                        {currentDiscountAmount > 0 ? `-₹${currentDiscountAmount.toLocaleString('en-IN')} (${currentDiscountPct.toFixed(1)}%)` : 'No Discount'}
                      </span>
                    </div>

                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-200">
                      <span className="text-[10px] text-orange-950 font-mono font-bold block uppercase">FINAL SELLING PRICE</span>
                      <span className="font-heading font-black text-lg text-[#F97316]">
                        ₹{currentFinalSellingPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-500 font-mono block uppercase">Cost Price</span>
                      <span className="font-heading font-black text-base text-gray-700">
                        ₹{formCostPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      currentProfit >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-red-50 border-red-200 text-red-950'
                    }`}>
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold block">Estimated Profit per Unit</span>
                        <span className={`font-heading font-black text-base ${currentProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {currentProfit >= 0 ? `+₹${currentProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(currentProfit).toLocaleString('en-IN')}`}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        currentProfit >= 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
                      }`}>
                        {currentProfit >= 0 ? 'Profit' : 'Loss'}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      currentProfitMarginPct >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-red-50 border-red-200 text-red-950'
                    }`}>
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold block">Profit Margin Percentage</span>
                        <span className={`font-heading font-black text-base ${currentProfitMarginPct >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {currentProfitMarginPct.toFixed(1)}%
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        currentProfitMarginPct >= 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
                      }`}>
                        Margin %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2.5: SELECTABLE PRODUCT FEATURE TAGS */}
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider flex items-center gap-2">
                    <Tag size={16} className="text-[#F97316]" /> Selectable Product Feature Tags
                  </h3>
                  <span className="text-[11px] text-gray-500 font-mono">Displayed on Customer Product Detail Page</span>
                </div>

                <p className="text-xs text-gray-600 font-sans">
                  Select feature tags for this product. Only the selected tags will be displayed on the customer product detail page.
                </p>

                {/* Selected Tags Chips */}
                <div className="space-y-2">
                  <label className="font-bold text-xs text-gray-800 block">Currently Selected Tags ({formTags.length})</label>
                  {formTags.length === 0 ? (
                    <span className="text-xs text-gray-400 italic block font-mono">No tags selected yet. Click preset tags below or add custom tags.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2 py-1">
                      {formTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-300 text-[#111111] text-xs font-heading font-extrabold px-3 py-1.5 rounded-xl shadow-xs"
                        >
                          <CheckCircle2 size={14} className="text-[#F97316]" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => setFormTags(formTags.filter((t) => t !== tag))}
                            className="text-gray-400 hover:text-red-600 transition-colors ml-1 cursor-pointer"
                            title="Remove Tag"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preset Tags Chooser */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="font-bold text-xs text-gray-700 block">Available Preset Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TAGS.map((tag) => {
                      const isSelected = formTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormTags(formTags.filter((t) => t !== tag));
                            } else {
                              setFormTags([...formTags, tag]);
                            }
                          }}
                          className={`text-xs font-heading font-extrabold px-3 py-1.5 rounded-xl transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-[#F97316] text-white border-[#F97316] shadow-xs'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Tag Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    placeholder="Type custom feature tag..."
                    className="flex-1 bg-gray-50 text-xs text-[#111111] p-2.5 rounded-xl border border-gray-300 outline-none focus:border-[#F97316]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customTagInput.trim() && !formTags.includes(customTagInput.trim())) {
                          setFormTags([...formTags, customTagInput.trim()]);
                          setCustomTagInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customTagInput.trim() && !formTags.includes(customTagInput.trim())) {
                        setFormTags([...formTags, customTagInput.trim()]);
                        setCustomTagInput('');
                      }
                    }}
                    className="bg-[#111111] hover:bg-[#F97316] text-white text-xs font-heading font-black px-4 py-2.5 rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    + Add Custom Tag
                  </button>
                </div>
              </div>

              {/* SECTION 3: VARIANTS MATRIX */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider flex items-center gap-2">
                    <Sliders size={16} className="text-[#F97316]" /> 3. Selectable Product Variants
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="bg-[#111111] hover:bg-[#F97316] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Variant Option
                  </button>
                </div>

                <div className="space-y-3">
                  {formVariants.map((v, idx) => (
                    <div key={v.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 block">Variant Name</span>
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormVariants(formVariants.map((vItem) => (vItem.id === v.id ? { ...vItem, name: val } : vItem)));
                          }}
                          className="w-full bg-white p-2 rounded-xl border border-gray-300 font-bold"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-500 block">Price (₹)</span>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormVariants(formVariants.map((vItem) => (vItem.id === v.id ? { ...vItem, price: val } : vItem)));
                          }}
                          className="w-full bg-white p-2 rounded-xl border border-gray-300 font-mono font-bold text-[#F97316]"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-500 block">Weight</span>
                        <input
                          type="text"
                          value={v.weight || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormVariants(formVariants.map((vItem) => (vItem.id === v.id ? { ...vItem, weight: val } : vItem)));
                          }}
                          placeholder="e.g. 240 kg"
                          className="w-full bg-white p-2 rounded-xl border border-gray-300 font-mono"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-500 block">Stock Qty</span>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormVariants(formVariants.map((vItem) => (vItem.id === v.id ? { ...vItem, stock: val } : vItem)));
                          }}
                          className="w-full bg-white p-2 rounded-xl border border-gray-300 font-mono"
                        />
                      </div>

                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteVariantRow(v.id)}
                          className="text-red-600 hover:bg-red-100 p-2 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: PRODUCT IMAGES (UP TO 20 IMAGES) */}
              <div className="space-y-4">
                <h3 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                  <UploadCloud size={16} className="text-[#F97316]" /> 4. Product Gallery Images ({formImages.length}/20)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {formImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-300 group bg-gray-100">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormImages(formImages.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 bg-[#F97316] text-white text-[8px] font-black px-2 py-0.5 rounded">
                          Thumbnail
                        </span>
                      )}
                    </div>
                  ))}

                  {formImages.length < 20 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#F97316] transition-colors p-2 text-center bg-gray-50">
                      <Upload size={20} className="text-gray-400 mb-1" />
                      <span className="text-[10px] font-bold text-gray-600">Upload Image</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* SAVE / PUBLISH ACTIONS */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-black text-xs px-5 py-3 rounded-xl"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormStatus('Draft');
                    }}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-heading font-black text-xs px-5 py-3 rounded-xl"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-8 py-3.5 rounded-xl shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <CheckCircle2 size={16} /> {editingProd ? 'Update Product' : 'Publish Product to Live Shop'}
                  </button>
                </div>
              </div>

            </div>
          </form>
        )}

        {/* ── TAB 3: CATEGORIES MANAGER ── */}
        {activeTab === 'categories' && (
          <div className="bg-white p-6 sm:p-8 rounded-[26px] border border-gray-200 shadow-xs space-y-6">
            <h3 className="font-heading font-black text-lg text-[#111111]">CATEGORIES & SUBCATEGORIES MANAGEMENT</h3>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="New Category Name..."
                className="flex-1 bg-gray-50 p-2.5 rounded-xl border border-gray-300 text-xs font-bold"
              />
              <button
                onClick={() => {
                  if (newCategoryInput.trim()) {
                    addCategory(newCategoryInput.trim());
                    setNewCategoryInput('');
                  }
                }}
                className="bg-[#F97316] text-white text-xs font-bold px-4 py-2.5 rounded-xl"
              >
                Add Category
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {categories.filter((c) => c !== 'All').map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                return (
                  <div key={cat} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-heading font-black text-xs text-[#111111]">{cat}</h4>
                      <span className="text-[10px] text-gray-500 font-mono">{count} Products</span>
                    </div>
                    <button onClick={() => deleteCategory(cat)} className="text-red-600 p-1.5 hover:bg-red-50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 6: INVENTORY ALERTS ── */}
        {activeTab === 'inventory' && (
          <div className="bg-white p-6 sm:p-8 rounded-[26px] border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-heading font-black text-lg text-[#111111]">LOW STOCK & INVENTORY ALERTS</h3>
            <div className="space-y-3">
              {products.filter((p) => p.stock <= 5).map((p) => (
                <div key={p.id} className="p-4 bg-red-50 rounded-2xl border border-red-200 flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={18} className="text-red-600" />
                    <div>
                      <h4 className="font-heading font-black text-xs text-[#111111]">{p.name}</h4>
                      <span className="text-[10px] text-red-700 font-bold">Remaining Stock: {p.stock} units</span>
                    </div>
                  </div>
                  <button onClick={() => handleStartEdit(p)} className="bg-[#111111] text-white font-bold px-3 py-1.5 rounded-xl">
                    Restock
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── DETAIL DRAWER MODAL ── */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-end p-0">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 text-xs font-sans">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <span className="text-[#F97316] font-mono font-bold uppercase">{detailProduct.category}</span>
                <h3 className="font-heading font-black text-lg text-[#111111]">{detailProduct.name}</h3>
              </div>
              <button onClick={() => setDetailProduct(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
              <img src={detailProduct.images[0]} alt={detailProduct.name} className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-mono text-[10px] block">PRICE</span>
                <strong className="font-heading font-black text-sm text-[#F97316]">₹{detailProduct.price.toLocaleString('en-IN')}</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-mono text-[10px] block">STOCK</span>
                <strong className="font-heading font-black text-sm text-[#111111]">{detailProduct.stock} {detailProduct.unit}s</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-mono text-[10px] block">VIEWS</span>
                <strong className="font-heading font-black text-sm text-[#111111]">{detailProduct.views || 0}</strong>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-3">
              <h4 className="font-heading font-black text-xs text-[#111111] uppercase">Description</h4>
              <p className="text-gray-700 leading-relaxed">{detailProduct.description}</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => { setDetailProduct(null); handleStartEdit(detailProduct); }} className="flex-1 bg-[#F97316] text-white font-heading font-black py-3 rounded-xl">
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK CATEGORY MODAL */}
      {bulkCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 font-sans text-xs">
            <h3 className="font-heading font-black text-sm">Bulk Change Category ({selectedIds.length} Products)</h3>
            <select value={bulkCategoryValue} onChange={(e) => setBulkCategoryValue(e.target.value)} className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-xl border border-gray-300 font-medium text-gray-900 focus:border-[#F97316]">

              {categories.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setBulkCategoryModal(false)} className="bg-gray-200 px-4 py-2 rounded-xl">Cancel</button>
              <button onClick={() => { bulkUpdateCategory(selectedIds, bulkCategoryValue); setSelectedIds([]); setBulkCategoryModal(false); }} className="bg-[#F97316] text-white font-bold px-4 py-2 rounded-xl">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Modal */}
      <GenericDeleteModal
        isOpen={!!deletingProd}
        title="Delete Machinery Product"
        itemTitle={deletingProd?.name}
        description={`Are you sure you want to delete product "${deletingProd?.name}" from your catalog?`}
        onClose={() => setDeletingProd(null)}
        onConfirm={async () => {
          if (deletingProd) {
            deleteProduct(deletingProd.id);
          }
        }}
      />
    </div>
  );
};
