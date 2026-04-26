'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { toSlug } from '@/utils/slug';
import { API_URL } from '@/utils/constants';
import { formatVND } from '@/utils/format';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [exclusives, setExclusives] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Sách hay mùa hè này",
      subtitle: "Khám phá những cuốn sách hay nhất cho mùa hè này",
      image: "/images/hero/summer.png",
      cta: "Mua ngay",
      link: "/products"
    },
    {
      title: "Sách mới: Những câu chuyện mới",
      subtitle: "Khám phá những kiệt tác mới nhất từ khắp nơi trên thế giới.",
      image: "/images/hero/new-arrivals.png",
      cta: "Xem sách mới",
      link: "/products?sort=createdAt&order=DESC"
    },
    {
      title: "Quà tặng tri thức",
      subtitle: "Gửi tặng những cuốn sách hay kèm lời chúc ý nghĩa đến những người thân yêu.",
      image: "/images/hero/gift-box.png",
      cta: "Chọn quà ngay",
      link: "/products"
    }
  ];

  const handleSearch = (e?: React.KeyboardEvent) => {
    if ((!e || e.key === 'Enter') && searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const [bestSellersRes, exclusivesRes] = await Promise.all([
          fetch(`${API_URL}/products?sort=soldCount&order=DESC&limit=5`),
          fetch(`${API_URL}/products?special=true&limit=5`)
        ]);

        const bestSellersData = await bestSellersRes.json();
        const exclusivesData = await exclusivesRes.json();

        setBestSellers(Array.isArray(bestSellersData.data) ? bestSellersData.data : []);
        setExclusives(Array.isArray(exclusivesData.data) ? exclusivesData.data : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="bg-white">
      {/* Search Section */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 py-2 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative w-full group">
            <input
              type="text"
              className="h-10 w-full rounded-xl border-2 border-gray-300 bg-white pl-4 pr-12 text-sm shadow-sm transition-all focus:border-red-500 focus:ring-4 focus:ring-red-500/10 group-hover:border-gray-400 outline-none"
              placeholder="Bạn đang tìm sách gì?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

      <main>
        {/* Hero Carousel */}
        <div className="relative h-[300px] sm:h-[400px] lg:h-[450px] w-full overflow-hidden bg-gray-900 shadow-lg">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover opacity-80"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              
              <div className="relative h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="max-w-xl"
                  >
                    <div className="inline-flex items-center rounded-full bg-red-600/20 px-3 py-1 text-sm font-semibold text-red-500 backdrop-blur-sm border border-red-500/20 mb-4 sm:mb-6">
                      Bộ sưu tập nổi bật
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-200 mb-6 sm:mb-10 leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
                      {slide.subtitle}
                    </p>
                    <Link
                      href={slide.link}
                      className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-white shadow-xl hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95"
                    >
                      {slide.cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </motion.div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all z-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all z-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-30">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 transition-all rounded-full ${
                  i === currentSlide ? 'w-6 bg-red-600' : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Best Sellers Section */}
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-purple-600">
                SẢN PHẨM BÁN CHẠY
              </h2>
              <Link href="/products" className="hidden text-sm font-semibold text-red-600 hover:text-red-500 sm:flex sm:items-center">
                Xem tất cả sản phẩm
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-5 xl:gap-x-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-96 rounded-2xl bg-white shadow-sm border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : bestSellers.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-5 xl:gap-x-8"
              >
                {bestSellers.map((book: Product, index: number) => (
                  <motion.div 
                    key={book.id} 
                    variants={itemVariants}
                    whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                    className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-3 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer overflow-hidden"
                  >
                    <Link href={`/products/${toSlug(book.title)}-${book.id}`} className="absolute inset-0 z-30" />
                    
                    {/* Top Rank Ribbon */}
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-20 pointer-events-none">
                      <div className={`absolute top-2 right-[-20px] rotate-45 w-20 py-0.5 text-center text-[10px] font-black uppercase tracking-tighter shadow-sm
                        ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                          index === 1 ? 'bg-gray-300 text-gray-800' : 
                          index === 2 ? 'bg-amber-600 text-amber-50' : 
                          'bg-red-500 text-white'}`}
                      >
                        TOP {index + 1}
                      </div>
                    </div>

                    {book.special && (
                      <div className="absolute top-2 left-2 z-20 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm uppercase tracking-wider">
                        Độc quyền
                      </div>
                    )}
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center p-2">
                      <Image
                        src={book.image}
                        alt={book.title}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                      />
                    </div>
                    <div className="mt-2.5 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors h-9">
                        {book.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
                        <span className="text-sm font-bold text-gray-700">{book.rating || '0.0'}</span>
                        <span className="text-xs text-gray-400">({book.reviewCount || 0})</span>
                      </div>
                      <p className="mt-1 text-base font-bold text-red-600">
                        {formatVND(Number(book.price))}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="mt-8 text-gray-500 text-center py-10">Chưa có sản phẩm bán chạy nào.</p>
            )}

            {!loading && exclusives.length > 0 && (
              <div className="mt-20">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
                    ĐỘC QUYỀN TẠI DreamBook
                  </h2>
                  <Link href="/products?special=true" className="hidden text-sm font-semibold text-red-600 hover:text-red-500 sm:flex sm:items-center">
                    Xem tất cả sản phẩm
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-5 xl:gap-x-8"
                >
                  {exclusives.map((book: Product) => (
                    <motion.div 
                      key={book.id} 
                      variants={itemVariants}
                      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                      className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-3 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
                    >
                      <Link href={`/products/${toSlug(book.title)}-${book.id}`} className="absolute inset-0 z-30" />
                      <div className="absolute top-2 left-2 z-20 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm uppercase tracking-wider">
                        Độc quyền
                      </div>
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center p-2">
                        <Image
                          src={book.image}
                          alt={book.title}
                          fill
                          className="object-contain transition-transform duration-500 group-hover:scale-110"
                          unoptimized
                        />
                      </div>
                      <div className="mt-2.5 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors h-9">
                          {book.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
                          <span className="text-sm font-bold text-gray-700">{book.rating || '0.0'}</span>
                          <span className="text-xs text-gray-400">({book.reviewCount || 0})</span>
                        </div>
                        <p className="mt-1 text-base font-bold text-red-600">
                          {formatVND(Number(book.price))}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                <div className="mt-8 sm:hidden">
                  <Link href="/products?special=true" className="block text-sm font-semibold text-red-600 hover:text-red-500">
                    Xem tất cả sản phẩm
                    <ArrowRight className="ml-1 inline h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
            
            <div className="mt-8 sm:hidden">
              <Link href="/products" className="block text-sm font-semibold text-red-600 hover:text-red-500">
                Xem tất cả sản phẩm
                <ArrowRight className="ml-1 inline h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
