import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';
import { supabase } from '../services/supabase';
import { fetchAllProducts } from '../services/supabaseService';

interface ProductContextType {
  products: Product[];
  categories: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  filteredProducts: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'views'>) => Promise<void>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  duplicateProduct: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: 'Published' | 'Draft' | 'Hidden' | 'Archived') => Promise<void>;
  bulkUpdateCategory: (ids: string[], category: string) => Promise<void>;
  bulkUpdatePrice: (ids: string[], priceAdjustmentPercent: number) => Promise<void>;
  bulkUpdateStock: (ids: string[], newStock: number) => Promise<void>;
  addCategory: (categoryName: string) => void;
  deleteCategory: (categoryName: string) => void;
  getProductById: (id: string) => Product | undefined;
  incrementViews: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([
    'All', 'Windows Grill', 'Gates', 'Doors', 'Steel Furniture', 'Tractor Kalappai', 'Machine Works', 'Custom Fabrication'
  ]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllProducts();
      if (data.length) {
        setProducts(data);
      } else {
        const savedLocal = localStorage.getItem('ml_products_override');
        if (savedLocal) {
          setProducts(JSON.parse(savedLocal));
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
      }
    } catch {
      const savedLocal = localStorage.getItem('ml_products_override');
      setProducts(savedLocal ? JSON.parse(savedLocal) : INITIAL_PRODUCTS);
    } fontFinally: {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  // Sync to local storage for instant offline / local state fallback
  const syncLocal = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('ml_products_override', JSON.stringify(updatedProducts));
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    let matchesFilter = true;
    if (selectedFilter === 'Ready Stock') matchesFilter = p.isReadyStock;
    else if (selectedFilter === 'Made To Order') matchesFilter = p.isMadeToOrder;
    else if (selectedFilter === 'Best Selling') matchesFilter = !!p.isBestSelling;
    else if (selectedFilter === 'Trending') matchesFilter = !!p.isTrending;
    else if (selectedFilter === 'Premium Collection') matchesFilter = !!p.isPremium;
    else if (selectedFilter === 'Budget Friendly') matchesFilter = !!p.isBudgetFriendly;
    else if (selectedFilter === 'Festival Offers') matchesFilter = !!p.isFestivalOffer;
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const addProduct = async (productData: Omit<Product, 'id' | 'views'>) => {
    const id = 'prod-' + Date.now();
    const newProduct: Product = {
      ...productData,
      id,
      views: 0,
      status: productData.status || 'Published',
      wishlistCount: 0,
      totalOrdersCount: 0,
      totalRevenueGenerated: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [newProduct, ...products];
    syncLocal(updated);

    await supabase.from('products').insert({
      id,
      views: 0,
      name: newProduct.name,
      category: newProduct.category,
      sub_category: newProduct.subCategory,
      price: newProduct.originalPrice || newProduct.price,
      original_price: newProduct.originalPrice || newProduct.price,
      discount_type: newProduct.discountType || 'none',
      discount_value: newProduct.discountValue || 0,
      discount_amount: newProduct.discountAmount || 0,
      final_selling_price: newProduct.finalSellingPrice || newProduct.price,
      discount_price: newProduct.discountAmount ? newProduct.finalSellingPrice : null,
      cost_price: newProduct.costPrice || 0,
      profit_margin: newProduct.profitMargin || 0,
      tags: newProduct.tags || [],
      unit: newProduct.unit,
      stock: newProduct.stock,
      is_ready_stock: newProduct.isReadyStock,
      is_made_to_order: newProduct.isMadeToOrder,
      images: newProduct.images,
      description: newProduct.description,
      specifications: newProduct.specifications,
      rating: newProduct.rating || 4.9,
      review_count: newProduct.reviewCount || 1,
      is_recommended: newProduct.isRecommended,
      is_best_selling: newProduct.isBestSelling,
      is_trending: newProduct.isTrending,
      is_premium: newProduct.isPremium,
      is_budget_friendly: newProduct.isBudgetFriendly,
      is_festival_offer: newProduct.isFestivalOffer,
      badge_text: newProduct.badgeText,
    });
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    const nextProducts = products.map((p) => (p.id === id ? { ...p, ...updated } : p));
    syncLocal(nextProducts);

    const mapped: Record<string, unknown> = {};
    if (updated.name !== undefined) mapped.name = updated.name;
    if (updated.category !== undefined) mapped.category = updated.category;
    if (updated.price !== undefined || updated.originalPrice !== undefined) {
      const pVal = updated.originalPrice ?? updated.price;
      mapped.price = pVal;
      mapped.original_price = pVal;
    }
    if (updated.discountType !== undefined) mapped.discount_type = updated.discountType;
    if (updated.discountValue !== undefined) mapped.discount_value = updated.discountValue;
    if (updated.discountAmount !== undefined) mapped.discount_amount = updated.discountAmount;
    if (updated.finalSellingPrice !== undefined) {
      mapped.final_selling_price = updated.finalSellingPrice;
      mapped.discount_price = (updated.discountAmount && updated.discountAmount > 0) ? updated.finalSellingPrice : null;
    } else if (updated.discountPrice !== undefined) {
      mapped.discount_price = updated.discountPrice;
    }
    if (updated.costPrice !== undefined) mapped.cost_price = updated.costPrice;
    if (updated.profitMargin !== undefined) mapped.profit_margin = updated.profitMargin;
    if (updated.tags !== undefined) mapped.tags = updated.tags;
    if (updated.stock !== undefined) mapped.stock = updated.stock;
    if (updated.images !== undefined) mapped.images = updated.images;
    if (updated.description !== undefined) mapped.description = updated.description;
    if (updated.specifications !== undefined) mapped.specifications = updated.specifications;
    if (updated.isRecommended !== undefined) mapped.is_recommended = updated.isRecommended;
    if (updated.isBestSelling !== undefined) mapped.is_best_selling = updated.isBestSelling;
    if (updated.isTrending !== undefined) mapped.is_trending = updated.isTrending;
    if (updated.badgeText !== undefined) mapped.badge_text = updated.badgeText;
    
    await supabase.from('products').update(mapped).eq('id', id);
  };

  const duplicateProduct = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    const dup: Product = {
      ...target,
      id: 'prod-' + Date.now(),
      name: `${target.name} (Copy)`,
      sku: target.sku ? `${target.sku}-COPY` : undefined,
      views: 0,
      createdAt: new Date().toISOString()
    };

    const nextProducts = [dup, ...products];
    syncLocal(nextProducts);
  };

  const deleteProduct = async (id: string) => {
    const nextProducts = products.filter((p) => p.id !== id);
    syncLocal(nextProducts);
    await supabase.from('products').delete().eq('id', id);
  };

  const bulkDeleteProducts = async (ids: string[]) => {
    const nextProducts = products.filter((p) => !ids.includes(p.id));
    syncLocal(nextProducts);
    await supabase.from('products').delete().in('id', ids);
  };

  const bulkUpdateStatus = async (ids: string[], status: 'Published' | 'Draft' | 'Hidden' | 'Archived') => {
    const nextProducts = products.map((p) => (ids.includes(p.id) ? { ...p, status } : p));
    syncLocal(nextProducts);
  };

  const bulkUpdateCategory = async (ids: string[], category: string) => {
    const nextProducts = products.map((p) => (ids.includes(p.id) ? { ...p, category } : p));
    syncLocal(nextProducts);
  };

  const bulkUpdatePrice = async (ids: string[], priceAdjustmentPercent: number) => {
    const nextProducts = products.map((p) => {
      if (ids.includes(p.id)) {
        const factor = 1 + priceAdjustmentPercent / 100;
        return { ...p, price: Math.round(p.price * factor) };
      }
      return p;
    });
    syncLocal(nextProducts);
  };

  const bulkUpdateStock = async (ids: string[], newStock: number) => {
    const nextProducts = products.map((p) => (ids.includes(p.id) ? { ...p, stock: newStock } : p));
    syncLocal(nextProducts);
  };

  const addCategory = (categoryName: string) => {
    if (!categories.includes(categoryName)) {
      setCategories([...categories, categoryName]);
    }
  };

  const deleteCategory = (categoryName: string) => {
    setCategories(categories.filter((c) => c !== categoryName));
  };

  const getProductById = (id: string) => products.find((p) => p.id === id);

  const incrementViews = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, views: p.views + 1 } : p));
    supabase.from('products').select('views').eq('id', id).single().then(({ data }) => {
      if (data) supabase.from('products').update({ views: (data.views as number) + 1 }).eq('id', id);
    });
  };

  return (
    <ProductContext.Provider value={{
      products, categories, searchQuery, setSearchQuery,
      selectedCategory, setSelectedCategory, selectedFilter, setSelectedFilter,
      filteredProducts, loading, addProduct, updateProduct, duplicateProduct, deleteProduct,
      bulkDeleteProducts, bulkUpdateStatus, bulkUpdateCategory, bulkUpdatePrice, bulkUpdateStock,
      addCategory, deleteCategory, getProductById, incrementViews,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
};
