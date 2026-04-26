# DreamBook - Modern Book Store

Hệ thống quản lý và bán sách trực tuyến hiện đại được xây dựng với kiến trúc Frontend và Backend tách biệt.

## 🚀 Công nghệ sử dụng

### Frontend (fe/)
- **Next.js 15+ (App Router)**: Framework React mạnh mẽ nhất hiện nay.
- **Tailwind CSS**: Thiết kế giao diện nhanh chóng, hiện đại.
- **Lucide React**: Bộ icon tinh tế.
- **Framer Motion**: Hiệu ứng chuyển động mượt mà.
- **NextAuth.js**: Quản lý xác thực người dùng.

### Backend (be/)
- **NestJS**: Framework Node.js kiến trúc microservices.
- **PostgreSQL (Neon Database)**: Cơ sở dữ liệu quan hệ mạnh mẽ, lưu trữ đám mây.
- **TypeORM**: Quản lý database thông qua các Object.
- **Passport/JWT**: Bảo mật hệ thống và phân quyền Admin/User.

---

## 📂 Cấu trúc dự án
- `/fe`: Chứa mã nguồn của ứng dụng Frontend (Next.js).
- `/be`: Chứa mã nguồn của ứng dụng Backend (NestJS).
- `docker-compose.yml`: Cấu hình chạy Docker cho toàn bộ hệ thống.
- `init.sql`: File khởi tạo dữ liệu ban đầu cho Database.

---

## 🛠 Hướng dẫn cài đặt

### 1. Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (Tùy chọn)

### 2. Cài đặt Backend (be)
```bash
cd be
npm install
# Cấu hình file .env dựa trên .env.example
npm run start:dev
```

### 3. Cài đặt Frontend (fe)
```bash
cd fe
npm install
# Cấu hình file .env dựa trên .env.example
npm run dev
```

### 4. Chạy với Docker
```bash
docker-compose up --build
```
Ứng dụng sẽ chạy tại:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`

---

## ✨ Tính năng chính
- **Cửa hàng:** Tìm kiếm sách nâng cao, danh mục sách, giỏ hàng và danh sách yêu thích.
- **Thanh toán:** Tích hợp cổng thanh toán VNPay.
- **Quản trị (Admin):**
    - Dashboard theo dõi doanh thu và đơn hàng bằng biểu đồ trực quan.
    - Quản lý sản phẩm, đơn hàng, mã giảm giá và người dùng.
    - Phân tích phân phối thể loại sách.

---

## 📄 License
Project này được phát triển cho mục đích học tập
