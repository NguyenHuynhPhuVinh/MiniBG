# 💰 CƠ CHẾ 5: HỆ THỐNG TIỀN TỆ & KINH TẾ (ECONOMY)

**Cập nhật:** 08/08/2025  
**Phiên bản:** 2.2 - Đồng bộ GAME_SYSTEM (công bằng, 1 loại tiền tệ, không bán trứng)  
**Trạng thái:** Tiền tệ đơn giản với SynCoin duy nhất; giá và tỉ lệ mang tính cấu hình

## 🎯 Mục Tiêu

- Một loại tiền tệ duy nhất: SynCoin
- Nguồn cung minh bạch: từ Quiz Racing và quy đổi duplicate khi mở trứng
- Shop cấu hình theo danh mục (frames, emoji, avatar hiếm), không hard-code giá trong tài liệu
- Tích hợp mini game (4 câu đúng = 1 lần) với trứng mở tức thì sau trận
- Trứng KHÔNG THỂ MUA; chỉ thu thập từ mini game

## 💰 SynCoin - Tiền Tệ Duy Nhất

### Mô Tả

**SynCoin** là đơn vị tiền tệ duy nhất trong Synlearnia, có thể kiếm được thông qua các hoạt động học tập và sử dụng cho mọi giao dịch trong game.

**Icon:** `coin.png`

### Cách Nhận (Nguồn Cung)

#### 1. Hoàn Thành Quiz Racing

- Nguồn chính: SynCoin tính theo performance (điểm, xếp hạng) do server xác thực
- Có thể áp dụng bảo vệ chống farm/lạm phát (tùy cấu hình vận hành)

#### 2. Phân Giải Vật Phẩm Trùng Lặp

- Tự động chuyển đổi: khi mở trứng và trúng vật phẩm đã sở hữu
- Công bằng: quy đổi theo độ hiếm; xảy ra ngay khi mở trứng sau trận
- Giá trị quy đổi do hệ thống Economy cấu hình (xem Collection System)

### Công Dụng (Nguồn Cầu)

#### 1. Mua Khung Avatar Đặc Biệt

- Từ `avatar-frame-pack` (không unlock theo cấp độ)
- Có thể mua bằng SynCoin hoặc nhận từ trứng hiếm
- Biểu tượng thể hiện cá tính và phong cách

#### 2. Mua Emoji Cụ Thể

- Từ `vector-emojis-pack`; bán lẻ từng emoji (không bán trứng/pack trứng)
- Tương tác xã hội: sử dụng trong sảnh chờ và Quiz Racing

#### 3. Mua Avatar Hiếm (Tùy chọn)

- Cho phép mua một số avatar hiếm bằng SynCoin (không yêu cầu cấp)
- Bổ sung lựa chọn cho người muốn hoàn thiện sưu tầm

**🚫 LƯU Ý QUAN TRỌNG:** SynCoin KHÔNG THỂ mua trứng. Trứng chỉ thu thập từ mini game khi đạt 4 câu đúng và được mở tức thì sau trận.

## 🛒 Cửa Hàng SynCoin (Giá Cấu Hình)

### Danh mục

- Avatar Frames: từ `avatar-frame-pack` (không phụ thuộc cấp độ)
- Emoji: bán lẻ từng emoji từ `vector-emojis-pack`
- Avatar hiếm (tuỳ chọn): một số avatar có thể bán để bổ sung lựa chọn sưu tầm

### Nguyên tắc định giá

- Do hệ thống Economy/Shop cấu hình; có thể thay đổi mà không sửa tài liệu/code
- Giá như nhau cho mọi người chơi; không phụ thuộc level/tier
- Không bán trứng; chỉ bán vật phẩm trực tiếp

### Ví dụ dải giá tham khảo (có thể thay đổi)

| Nhóm                    | Dải giá gợi ý   |
| ----------------------- | --------------- |
| Emoji Basic             | 5–20 SynCoin    |
| Emoji Rare              | 20–60 SynCoin   |
| Emoji Epic/Legendary    | 60–150 SynCoin  |
| Avatar Frames (Premium) | 150–300 SynCoin |
| Avatar Hiếm (tuỳ chọn)  | 200–400 SynCoin |

Ghi chú: Dải giá tham khảo cân đối với tỉ lệ quy đổi duplicate từ trứng (xem Collection System) để tránh lạm phát.

## 🔄 Vòng Lặp Kinh Tế

Mô hình này tạo ra một vòng lặp tích cực theo đúng cơ chế được mô tả trong GAME_SYSTEM_SYNLEARNIA.md:

### 1. HỌC & CHƠI

- Người dùng tham gia Quiz Racing, cạnh tranh với người chơi khác
- Cố gắng trả lời đúng để có điểm cao và đạt 4 câu đúng (không cần liên tiếp)

### 2. MINI GAME THU THẬP TRỨNG

- **Kích hoạt:** Khi trả lời đúng đủ 4 câu hỏi, kích hoạt mini game thu thập trứng
- **Thời gian:** 10 giây thu thập trứng rơi từ trên xuống
- **Reset:** Bộ đếm reset về 0/4 sau mỗi lần hoàn thành mini game
- **Công bằng:** Tỉ lệ thu thập như nhau cho tất cả người chơi

### 3. NHẬN THƯỞNG QUIZ RACING

- **SynCoin:** Nhận dựa trên thành tích Quiz Racing (thứ hạng, điểm số)
- **XP:** Nhận để lên cấp và mở khóa huy hiệu mới
- **Trứng:** Thu thập từ mini game khi đạt 4 câu đúng

### 4. MỞ TRỨNG TỨC THỜI

- **Tự động:** Khi kết thúc Quiz Racing, TẤT CẢ trứng thu thập được tự động mở ngay lập tức
- **Không lưu trữ:** Trứng không tồn tại trong cơ sở dữ liệu hay inventory của người chơi
- **Phần thưởng ngay:** Nhận avatar, khung, emoji, XP hoặc SynCoin tức thì
- **Chống trùng lặp:** Vật phẩm trùng lặp tự động chuyển thành SynCoin theo độ hiếm

### 5. MUA SẮM TRONG CỬA HÀNG

- **Sử dụng SynCoin:** Mua khung avatar đặc biệt (500-2,000 SynCoin)
- **Mua emoji cụ thể:** Chọn emoji yêu thích (50-800 SynCoin)
- **Mua chắc chắn:** Không RNG, trả tiền là có ngay vật phẩm
- **🚫 Không mua trứng:** Trứng chỉ thu thập từ mini game

### 6. QUAY LẠI BƯỚC 1

- **Động lực rõ ràng:** Mục tiêu thu thập từ mini game và mua sắm khuyến khích tiếp tục chơi
- **Chu kỳ không ngừng:** Luôn có vật phẩm mới để sưu tầm và mua

## 💡 Lợi Ích Của Hệ Thống

### ✅ Đơn Giản và Dễ Hiểu

- **Một loại tiền tệ duy nhất (SynCoin)** giúp người chơi dễ dàng quản lý và hiểu hệ thống
- **Bảng giá rõ ràng** cho tất cả items không có chi phí ẩn
- **Không phức tạp** về currencies như nhiều game khác

### ⚖️ Cân Bằng Giữa May Rủi và Nỗ Lực

- **May mắn:** Người chơi có thể nhận vật phẩm hiếm từ mini game thu thập trứng
- **Nỗ lực:** Người chơi có thể tích lũy SynCoin để mua chắc chắn vật phẩm mong muốn
- **Cả hai đều có giá trị:** Không thiên vị về bất kỳ phương thức nào

### 🎯 Tạo Giá Trị Cho Mọi Phần Thưởng

- **Không có phần thưởng vô dụng:** Vật phẩm trùng lặp từ trứng tự động chuyển thành SynCoin
- **Mọi nỗ lực đều có giá trị:** Kể cả khi không may mắn vẫn nhận được SynCoin

### 📈 Tăng Khả Năng Giữ Chân Người Dùng

- **Shop với 100+ items:** Khuyến khích người dùng quay trở lại để kiếm SynCoin
- **Mục tiêu dài hạn:** Khung avatar đắt tạo động lực chơi lâu dài
- **Tiến bộ liên tục:** Luôn có vật phẩm mới để hướng tới

### 🛍️ Linh Hoạt Trong Mua Sắm

- **Tự do lựa chọn:** Người chơi quyết định ưu tiên mini game hay mua sắm
- **Không bắt buộc:** Có thể chơi hoàn toàn miễn phí hoặc tích cực mua sắm
- **Trải nghiệm cá nhân hóa:** Mỗi người có cách chơi riêng

### 🎮 Tích Hợp Hoàn Hảo Với Game Mechanics

- **Quiz Racing Focus:** Hệ thống kinh tế hỗ trợ chứ không làm phân tâm khỏi học tập
- **Mini Game Integration:** Trứng chỉ từ mini game tạo sự độc quyền và giá trị
- **Social Features:** Emoji và khung avatar thúc đẩy tương tác xã hội
