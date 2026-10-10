# Portfolio — Dao Nguyen Dang Gia

Site tĩnh, tiếng Anh, không cần build.

## Xem trên máy

Mở PowerShell trong thư mục này, rồi chạy:

```powershell
..\OmniTrace\.venv\Scripts\python.exe -m http.server 4173
```

Giữ cửa sổ đó mở. Trình duyệt vào http://127.0.0.1:4173

Tắt server: nhấn `Ctrl + C` trong PowerShell.

Máy chưa có Python thì bấm đúp `index.html`. Bộ lọc và các trang project vẫn chạy.

## Sửa nội dung

- Trang chủ: `index.html`
- Bốn bài: `work/`
- Thẻ lọc nằm ở thuộc tính `data-tags` trên từng thẻ project: `software`, `ai`, `data`, `robot`

## Đưa lên mạng, không mất phí

GitHub Pages hoặc Cloudflare Pages hoặc Vercel, gói miễn phí. Site này là HTML tĩnh, trỏ thư mục gốc là chạy.

`daonguyenhp.vercel.app` hiện không mở được (404). Có thể trỏ lại project Vercel đó vào thư mục này.

## Việc nên bỏ tiền

Xem mục chi phí trong cuộc trao đổi khi site được dựng. Tóm tắt:

| Khoản | Có bắt buộc để site sống không | Mức |
| --- | --- | --- |
| Hosting GitHub Pages / Cloudflare Pages / Vercel | Không, bản miễn phí đủ | 0 |
| Tên miền `.com` hoặc `.dev` | Không, nhưng nên có khi gửi CV | khoảng 10–20 USD/năm |
| Email theo tên miền | Không. Email trường đang dùng được. Cloudflare Email Routing thì miễn phí nếu đã có tên miền | 0, hoặc Google Workspace nếu muốn hộp thư riêng |
| Ảnh chân dung | Không | một buổi chụp nếu muốn |
| Form liên hệ trả phí | Không. Trang dùng `mailto` | 0 |
| Chứng chỉ HTTPS | Không. Host ở trên cấp sẵn | 0 |

Jetson, AWS Bedrock, phần cứng tủ thuốc là tiền của từng dự án, không phải tiền của website này.
