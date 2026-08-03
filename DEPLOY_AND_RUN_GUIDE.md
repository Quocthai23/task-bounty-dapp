# 🚀 HƯỚNG DẪN VẬN HÀNH TOÀN DIỆN HỆ THỐNG TASK BOUNTY (FULL-STACK RUN & DEPLOY GUIDE)

> **Tài liệu hướng dẫn chi tiết từ A - Z:** Khởi động Docker, Blockchain Local Node (Hardhat), Fiat-Bridge Token Engine, Tunnels Ngrok, Tích hợp Cổng thanh toán PayOS Webhook, cùng Backend NestJS & Frontend React DApp.

---

## 📑 MỤC LỤC
1. [Sơ Đồ Kiến Trúc Hệ Thống](#1-sơ-đồ-kiến-trúc-hệ-thống)
2. [Yêu Cầu Tiền Đề (Prerequisites)](#2-yêu-cầu-tiền-đề-prerequisites)
3. [Bước 1: Khởi Động Docker & Cơ Sở Hạ Tầng](#bước-1-khởi-động-docker--cơ-sở-hạ-tầng)
4. [Bước 2: Khởi Tạo Local Blockchain & Deploy Smart Contracts](#bước-2-khởi-tạo-local-blockchain--deploy-smart-contracts)
5. [Bước 3: Cài Đặt & Chạy Ngrok Tunnel](#bước-3-cài-đặt--chạy-ngrok-tunnel)
6. [Bước 4: Cấu Hình Webhook Trên Dashboard PayOS](#bước-4-cấu-hình-webhook-trên-dashboard-payos)
7. [Bước 5: Cấu Hình & Chạy Backend (NestJS API)](#bước-5-cấu-hình--chạy-backend-nestjs-api)
8. [Bước 6: Khởi Chạy Frontend (React Vite DApp)](#bước-6-khởi-chạy-frontend-react-vite-dapp)
9. [Bước 7: Kịch Bản Kiểm Thử Nạp Tiền & Đúc Token Thực Tế (E2E Test)](#bước-7-kịch-bản-kiểm-thử-nạp-tiền--đúc-token-thực-tế-e2e-test)
10. [Xử Lý Lỗi Thường Gặp (Troubleshooting & FAQs)](#10-xử-lý-lỗi-thường-gặp-troubleshooting--faqs)

---

## 1. Sơ Đồ Kiến Trúc Hệ Thống

```mermaid
flowchart TD
    subgraph Client ["🖥️ Khách Hàng / Trình Duyệt"]
        User["Người dùng"] -->|1. Chọn Nạp VND| FE["Frontend DApp (Port 5173)"]
        User -->|4. Quét VietQR| Banking["App Ngân Hàng Thật"]
    end

    subgraph Gateway ["🌐 Cổng Công Khai & Webhook"]
        Banking -->|5. Chuyển khoản thành công| PayOS["PayOS Payment Gateway"]
        PayOS -->|6. Gửi Webhook| Ngrok["Ngrok Tunnel (Domain Cố Định)"]
        Ngrok -->|7. Forward Request| BE
    end

    subgraph Backend_Layer ["⚙️ Backend & Fiat-Bridge Engine"]
        FE -->|2. Gọi API Nạp| BE["Backend NestJS (Port 3000)"]
        BE -->|3. Trả link VietQR| FE
        BE -->|8. Xác thực & Gửi Lệnh Mint| Bridge["Fiat-Bridge Service (Port 8080)"]
        Bridge -->|9. Xếp hàng Outbox| RabbitMQ[("RabbitMQ Queue")]
    end

    subgraph Blockchain_Layer ["⛓️ Local EVM Blockchain (Hardhat)"]
        Bridge -->|10. Ký & Broadcast Giao Dịch| Node["Hardhat Node (Port 8545)"]
        Node -->|11. Mint Token VNDT| SmartContract["ERC20 Multi-Currency Contracts"]
    end

    subgraph Storage ["💾 Cơ Sở Dữ Liệu"]
        BE <--> PG[("PostgreSQL (Port 5432)")]
        BE <--> Redis[("Redis (Port 26379)")]
        BE <--> Vault[("HashiCorp Vault (Port 8200)")]
    end
```

---

## 2. Yêu Cầu Tiền Đề (Prerequisites)

| Công cụ | Phiên bản khuyến nghị | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Node.js** | `>= v18.0.0` (Khuyên dùng v20+) | Chạy NestJS Backend, React DApp & Hardhat |
| **Docker Desktop** | Bản mới nhất | Chạy PostgreSQL, Redis, RabbitMQ, Vault, Fiat-Bridge |
| **Ngrok** | `v3.x` | Tạo Public Webhook URL kết nối PayOS với Localhost |
| **Tài khoản PayOS** | [payos.vn](https://payos.vn/) | Cổng thanh toán VietQR tự động |
| **Go (Golang)** | `>= 1.21` (Nếu build bridge cục bộ) | Mã nguồn `D:\fiat-bridge` |

---

## Bước 1: Khởi Động Docker & Cơ Sở Hạ Tầng

1. **Mở ứng dụng Docker Desktop** trên máy tính của bạn và đảm bảo Docker daemon đang ở trạng thái `Running`.
2. **Kiểm tra và khởi chạy các containers:**

Mở PowerShell hoặc Command Prompt và chạy:

```powershell
# Kiểm tra danh sách container
docker ps -a

# Khởi động toàn bộ các dịch vụ hạ tầng
docker start task-bounty-postgres task-bounty-redis task-bounty-vault task-bounty-rabbitmq fiat-bridge
```

3. **Xác nhận các cổng dịch vụ đang hoạt động:**
   - **PostgreSQL:** `localhost:5432` (User: `postgres`, Password: `postgres`, DB: `task_bounty`)
   - **Redis:** `localhost:26379` (hoặc `6379`)
   - **RabbitMQ:** `localhost:5672` (Giao diện quản trị Web UI: `http://localhost:15672` - guest/guest)
   - **HashiCorp Vault:** `localhost:8200`
   - **Fiat-Bridge Engine:** `http://localhost:8080`

---

## Bước 2: Khởi Tạo Local Blockchain & Deploy Smart Contracts

Mã nguồn Smart Contract và Hardhat nằm tại thư mục: `D:\fiat-bridge\contracts`.

### 2.1. Khởi động Hardhat Local Node (Mạng Blockchain giả lập)
Mở một cửa sổ Terminal riêng (Terminal 1) và chạy:

```powershell
cd D:\fiat-bridge\contracts
npx hardhat node
```
> 💡 **Kết quả:** Hardhat sẽ khởi tạo mạng EVM cục bộ tại `http://127.0.0.1:8545` (Chain ID: `31337`), cung cấp sẵn 20 ví giả lập kèm 10,000 ETH test mỗi ví.
> 
> *Tài khoản Admin Deployer (Account #0):*
> - Public Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
> - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

### 2.2. Triển khai 5 Smart Contracts Stablecoin
Mở một cửa sổ Terminal mới (Terminal 2) và chạy script deploy:

```powershell
cd D:\fiat-bridge\contracts
node scripts/deploy-all.js
```

Sau khi deploy thành công, script sẽ tự động lưu lại file `deployed-contracts.json` với địa chỉ tương ứng:
- 🇻🇳 **VNDT (VND Token):** `0xe7f1725e7734ce288f8367e1bb143e90bb3f0512`
- 🇺🇸 **USDT (USD Token):** `0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0`
- 🇪🇺 **EURT (EUR Token):** `0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9`
- 🇯🇵 **JPYT (JPY Token):** `0xdc64a140aa3e981100a9beca4e685f962f0cf6c9`
- 🇨🇳 **CNYT (CNY Token):** `0x5fc8d32690cc91d4c39d9d3abcbd16989f875707`

---

## Bước 3: Cài Đặt & Chạy Ngrok Tunnel

Để PayOS có thể bắn thông báo thanh toán (Webhook) về máy tính cá nhân của bạn, cần một đường hầm HTTPS công khai.

1. **Cài đặt Ngrok & Gán Authtoken:**
   Nếu chưa có ngrok, tải tại [ngrok.com/download](https://ngrok.com/download) hoặc cài qua winget:
   ```powershell
   winget install ngrok
   ```
   Đăng nhập tài khoản ngrok và gán Token xác thực của bạn:
   ```powershell
   ngrok config add-authtoken <YOUR_NGROK_AUTHTOKEN>
   ```

2. **Khởi chạy Tunnel trỏ về Backend NestJS (Port 3000):**
   - **Nếu bạn đã có Static Domain cố định:**
     ```powershell
     ngrok http --url=https://solubly-postinfective-mamie.ngrok-free.dev 3000
     ```
   - **Nếu dùng Domain ngẫu nhiên mặc định:**
     ```powershell
     ngrok http 3000
     ```

3. **Bảng điều khiển Web Inspector của Ngrok:**
   - Truy cập: `http://127.0.0.1:4040` trên trình duyệt để kiểm tra realtime toàn bộ các request webhook gửi tới và xem mã phản hồi (HTTP Status).

---

## Bước 4: Cấu Hình Webhook Trên Dashboard PayOS

1. Đăng nhập vào tài khoản PayOS tại: [https://payos.vn/](https://payos.vn/).
2. Chọn mục **Kênh thanh toán (Payment Channels)** hoặc **Cài đặt Tích hợp**.
3. **Lấy bộ 3 thông số API:**
   - `Client ID`
   - `API Key`
   - `Checksum Key`
4. **Cập nhật Webhook URL:**
   - Dán URL sau vào ô **Webhook URL**:
     ```
     https://solubly-postinfective-mamie.ngrok-free.dev/api/wallets/payos-webhook
     ```
     *(Thay bằng domain ngrok tương ứng nếu bạn dùng domain khác).*
   - Nhấn nút **Xác nhận / Kiểm tra Webhook**. PayOS sẽ gửi 1 request test và hệ thống Backend sẽ phản hồi `{"success": true}`.

---

## Bước 5: Cấu Hình & Chạy Backend (NestJS API)

Thư mục dự án: `C:\task-bounty-api`.

### 5.1. Thiết lập biến môi trường (`.env`)
Mở file `C:\task-bounty-api\.env` và đảm bảo các thông số chuẩn xác như sau:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/task_bounty?schema=public"

# Fiat Bridge & Blockchain Local Config
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=task_bounty
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337
CONTRACT_ADDRESS=0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
CONTRACT_ADDRESS_VND=0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
CONTRACT_ADDRESS_USD=0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0
CONTRACT_ADDRESS_EUR=0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9
CONTRACT_ADDRESS_JPY=0xdc64a140aa3e981100a9beca4e685f962f0cf6c9
CONTRACT_ADDRESS_CNY=0x5fc8d32690cc91d4c39d9d3abcbd16989f875707
ADMIN_PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
FIAT_BRIDGE_URL=http://localhost:8080
FIAT_BRIDGE_API_KEY=7afff93f725d94800318faeeb8c7662b6b57c6cb45f3ee3fcbf8df2d5150bb02

# JWT Security
JWT_ACCESS_SECRET="enterprise-super-secret-access-key"
JWT_REFRESH_SECRET="enterprise-super-secret-refresh-key"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# App Port
PORT=3000
REDIS_PORT=26379

# PayOS Integration Keys (Lấy từ Dashboard PayOS của bạn)
PAYOS_CLIENT_ID=b3a40502-3f10-444e-810d-01de14a4ab6b
PAYOS_API_KEY=1fa1255b-0186-418e-a39b-6fc21ca2a2d8
PAYOS_CHECKSUM_KEY=7afff93f725d94800318faeeb8c7662b6b57c6cb45f3ee3fcbf8df2d5150bb02
```

### 5.2. Đồng bộ Database Schema (Prisma) & Khởi chạy Backend
Mở Terminal tại thư mục Backend:

```powershell
cd C:\task-bounty-api

# Đồng bộ bảng dữ liệu vào PostgreSQL
npx prisma db push

# Chạy Backend ở chế độ Development (Watch mode)
npm run start:dev
```

- **Backend API:** `http://localhost:3000/api`
- **Swagger Documentation:** `http://localhost:3000/api/docs`

---

## Bước 6: Khởi Chạy Frontend (React Vite DApp)

Thư mục dự án: `C:\task-bounty-dapp`.

1. **Cấu hình file `.env` Frontend:**
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
2. **Khởi chạy ứng dụng:**
   ```powershell
   cd C:\task-bounty-dapp
   npm run dev
   ```
3. **Mở trình duyệt truy cập:** 👉 [http://localhost:5173](http://localhost:5173)

---

## Bước 7: Kịch Bản Kiểm Thử Nạp Tiền & Đúc Token Thực Tế (E2E Test)

1. **Đăng nhập:** Mở `http://localhost:5173`, đăng nhập tài khoản của bạn.
2. **Vào trang Ví:** Nhấp vào mục **Ví & Tài Chính (Wallet)** trên thanh Menu.
3. **Tạo lệnh Nạp Tiền:**
   - Chọn Tab **Nạp Tiền (Deposit)**.
   - Chọn loại tiền: **VND (Việt Nam Đồng)**.
   - Chọn một hạn mức nạp (hoặc nhập số tiền tùy ý, ví dụ `10,000 VND`).
   - Nhấn **Nạp Tiền VND (PayOS)**.
4. **Quét mã thanh toán:**
   - Khung VietQR sẽ xuất hiện kèm thông tin ngân hàng thụ hưởng và nội dung chuyển khoản tự động.
   - Sử dụng App Ngân hàng hoặc quét mã để thanh toán.
5. **Quan sát kết quả tự động:**
   - PayOS xác nhận giao dịch -> bắn Webhook về `ngrok`.
   - Backend xác thực chữ ký HMAC `PAYOS_CHECKSUM_KEY`, cập nhật giao dịch sang trạng thái `COMPLETED`.
   - Backend phát lệnh đúc token tới `fiat-bridge` (`POST /api/v1/bridge/mint`).
   - `fiat-bridge` ký giao dịch và phát lên Smart Contract `0xe7f1725e7734ce288f8367e1bb143e90bb3f0512`.
   - Frontend DApp ngay lập tức hiển thị thông báo thành công, cập nhật số dư **VNDT (On-Chain Balance)** và ghi nhận vào danh sách **Lịch Sử Giao Dịch**!

---

## 10. Xử Lý Lỗi Thường Gặp (Troubleshooting & FAQs)

### ❓ 1. Lỗi `401 Unauthorized` khi Backend gọi Fiat-Bridge
- **Nguyên nhân:** Khóa `FIAT_BRIDGE_API_KEY` trong `task-bounty-api/.env` không trùng khớp với `HMAC_SECRET` của container `fiat-bridge`.
- **Khắc phục:** Đặt `FIAT_BRIDGE_API_KEY=7afff93f725d94800318faeeb8c7662b6b57c6cb45f3ee3fcbf8df2d5150bb02` (hoặc `dev-key`) trong `.env` của Backend rồi khởi động lại backend.

### ❓ 2. Lỗi `EADDRINUSE: address already in use :::3000`
- **Nguyên nhân:** Tiến trình Node.js cũ vẫn đang chiếm dụng cổng 3000.
- **Khắc phục:** Mở PowerShell chạy lệnh hủy tiến trình:
  ```powershell
  $p = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue; if ($p) { Stop-Process -Id $p.OwningProcess -Force }
  ```

### ❓ 3. Lỗi `relation "transactions" does not exist` trong log `fiat-bridge`
- **Khắc phục:** Khởi động lại container `fiat-bridge` để GORM tự động chạy AutoMigrate:
  ```powershell
  docker restart fiat-bridge
  ```

### ❓ 4. Ngrok bị ngắt kết nối hoặc đổi URL mới
- Nếu sử dụng phiên bản miễn phí của ngrok không cố định domain, mỗi lần bật lại ngrok bạn cần copy URL mới (ví dụ `https://xyz.ngrok-free.dev`) và cập nhật lại vào mục **Webhook URL** trên Dashboard PayOS.

---
*Chúc bạn vận hành và phát triển dự án thành công! Mọi thắc mắc hãy xem log trực tiếp tại `http://127.0.0.1:4040` (Ngrok) và log container bằng `docker logs -f fiat-bridge`.*
