# 📈 CƠ CHẾ 1: HỆ THỐNG CẤP ĐỘ & HUY HIỆU

**Cập nhật:** 08/08/2025  
**Phiên bản:** 2.1 - Synchronized với GAME_SYSTEM_SYNLEARNIA.md  
**Trạng thái:** Đồng bộ theo thiết kế GAME_SYSTEM (công bằng, 1 loại tiền tệ, trứng mở tức thì)

## 🎯 Mục Tiêu

- Tạo cảm giác tiến bộ rõ ràng và lâu dài thông qua học tập
- Khuyến khích tham gia thường xuyên vào Quiz Racing
- Cung cấp mục tiêu ngắn hạn và dài hạn với 120 cấp độ
- Phân tầng người chơi theo dedication và performance
- Tích hợp với hệ thống huy hiệu 10 tầng từ Wood đến Master

## 📊 Hệ Thống Điểm Kinh Nghiệm (XP)

### Nguồn XP duy nhất: Quiz Racing

Mọi XP đến từ hoạt động trong Quiz Racing, do server tính để đảm bảo công bằng:

- Hoàn thành quiz: XP cơ bản theo thành tích tổng thể
- Câu trả lời đúng: XP theo độ khó và độ chính xác
- Chuỗi thắng (streak): XP bonus khi đúng liên tiếp (reset khi sai/hết thời gian)
- Thưởng từ trứng: Một số trứng có thể cho XP khi mở (trứng chỉ đến từ mini game)

Xem [Quiz Racing Reward Calculation](06-quiz-racing-system.md) để biết công thức XP cụ thể (speed bonus, streak, độ khó, xếp hạng...).

## 🏆 Hệ Thống Cấp Độ (Level)

### XP cần thiết theo cấu hình

- Tối đa 120 cấp độ (1 → 120)
- Mốc XP mỗi cấp tăng dần theo cấu hình LevelConfig (không hard-code công thức tại tài liệu)
- Cấu hình được tinh chỉnh qua dữ liệu vận hành để giữ nhịp tiến độ hợp lý

### Phần thưởng khi lên cấp

- Mở khóa huy hiệu/tier tương ứng (xem phần Tier bên dưới)
- Mở khóa một số vật phẩm trang trí theo lộ trình (ví dụ avatar cơ bản)
- Không phát SynCoin theo cấp độ mặc định (SynCoin chủ yếu đến từ Quiz Racing và quy đổi duplicate)

#### Avatar Unlock Policy (30 avatars total)

- Bộ `avatar-animal-pack/` gồm 30 avatar động vật.
- Một PHẦN avatars mở khóa theo cấp độ (core progression). Phần còn lại là hiếm/độc quyền, chỉ nhận được từ Trứng Thưởng hoặc mua trong Cửa hàng bằng SynCoin.
- Lộ trình mở khóa theo cấp độ được cấu hình. Ví dụ (minh họa):
  - Level 1: `chick` (khởi tạo)
  - Level 5: `dog`
  - Level 10: `rabbit`
  - Level 15: `cow`
  - Level 20: `bear`
  - Level 25: `elephant`
  - Level 30: `panda`
  - Level 35: `monkey`
  - Level 40: `horse`
  - Level 45: `duck`
  - Level 50: `pig`
  - Level 55: `goat`
  - (Các avatar còn lại: trứng/Cửa hàng)

#### Mini Game & Trứng Thưởng

- Trứng chỉ thu thập từ mini game khi đạt 4 câu đúng trong Quiz Racing.
- Trứng được mở TỨC THÌ khi kết thúc Quiz Racing (không lưu trữ trong inventory ở trạng thái “trứng”).
- Tỉ lệ phần thưởng từ trứng như nhau cho tất cả người chơi, không phụ thuộc vào cấp độ hay tier (đảm bảo công bằng).
- Vật phẩm trùng lặp từ trứng tự động chuyển thành SynCoin theo độ hiếm.

Xem [Collection System](03-collection-system.md) và [Quiz Racing System](06-quiz-racing-system.md) để biết chi tiết drop rates và mechanics.

#### Ghi chú về SynCoin

- SynCoin chủ yếu nhận được từ việc hoàn thành Quiz Racing và quy đổi vật phẩm trùng lặp từ trứng.
- Không thể mua trứng bằng SynCoin.

## 👑 Hệ Thống Tầng Huy Hiệu (Tier System)

### Chi tiết các tầng & phần hiển thị

| Tầng     | Cấp Độ  | Tên Tầng (Tier)          |
| -------- | ------- | ------------------------ |
| Wood     | 1-12    | Wood (Gỗ)                |
| Bronze   | 13-24   | Bronze (Đồng)            |
| Silver   | 25-36   | Silver (Bạc)             |
| Gold     | 37-48   | Gold (Vàng)              |
| Platinum | 49-60   | Platinum (Bạch Kim)      |
| Onyx     | 61-72   | Onyx (Đá Mã Não)         |
| Sapphire | 73-84   | Sapphire (Lam Ngọc)      |
| Ruby     | 85-96   | Ruby (Hồng Ngọc)         |
| Amethyst | 97-108  | Amethyst (Thạch Anh Tím) |
| Master   | 109-120 | Master (Bậc Thầy)        |

- Mỗi cấp trong dải tier mở khóa 1 huy hiệu thiết kế riêng (hiển thị trong hồ sơ/bảng xếp hạng).
- Không có multiplier SynCoin theo tier để đảm bảo công bằng.

### Frame System

- Khung avatar đặc biệt từ `avatar-frame-pack/` có thể nhận theo 2 cách: mở trứng (Rare/Epic/Legendary) hoặc mua trong Cửa hàng bằng SynCoin.
- Không có frame nào unlock tự động theo tier.

## 🎮 Tương Tác Với Hệ Thống Khác

### Với Quiz Racing System

- XP là nguồn duy nhất đến từ Quiz Racing (speed bonus, streak, độ khó, hoàn thành quiz)
- Cơ chế 4 câu đúng kích hoạt mini game thu thập trứng (overlay cá nhân, không ảnh hưởng điểm quiz)
- Trứng mở tức thì khi kết thúc trận
- Không ghép trận theo level (đảm bảo linh hoạt, giảng viên vẫn có thể tham gia)

### Với Economy System

- Single currency: chỉ có SynCoin
- Nguồn cung: hoàn thành quiz + quy đổi duplicate từ trứng
- Nguồn cầu: mua avatar/emoji hiếm, khung avatar đặc biệt tại Cửa hàng
- Không thể mua trứng bằng SynCoin (trứng chỉ từ mini game)

### Với Collection System

- Avatar: một phần mở theo cấp độ; avatar hiếm/độc quyền chỉ từ trứng hoặc Cửa hàng
- Mini game rewards: thu thập trứng khi đạt 4 câu đúng; trứng mở tức thì khi kết thúc trận
- Duplicate từ trứng → SynCoin; đảm bảo không có phần thưởng “vô dụng”

### Với Customization System

- Progressive unlocks: avatar cơ bản mở theo cấp; frames/emoji đặc biệt từ trứng hoặc Cửa hàng
- Status display: level và tier hiển thị trong profile, sảnh chờ và giao diện quiz

## 📊 Metrics & Analytics

### Progression Health Monitoring

**Cần theo dõi:**

- Tốc độ level up trung bình theo thời gian chơi
- Phân bố người chơi qua các tầng
- Tỷ lệ người chơi "mắc kẹt" ở level nào đó
- Sự hài lòng với tốc độ progression

**Chỉ số cân bằng (gợi ý, điều chỉnh theo dữ liệu):**

- Thời gian trung bình để đạt level 60: 4–6 tháng
- Đạt Onyx tier (61): 6–8 tháng; Master (109): 12–18 tháng; Max 120: 18–24 tháng
- Không quá 15% người chơi bỏ cuộc ở bất kỳ tier nào
- Phân bố lý tưởng: 40% Wood–Bronze, 30% Silver–Gold, 20% Platinum–Onyx, 10% Sapphire+

**🔗 Liên Kết & Dependencies**:

- [Economy System](05-economy-system.md) - Tier multipliers và currency scaling
- [Quiz Racing System](06-quiz-racing-system.md) - Nguồn XP duy nhất và reward calculation
- [Collection System](03-collection-system.md) - Avatar unlocks và egg rewards
- [Customization System](02-customization-system.md) - Avatar frames và progressive unlocks
- [Cross-System Interactions](interactions/cross-system-interactions.md) - Tương tác tổng thể giữa các hệ thống

**📁 Asset References**:

- `avatar-animal-pack/` — 30 avatars (một phần theo cấp, phần còn lại trứng/Cửa hàng)
- `eggs-icon-pack/` — các loại trứng cho mini game (tỉ lệ như nhau cho mọi người chơi)
- `avatar-frame-pack/` — frames đặc biệt (trứng hoặc Cửa hàng)
- `vector-ranks-pack/` — badge theo tier và rank icons
