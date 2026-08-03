<div align="center">
  <h1>🎨 Task Bounty DApp (Frontend)</h1>
  <p><i>Giao diện người dùng hiện đại, kết nối ví Web3 và bảng điều khiển AI phân tích tiến độ.</i></p>
  <p>👉 <b><a href="./DEPLOY_AND_RUN_GUIDE.md">Xem Hướng Dẫn Chạy Toàn Diện Hệ Thống (Docker, Blockchain, Ngrok, PayOS, Fiat-Bridge, Backend & Frontend)</a></b></p>
</div>

---

## 📖 Tổng quan dự án (Project Overview)

Đây là **Decentralized Application (DApp)** của nền tảng **Task Bounty**. Ứng dụng cung cấp một không gian làm việc mượt mà, trực quan và hiện đại dành cho cả Người quản lý dự án (Project Managers/Clients) lẫn Người thực thi (Assignees/Freelancers). 

Không chỉ dừng lại ở các thao tác quản lý công việc thông thường (CRUD), DApp còn mở ra cánh cửa giao tiếp trực tiếp với mạng lưới Blockchain và hệ thống Trí tuệ nhân tạo (AI) từ Backend, giúp mọi quy trình trở nên minh bạch và thông minh hơn bao giờ hết.

---

## ✨ Tính năng nổi bật (Key Features)

### 1. 🦊 Trải nghiệm Web3 & Thanh toán liền mạch
- **Kết nối ví (Wallet Connection):** Tích hợp dễ dàng với MetaMask hoặc các ví Web3 thông dụng khác.
- **Ký xác thực (Message Signing):** Sử dụng ví Crypto thay thế (hoặc song song) với phương thức đăng nhập Email/Password truyền thống.
- **Nhận tiền tức thì:** Giao diện hiển thị số dư, trạng thái của phần thưởng (Bounty) đính kèm mỗi Task. Khi Task hoàn thành, người dùng chỉ cần nhấn nút "Claim" để tương tác với Smart Contract và nhận token về ví cá nhân.

### 2. 🤖 Dashboard Thông minh cùng AI Insights
- **Đồ thị trực quan:** Hiển thị biểu đồ phân bổ công việc và dự phóng tiến độ.
- **Thẻ cảnh báo AI (AI Risk Cards):** Các Task có dấu hiệu quá tải, hoặc mô tả quá mơ hồ, phức tạp sẽ được AI gắn cờ đỏ (cảnh báo nguy cơ trễ hạn). Giao diện sẽ hiển thị các Insight này ngay trên danh sách công việc để người quản lý kịp thời điều chỉnh.

### 3. 📝 Quản lý công việc & Trình soạn thảo Markdown chuyên sâu
- **Rich Text Editor:** Ứng dụng tích hợp trình soạn thảo **Lexical** mạnh mẽ. Hỗ trợ đầy đủ Markdown, chèn code blocks, danh sách, và định dạng văn bản chuyên sâu để mô tả công việc (Task Description) rõ ràng nhất.
- **Cập nhật Real-time:** Nhờ Socket.io, khi một đồng nghiệp thay đổi trạng thái Task từ bảng Kanban, giao diện của bạn cũng tự động cập nhật trong tích tắc mà không cần F5.

### 4. 💅 Giao diện Premium, Tối ưu Trải nghiệm (UI/UX)
- **Thiết kế tinh tế:** Sử dụng Tailwind CSS v4 mới nhất kết hợp với hệ sinh thái Component của Radix UI (accessible, không lỗi thời).
- **Chủ đề Sáng/Tối (Dark/Light Mode):** Hỗ trợ chuyển đổi giao diện linh hoạt dựa theo sở thích người dùng hoặc hệ thống (sử dụng `next-themes`).
- **Phản hồi tức thì:** Tối ưu hóa các thao tác bằng cơ chế Optimistic UI qua React Query, kết hợp hệ thống thông báo dạng Toast (Sonner) đẹp mắt.

---

## 🛠 Công nghệ sử dụng (Tech Stack)

Hệ thống Frontend được xây dựng hướng tới hiệu năng cao nhất và dễ bảo trì nhất:

- **Core:** [React 19](https://react.dev/) và [Vite](https://vitejs.dev/) (Build tool siêu tốc).
- **Ngôn ngữ:** TypeScript 100% Type-safe.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/).
- **Quản lý State:** 
  - [Zustand](https://zustand-demo.pmnd.rs/): Cho Global/UI State.
  - [TanStack React Query](https://tanstack.com/query): Cho Server State, caching, và data fetching.
- **Rich Text Editor:** [Lexical](https://lexical.dev/) (Bởi Meta).
- **Routing:** React Router DOM v7.
- **Tiện ích khác:** `date-fns` (xử lý thời gian), `lucide-react` (Icon vector), `axios`.

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy (Getting Started)

### Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/en/) (v18 trở lên).
- Trình duyệt đã cài đặt tiện ích ví Web3 (Ví dụ: MetaMask).

### Cài đặt (Installation)

1. **Vào thư mục Frontend:**
   ```bash
   cd task-bounty-dapp
   ```

2. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường:**
   Tạo file `.env` ở thư mục gốc (root) và cập nhật đường dẫn API của Backend.
   ```env
   # Ví dụ nội dung .env
   VITE_API_URL=http://localhost:3000/api
   VITE_WS_URL=ws://localhost:3000
   VITE_CHAIN_ID=11155111 # Ví dụ Sepolia Testnet
   ```

### Khởi chạy môi trường Phát triển (Development)

```bash
npm run dev
```
👉 Truy cập ứng dụng tại: `http://localhost:5173`

### Đóng gói cho Production (Build & Preview)

```bash
# Kiểm tra lỗi TypeScript & Đóng gói ứng dụng
npm run build

# Xem thử bản build ở local
npm run preview
```

---

## 📂 Cấu trúc thư mục (Folder Structure)

```
task-bounty-dapp/
├── public/             # Chứa tài nguyên tĩnh (favicon, images tĩnh...)
├── src/
│   ├── assets/         # Tài nguyên hình ảnh, fonts, svg...
│   ├── components/     # Các Reusable UI Components (Button, Modal, Input...)
│   ├── features/       # Chia module theo chức năng (Auth, Tasks, Web3, Dashboard...)
│   ├── hooks/          # Custom React Hooks
│   ├── lib/            # Tiện ích, thiết lập thư viện ngoài (axios, radix...)
│   ├── store/          # Zustand stores quản lý global state
│   ├── utils/          # Các hàm helper dùng chung
│   ├── App.tsx         # Root component & Routing configuration
│   └── main.tsx        # React DOM render entry point
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.ts
```
