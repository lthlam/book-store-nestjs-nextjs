'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, ChevronRight, Share2, Tag, Calendar, User as UserIcon, Star, Send, Trash2, BookOpen } from 'lucide-react';
import { useShop } from '../../../../context/ShopContext';
import { useToast } from '../../../../context/ToastContext';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useProductReviews, useCanReview, useCreateReview, useDeleteReview } from '@/hooks/useReviews';
import { toSlug } from '../../../../utils/slug';
import { formatVND } from '@/utils/format';
import type { User } from '@/types';

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${cls} ${s <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

export default function SingleProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = use(params);
  const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
  const match = rawId.match(uuidRegex);
  const id = match ? match[1] : (rawId.includes('-') ? rawId.split('-').pop() || rawId : rawId);

  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        // Use Promise.resolve to avoid synchronous setState warning in effect
        Promise.resolve().then(() => {
          setUser(u);
        });
      } catch { /* ignore */ }
    }
  }, []);

  const { data: product, isLoading, isError } = useProduct(id);
  const { data: relatedData } = useProducts({ limit: 4, genreId: product?.genre?.id, excludeId: id });
  const { data: reviews = [] } = useProductReviews(id);
  // enabled chỉ khi user đã đăng nhập
  const { data: eligibility } = useCanReview(id, !!user);
  const createReview = useCreateReview();
  const deleteReview = useDeleteReview();

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user) { toast.error('Vui lòng nhập nội dung đánh giá.'); return; }
    await createReview.mutateAsync({ productId: id, rating, comment });
    toast.success('Đánh giá của bạn đã được gửi thành công!');
    setComment('');
  };

  const executeDelete = async () => {
    if (!reviewToDelete || !user) return;
    await deleteReview.mutateAsync({ id: reviewToDelete, productId: id });
    toast.success('Xoá đánh giá thành công!');
    setConfirmDeleteOpen(false);
    setReviewToDelete(null);
  };

  const ratingStats = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { star, count, percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0 };
  });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (isError || !product) return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4">
      <h1 className="text-3xl font-extrabold text-gray-900">Không tìm thấy sách</h1>
      <Link href="/" className="mt-8 text-red-600 font-semibold hover:text-red-500">Quay lại trang chủ</Link>
    </div>
  );

  const relatedProducts = relatedData?.data ?? [];

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="bg-gray-50 border-b border-gray-200 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex text-sm font-medium text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
            <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0 text-gray-400 mt-0.5" />
            <Link href="/products" className="hover:text-red-600 transition-colors">Sản phẩm</Link>
            <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0 text-gray-400 mt-0.5" />
            <span className="text-gray-900 truncate">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[3/4] w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-gray-100 border border-gray-200 shadow-xl">
              <Image src={product.image} alt={product.title} fill className="object-cover" unoptimized />
            </div>
          </div>

          <div className="mt-10 px-4 sm:px-0 lg:mt-0 pt-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{product.title}</h1>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center">
                <StarRow rating={Math.round(product.rating || 0)} />
                <span className="ml-2 text-sm font-semibold text-gray-900">{product.rating || '0.0'}</span>
              </div>
              <span className="text-sm border-l border-gray-300 pl-3 text-gray-500">{product.reviewCount || 0} đánh giá</span>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-y border-gray-100 py-6">
              {[
                { icon: <UserIcon className="h-5 w-5 mr-3 text-red-500" />, label: 'Tác giả:', value: product.author?.name || 'Chưa rõ' },
                { icon: <Tag className="h-5 w-5 mr-3 text-red-500" />, label: 'Thể loại:', value: product.genre?.name || 'Chưa phân loại' },
                { icon: <BookOpen className="h-5 w-5 mr-3 text-red-500" />, label: 'Nhà xuất bản:', value: product.publisher?.name || 'Chưa rõ' },
                { icon: <Calendar className="h-5 w-5 mr-3 text-red-500" />, label: 'Năm xuất bản:', value: String(product.year) },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center text-gray-600">
                  {icon}<span className="font-semibold text-gray-900 mr-2">{label}</span> {value}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Về cuốn sách này</h2>
              <p className="text-base text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="mt-8">
              <p className="text-4xl font-bold tracking-tight text-red-600">{formatVND(Number(product.price))}</p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              {product.stock === 0 ? (
                <button type="button" disabled
                  className="flex flex-1 items-center justify-center rounded-xl border border-transparent bg-gray-400 px-8 py-4 text-base font-bold text-white shadow-sm cursor-not-allowed">
                  Hết hàng
                </button>
              ) : (
                <button type="button" onClick={() => addToCart(product)}
                  className="flex flex-1 items-center justify-center rounded-xl border border-transparent bg-red-600 px-8 py-4 text-base font-bold text-white shadow-sm hover:bg-red-700 transition-all transform hover:scale-[1.02]">
                  <ShoppingCart className="h-5 w-5 mr-2" /> Thêm vào giỏ hàng
                </button>
              )}
              <button type="button" onClick={() => toggleWishlist(product)}
                className={`flex items-center justify-center rounded-xl border-2 px-8 py-4 transition-all ${isInWishlist(product.id) ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-red-500 hover:border-red-200'}`}>
                <Heart className="h-6 w-6" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
              </button>
              <button type="button" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Đã sao chép liên kết!'); }}
                className="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white p-4 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-all sm:w-16">
                <Share2 className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-gray-200">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((book) => (
                <div key={book.id} className="group relative flex flex-col">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100">
                    <Image src={book.image} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  </div>
                  <div className="mt-4 flex flex-col flex-1 z-10">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                      <Link href={`/products/${toSlug(book.title)}-${book.id}`} className="hover:text-red-600 transition-colors">
                        <span aria-hidden="true" className="absolute inset-0" />{book.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-base font-bold text-red-600">{formatVND(Number(book.price))}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-20 pt-10 border-t border-gray-200">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Đánh giá từ khách hàng</h2>
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-4 mb-10 lg:mb-0">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Chia sẻ ý kiến của bạn</h3>
                <p className="mt-1 text-sm text-gray-600 mb-6">Nếu bạn đã đọc cuốn sách này, chúng tôi rất muốn nghe trải nghiệm của bạn.</p>

                <div className="mb-8 space-y-3">
                  {ratingStats.map(({ star, percentage }) => (
                    <div key={star} className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 w-8"><span className="font-semibold">{star}</span><Star className="h-3 w-3 text-yellow-400 fill-current" /></div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                      </div>
                      <div className="w-10 text-right text-gray-500">{Math.round(percentage)}%</div>
                    </div>
                  ))}
                </div>

                {eligibility?.eligible ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4 border-t border-gray-200 pt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Xếp hạng</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" onClick={() => setRating(s)} className="p-1 hover:scale-110 transition-transform">
                            <Star className={`h-6 w-6 ${s <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Nội dung đánh giá</label>
                      <textarea id="comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)}
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-3 border"
                        placeholder="Bạn thích hay không thích điều gì?" />
                    </div>
                    <button type="submit" disabled={createReview.isPending || !comment.trim()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition-colors">
                      <Send className="h-4 w-4" /> {createReview.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-dashed border-gray-300 text-center">
                    <p className="text-sm text-gray-500">
                      {user
                        ? (eligibility?.reason === 'ALREADY_REVIEWED' ? 'Bạn đã review sản phẩm này rồi.' : 'Bạn chỉ có thể đánh giá sản phẩm đã mua và nhận hàng thành công.')
                        : 'Vui lòng đăng nhập và mua sản phẩm này để để lại đánh giá.'}
                    </p>
                    {!user && <Link href="/login" className="mt-3 inline-block rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white">Đăng nhập</Link>}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-8">
              {reviews.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 border border-gray-100 rounded-2xl border-dashed">
                  <Star className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-2">Chưa có đánh giá nào.</p>
                </div>
              ) : (
                <div className="space-y-8 divide-y divide-gray-100">
                  {reviews.map((review) => (
                    <div key={review.id} className="pt-6 first:pt-0 group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex flex-col">
                          <div className="font-semibold text-gray-900 leading-none mb-1">{review.user?.name || 'Khách ẩn danh'}</div>
                          <div className="flex items-center gap-2">
                            <StarRow rating={review.rating} />
                            <span className="text-[10px] text-gray-400 italic">{new Date(review.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        </div>
                        {user && user.id === review.user?.id && (
                          <button onClick={() => { setReviewToDelete(review.id); setConfirmDeleteOpen(true); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="mt-2 text-gray-700 leading-relaxed text-sm">{review.comment}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmDeleteOpen}
        title="Xoá đánh giá"
        message="Bạn có chắc chắn muốn xoá đánh giá này?"
        confirmLabel="Xoá"
        cancelLabel="Huỷ"
        loading={deleteReview.isPending}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
