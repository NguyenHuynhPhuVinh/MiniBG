# 🎨 CƠ CHẾ 2: TÙY CHỈNH & THỂ HIỆN

> **Cơ chế này cho phép người chơi thể hiện thành tích và cá tính của mình thông qua các vật phẩm trang trí.**

**Cập nhật:** 08/08/2025  
**Phiên bản:** 2.1 - Đồng bộ với GAME_SYSTEM_SYNLEARNIA.md (trứng mở tức thì, công bằng, 1 loại tiền tệ)

## 🎯 Mục Tiêu

- Cho phép người chơi thể hiện cá tính và thành tích qua avatar và khung viền
- Tạo động lực sưu tầm và khoe khoang thông qua hệ thống tier progression
- Xây dựng identity và status symbol với 10 tiers từ Wood đến Master
- Tăng attachment với game thông qua personalization có ý nghĩa
- Liên kết trực tiếp với progression system và mini game rewards

## 🐾 Hệ Thống Avatar (30 Animals từ avatar-animal-pack)

### Avatar Progression Integration

**QUAN TRỌNG:** Avatar là vật phẩm thể hiện chính. Frames KHÔNG unlock theo cấp độ.

- Khi tạo tài khoản, người chơi chọn một avatar cơ bản từ bộ sưu tập.
- Một PHẦN avatar sẽ mở khóa theo cấp độ (progression cốt lõi).
- Avatar hiếm/độc quyền có thể nhận từ Trứng Thưởng hoặc mua trong Cửa hàng bằng SynCoin.

> Xem [01-progression-system.md](01-progression-system.md) để biết lộ trình mở khóa theo cấp độ (được cấu hình trong `level-config.json`).

**Avatar system overview:**

- 30 avatars từ `avatar-animal-pack` (bear, buffalo, chick, chicken, cow, crocodile, dog, duck, elephant, frog, giraffe, goat, gorilla, hippo, horse, monkey, moose, narwhal, owl, panda, parrot, penguin, pig, rabbit, rhino, sloth, snake, walrus, whale, zebra)
- Level-based unlocks (một phần): mở tại các mốc level được cấu hình
- Mini game rewards: có thể nhận avatar từ trứng (bỏ qua yêu cầu cấp)
- Shop: một số avatar hiếm có thể mua bằng SynCoin
- Frame exclusion: Frames KHÔNG unlock qua level

### Avatar Acquisition Methods

#### 1. Level Progression (Primary)

**Guaranteed unlock theo achievement:**

- Một phần avatars unlock tại các mốc level định trước
- Theo dõi tiến độ rõ ràng, không RNG cho nhóm này

#### 2. Mini Game Eggs (Secondary)

**Lucky drops từ Quiz Racing:**

- Trứng CHỈ thu thập từ mini game khi đạt 4 câu đúng trong Quiz Racing
- **Instant opening:** Trứng mở ngay khi kết thúc Quiz Racing (không lưu trữ “trứng” trong inventory)
- **Công bằng:** Tỉ lệ phần thưởng như nhau cho mọi người chơi, không phụ thuộc cấp độ hay tier
- **Duplicate protection:** Nếu nhận avatar đã có → tự động đổi thành SynCoin
- Bỏ qua yêu cầu cấp độ nếu avatar rơi từ trứng

#### 3. Shop Purchases (Optional)

- Một số avatar hiếm có thể mua bằng SynCoin trong Cửa hàng
- Không có yêu cầu cấp độ khi mua; không bán trứng

## 🖼️ Hệ Thống Avatar Frames (Premium Frames)

### Premium Frame Collection (từ avatar-frame-pack)

- Khung avatar đặc biệt, dùng để thể hiện cá tính và thành tích
- Ví dụ assets: `crimson-phoenix-frame.png`, `cyber-glitch-frame.png`, `drumalong-festival-frame.png`, `nation-of-pyro-frame.png`, `ocean-song-frame.png`, `violet-starlight-frame.png`

#### Frame Acquisition (KHÔNG LIÊN QUAN CẤP ĐỘ)

**QUAN TRỌNG:** Frames độc lập với cấp độ. Bất kỳ ai cũng có thể sở hữu bất kỳ frame nào.

- Shop: mua bằng SynCoin (không có yêu cầu cấp độ, không bán trứng)
- Mini game: rơi từ trứng khi mở (tức thì sau mỗi trận Quiz Racing)
- Fair access: mọi người đều có cơ hội như nhau

#### Frame Rarity & Prestige Value

- Giá và độ hiếm được cấu hình bởi Economy/Shop (không cố định tại tài liệu này)
- Prestige phản ánh độ hiếm (giá và tần suất rơi), KHÔNG dựa trên cấp độ

### Frame Acquisition Methods

#### 1. SynCoin Purchase (Primary Method)

**Guaranteed acquisition cho MỌI PLAYER bất kể cấp độ:**

- Frames bán trong Shop bằng SynCoin (giá do Shop/Economy cấu hình)
- KHÔNG có level requirements
- Không RNG: người chơi biết mình sẽ nhận khung nào

#### 2. Quiz Racing Mini Game Drops (Bonus Chance)

**Lucky rewards từ instant egg opening:**

- Mini game trigger: đạt 4 câu đúng → 10 giây thu thập trứng
- Instant opening: mở trứng ngay khi kết thúc trận; KHÔNG tồn trữ trứng trong inventory
- Fairness: tỉ lệ như nhau cho tất cả người chơi
- Duplicate handling: nếu trùng → tự động quy đổi SynCoin theo độ hiếm

## 😀 Hệ Thống Emoji Social Interaction

### Emoji System Integration

**Emoji collection được quản lý trong [Social System](04-social-system.md) với bộ emoji từ `vector-emojis-pack`.**

> **Chi tiết complete:** Xem [04-social-system.md](04-social-system.md) cho đầy đủ emoji categorization, acquisition methods, và usage contexts.

**Key customization aspects:**

#### Basic Emoji Set (Free)

**Starter emojis cho all players:**

- Core emotional expressions (happy, sad, angry, surprised, etc.)
- Basic communication emojis (thumbs up, heart, thinking, etc.)
- Essential Quiz Racing reactions (fire for streaks, lightning for speed, etc.)

#### Premium Emoji Collection

**Advanced emojis từ 2 nguồn chính:**

- Mini game rewards: emoji độc quyền từ trứng Quiz Racing
- SynCoin purchases: mua trong Shop

Lưu ý: KHÔNG có emoji unlocks từ achievements hay tier progression.
