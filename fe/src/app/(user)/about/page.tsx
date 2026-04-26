import Image from 'next/image';
import { CreditCard, Headset, Truck, ShieldCheck, HeartPulse } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            {/* Image Placeholder/Container */}
            <div className="w-full lg:w-1/2">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
                <Image
                  src="/images/about-hero.png"
                  alt="About DreamBook"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-red-600/5 mix-blend-multiply"></div>
              </div>
            </div>

            {/* Content */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
                Về chúng tôi
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Tại sao chọn <span className="text-red-600">cửa hàng của chúng tôi?</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Chúng tôi cung cấp đa dạng các loại sách, từ những tác phẩm phổ biến đến các thể loại chuyên sâu, đảm bảo bạn luôn tìm thấy nội dung phù hợp với sở thích của mình.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Sứ mệnh của chúng tôi là lan tỏa niềm yêu thích đọc sách bằng cách mang đến sự tiếp cận dễ dàng với những câu chuyện và kiến thức. Chúng tôi cung cấp dịch vụ giao hàng nhanh chóng và đáng tin cậy, đảm bảo sách sẽ đến tận tay bạn một cách sớm nhất. Hệ thống vận chuyển hiệu quả của chúng tôi được thiết kế để phù hợp hoàn hảo với lịch trình bận rộn của bạn.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="flex gap-4 group">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:bg-red-500 transition-colors">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Thanh toán dễ dàng</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Trải nghiệm giao dịch nhanh chóng với các phương thức thanh toán kỹ thuật số thân thiện với người dùng.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:bg-red-500 transition-colors">
                    <Headset className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Hỗ trợ 24/7</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng phục vụ 24/7 để giải đáp mọi thắc mắc của bạn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Stats/Features Section */}
      <section className="py-20 bg-red-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-red-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"></div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold">10K+</div>
              <div className="text-red-200">Đầu sách</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">50K+</div>
              <div className="text-red-200">Độc giả hài lòng</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">24h</div>
              <div className="text-red-200">Giao hàng nhanh</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">100%</div>
              <div className="text-red-200">Thanh toán an toàn</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team/Values Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Giá trị cốt lõi</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Không chỉ là bán sách, chúng tôi mong muốn xây dựng một cộng đồng những người đam mê tìm tòi và khám phá.
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-red-50 text-red-600 mb-6">
              <HeartPulse className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Đam mê đọc sách</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Chúng tôi tuyển chọn từng cuốn sách một cách cẩn thận, đảm bảo bộ sưu tập phản ánh sự đa dạng vô hạn của tri thức nhân loại.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-50 text-blue-600 mb-6">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tin cậy tuyệt đối</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Sự tin tưởng và hài lòng của bạn là ưu tiên hàng đầu của chúng tôi. Từ khâu đặt hàng đến khi nhận sách, chúng tôi đảm bảo một trải nghiệm an tâm nhất.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-50 text-green-600 mb-6">
              <Truck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Dịch vụ nhanh chóng</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Chúng tôi hiểu sự háo hức khi đón nhận những cuốn sách mới. Đội ngũ giao vận luôn nỗ lực để mang những trải nghiệm tiếp theo đến với bạn sớm nhất có thể.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
