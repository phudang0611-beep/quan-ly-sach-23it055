# ĐỀ THI GIỮA KÌ - MÔN: ĐIỆN TOÁN ĐÁM MÂY
## HỆ THỐNG QUẢN LÝ SÁCH TRÊN NỀN TẢNG CLOUD (STATELESS & LEAST PRIVILEGE)

- **Họ và tên sinh viên:** Lê Phú Đẳng
- **Mã số sinh viên (MSSV):** 23IT055
- **3 số cuối MSSV:** `055` (Tiền tố bắt buộc cho Mã Sách)
- **Chữ số cuối MSSV:** `5`
- **Mức thuế suất VAT:** `VAT = (Chữ số cuối MSSV + 5)% = (5 + 5)% = 10%`
- **Tên cơ sở dữ liệu MongoDB Atlas:** `DB_23IT055`

---

## 1. KIẾN TRÚC VÀ CÁC YÊU CẦU ĐÃ ĐÁP ỨNG

### 1.1. Kiến trúc Bảo mật Cơ sở dữ liệu Cloud (Least Privilege)
- Thiết lập cơ sở dữ liệu trên MongoDB Atlas mang tên: `DB_23IT055`.
- Tạo 02 tài khoản người dùng độc lập:
  - **Tài khoản chỉ ĐỌC (`user_read_23IT055`):** Được cấp quyền `read` duy nhất trên database `DB_23IT055`. Dùng để đọc danh sách sách (`find()`).
  - **Tài khoản GHI (`user_write_23IT055`):** Được cấp quyền `readWrite` trên database `DB_23IT055`. Dùng để thêm mới sách (`create()`).
- Hệ thống duy trì 2 kết nối Mongoose riêng biệt (`readConnection` và `writeConnection`). Luồng đọc và ghi được điều hướng tự động và độc lập vào đúng tài khoản có thẩm quyền tương ứng.

### 1.2. Logic Backend & Kiến trúc Stateless
- **Đa luồng kết nối Node.js/Express:**
  - `ReadBook = readConnection.model('Book', bookSchema)`: phục vụ `GET /` (Xem danh sách).
  - `WriteBook = writeConnection.model('Book', bookSchema)`: phục vụ `POST /books` (Thêm sách).
- **Stateless Session (Phục vụ Auto-Scaling Cloud):**
  - Sử dụng thư viện `connect-mongo` kết hợp `express-session` để lưu trữ toàn bộ Session tập trung xuống collection `sessions` trên Cloud MongoDB Atlas.
  - Tuyệt đối **không lưu Session/Cookie trong RAM máy chủ** (MemoryStore), đảm bảo khi ứng dụng nhân bản nhiều bản sao (Multi-instance / Horizontal Pod Autoscaling) thì phiên làm việc của người dùng không bị mất.
- **Thuật toán cá nhân hóa:**
  - **Bộ lọc mã sản phẩm:** Bắt buộc có tiền tố là 3 số cuối MSSV: `055`. Nếu người dùng nhập mã không bắt đầu bằng `055` (ví dụ: `BK01` hoặc `123-BK`), hệ thống lập tức từ chối và thông báo lỗi.
  - **Thuế suất VAT:** Tự động tính theo công thức `(5 + 5)% = 10%`.
  - **Giá sau thuế:** Hệ thống tự động tính `priceWithVAT = price * 1.10` trước khi lưu vào Cloud MongoDB Atlas.
  - **Handlebars:** Render giao diện chuẩn Bootstrap 5, Footer cố định hiển thị:
    `Họ và tên: Lê Phú Đẳng | MSSV: 23IT055 | Mức VAT áp dụng: 10%`.

### 1.3. Quản lý mã nguồn & Kiểm soát DevOps
- Khởi tạo Git, cấu hình `.gitignore` nghiêm ngặt ngăn chặn rò rỉ `.env`, thư mục `node_modules` và log.
- Cung cấp file `.env.example` làm mẫu cấu hình chuẩn.
- Bóc tách quy trình code trên 2 nhánh độc lập:
  - Nhánh `feature/database`: Triển khai mô hình đa kết nối Least Privilege và Book Model.
  - Nhánh `feature/session`: Cấu hình Stateless Session trên Mongo Atlas và giao diện Handlebars.
  - Gộp lần lượt về `main` bằng lệnh `git merge --no-ff`, lưu lại đầy đủ sơ đồ cây có các nút gộp (Merge Node).

---

## 2. HƯỚNG DẪN THIẾT LẬP MONGODB ATLAS

1. Đăng nhập [MongoDB Atlas](https://cloud.mongodb.com/).
2. Tạo 1 Cluster miễn phí (Shared M0 Cluster).
3. **Cấu hình Network Access (Mở kết nối Cloud):**
   - Vào menu **Network Access** &rarr; Chọn **Add IP Address**.
   - Chọn **Allow Access from Anywhere** (`0.0.0.0/0`) &rarr; Nhấn **Confirm** (để dịch vụ PaaS như Render có thể kết nối).
4. **Cấu hình Database Access (Bảo mật Least Privilege):**
   - Vào menu **Database Access** &rarr; Chọn **Add New Database User**.
   - **Tài khoản Đọc:**
     - Username: `user_read_23IT055`
     - Password: Nhập mật khẩu (ví dụ: `ReadPassword123@`)
     - Database User Privileges: Chọn **Built-in Role** &rarr; chọn **Only read any database** hoặc chọn **Specific Privileges**:
       - Role: `read`
       - Database: `DB_23IT055`
   - **Tài khoản Ghi:**
     - Username: `user_write_23IT055`
     - Password: Nhập mật khẩu (ví dụ: `WritePassword123@`)
     - Database User Privileges: Chọn **Specific Privileges**:
       - Role: `readWrite`
       - Database: `DB_23IT055`
5. **Lấy chuỗi kết nối (Connection String):**
   - Vào tab **Database** &rarr; Nhấn **Connect** &rarr; Chọn **Drivers** (Node.js).
   - Sao chép chuỗi kết nối và thay đổi username, password tương ứng cho từng tài khoản:
     ```text
     mongodb+srv://user_read_23IT055:<password>@cluster0.xxxxx.mongodb.net/DB_23IT055?retryWrites=true&w=majority
     mongodb+srv://user_write_23IT055:<password>@cluster0.xxxxx.mongodb.net/DB_23IT055?retryWrites=true&w=majority
     ```

---

## 3. CẤU HÌNH BIẾN MÔI TRƯỜNG CỤC BỘ (.env)

Tạo file `.env` tại thư mục gốc của dự án (tuyệt đối không commit file này lên Git):

```env
PORT=3000
MONGO_URI_READ=mongodb+srv://user_read_23IT055:<mat_khau_read>@cluster0.xxxxx.mongodb.net/DB_23IT055?retryWrites=true&w=majority
MONGO_URI_WRITE=mongodb+srv://user_write_23IT055:<mat_khau_write>@cluster0.xxxxx.mongodb.net/DB_23IT055?retryWrites=true&w=majority
MONGO_URI_SESSION=mongodb+srv://user_write_23IT055:<mat_khau_write>@cluster0.xxxxx.mongodb.net/DB_23IT055?retryWrites=true&w=majority
SESSION_SECRET=LePhuDang_23IT055_Secret_Key_Cloud2026
```

Cài đặt và chạy ứng dụng cục bộ:
```bash
npm install
npm start
```
Mở trình duyệt: `http://localhost:3000`.

---

## 4. HƯỚNG DẪN QUẢN LÝ GIT VÀ ĐẨY LÊN GITHUB

### 4.1. Kiểm tra sơ đồ cây Git (Minh chứng hoàn thành tiêu chí DevOps)
Chạy lệnh sau để hiển thị sơ đồ các nhánh và nút gộp (Merge Node):
```bash
git log --graph --oneline
```
Kết quả hiển thị:
```text
*   59baa09 Merge branch 'feature/session' into main
|\  
| * c969b10 feat(session): configure stateless session with connect-mongo, handlebars templates and student footer
|/  
*   2b5083f Merge branch 'feature/database' into main
|\  
| * 998908b feat(database): implement multi-connection architecture with Least Privilege (Read/Write) and Book model
|/  
* 585e994 chore: initial project setup with dependencies and gitignore
```

### 4.2. Đẩy lên GitHub ở chế độ Private & Cấp quyền Giảng viên
1. Đăng nhập [GitHub](https://github.com/) &rarr; Nhấn **New Repository**.
2. Đặt tên repository: `quan-ly-sach-23it055`.
3. Chọn chế độ: **Private** (Riêng tư).
4. Không tích chọn tạo README, .gitignore vì đã có sẵn trong dự án.
5. Liên kết và đẩy code lên:
   ```bash
   git remote add origin https://github.com/<tai-khoan-github-cua-ban>/quan-ly-sach-23it055.git
   git branch -M main
   git push -u origin main
   ```
6. **Cấp quyền cho Giảng viên:**
   - Vào repository trên GitHub &rarr; Chọn tab **Settings** &rarr; Chọn mục **Collaborators**.
   - Nhấn nút **Add people** &rarr; Nhập username hoặc email của Giảng viên &rarr; Chọn **Add collaborator**.

---

## 5. HƯỚNG DẪN TRIỂN KHAI LÊN NỀN TẢNG CLOUD PAAS (RENDER)

1. Đăng ký/Đăng nhập tài khoản tại [Render](https://render.com/).
2. Chọn **New +** &rarr; Chọn **Web Service**.
3. Chọn **Build and deploy from a Git repository** &rarr; Kết nối tài khoản GitHub &rarr; Chọn repository `quan-ly-sach-23it055`.
4. Cấu hình thông số triển khai:
   - **Name:** `quan-ly-sach-23it055`
   - **Region:** Singapore (Southeast Asia)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. **Cấu hình Environment Variables (Bảo mật Cloud):**
   Cuộn xuống phần **Environment Variables** và thêm từng biến (tuyệt đối không hardcode trong mã nguồn):
   - `PORT`: `3000`
   - `MONGO_URI_READ`: `mongodb+srv://user_read_23IT055:<mat_khau_read>@cluster0.xxxxx.mongodb.net/DB_23IT055?retryWrites=true&w=majority`
   - `MONGO_URI_WRITE`: `mongodb+srv://user_write_23IT055:<mat_khau_write>@cluster0.xxxxx.mongodb.net/DB_23IT055?retryWrites=true&w=majority`
   - `MONGO_URI_SESSION`: `mongodb+srv://user_write_23IT055:<mat_khau_write>@cluster0.xxxxx.mongodb.net/DB_23IT055?retryWrites=true&w=majority`
   - `SESSION_SECRET`: `LePhuDang_23IT055_Secret_Key_Cloud2026`
6. Nhấn nút **Create Web Service**. Đợi 1-2 phút để Render tự động build và chạy dịch vụ trực tuyến 24/7.
