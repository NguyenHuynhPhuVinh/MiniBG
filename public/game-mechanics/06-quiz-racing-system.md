# Quiz Racing & Mini Game

Cập nhật: 08/08/2025
Phiên bản: 2.1 — Đồng bộ GAME_SYSTEM (công bằng, không multiplier theo tier, trứng mở tức thì)

## 📋 System Overview

Đây là **trung tâm tính toán phần thưởng duy nhất** cho toàn bộ Synlearnia platform. Quiz Racing là **nguồn duy nhất** để kiếm XP, SynCoin và Mini Game rewards trong hệ thống. Tất cả logic tính toán phần thưởng được tập trung tại đây thay vì rải rác ở các file khác.

### Reward Sources Summary

- **XP (Experience Points):** 100% từ quiz performance - không có nguồn XP nào khác
- **SynCoin (Single Currency):** Nguồn chính từ quiz (không có multiplier theo tier)
- **Mini Game Access:** Cứ đủ 4 câu đúng (không cần liên tiếp, tính toàn trận) = 1 mini game thu thập trứng
- **Egg Rewards:** Vật phẩm từ trứng (avatar/frame/emoji/XP/SynCoin) khi mở tức thì sau trận

> **Lưu ý:** Game mechanics và luồng hoạt động đã được document chi tiết trong flowchart riêng biệt. File này chỉ tập trung vào **logic tính toán phần thưởng** sau khi quiz kết thúc.

## 🏆 HỆ THỐNG TÍNH TOÁN PHẦN THƯỞNG CHI TIẾT

> **Input Data từ Flowchart:** File này nhận các input data sau từ quiz gameplay:
>
> - **Total Score:** Tổng điểm đã được tính theo flowchart:
>   - **Base Points:** Vòng 1 (Dễ: 100, Trung bình: 150, Khó: 200) | Vòng 2+: 50% điểm vòng 1
>   - **Speed Bonus:** Dễ: +30, Trung bình: +40, Khó: +50 điểm (chỉ vòng 1, trong 5s đầu)
>   - **Streak Bonus:** Câu 4: +15, Câu 5: +25, Câu 6: +35, Câu 7+: +50 điểm (chỉ vòng 1)
>   - **Global Events:** Golden Question (×2), Speed Question (speed bonus ×2), Opportunity Question (100% điểm vòng 2)
> - **Correct Answers:** Số câu trả lời đúng tổng cộng
> - **Final Ranking:** Thứ hạng cuối cùng trong quiz
> - **Max Streak:** Chuỗi thắng dài nhất đạt được (3+ câu liên tiếp)
> - **Mini Game Performance:** Số trứng thu thập được trong mini game (10 giây)
> - **Player Level/Tier:** Current tier for multiplier calculation (120 levels, 10 tiers)

### 💰 SynCoin Calculation (Post-Game Currency Rewards)

#### Base SynCoin Formula (server-config)

SynCoin được tính trên server để đảm bảo công bằng. Công thức và hệ số là cấu hình, không hard-code trong tài liệu. Ví dụ tham khảo:

```
baseCoins = floor(Total_Score / 100)
coins = clamp(baseCoins + Correct_Answers + Ranking_Bonus + Achievement_Bonus, minCoinsPerMatch, maxCoinsPerMatch)
```

Gợi ý: đặt minCoinsPerMatch ~5 và maxCoinsPerMatch ~30 để tránh lạm phát (điều chỉnh theo dữ liệu thực tế).

#### Ranking Bonus (server-config)

Thưởng theo thứ hạng do hệ thống Economy cấu hình. Ví dụ: 1st +6, 2nd +4, 3rd +2, 4th-8th +1.

#### Special Performance Bonuses (server-config)

Các bonus thành tích (perfect quiz, speed, streak, comeback, consistency...) do server quy định, giá trị nhỏ và hợp lý để tránh lạm phát.

#### Tier Multipliers

Không áp dụng multiplier theo tier cho SynCoin để đảm bảo công bằng.

#### Example SynCoin Calculation (tham khảo)

Player: 12 correct answers, 2,450 total score, 2nd place, perfect quiz.

- baseCoins = floor(2450/100) = 24
- coins ≈ clamp(24 + 12 + 4 (rank) + 2 (achv), 5, 30) = 30 (maxed)

### ⭐ XP Calculation (Character Progression)

#### Base XP Formula (server-config)

XP đến 100% từ Quiz Racing. Công thức và hệ số do server cấu hình. Ví dụ:

```
baseXP = 10 (participation) + (Correct_Answers × 5) + (Total_Score ÷ 50) + Ranking_XP_Bonus
```

#### Ranking XP Bonus Structure

**XP thưởng theo thứ hạng:**

- **1st Place:** +100 XP
- **2nd Place:** +75 XP
- **3rd Place:** +50 XP
- **4th-6th Place:** +25 XP
- **7th-8th Place:** +10 XP

#### Special Performance Bonuses (server-config)

Bonus XP theo thành tích (perfect, speed, streak, comeback, consistency...) có giá trị vừa phải; điều chỉnh theo vận hành.

#### Tier Multipliers

Không áp dụng multiplier theo tier cho XP.

#### Example XP Calculation (tham khảo)

Player: 14 correct answers, 3,200 total score, 1st place, max streak 12.

- baseXP ≈ 10 + (14×5) + (3200÷50) + 100 = 10 + 70 + 64 + 100 = 244
- +75 (streak bonus) ⇒ 319 XP

### 🎮 Mini Game Access & Instant Egg Opening System

#### Mini Game Unlock Mechanics

**Công thức mini game access:**

```
Mini Game Access = floor(Correct_Answers_Since_Last_MiniGame ÷ 4)
```

Quy tắc:

- Đủ 4 câu đúng (không cần liên tiếp, tính toàn trận) ⇒ kích hoạt 1 mini game 10 giây
- Sau khi chơi mini game, reset bộ đếm về 0/4
- Người chơi khác tiếp tục quiz bình thường trong khi một số người vào mini game overlay cá nhân

#### Instant Egg Opening System

**Cơ chế mở trứng tức thì (theo GAME_SYSTEM):**

- **Thu thập trong mini game:** 10 giây thu thập trứng rơi từ trên xuống
- **Không lưu trữ:** Trứng không tồn tại trong database hay inventory
- **Mở tức thì khi kết thúc Quiz Racing:** Tất cả trứng thu thập được sẽ mở ngay lập tức
- **Phần thưởng ngẫu nhiên:** Avatar mới, Khung Avatar, XP, Emoji độc quyền

#### Duplicate Item Conversion

Chuyển đổi vật phẩm trùng lặp thành SynCoin theo độ hiếm. Giá trị quy đổi do hệ thống Economy cấu hình. Tham khảo mức ví dụ trong [03-collection-system.md]. XP không thể trùng; luôn cộng thêm.

### 🎨 Collection Rewards từ Mini Game Instant Opening

#### Avatar Unlock System từ Trứng (config)

Pool avatar và tỉ lệ rơi do hệ thống Economy/Collection cấu hình. Avatar hiếm/độc quyền có thể chỉ xuất hiện từ trứng hoặc từ Shop.

#### Frame Drop System từ Trứng (config)

Frames rơi với tỉ lệ thấp ở các trứng hiếm, đồng thời có thể mua trong Shop bằng SynCoin. Danh mục và tỉ lệ do Economy cấu hình.

#### XP & Emoji Rewards (config)

XP bonus và emoji độc quyền có thể xuất hiện từ trứng theo tỉ lệ cấu hình; một phần emoji cũng có thể mua trong Shop.

#### Tier Multipliers

Không áp dụng multiplier theo tier cho phần thưởng mini game; tỉ lệ công bằng cho mọi người chơi.

## 📊 Input Data Requirements

### Required Data từ Flowchart

**Để tính toán rewards chính xác, system cần receive:**

#### Core Performance Data

- **Total Score:** Tổng điểm từ Base Points + Speed Bonus + Streak Bonus + Global Events
- **Correct Answers:** Số câu trả lời đúng tổng cộng
- **Round 1 Correct Answers:** Số câu trả lời đúng ở vòng 1 (để tính mini game access)
- **Final Ranking:** Thứ hạng cuối cùng (1st-8th place)
- **Max Streak:** Chuỗi thắng dài nhất đạt được trong quiz

#### Player Context Data

- Player Level/Tier: để hiển thị badge/huy hiệu (không dùng để nhân thưởng)
- Badge Progress: huy hiệu hiện tại trong tier (1-12 mỗi tier)

### Reward Calculation Process

**Step-by-step execution:**

1. **Validate Input Data:** Ensure all required metrics are present
2. **Calculate Base Rewards:** Apply base formulas for SynCoin, XP, Mini Game Access
3. **Add Ranking Bonuses:** Apply placement-based bonuses
4. **Add Performance Bonuses:** Check achievements và add special bonuses
5. (Bỏ qua) Không áp dụng tier multipliers
6. Process Mini Games: chạy mini game thu thập trứng và mở tức thì
7. Handle Duplicates: chuyển vật phẩm trùng lặp thành SynCoin
8. Return Final Rewards: trả kết quả cho client hiển thị

## 🎯 Implementation Notes

### Critical Dependencies

- Flowchart Scoring System: tính Total Score (base/speed/streak/events) theo GAME_SYSTEM
- Mini Game Integration: mini game 10 giây với instant opening
- Tier System Integration: 10-tier system (120 levels) dùng cho hiển thị huy hiệu (không multiplier)
- Achievement Validation: xác thực bonus thành tích
- Instant Reward System: trứng mở tức thì khi kết thúc Quiz Racing
- Duplicate Handling: auto-convert duplicate thành SynCoin
- Badge Progression: theo dõi huy hiệu (12/bậc)

### Error Handling

- Missing Data: fallback phần thưởng tối thiểu nếu thiếu số liệu
- Invalid Rankings: validate thứ hạng trước khi áp dụng bonus
- Overflow Protection: áp trần phần thưởng để ngăn lạm dụng
- Latency & Fairness: đo thời gian trả lời trên server cho speed bonus; chống gian lận thời gian
