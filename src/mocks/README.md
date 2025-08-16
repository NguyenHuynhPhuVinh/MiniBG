# Mock Data Layer

Mục tiêu: cung cấp dữ liệu ảo cho UI trước khi có API thật, và có thể gỡ bỏ (delete) toàn bộ mock dễ dàng mà không chạm vào service contracts.

Nguyên tắc:
- Không thêm dependency mới (ví dụ MSW) để giữ nhẹ cân; dùng conditional routing trong service layer.
- Tôn trọng contract của services/types hiện có (vd: CurrencyService.getCurrencyBalance trả về CurrencyApiResponse).
- Bật/tắt qua biến môi trường `NEXT_PUBLIC_USE_MOCKS=true|false`.
- Đồng bộ với GAME SYSTEM: SynCoin là bắt buộc; Kristal có thể bật/tắt qua `NEXT_PUBLIC_ENABLE_KRISTAL=true|false` để phù hợp chiến lược 1 hay 2 currency.

Cấu trúc:
```
src/mocks/
├── data/
│   ├── currency.mock.json
│   └── ... (thêm sau nếu cần)
├── handlers/
│   ├── currency.mock.ts     # hàm mock logic theo endpoint
│   └── index.ts             # gom handler
└── init.ts                  # hàm init để wrap axios khi USE_MOCKS=true
```

Xóa mock hoàn toàn:
- Xóa thư mục `src/mocks/`
- Gỡ import `@/mocks/init` (nếu đã thêm) khỏi entry (hoặc bỏ NEXT_PUBLIC_USE_MOCKS)

Thay thế bằng API thực tế:
- Đặt `NEXT_PUBLIC_USE_MOCKS=false` (mặc định false)
- Không cần đổi code UI/service do contract giữ nguyên.

