# 🥚 CƠ CHẾ 3: MINI GAME THU THẬP TRỨNG

**Cập nhật:** 08/08/2025  
**Phiên bản:** 3.1 - Đồng bộ GAME_SYSTEM (công bằng, trứng mở tức thì, 1 loại tiền tệ)  
**Trạng thái:** Không phụ thuộc cấp độ; tỉ lệ công bằng cho mọi người chơi

## 🎮 Cơ Chế Mini Game Thu Thập Trứng

### Điều Kiện Kích Hoạt

**Trong Quiz Racing:**

- **Bộ đếm cá nhân:** "🥚 X/4" hiển thị cho mỗi người chơi
- **Kích hoạt:** Trả lời đúng đủ 4 câu hỏi (không cần liên tiếp)
- **Mini game:** 10 giây thu thập trứng rơi từ trên xuống
- **Reset:** Bộ đếm về 0/4 sau mỗi lần hoàn thành mini game

### Gameplay Mini Game

**Cơ chế thu thập:**

- **Thời gian:** 10 giây countdown
- **Tương tác:** Click/tap để thu thập trứng rơi
- **Tốc độ rơi:** Ngẫu nhiên, tạo thử thách
- **Số lượng:** 2-8 trứng có thể thu thập mỗi lần chơi
- **Overlay riêng:** Không làm gián đoạn người chơi khác

### Mở Trứng Tức Thì

**Sau khi kết thúc Quiz Racing:**

- Tự động mở TẤT CẢ trứng thu thập được
- Hiển thị phần thưởng ngay lập tức
- Duplicate items → tự động convert thành SynCoin

## 🎯 Tỉ Lệ Xuất Hiện Trứng (Công Bằng, Không Phụ Thuộc Cấp Độ)

Tất cả người chơi có tỉ lệ rơi trứng như nhau, không phụ thuộc vào cấp độ hay tier. Ví dụ cấu hình (có thể thay đổi trong hệ thống Economy):

```
basic-egg (Common):    85%
royal-egg (Rare):      12%
legendary-egg (Epic):   2.5%
dragon-egg (Legendary): 0.5%
Tổng:                  100%
```

## 📊 Nguyên Tắc Thiết Kế

- Công bằng: tỉ lệ rơi trứng như nhau cho mọi người chơi.
- Đơn giản: mini game chỉ là lớp thưởng phụ, không ảnh hưởng điểm quiz.
- Không bán trứng: trứng chỉ thu thập qua mini game, mở tức thì khi kết thúc trận.

## 🎁 Loại Vật Phẩm Từ Trứng

### Phần Thưởng Cơ Bản

**Tất cả trứng có thể chứa:**

- **Avatar** (theo rarity: Common → Uncommon → Rare → Epic → Legendary)
- **Emoji** (theo rarity: Common → Uncommon → Rare → Epic → Legendary)
- **XP Bonus** (50-1000 tùy loại trứng)
- **SynCoin** (25-500 tùy loại trứng)

### Frame System

- Frames có thể rơi từ trứng với tỉ lệ thấp ở các trứng hiếm hơn (ví dụ: legendary/dragon), hoặc mua trong Cửa hàng bằng SynCoin.
- Không gắn frames với cấp độ người chơi.

### Rarity Progression

```
basic-egg:     Avatar Common, Emoji Basic
cracked-egg:   Avatar Common/Uncommon, Emoji Basic/Rare
royal-egg:     Avatar Uncommon/Rare, Frame Basic, Emoji Rare
legendary-egg: Avatar Rare/Epic, Emoji Epic
dragon-egg:    Avatar Epic/Legendary, Frame Premium, Emoji Legendary (HIGHEST)
```

## 💰 SynCoin Conversion Rates (Ví dụ, có thể cấu hình)

### Duplicate Protection System

**Avatar Conversion (gợi ý):**

```
Common:    5 SynCoin
Uncommon:  10 SynCoin
Rare:      20 SynCoin
Epic:      60 SynCoin
Legendary: 150 SynCoin
```

**Frame Conversion (gợi ý):**

```
Basic:     20 SynCoin
Premium:   80 SynCoin
```

**Emoji Conversion (gợi ý):**

```
Common:    5 SynCoin
Uncommon:  10 SynCoin
Rare:      20 SynCoin
Epic:      60 SynCoin
Legendary: 150 SynCoin
```

Ghi chú:

- Không có multiplier theo tier/cấp độ để đảm bảo công bằng.
- Các giá trị trên chỉ là mặc định ví dụ; có thể điều chỉnh trong hệ thống Economy.

## 🔧 Gợi ý Vận hành

- Theo dõi duplicate rate và coin sink trong Shop để cân bằng quy đổi.
- A/B test tỉ lệ trứng hiếm (legendary/dragon) để tối ưu giữ chân.
- Minh bạch tỉ lệ rơi (không bán trứng) để tránh hiểu lầm loot-box.

---

**📁 Asset References:**

- `eggs-icon-pack/` — các loại trứng: basic-egg, royal-egg, legendary-egg, dragon-egg, (và các biến thể: mythical, rainbow, ice, party, ...)
- `avatar-animal-pack/` — 30 avatars với rarity: Common → Legendary
- `avatar-frame-pack/` — frames đặc biệt (mua Shop/đặt rơi từ trứng)
- `vector-emojis-pack/` — emoji (Basic → Legendary)
- `icons-gems-pack/coin.png` — biểu tượng SynCoin
