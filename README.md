# Pick'Ems — Crossfire: Legends Fall Championship 2026

Trang web dự đoán vòng bảng (pick'ems) cho giải Crossfire: Legends Fall Championship 2026, lấy cảm hứng giao diện từ Pick'Ems Valorant Champions, phối theo tông lửa/vàng kim của key visual giải đấu. Kéo đội từ danh sách "Chưa Xếp Hạng" lên 4 vị trí thứ hạng cố định (1–4) để dự đoán kết quả vòng bảng — vị trí 1–2 (khung vàng) là đội đi tiếp, vị trí 3–4 (khung xám tro) là đội bị loại.

Trang web **tĩnh hoàn toàn** (HTML/CSS/JS thuần, không cần build step), dữ liệu lưu trong `localStorage` của trình duyệt — không cần tài khoản hay server.

## Cấu trúc

- `index.html` — khung giao diện (hero banner + lưới bảng đấu)
- `assets/style.css` — theme lửa/vàng kim, font tùy chỉnh, toàn bộ style
- `assets/fonts/` — font "GS3 Agency FB" (Regular/Bold) dùng cho tiêu đề, nút bấm, nhãn, tên đội
- `assets/img/` — nơi đặt key visual (KV) của giải để làm nền hero banner (xem mục bên dưới)
- `assets/teams.js` — dữ liệu 4 bảng đấu (A–D), mỗi bảng 4 đội (**placeholder**, sửa lại khi có danh sách đội thật), cùng hằng số `ADVANCE_COUNT`
- `assets/app.js` — kéo thả (dùng [SortableJS](https://github.com/SortableJS/Sortable) qua CDN) vào 4 ô thứ hạng cố định, lưu trạng thái, thanh tiến độ
- `assets/scoring.js` — luật tính điểm (16đ đi tiếp + 2đ bonus đúng thứ hạng, tối đa 40đ/bảng). File này **chưa được gắn vào giao diện** (hiện tại trang chỉ tập trung vào việc thu thập dự đoán) — giữ lại làm tham khảo khi cần bật tính năng chấm điểm/nhập kết quả thực tế sau này.

## Thay key visual (KV) của giải

Hero banner ở đầu trang hiện dùng gradient lửa dựng bằng CSS (chưa có ảnh thật). Để lắp KV chính thức:

1. Copy file ảnh KV vào `assets/img/` (vd. `assets/img/kv.jpg`).
2. Mở [`assets/style.css`](assets/style.css), tìm rule `.hero-bg`, bỏ comment và điền đường dẫn:
   ```css
   .hero-bg {
     background-image: url("img/kv.jpg");
     background-size: cover;
     background-position: center 25%; /* chỉnh % theo bố cục ảnh */
   }
   ```
3. Lớp `.hero-overlay` sẽ tự làm tối phần dưới ảnh để chữ tiêu đề luôn dễ đọc.

## Luật tính điểm (tham khảo, sẽ dùng khi bật lại tính năng chấm điểm)

Với mỗi bảng 4 đội, top 2 đi tiếp:

- Dự đoán đúng đội đi tiếp (đội đó thực sự vào top 2 **và** bạn xếp nó vào 1 trong 2 vị trí đầu): **+16 điểm**.
- Dự đoán đúng đội **không** đi tiếp: **+0 điểm** (không có điểm cho việc đoán đúng đội bị loại).
- Xếp đúng chính xác thứ hạng (vị trí 1–4) của đội: **+2 điểm bonus**, áp dụng cho mọi vị trí kể cả đội không đi tiếp.
- Tổng tối đa 1 bảng: `2 × 16 + 4 × 2 = 40 điểm`. Tổng tối đa toàn giải (4 bảng): `160 điểm`.

## Cập nhật dữ liệu đội thật

Mở [`assets/teams.js`](assets/teams.js) và thay tên đội (`name`), mã ngắn (`short`), màu logo placeholder (`color`) cho từng bảng. Nếu số bảng / số đội mỗi bảng / số đội đi tiếp khác với 4 bảng × 4 đội × top 2, chỉnh thêm hằng số `ADVANCE_COUNT` và cấu trúc `GROUPS` tương ứng (lưu ý `assets/app.js` hiện giả định mọi bảng có cùng số đội như bảng đầu tiên).

## Chạy thử local

Không cần cài đặt gì — mở trực tiếp `index.html` bằng trình duyệt, hoặc chạy một static server bất kỳ (vd. VS Code Live Server) ở thư mục gốc.

## Deploy GitHub Pages

Repo đã có sẵn workflow `.github/workflows/deploy.yml` dùng GitHub Actions để deploy tĩnh (không cần build):

1. Tạo repo trên GitHub, push code lên nhánh `main`.
2. Vào **Settings → Pages**, ở mục **Build and deployment → Source**, chọn **GitHub Actions**.
3. Push lên `main` (hoặc chạy workflow thủ công) — trang sẽ tự deploy lên `https://<username>.github.io/<repo>/`.
