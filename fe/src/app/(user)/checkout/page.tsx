'use client';

import { useState, useEffect } from 'react';

import { CreditCard, Truck, Receipt, CheckCircle2, Circle, Tag, X, User as UserIcon, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useShop } from '../../../context/ShopContext';
import { useToast } from '../../../context/ToastContext';
import { Address, User, Province, Ward, Coupon } from '@/types';

import { API_URL } from '@/utils/constants';
import { formatVND } from '@/utils/format';

export default function CheckoutPage() {
  const router = useRouter();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [street, setStreet] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formPhoneNumber, setFormPhoneNumber] = useState('');
  const [addingAddress, setAddingAddress] = useState(false);

  const { cart, clearCart } = useShop();
  const toast = useToast();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplying, setCouponApplying] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shipping = total > 500000 ? 0 : (total > 0 ? 30000 : 0);
  const discount = couponDiscount;
  const finalAmount = total + shipping - discount;

  useEffect(() => {
    const initData = async () => {
      const stored = localStorage.getItem('user');
      if (!stored) {
        router.push('/login');
        return;
      }
      const userData = JSON.parse(stored);
      setUser(userData);

      try {
        const res = await fetch(`${API_URL}/addresses`);
        if (res.ok) {
          const allAddresses: Address[] = await res.json();
          const userAddresses = allAddresses.filter((a) => a.user?.id === userData.id);
          setAddresses(userAddresses);
          if (userAddresses.length > 0) {
            setSelectedAddress(userAddresses[0].id);
          }
        }
      } catch (err) {
         console.error('Failed to load addresses', err);
      }

      // Fetch active coupons
      try {
        const res = await fetch(`${API_URL}/coupons/active`);
        if (res.ok) {
          setAvailableCoupons(await res.json());
        }
      } catch (err) {
        console.error('Failed to load coupons', err);
      }
    };
    initData();
  }, [router]);

  useEffect(() => {
    if (!showModal) return;
    fetch(`${API_URL}/addresses/provinces`)
      .then(r => r.json())
      .then(data => setProvinces(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [showModal]);

  useEffect(() => {
    if (!selectedProvince) { Promise.resolve().then(() => { setWards([]); setSelectedWard(''); }); return; }
    fetch(`${API_URL}/addresses/wards?provinceCode=${selectedProvince}`)
      .then(r => r.json())
      .then(data => { setWards(Array.isArray(data) ? data : []); setSelectedWard(''); })
      .catch(console.error);
  }, [selectedProvince]);

  const handleAddAddress = async () => {
    if (!street || !selectedWard || !formContactName || !formPhoneNumber || !user) {
        toast.error('Vui lòng nhập đầy đủ thông tin giao hàng.');
        return;
    }
    setAddingAddress(true);
    try {
      const res = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          street, 
          wardCode: selectedWard,
          contactName: formContactName,
          phoneNumber: formPhoneNumber
        }),
      });
      if (res.ok) {
        const listRes = await fetch(`${API_URL}/addresses`);
        if (listRes.ok) {
          const all: Address[] = await listRes.json();
          const userAddresses = all.filter((a) => a.user?.id === user?.id);
          setAddresses(userAddresses);
          // Auto select new address
          const newAddr = userAddresses.find((a) => a.street === street && a.wardCode === selectedWard);
          if (newAddr) setSelectedAddress(newAddr.id);
        }
        setShowModal(false);
        setStreet('');
        setSelectedProvince('');
        setSelectedWard('');
        setFormContactName('');
        setFormPhoneNumber('');
        toast.success('Thêm địa chỉ giao hàng thành công!');
      } else { toast.error('Lỗi khi thêm địa chỉ.'); }
    } catch (err) { console.error(err); toast.error('Lỗi kết nối server.'); }
    finally { setAddingAddress(false); }
  };



  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponApplying(true);
    try {
      const res = await fetch(`${API_URL}/coupons/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), orderTotal: total }),
      });
      const data = await res.json();
      if (res.ok) {
        setCouponDiscount(data.discountAmount);
        setCouponCode(couponInput.trim().toUpperCase());
        toast.success(`Coupon applied! Bạn tiết kiệm ${formatVND(data.discountAmount)}`);
      } else {
        const msg = Array.isArray(data.message) ? data.message[0] : data.message;
        toast.error(msg || 'Invalid coupon code.');
      }
    } catch {
      toast.error('Failed to apply coupon.');
    } finally {
      setCouponApplying(false);
    }
  };

  const selectAndApplyCoupon = (code: string) => {
    setCouponInput(code);
    setShowCouponModal(false);
    // Use a small timeout to ensure state update is reflected or just call the function directly with code
    setTimeout(() => {
        const btn = document.getElementById('apply-coupon-btn');
        if (btn) btn.click();
    }, 100);
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponInput('');
    setCouponDiscount(0);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress || cart.length === 0 || !user) return;
    
    setLoading(true);
    try {
      const orderPayload = {
        userId: user.id,
        addressId: selectedAddress,
        totalAmount: finalAmount,
        shipping: shipping,
        discount: couponDiscount,
        couponCode: couponCode || undefined,
        status: 'pending',
        paymentMethod,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.product.price
        }))
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      
      if (res.ok) {
        const orderData = await res.json();
        
        if (orderData.paymentUrl) {
          // Redirect to VNPay
          window.location.href = orderData.paymentUrl;
          return;
        }

        clearCart();
        sessionStorage.setItem('lastOrder', JSON.stringify({ total: finalAmount }));
        router.push('/checkout/success');
      } else {
        toast.error('Failed to place order.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">Thanh toán</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          
          <div className="lg:col-span-8 space-y-8">
            
            {/* Address Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
                <Truck className="h-6 w-6 text-red-600" />
                <h2 className="text-lg font-bold text-gray-900">Thông tin giao hàng</h2>
              </div>
              
              <div className="p-6">
                {addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((ad) => (
                      <div 
                        key={ad.id} 
                        onClick={() => setSelectedAddress(ad.id)}
                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${selectedAddress === ad.id ? 'border-red-600 bg-red-50/50' : 'border-gray-200 hover:border-red-200'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">Nhà riêng</span>
                          {selectedAddress === ad.id ? (
                            <CheckCircle2 className="h-5 w-5 text-red-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                            {ad.contactName || user?.name || 'N/A'}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {ad.phoneNumber || user?.contact || 'N/A'}
                          </p>
                          <p className="pt-1 text-xs">{ad.street}</p>
                          <p className="text-xs">{ad.ward?.name || ad.wardCode}, {ad.ward?.province?.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-red-500 font-medium mb-4">Bạn phải thêm địa chỉ để tiếp tục.</p>
                  </div>
                )}
                
                <div className="mt-6">
                  <button 
                    onClick={() => setShowModal(true)}
                    className="text-sm font-semibold text-red-600 hover:text-red-500 flex items-center gap-1"
                  >
                    <span>+</span> Thêm địa chỉ giao hàng mới
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-red-600" />
                <h2 className="text-lg font-bold text-gray-900">Phương thức thanh toán</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">


                  <label className={`flex items-center gap-4 cursor-pointer rounded-xl border p-4 transition-all ${paymentMethod === 'cod' ? 'border-red-600 bg-red-50/50' : 'border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="cod" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')}
                      className="h-4 w-4 text-red-600 focus:ring-red-600"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                      <span className="block text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 cursor-pointer rounded-xl border p-4 transition-all ${paymentMethod === 'vnpay' ? 'border-red-600 bg-red-50/50' : 'border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="vnpay" 
                      checked={paymentMethod === 'vnpay'} 
                      onChange={() => setPaymentMethod('vnpay')}
                      className="h-4 w-4 text-red-600 focus:ring-red-600"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-semibold text-gray-900">VNPay (Thẻ ATM / QR / Visa)</span>
                      <span className="block text-sm text-gray-500">Thanh toán thương mại điện tử hàng đầu VN</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 cursor-pointer rounded-xl border p-4 transition-all ${paymentMethod === 'momo' ? 'border-red-600 bg-red-50/50' : 'border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="momo" 
                      checked={paymentMethod === 'momo'} 
                      onChange={() => setPaymentMethod('momo')}
                      className="h-4 w-4 text-red-600 focus:ring-red-600"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-semibold text-gray-900">Ví MoMo</span>
                      <span className="block text-sm text-gray-500">Thanh toán siêu nhanh qua ví điện tử MoMo</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-4 mt-10 lg:mt-0">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
                <Receipt className="h-6 w-6 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-900">Tóm tắt đơn hàng</h2>
              </div>
              
              <div className="p-6">
                {/* Coupon Input */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Tag className="h-4 w-4 text-red-500" /> Mã giảm giá
                  </label>
                  {couponCode ? (
                    <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                      <div>
                        <span className="text-sm font-semibold text-green-700">{couponCode}</span>
                        <p className="text-xs text-green-600 mt-0.5">Đã áp dụng mã!</p>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-green-500 hover:text-green-700 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                       <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={e => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                          placeholder="Nhập mã giảm giá"
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 uppercase"
                        />
                        <button
                          id="apply-coupon-btn"
                          onClick={handleApplyCoupon}
                          disabled={couponApplying || !couponInput.trim()}
                          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60 transition-colors"
                        >
                          {couponApplying ? '...' : 'Áp dụng'}
                        </button>
                      </div>
                      {availableCoupons.length > 0 && (
                        <button 
                          onClick={() => setShowCouponModal(true)}
                          className="text-xs font-semibold text-red-600 hover:text-red-500 flex items-center gap-1 mt-1 underline"
                        >
                          Chọn mã giảm giá hiện có ({availableCoupons.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <dl className="space-y-4 text-base text-gray-600">
                  <div className="flex justify-between items-center">
                    <dt>Tạm tính</dt>
                    <dd className="font-medium text-gray-900">{formatVND(total)}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt>Phí vận chuyển</dt>
                    <dd className={`font-medium ${shipping === 0 && total > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {shipping === 0 && total > 0 ? 'Miễn phí' : formatVND(shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt>Giảm giá</dt>
                    <dd className={`font-medium ${discount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {discount > 0 ? '-' : ''}{formatVND(discount)}
                    </dd>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-4">
                    <dt className="text-lg font-bold text-gray-900">Tổng cộng</dt>
                    <dd className="text-2xl font-bold text-red-600">{formatVND(finalAmount)}</dd>
                  </div>
                </dl>

                <div className="mt-8">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={addresses.length < 1 || loading || cart.length === 0}
                    className="w-full flex items-center justify-center rounded-xl bg-red-600 px-4 py-4 text-base font-bold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-[1.02]"
                  >
                    {loading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
                  </button>
                  <p className="mt-4 text-xs text-center text-gray-500">
                    Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Thêm thông tin giao hàng</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Họ tên người nhận</label>
                  <input 
                    type="text" 
                    value={formContactName} 
                    onChange={e => setFormContactName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Số điện thoại</label>
                  <input 
                    type="tel" 
                    value={formPhoneNumber} 
                    onChange={e => setFormPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0987654321"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tỉnh / Thành phố</label>
                <select 
                  value={selectedProvince} 
                  onChange={e => setSelectedProvince(e.target.value)} 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="">-- Chọn Tỉnh/Thành --</option>
                  {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Quận / Huyện / Phường / Xã</label>
                <select 
                  value={selectedWard} 
                  onChange={e => setSelectedWard(e.target.value)}
                  disabled={!selectedProvince}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Địa chỉ chi tiết (Số nhà, tên đường)</label>
                <input 
                  type="text" 
                  value={street} 
                  onChange={e => setStreet(e.target.value)}
                  placeholder="Ví dụ: 123 Đường ABC"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button 
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Huỷ
              </button>
              <button 
                onClick={handleAddAddress}
                disabled={!street || !selectedWard || !formContactName || !formPhoneNumber || addingAddress}
                className="rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-60 transition-colors"
              >
                {addingAddress ? 'Đang lưu...' : 'Lưu thông tin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Selection Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Mã giảm giá khả dụng</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {availableCoupons.map((c) => {
                const isEligible = total >= Number(c.minimum);
                return (
                  <div key={c.id} className={`p-4 rounded-xl border-2 transition-all ${isEligible ? 'border-red-100 bg-white hover:border-red-600' : 'border-gray-100 bg-gray-50 opacity-70'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-red-600 text-lg">{c.code}</span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                        Hết hạn: {new Date(c.expiryDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-semibold mb-1">{c.description}</p>
                    <p className="text-xs text-gray-500 mb-3">Đơn tối thiểu {formatVND(Number(c.minimum))}</p>
                    
                    <button 
                      onClick={() => isEligible && selectAndApplyCoupon(c.code)}
                      disabled={!isEligible}
                      className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${isEligible ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      {isEligible ? 'Áp dụng mã' : `Cần thêm ${formatVND(Number(c.minimum) - total)}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
