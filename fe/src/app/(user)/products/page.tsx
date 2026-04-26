'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingCart, ChevronDown, Heart, SlidersHorizontal, X, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import { Product, Genre, Author, Publisher } from '@/types';
import { toSlug } from '@/utils/slug';
import { API_URL } from '@/utils/constants';
import { formatVND } from '@/utils/format';


interface FilterOverrides {
  page?: number;
  search?: string;
  sort_by?: string;
  genres?: string[];
  authors?: string[];
  publishers?: string[];
  minPrice?: string;
  maxPrice?: string;
  rating?: number | null;
}

function ProductsContent() {
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // DERIVED ACTIVE STATES (Source of truth: URL)
  const searchQuery = searchParams?.get('search') || '';
  const sortBy = searchParams?.get('sort_by') || 'name_asc';
  const currentPage = Number(searchParams?.get('page')) || 1;
  const selectedCategory = useMemo(() => 
    searchParams?.get('genres')?.split(',').filter(Boolean) || (searchParams?.get('genre') ? [searchParams.get('genre')!] : []),
    [searchParams]
  );
  const selectedAuthors = useMemo(() => 
    searchParams?.get('authors')?.split(',').filter(Boolean) || [],
    [searchParams]
  );
  const selectedPublishers = useMemo(() => 
    searchParams?.get('publishers')?.split(',').filter(Boolean) || [],
    [searchParams]
  );
  const minPrice = searchParams?.get('minPrice') || '';
  const maxPrice = searchParams?.get('maxPrice') || '';
  const activeRating = searchParams?.get('rating') ? Number(searchParams.get('rating')) : null;

  // UI TEMP STATES (Overrides for local editing)
  const [localSearch, setLocalSearch] = useState<string | null>(null);
  const [localCategory, setLocalCategory] = useState<string[] | null>(null);
  const [localAuthors, setLocalAuthors] = useState<string[] | null>(null);
  const [localPublishers, setLocalPublishers] = useState<string[] | null>(null);
  const [localMinPrice, setLocalMinPrice] = useState<string | null>(null);
  const [localMaxPrice, setLocalMaxPrice] = useState<string | null>(null);
  const [localRating, setLocalRating] = useState<number | null | undefined>(undefined);

  const tempSearch = localSearch ?? searchQuery;
  const tempCategory = localCategory ?? selectedCategory;
  const tempAuthors = localAuthors ?? selectedAuthors;
  const tempPublishers = localPublishers ?? selectedPublishers;
  const tempMinPrice = localMinPrice ?? minPrice;
  const tempMaxPrice = localMaxPrice ?? maxPrice;
  const tempRating = localRating !== undefined ? localRating : activeRating;

  const [isSortOpen, setIsSortOpen] = useState(false);

  // Toggle States (Collapsible)
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isAuthorOpen, setIsAuthorOpen] = useState(false);
  const [isPublisherOpen, setIsPublisherOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isRatingOpen, setIsRatingOpen] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Search filter states
  const [genreSearch, setGenreSearch] = useState('');
  const [debouncedGenreSearch, setDebouncedGenreSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [debouncedAuthorSearch, setDebouncedAuthorSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGenreSearch(genreSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [genreSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAuthorSearch(authorSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [authorSearch]);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 20;

  const [genres, setGenres] = useState<Genre[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', itemsPerPage.toString());
      params.append('page', page.toString());
      
      if (searchQuery) params.append('search', searchQuery);
      
      if (sortBy === 'name_asc') { params.append('sort', 'title'); params.append('order', 'ASC'); }
      if (sortBy === 'name_desc') { params.append('sort', 'title'); params.append('order', 'DESC'); }
      if (sortBy === 'price_asc') { params.append('sort', 'price'); params.append('order', 'ASC'); }
      if (sortBy === 'price_desc') { params.append('sort', 'price'); params.append('order', 'DESC'); }
      if (sortBy === 'sold_desc') { params.append('sort', 'soldCount'); params.append('order', 'DESC'); }

      selectedCategory.forEach(id => params.append('genreIds', id));
      selectedAuthors.forEach(id => params.append('authorIds', id));
      selectedPublishers.forEach(id => params.append('publisherIds', id));

      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (activeRating) params.append('rating', activeRating.toString());

      const [genresRes, productsRes, authorsRes, publishersRes] = await Promise.all([
        fetch(`${API_URL}/genres`),
        fetch(`${API_URL}/products?${params.toString()}`),
        fetch(`${API_URL}/authors`),
        fetch(`${API_URL}/publishers`)
      ]);
      
      const genresData = await genresRes.json();
      const productsData = await productsRes.json();
      const authorsData = await authorsRes.json();
      const publishersData = await publishersRes.json();

      setGenres(Array.isArray(genresData) ? genresData : []);
      setProducts(Array.isArray(productsData.data) ? productsData.data : []);
      setTotalProducts(productsData.total || 0);
      setAuthors(Array.isArray(authorsData) ? authorsData : []);
      setPublishers(Array.isArray(publishersData) ? publishersData : []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, selectedCategory, selectedAuthors, selectedPublishers, minPrice, maxPrice, activeRating]);

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      fetchData(currentPage);
    };
    load();
  }, [currentPage, fetchData]);

  const filteredProducts = products;

  const applyFilters = useCallback((overrides: FilterOverrides = {}) => {
    const params = new URLSearchParams();
    
    // Use overrides or current temp states
    const page = overrides.page || 1;
    const search = overrides.search !== undefined ? overrides.search : tempSearch;
    const sort = overrides.sort_by || sortBy;
    const genres = overrides.genres || tempCategory;
    const authors = overrides.authors || tempAuthors;
    const publishers = overrides.publishers || tempPublishers;
    const minP = overrides.minPrice !== undefined ? overrides.minPrice : tempMinPrice;
    const maxP = overrides.maxPrice !== undefined ? overrides.maxPrice : tempMaxPrice;
    const rating = overrides.rating !== undefined ? overrides.rating : tempRating;

    if (page > 1) params.set('page', page.toString());
    if (search) params.set('search', search);
    if (sort !== 'name_asc') params.set('sort_by', sort);
    if (genres.length > 0) params.set('genres', genres.join(','));
    if (authors.length > 0) params.set('authors', authors.join(','));
    if (publishers.length > 0) params.set('publishers', publishers.join(','));
    if (minP) params.set('minPrice', minP);
    if (maxP) params.set('maxPrice', maxP);
    if (rating) params.set('rating', rating.toString());

    const query = params.toString();
    router.push(`${pathname}${query ? '?' + query : ''}`, { scroll: false });
  }, [tempSearch, sortBy, tempCategory, tempAuthors, tempPublishers, tempMinPrice, tempMaxPrice, tempRating, router, pathname]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(currentPage);
  }, [currentPage, fetchData, searchQuery, sortBy, selectedCategory, selectedAuthors, selectedPublishers, minPrice, maxPrice, activeRating]);

  // Scroll Restoration
  useEffect(() => {
    if (!loading && products.length > 0) {
      const savedScroll = sessionStorage.getItem('products-scroll-pos');
      if (savedScroll) {
        window.scrollTo(0, parseInt(savedScroll));
        sessionStorage.removeItem('products-scroll-pos');
      }
    }
  }, [loading, products]);

  useEffect(() => {
    const handleScroll = () => {
      if (pathname === '/products') {
        sessionStorage.setItem('products-scroll-pos', window.scrollY.toString());
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleApplyFilters = () => {
    applyFilters({ page: 1 });
  };

  const handleSearch = (e?: React.KeyboardEvent) => {
    if (!e || e.key === 'Enter') {
      applyFilters({ search: tempSearch, page: 1 });
    }
  };

  const handleReset = () => {
    setLocalSearch(null);
    setLocalCategory(null);
    setLocalAuthors(null);
    setLocalPublishers(null);
    setLocalMinPrice(null);
    setLocalMaxPrice(null);
    setLocalRating(undefined);
    setIsMobileFilterOpen(false);
    router.push(pathname, { scroll: false });
  };

  const sortOptions = [
    { id: 'name_asc', label: 'Tên (A-Z)' },
    { id: 'name_desc', label: 'Tên (Z-A)' },
    { id: 'price_asc', label: 'Giá tăng dần' },
    { id: 'price_desc', label: 'Giá giảm dần' },
    { id: 'sold_desc', label: 'Bán chạy nhất' },
  ];

  const renderFilterContent = () => (
    <div className="space-y-5">
      {/* Category Filter */}
      <div className="border-b border-gray-200 pb-2">
        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 group"
        >
          <span>Danh mục</span>
          <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''} group-hover:text-gray-600`} />
        </button>
        {isCategoryOpen && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm thể loại..."
                value={genreSearch}
                onChange={(e) => setGenreSearch(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white pl-7 pr-2 py-1 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
              />
              {genreSearch && (
                <button
                  onClick={() => setGenreSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              <label className="flex items-center gap-2 px-1 py-0.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={tempCategory.length === 0}
                  onChange={() => setLocalCategory([])}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span className={`text-sm ${tempCategory.length === 0 ? 'text-red-600 font-semibold' : 'text-gray-600'} group-hover:text-gray-900`}>Tất cả</span>
              </label>
              {genres
                .filter(cat => cat.name.toLowerCase().includes(debouncedGenreSearch.toLowerCase()))
                .map((cat, idx) => (
                  <label key={idx} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={tempCategory.includes(cat.id)}
                      onChange={() => {
                        if (tempCategory.includes(cat.id)) {
                          setLocalCategory(tempCategory.filter(id => id !== cat.id));
                        } else {
                          setLocalCategory([...tempCategory, cat.id]);
                        }
                      }}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span className={`text-sm truncate ${tempCategory.includes(cat.id) ? 'text-red-600 font-semibold' : 'text-gray-600'} group-hover:text-gray-900`}>{cat.name}</span>
                  </label>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Author Filter */}
      <div className="border-b border-gray-200 pb-2">
        <button
          onClick={() => setIsAuthorOpen(!isAuthorOpen)}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 group"
        >
          <span>Tác giả</span>
          <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isAuthorOpen ? 'rotate-180' : ''} group-hover:text-gray-600`} />
        </button>
        {isAuthorOpen && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tác giả..."
                value={authorSearch}
                onChange={(e) => setAuthorSearch(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white pl-7 pr-2 py-1 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
              />
              {authorSearch && (
                <button
                  onClick={() => setAuthorSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {authors.length > 0 ? authors
                .filter(auth => auth.name.toLowerCase().includes(debouncedAuthorSearch.toLowerCase()))
                .map((auth, idx) => (
                  <label key={idx} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={tempAuthors.includes(auth.id)}
                      onChange={() => {
                        if (tempAuthors.includes(auth.id)) {
                          setLocalAuthors(tempAuthors.filter(a => a !== auth.id));
                        } else {
                          setLocalAuthors([...tempAuthors, auth.id]);
                        }
                      }}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span className={`text-sm truncate ${tempAuthors.includes(auth.id) ? 'text-red-600 font-semibold' : 'text-gray-600'} group-hover:text-gray-900`}>{auth.name}</span>
                  </label>
                )) : <p className="text-xs text-gray-400 px-1">Chưa có dữ liệu</p>}
            </div>
          </div>
        )}
      </div>

      {/* Publisher Filter */}
      <div className="border-b border-gray-200 pb-2">
        <button
          onClick={() => setIsPublisherOpen(!isPublisherOpen)}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 group"
        >
          <span>Nhà xuất bản</span>
          <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isPublisherOpen ? 'rotate-180' : ''} group-hover:text-gray-600`} />
        </button>
        {isPublisherOpen && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {publishers.length > 0 ? publishers.map((pub, idx) => (
              <label key={idx} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={tempPublishers.includes(pub.id)}
                  onChange={() => {
                    if (tempPublishers.includes(pub.id)) {
                      setLocalPublishers(tempPublishers.filter(p => p !== pub.id));
                    } else {
                      setLocalPublishers([...tempPublishers, pub.id]);
                    }
                  }}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span className={`text-sm truncate ${tempPublishers.includes(pub.id) ? 'text-red-600 font-semibold' : 'text-gray-600'} group-hover:text-gray-900`}>{pub.name}</span>
              </label>
            )) : <p className="text-xs text-gray-400 px-1">Chưa có dữ liệu</p>}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="border-b border-gray-200 pb-2">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 group"
        >
          <span>Khoảng giá</span>
          <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isPriceOpen ? 'rotate-180' : ''} group-hover:text-gray-600`} />
        </button>
        {isPriceOpen && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min"
                value={tempMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-full rounded border-gray-300 py-1.5 px-2 text-xs focus:border-red-500 focus:ring-red-500 border"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={tempMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-full rounded border-gray-300 py-1.5 px-2 text-xs focus:border-red-500 focus:ring-red-500 border"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="border-b border-gray-200 pb-2">
        <button
          onClick={() => setIsRatingOpen(!isRatingOpen)}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 group"
        >
          <span>Đánh giá</span>
          <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isRatingOpen ? 'rotate-180' : ''} group-hover:text-gray-600`} />
        </button>
        {isRatingOpen && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <label key={star} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={tempRating === star}
                  onChange={() => setLocalRating(tempRating === star ? null : star)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <div className="flex flex-1 items-center gap-1">
                  <div className="flex shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-2.5 w-2.5 ${i < star ? 'fill-yellow-400 text-yellow-500' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className={`text-xs ${tempRating === star ? 'text-red-600 font-semibold' : 'text-gray-600'}`}> trở lên</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="pt-1 space-y-2">
        <button
          onClick={() => { handleApplyFilters(); setIsMobileFilterOpen(false); }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-all active:scale-[0.98] shadow-sm shadow-red-200"
        >
          Áp dụng
        </button>
        <button
          onClick={handleReset}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-gray-500 border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <X className="h-3 w-3" /> Reset
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Search Header */}
      <div className="sticky top-16 z-30 bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
          <div className="relative w-full group">
            <input
              type="text"
              className="h-10 w-full rounded-xl border-2 border-gray-300 bg-white pl-4 pr-12 text-sm shadow-sm transition-all focus:border-red-500 focus:ring-4 focus:ring-red-500/10 group-hover:border-gray-400 outline-none"
              placeholder="Bạn đang tìm sách gì?"
              value={tempSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleSearch}
            />
            <button
              onClick={() => handleSearch()}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-lg bg-red-600 text-white shadow-sm hover:bg-red-700 transition-all active:scale-95"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-x-6 gap-y-8">
          {/* Sidebar - Desktop Filter */}
          <aside className="hidden lg:block w-full lg:w-52 flex-shrink-0">
            {renderFilterContent()}
          </aside>

          {/* Mobile Filter Overlay */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-[100] lg:hidden">
              <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" onClick={() => setIsMobileFilterOpen(false)} />
              <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Bộ lọc sản phẩm</h2>
                  <button onClick={() => setIsMobileFilterOpen(false)} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {renderFilterContent()}
                </div>
              </div>
            </div>
          )}

          <div className="flex-1">
            {/* Mobile View: Filters & Toolbar (Matches user image) */}
            <div className="lg:hidden space-y-4 mb-6">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-sm font-bold uppercase tracking-widest text-white shadow-md active:scale-[0.98] transition-all hover:bg-red-700"
              >
                <SlidersHorizontal className="h-4 w-4" /> BỘ LỌC
              </button>

              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-3 shadow-sm">
                <div className="text-sm font-bold text-gray-900">
                  {totalProducts} Sản phẩm
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Sắp xếp:</span>
                  <div className="relative">
                    <button 
                      onClick={() => setIsSortOpen(!isSortOpen)} 
                      className="inline-flex w-36 items-center justify-between gap-x-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-all"
                    >
                      <span className="truncate">{sortOptions.find(o => o.id === sortBy)?.label}</span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isSortOpen && (
                      <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in duration-100">
                        <div className="py-1">
                          {sortOptions.map((opt) => (
                            <button 
                              key={opt.id} 
                              onClick={() => { applyFilters({ sort_by: opt.id }); setIsSortOpen(false); }} 
                              className={`block w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition-colors ${sortBy === opt.id ? 'text-red-600 font-bold bg-red-50/50' : 'text-gray-700'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View Header */}
            <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <p className="mt-1 text-sm text-gray-500">{totalProducts} sản phẩm được tìm thấy</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 hidden sm:block">Sắp xếp:</span>
                <div className="relative">
                  <button 
                    onClick={() => setIsSortOpen(!isSortOpen)} 
                    className="inline-flex w-44 items-center justify-between gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all active:scale-95"
                  >
                    <SlidersHorizontal className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{sortOptions.find(o => o.id === sortBy)?.label}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isSortOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in duration-100">
                      <div className="py-1">
                        {sortOptions.map((opt) => (
                          <button 
                            key={opt.id} 
                            onClick={() => { applyFilters({ sort_by: opt.id }); setIsSortOpen(false); }} 
                            className={`block w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition-colors ${sortBy === opt.id ? 'text-red-600 font-bold bg-red-50/50' : 'text-gray-700'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-[400px] rounded-2xl bg-white shadow-sm border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((book) => (
                      <div key={book.id} className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-3 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1">
                        {/* Full-card clickable overlay */}
                        <Link href={`/products/${toSlug(book.title)}-${book.id}`} className="absolute inset-0 z-10 rounded-2xl" aria-label={book.title} />
                        {book.special && (
                          <div className="absolute top-2 left-2 z-20 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm uppercase tracking-wider">
                            Độc quyền
                          </div>
                        )}
                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-50">
                          <Image
                            src={book.image}
                            alt={book.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            unoptimized
                          />
                        </div>
                        <div className="mt-2.5 flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors h-9">
                            {book.title}
                          </h3>
                          <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                            <span className="text-red-500/80">{book.genre?.name}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
                            <span className="text-sm font-bold text-gray-700">{book.rating || '0.0'}</span>
                            <span className="text-xs text-gray-400">({book.reviewCount || 0})</span>
                          </div>
                          <p className="mt-1 text-base font-bold text-red-600">
                            {formatVND(Number(book.price))}
                          </p>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-100 pt-2 relative z-20">
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(book); }}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-sm active:scale-95"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" /> THÊM
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(book); }}
                            className={`flex items-center justify-center rounded-lg p-1.5 transition-colors border shadow-sm active:scale-95 ${isInWishlist(book.id)
                                ? 'bg-pink-100 text-pink-600 border-pink-200'
                                : 'bg-white text-gray-400 border-gray-200 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200'
                              }`}
                          >
                            <Heart className="h-4 w-4" fill={isInWishlist(book.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Search className="h-6 w-6 text-gray-400" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-gray-900">Không tìm thấy sản phẩm</h2>
                    <p className="mt-2 text-gray-500 max-w-xs mx-auto">Thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                    <button onClick={handleReset} className="mt-6 text-red-600 font-semibold hover:underline">Xóa tất cả bộ lọc</button>
                  </div>
                )}

                {/* Pagination Component */}
                {totalProducts > itemsPerPage && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => { applyFilters({ page: Math.max(currentPage - 1, 1) }); window.scrollTo(0, 0); }}
                      disabled={currentPage === 1}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-500 transition-all shadow-sm"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="flex items-center gap-1.5 px-4 h-10 rounded-lg bg-white border border-gray-100 shadow-sm text-sm font-semibold text-gray-700">
                      <span className="text-red-600">Trang {currentPage}</span>
                      <span className="text-gray-300">/</span>
                      <span>{Math.ceil(totalProducts / itemsPerPage)}</span>
                    </div>

                    <button
                      onClick={() => { applyFilters({ page: Math.min(currentPage + 1, Math.ceil(totalProducts / itemsPerPage)) }); window.scrollTo(0, 0); }}
                      disabled={currentPage >= Math.ceil(totalProducts / itemsPerPage)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-500 transition-all shadow-sm"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
