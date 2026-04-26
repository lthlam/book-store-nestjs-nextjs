import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebook, FaInstagram, FaXTwitter } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900">
              <div className="h-8 w-8 relative flex-shrink-0 bg-white rounded-lg p-1 border border-gray-100 shadow-sm">
                <Image 
                  src="/logo.png" 
                  alt="DreamBook" 
                  fill 
                  className="object-contain"
                />
              </div>
              <span>DreamBook</span>
            </Link>
            <p className="text-sm text-gray-500">
              Điểm dừng chân cho mọi nhu cầu về sách của bạn. Mang những cuốn sách tốt nhất đến tận tay bạn.
            </p>
            <div className="flex gap-4">
              <a className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-300 shadow-sm" aria-label="Facebook">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-black hover:bg-black hover:text-white transition-all duration-300 shadow-sm" aria-label="X (Twitter)">
                <FaXTwitter className="h-4 w-4" />
              </a>
              <a className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-[#E4405F] hover:bg-[#E4405F] hover:text-white transition-all duration-300 shadow-sm" aria-label="Instagram">
                <FaInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Map */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Vị trí của chúng tôi</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 h-32 shadow-inner">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62705.41680608587!2d106.63469145952148!3d10.835158652618867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529140597ba57%3A0x66c5d691eef95de6!2zR8OyIFZp4bqlcCwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1713410000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-500">Quận Gò Vấp, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-gray-500">+84 00 00 0000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-gray-500">support@bookstore.abc</span>
              </li>
              <li className="pt-2">
                <Link href="/contact" className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                  Gửi tin nhắn cho chúng tôi →
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Bản tin</h3>
            <p className="text-sm text-gray-500 mb-4">Đăng ký để nhận các ưu đãi đặc biệt, quà tặng miễn phí và cập nhật thông tin mới nhất.</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="w-full px-3 h-9 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button
                type="button"
                className="h-9 px-4 whitespace-nowrap bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition"
              >
                Đăng ký
              </button>
            </form>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} DreamBook, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
