# ĐỀ XUẤT CƠ CHẾ "GAMIFICATION" CHO SYNLEARNIA

**Ngày:** 26/07/2025  
**Biên soạn:** Nguyễn Huỳnh Phú Vinh và Gemini 2.5 Pro  
**Phiên bản:** 2.0

## Mục tiêu

- Tăng cường sự tương tác và gắn bó của sinh viên (người chơi) với nền tảng
- Tạo ra cảm giác tiến bộ và thành tựu rõ ràng thông qua học tập
- Cung cấp phần thưởng hấp dẫn, khuyến khích việc tham gia làm bài trắc nghiệm thường xuyên
- Xây dựng một hệ thống tích hợp, nơi các cơ chế game hỗ trợ và bổ sung cho nhau

## Cơ chế 1: Hệ thống Cấp độ & Huy hiệu

Đây là hệ thống cốt lõi, ghi nhận sự tiến bộ của người chơi qua thời gian.

### 1. Điểm kinh nghiệm (XP):

- Người chơi nhận được XP khi hoàn thành các hoạt động học tập, chủ yếu là trả lời đúng các câu hỏi trắc nghiệm
- Các nguồn nhận XP khác bao gồm: hoàn thành một bài quiz, đạt chuỗi trả lời đúng (streak), nhận thưởng từ Trứng

### 2. Cấp độ (Levels):

- Khi tích lũy đủ XP, người chơi sẽ lên cấp. Mỗi cấp độ là một cột mốc ghi nhận nỗ lực
- Hệ thống có tối đa 120 cấp độ, từ cấp 1 đến cấp 120
- Cấp độ là điều kiện tiên quyết để mở khóa các tầng Huy hiệu và một số Avatar nhất định

### 3. Huy hiệu (Badges):

Để tạo ra các mục tiêu lớn và rõ ràng, hệ thống sẽ có các tầng cấp độ. Mỗi cấp độ sẽ mở khóa một Huy hiệu riêng biệt (hiển thị trên hồ sơ), với mỗi tầng có 12 huy hiệu cùng loại nhưng khác nhau về thiết kế.

**Hệ thống huy hiệu theo cấp độ:**

| Dải Cấp độ | Tên Tầng (Tier)          | Huy hiệu được mở khóa                                      |
| ---------- | ------------------------ | ---------------------------------------------------------- |
| 1-12       | Wood (Gỗ)                | Wood Badge 1, Wood Badge 2, ..., Wood Badge 12             |
| 13-24      | Bronze (Đồng)            | Bronze Badge 1, Bronze Badge 2, ..., Bronze Badge 12       |
| 25-36      | Silver (Bạc)             | Silver Badge 1, Silver Badge 2, ..., Silver Badge 12       |
| 37-48      | Gold (Vàng)              | Gold Badge 1, Gold Badge 2, ..., Gold Badge 12             |
| 49-60      | Platinum (Bạch Kim)      | Platinum Badge 1, Platinum Badge 2, ..., Platinum Badge 12 |
| 61-72      | Onyx (Đá Mã Não)         | Onyx Badge 1, Onyx Badge 2, ..., Onyx Badge 12             |
| 73-84      | Sapphire (Lam Ngọc)      | Sapphire Badge 1, Sapphire Badge 2, ..., Sapphire Badge 12 |
| 85-96      | Ruby (Hồng Ngọc)         | Ruby Badge 1, Ruby Badge 2, ..., Ruby Badge 12             |
| 97-108     | Amethyst (Thạch Anh Tím) | Amethyst Badge 1, Amethyst Badge 2, ..., Amethyst Badge 12 |
| 109-120    | Master (Bậc Thầy)        | Master Badge 1, Master Badge 2, ..., Master Badge 12       |

## Cơ chế 2: Tùy chỉnh & Thể hiện

Cơ chế này cho phép người chơi thể hiện thành tích và cá tính của mình thông qua các vật phẩm trang trí.

### Avatar:

- Khi tạo tài khoản, người chơi được chọn một trong vài avatar cơ bản
- Hệ thống có tổng cộng 30 avatar động vật. Các avatar khác sẽ được mở khóa theo 2 cách:
  - **Mở khóa theo cấp độ:** Đạt đến một cấp độ cụ thể sẽ mở khóa avatar tương ứng
  - **Mở khóa từ Trứng Thưởng:** Một số avatar hiếm và độc quyền chỉ có thể nhận được từ việc mở trứng

### Khung Avatar (Avatar Frames):

Đây là các khung viền trang trí cho avatar, là biểu tượng cho phong cách và sự độc đáo của người chơi.

**Cách nhận:**

- **Khung viền đặc biệt:** Các khung viền có thiết kế độc đáo và hiếm có thể nhận được từ 2 nguồn:
  - Mở Trứng Thưởng (độ hiếm Rare, Epic, Legendary)
  - Mua từ Cửa hàng bằng SynCoin

## Cơ chế 3: Trứng Thưởng & Sưu Tầm

Cơ chế này tạo ra yếu tố bất ngờ và khuyến khích người chơi tham gia thường xuyên để "săn" các vật phẩm giá trị.

**Mục tiêu:** Tạo ra một vòng lặp tham gia - nhận thưởng - sưu tầm hấp dẫn, giữ chân người chơi lâu dài.

### Cách nhận Trứng:

- **Mini Game Thu Thập (DUY NHẤT):** Trong Quiz Racing, mỗi khi trả lời đúng đủ 4 câu hỏi (không cần liên tiếp), người chơi sẽ được vào mini game thu thập trứng trong 10 giây, sau đó quay lại tiếp tục quiz và reset bộ đếm

**Lưu ý quan trọng:** Trứng CHUYÊN được thu thập từ mini game trong Quiz Racing. Không có cách nào khác để nhận trứng trong hệ thống.

**Cơ chế mở trứng tức thì:** Tất cả trứng thu thập được từ mini game sẽ được mở ngay lập tức khi kết thúc Quiz Racing. Trứng không tồn tại dưới dạng vật phẩm trong cơ sở dữ liệu hay inventory của người chơi, chúng chỉ là phương tiện tạm thời để nhận phần thưởng.

### Phần thưởng bên trong Trứng:

Khi mở trứng, người chơi có thể nhận được một trong các vật phẩm sau:

- **Avatar Mới:** Bao gồm cả các avatar độc quyền không thể mở khóa bằng cấp độ
- **Khung Avatar Đặc Biệt:** Các khung viền hiếm có, không mở khóa bằng cấp độ
- **Điểm kinh nghiệm (XP):** Một lượng XP ngẫu nhiên giúp lên cấp nhanh hơn
- **Emoji độc quyền:** Các biểu tượng cảm xúc vui nhộn không có sẵn

**Lưu ý:** Tỉ lệ nhận được các vật phẩm từ trứng như nhau cho tất cả người chơi, không phụ thuộc vào cấp độ hay hạng.

## Cơ chế 4: Tương tác Xã hội

Cơ chế này thúc đẩy sự tương tác nhẹ nhàng, vui vẻ giữa những người chơi mà không cần hệ thống chat phức tạp.

### Biểu tượng cảm xúc (Emoji):

- Người chơi có thể sử dụng các biểu tượng Emoji vui nhộn để tương tác với nhau trong sảnh chờ hoặc trong quá trình làm bài quiz (nếu được cho phép)

**Cách nhận:**

- Một bộ Emoji cơ bản sẽ có sẵn cho tất cả mọi người
- Các Emoji hiếm, độc đáo và thú vị hơn sẽ được mở khóa thông qua việc mở Trứng Thưởng

**Tích hợp:** Việc khoe Avatar, Khung Avatar và Huy hiệu trên bảng xếp hạng và sảnh chờ cũng là một phần quan trọng của tương tác xã hội, tạo động lực cho người chơi khác phấn đấu.

## Cơ chế 5: Hệ thống Tiền tệ & Kinh tế (Economy)

Để tạo ra một hệ thống kinh tế trong game cân bằng và dễ hiểu, Synlearnia sẽ sử dụng một loại tiền tệ duy nhất. Mô hình này khuyến khích sự tham gia thường xuyên và mang lại giá trị cho cả sự may mắn (mở trứng) và sự kiên trì (tích lũy).

### 5.1. SynCoin (Tiền tệ duy nhất)

**Mô tả:** SynCoin là đơn vị tiền tệ duy nhất trong Synlearnia, có thể kiếm được thông qua các hoạt động học tập và sử dụng cho mọi giao dịch trong game.

**Icon:** `coin.png`

**Cách Nhận (Nguồn Cung):**

- **Hoàn thành bài quiz:** Nhận một lượng SynCoin dựa trên số câu trả lời đúng và thành tích
- **Phân giải vật phẩm trùng lặp:** Khi mở trứng từ mini game trong Quiz Racing và nhận được vật phẩm đã sở hữu, sẽ tự động được chuyển thành SynCoin tương ứng với độ hiếm

**Công Dụng (Nguồn Cầu):**

- Mua Avatar và Emoji hiếm trong Cửa hàng
- Mua Khung Avatar đặc biệt và các vật phẩm trang trí

**Lưu ý:** SynCoin không thể mua trứng vì trứng chỉ có thể thu thập từ mini game trong Quiz Racing.

### 5.2. Vòng lặp Kinh tế

Mô hình này tạo ra một vòng lặp tích cực, giữ chân người dùng:

1. **HỌC & CHƠI:** Người dùng tham gia làm quiz, cố gắng trả lời đúng để đạt 4 câu đúng
2. **MINI GAME:** Khi đạt 4 câu đúng, chơi mini game thu thập trứng trong 10 giây
3. **NHẬN THƯỞNG:** Nhận XP (để lên cấp), SynCoin (từ hoàn thành quiz), và trứng từ mini game
4. **MỞ TRỨNG TỨC THỜI:** Khi kết thúc Quiz Racing, tất cả trứng thu thập được sẽ tự động mở ngay lập tức:
   - Nếu ra vật phẩm mới → Có thêm động lực thể hiện (khoe) và sưu tầm
   - Nếu ra vật phẩm trùng lặp → Nhận lại SynCoin, không cảm thấy lãng phí
5. **MUA SẮM:**
   - Dùng SynCoin để mua các vật phẩm hiếm trong Cửa hàng (Avatar, Khung Avatar, Emoji)
   - Lưu ý: Không thể mua trứng bằng SynCoin vì trứng chỉ thu thập được từ mini game
6. **QUAY LẠI BƯỚC 1:** Việc có mục tiêu thu thập phần thưởng từ mini game và mua sắm rõ ràng tạo động lực để người dùng tiếp tục học và chơi

### 5.3. Lợi ích của Hệ thống

- **Đơn giản và dễ hiểu:** Chỉ một loại tiền tệ giúp người chơi dễ dàng quản lý và hiểu hệ thống
- **Cân bằng giữa May rủi và Nỗ lực:** Người chơi có thể trông chờ vào may mắn từ mini game thu thập trứng, nhưng cũng có thể tích lũy SynCoin để mua chắc chắn vật phẩm mong muốn
- **Tạo giá trị cho mọi phần thưởng:** Không có phần thưởng nào là "vô dụng", kể cả vật phẩm trùng lặp từ trứng đều chuyển thành SynCoin
- **Tăng khả năng giữ chân người dùng:** Cửa hàng với nhiều vật phẩm khuyến khích người dùng quay trở lại để kiếm SynCoin
- **Linh hoạt trong mua sắm:** Người chơi có thể tự quyết định ưu tiên thu thập từ mini game (may mắn) hay mua vật phẩm cụ thể bằng SynCoin (chắc chắn)

## Cơ chế 6: Cuộc Đua Quiz Tốc Độ (Quiz Racing)

**Ý tưởng chủ đạo:** Biến mỗi bài quiz thành một "Đấu Trường Tri Thức Synlearnia" – một cuộc đua gay cấn nơi người chơi cạnh tranh bằng kiến thức và tốc độ. Cuộc đua tập trung hoàn toàn vào việc trả lời câu hỏi chính xác và nhanh chóng, tạo ra trải nghiệm cạnh tranh công bằng và hấp dẫn.

### 6.1. Hệ thống Điểm Năng Động (Nền tảng Cuộc Đua)

Hệ thống điểm là cốt lõi, thưởng cho cả tốc độ, sự chính xác và nỗ lực sửa sai. Mỗi câu hỏi sẽ có độ khó riêng biệt và điểm số tương ứng.

**Điểm Cơ Bản theo Độ khó câu hỏi:**

- **Câu hỏi Dễ:** 100 điểm
- **Câu hỏi Trung bình:** 150 điểm
- **Câu hỏi Khó:** 200 điểm

**Điểm Thưởng Tốc Độ (Speed Bonus):**

- Trả lời đúng trong 5 giây đầu nhận thêm điểm thưởng theo độ khó của từng câu:
  - **Dễ:** +30 điểm (tối đa)
  - **Trung bình:** +40 điểm (tối đa)
  - **Khó:** +50 điểm (tối đa)
- Công thức: Điểm thưởng = Điểm thưởng tối đa \* (Thời gian thưởng còn lại / Tổng thời gian thưởng)

**Điểm Thưởng Chuỗi Thắng (Streak Bonus):**

- Khi trả lời đúng 3 câu liên tiếp trở lên, người chơi nhận điểm thưởng cộng dồn cố định cho mỗi câu đúng tiếp theo:
  - **Câu thứ 4:** +15 điểm
  - **Câu thứ 5:** +25 điểm
  - **Câu thứ 6:** +35 điểm
  - **Câu thứ 7+:** +50 điểm (tối đa)
- Streak bonus áp dụng cho mọi câu hỏi bất kể độ khó
- Hiển thị biểu tượng "ngọn lửa" 🔥 bên cạnh tên người chơi

**Điểm Vượt Lên (Vòng 2 & 3):**

- Trả lời đúng một câu hỏi đã làm sai hoặc bỏ qua ở các vòng sau sẽ nhận 50% điểm cơ bản theo độ khó của câu đó:
  - **Dễ:** 50 điểm
  - **Trung bình:** 75 điểm
  - **Khó:** 100 điểm
- Không có điểm thưởng tốc độ hoặc chuỗi thắng cho các vòng này để giữ giá trị cho việc trả lời đúng ngay từ đầu

### 6.2. Cơ Chế Mini Game Thu Thập Trứng

Quiz Racing không chỉ tập trung vào thi đấu kiến thức mà còn tích hợp mini game thu thập trứng tạo thêm sự thú vị.

**Cơ chế kích hoạt:**

- Mỗi người chơi có bộ đếm riêng: "Câu đúng: X/4"
- Khi trả lời đúng đủ 4 câu hỏi (không cần liên tiếp), người chơi sẽ được kích hoạt mini game
- Bộ đếm sẽ reset về 0/4 sau mỗi lần hoàn thành mini game

**Mini Game Thu Thập Trứng:**

- **Thời gian:** 10 giây
- **Gameplay:** Màn hình xuất hiện nhiều quả trứng rơi từ trên xuống, người chơi click/tap để thu thập
- **Phần thưởng:** Số lượng trứng thu được phụ thuộc vào kỹ năng và may mắn của người chơi
- **Loại trứng:** Chủ yếu là Basic Egg, với tỉ lệ nhỏ xuất hiện các loại trứng hiếm hơn
- **Công bằng:** Tỉ lệ ra các loại trứng như nhau cho tất cả người chơi, không phụ thuộc vào cấp độ hay hạng

**Tích hợp với Quiz Racing:**

- Mỗi người chơi vào mini game độc lập khi đạt điều kiện (4 câu đúng) của riêng mình
- Người chơi khác tiếp tục làm quiz bình thường trong khi một số người đang chơi mini game riêng biệt
- Sau 10 giây, người chơi hoàn thành mini game sẽ quay lại quiz và tiếp tục cuộc đua
- Điểm số quiz không bị ảnh hưởng bởi mini game

### 6.3. Sự Kiện Cố Định (Đánh Dấu Tự Động)

Để cuộc đua thêm kịch tính, hệ thống sẽ tự động random và đánh dấu một số câu hỏi đặc biệt cho tất cả người chơi (mọi người sẽ thấy những câu được đánh dấu giống hệt nhau):

- **Câu Hỏi Vàng (Golden Question):** Hệ thống random chọn một câu hỏi cố định và đánh dấu là "Câu Hỏi Vàng" cho tất cả người chơi (hiển thị với viền vàng và icon đặc biệt). Mọi người đều thấy cùng một câu được đánh dấu và trả lời đúng sẽ nhận gấp đôi điểm cơ bản theo độ khó:
  - **Dễ:** 200 điểm (thay vì 100)
  - **Trung bình:** 300 điểm (thay vì 150)
  - **Khó:** 400 điểm (thay vì 200)
- **Câu Hỏi Tốc Độ (Speed Question):** Hệ thống random chọn một câu hỏi khác và đánh dấu là "Câu Hỏi Tốc Độ" cho tất cả người chơi (hiển thị với hiệu ứng chớp nháy). Tất cả người chơi đều thấy cùng câu này và có điểm thưởng tốc độ được nhân đôi
- **Câu Hỏi Cơ Hội (Opportunity Question):** Hệ thống chọn một câu hỏi ở Vòng 2 và đánh dấu đặc biệt cho tất cả người chơi, nếu trả lời đúng sẽ nhận 100% điểm cơ bản theo độ khó (thay vì 50% thông thường)

**Ví dụ:** Nếu hệ thống random chọn câu số 7 là "Câu Hỏi Vàng", thì TẤT CẢ người chơi trong trận đấu đó sẽ thấy câu số 7 có viền vàng và biết rằng câu này cho điểm gấp đôi.

### 6.4. Giao Diện & Trải Nghiệm Người Dùng (UI/UX)

**Sảnh chờ:**

- Hiển thị người chơi trên "vạch xuất phát"
- Hiển thị thông tin cấp độ và huy hiệu của từng người chơi

**Trong Cuộc Đua:**

- Đường Đua Tiến Trình ở đầu màn hình và Bảng Xếp Hạng ở bên cạnh, cập nhật liên tục
- **Bộ đếm trứng:** Hiển thị "🥚 X/4" cho mỗi người chơi để theo dõi tiến độ mini game
- Hiệu ứng âm thanh và hình ảnh rõ ràng khi trả lời đúng/sai
- **Thông báo mini game:** "Chuẩn bị thu thập trứng!" khi đạt 4 câu đúng

**Mini Game Thu Thập Trứng:**

- **Overlay cá nhân:** Màn hình mini game chỉ xuất hiện cho người chơi đạt điều kiện, không làm gián đoạn người chơi khác
- **Timer:** Đếm ngược 10 giây rõ ràng chỉ cho người đang chơi mini game
- **Hiệu ứng:** Trứng rơi từ trên xuống với tốc độ khác nhau trong màn hình riêng
- **Feedback:** Hiệu ứng thu thập khi click trúng trứng
- **Kết quả:** Hiển thị số trứng thu được trước khi người chơi quay lại quiz

**Màn hình kết quả:**

- Hiển thị "Bục Vinh Quang" cho top 3
- Hiển thị thứ hạng và tổng điểm số cuối cùng
- **Thống kê mini game:** Tổng số trứng thu thập được trong trận đấu
- **Mở trứng tức thời:** Tự động mở tất cả trứng thu thập được từ mini game và hiển thị phần thưởng ngay lập tức
- Thông báo phần thưởng tổng thể nhận được (XP, SynCoin, vật phẩm từ trứng)

### 6.5. Lợi ích của Cơ chế

1. **Tăng Cạnh tranh & Hứng khởi:** Biến việc làm quiz thụ động thành một cuộc đua chủ động và gay cấn
2. **Tạo Yếu tố Đặc biệt:** Các câu hỏi được đánh dấu đặc biệt tạo thêm kịch tính và mục tiêu rõ ràng cho mỗi cuộc đua
3. **Tập trung vào Kiến thức:** Người chơi cần tập trung hoàn toàn vào việc trả lời câu hỏi chính xác và nhanh chóng
4. **Công bằng cho mọi người:** Không có yếu tố lợi thế bất công, mọi người đều có cơ hội thắng như nhau
5. **Đơn giản và dễ hiểu:** Luật chơi rõ ràng, không phức tạp
6. **Mini Game Thu Thập:** Tạo thêm động lực trả lời đúng để được chơi mini game và thu thập trứng
7. **Mini Game Tích Hợp:** Cơ chế thu thập trứng khuyến khích trả lời đúng (4 câu đúng = 1 lần chơi mini game)
8. **Phần thưởng Tức thời:** Trứng thu thập được sẽ mở ngay lập tức khi kết thúc trận đấu, mang lại cảm giác thỏa mãn tức thì
9. **Công bằng:** Mọi người đều có cơ hội thắng như nhau và thu thập trứng dựa trên nỗ lực học tập
10. **Đa nhiệm:** Người chơi vừa thi đấu kiến thức vừa có cơ hội thu thập phần thưởng thông qua mini game

## Cấu trúc Assets & Thư mục

Dựa trên các cơ chế gamification đã mô tả, hệ thống sử dụng các assets sau:

```
public/
├── avatar-animal-pack/           # 30 avatar động vật cho người chơi
│   ├── bear.png, buffalo.png, chick.png, chicken.png
│   ├── cow.png, crocodile.png, dog.png, duck.png
│   ├── elephant.png, frog.png, giraffe.png, goat.png
│   ├── gorilla.png, hippo.png, horse.png, monkey.png
│   ├── moose.png, narwhal.png, owl.png, panda.png
│   ├── parrot.png, penguin.png, pig.png, rabbit.png
│   ├── rhino.png, sloth.png, snake.png, walrus.png
│   ├── whale.png, zebra.png
│   └── ...
├── avatar-frame-pack/            # Khung avatar đặc biệt
│   ├── crimson-phoenix-frame.png
│   ├── cyber-glitch-frame.png
│   ├── drumalong-festival-frame.png
│   ├── nation-of-pyro-frame.png
│   ├── ocean-song-frame.png
│   └── violet-starlight-frame.png
├── eggs-icon-pack/               # Các loại trứng thưởng
│   ├── basic-egg/                # Trứng cơ bản
│   ├── legendary-egg/            # Trứng huyền thoại
│   ├── mythical-egg/             # Trứng thần thoại
│   ├── rainbow-egg/              # Trứng cầu vồng
│   ├── royal-egg/                # Trứng hoàng gia
│   ├── dragon-egg/               # Trứng rồng
│   ├── ice-egg/                  # Trứng băng
│   ├── party-egg/                # Trứng tiệc tùng
│   └── ...
├── icons-gems-pack/              # Tài nguyên game
│   └── coin.png                  # Đồng xu (SynCoin)
├── vector-emojis-pack/           # Emoji tương tác xã hội
│   ├── angry-face.png, beaming-face.png
│   ├── confused-face.png, crying-face.png
│   ├── dizzy-face.png, exploding-head.png
│   └── ... (hơn 50 emoji khác nhau)
└── vector-ranks-pack/            # Biểu tượng huy hiệu theo từng cấp độ
    ├── wood/                     # 12 huy hiệu Wood (cấp 1-12)
    │   ├── diamond-wood-1.png, diamond-wood-2.png, ..., diamond-wood-12.png
    ├── bronze/                   # 12 huy hiệu Bronze (cấp 13-24)
    │   ├── diamond-bronze-1.png, diamond-bronze-2.png, ..., diamond-bronze-12.png
    ├── silver/                   # 12 huy hiệu Silver (cấp 25-36)
    │   ├── diamond-silver-1.png, diamond-silver-2.png, ..., diamond-silver-12.png
    ├── gold/                     # 12 huy hiệu Gold (cấp 37-48)
    │   ├── diamond-gold-1.png, diamond-gold-2.png, ..., diamond-gold-12.png
    ├── platinum/                 # 12 huy hiệu Platinum (cấp 49-60)
    │   ├── diamond-platinum-1.png, diamond-platinum-2.png, ..., diamond-platinum-12.png
    ├── onyx/                     # 12 huy hiệu Onyx (cấp 61-72)
    │   ├── diamond-onyx-1.png, diamond-onyx-2.png, ..., diamond-onyx-12.png
    ├── sapphire/                 # 12 huy hiệu Sapphire (cấp 73-84)
    │   ├── diamond-sapphire-1.png, diamond-sapphire-2.png, ..., diamond-sapphire-12.png
    ├── ruby/                     # 12 huy hiệu Ruby (cấp 85-96)
    │   ├── diamond-ruby-1.png, diamond-ruby-2.png, ..., diamond-ruby-12.png
    ├── amethyst/                 # 12 huy hiệu Amethyst (cấp 97-108)
    │   ├── diamond-amethyst-1.png, diamond-amethyst-2.png, ..., diamond-amethyst-12.png
    └── master/                   # 12 huy hiệu Master (cấp 109-120)
        ├── diamond-master-1.png, diamond-master-2.png, ..., diamond-master-12.png
```

## Tích hợp Hệ thống

### Luồng trải nghiệm người chơi:

1. **Đăng ký:** Chọn avatar cơ bản từ bộ sưu tập 30 avatar động vật
2. **Tham gia Quiz Racing:** Trả lời câu hỏi trong cuộc đua tri thức, cố gắng đạt 4 câu đúng để kích hoạt mini game
3. **Mini Game Thu Thập:** Chơi mini game thu thập trứng trong 10 giây khi đạt điều kiện
4. **Học tập & Cạnh tranh:** Nhận XP, SynCoin, tăng điểm với hệ thống speed bonus và streak
5. **Kết thúc & Mở trứng:** Khi kết thúc Quiz Racing, tự động mở tất cả trứng thu thập được và nhận phần thưởng ngay lập tức
6. **Tiến bộ:** Mở khóa avatar mới và huy hiệu theo cấp độ
7. **Kinh tế:** Tích lũy SynCoin từ vật phẩm trùng lặp để mua vật phẩm hiếm trong Cửa hàng
8. **Thể hiện:** Khoe thành tích qua avatar, khung và huy hiệu
9. **Tương tác:** Sử dụng emoji để tương tác với người chơi khác

### Động lực duy trì:

- **Ngắn hạn:** XP, SynCoin, lên cấp, thắng cuộc đua quiz
- **Trung hạn:** Đạt tầng huy hiệu mới, nhận khung avatar đặc biệt, tích lũy SynCoin
- **Dài hạn:** Đạt Master tier, trở thành cao thủ Quiz Racing, mua vật phẩm độc quyền từ Cửa hàng

### Hệ thống Cửa hàng:

- **Cửa hàng SynCoin:** Luôn mở, bán các vật phẩm bao gồm:
  - Avatar và Emoji hiếm
  - Khung Avatar đặc biệt
  - **Lưu ý:** Không bán trứng vì trứng chỉ thu thập được từ mini game
  - **Công bằng:** Tất cả vật phẩm trong cửa hàng có giá như nhau cho mọi người chơi, không phụ thuộc vào cấp độ hay hạng
- **Cơ chế phân giải:** Vật phẩm trùng lặp từ trứng mini game tự động chuyển thành SynCoin theo độ hiếm

### Quiz Racing Gameplay:

- **Tập trung vào Kiến thức:** Người chơi cạnh tranh dựa hoàn toàn trên khả năng trả lời câu hỏi
- **Tốc độ & Chính xác:** Thắng bằng cách trả lời nhanh và đúng
- **Sự kiện Cố định:** Các câu hỏi đặc biệt được đánh dấu tự động tạo thêm kịch tính cho cuộc đua
- **Mini Game Tích Hợp:** Cơ chế thu thập trứng khuyến khích trả lời đúng (4 câu đúng = 1 lần chơi mini game)
- **Công bằng:** Mọi người đều có cơ hội thắng như nhau và thu thập trứng dựa trên nỗ lực học tập
- **Đa nhiệm:** Người chơi vừa thi đấu kiến thức vừa có cơ hội thu thập phần thưởng thông qua mini game

---

## Thông tin phiên bản

**Tài liệu này được tạo từ:** Đề xuất cơ chế Gamification, Hệ thống Kinh tế và Quiz Racing cho Synlearnia  
**Cập nhật lần cuối:** 07/08/2025  
**Trạng thái:** Đã hoàn thiện nội dung chi tiết từ đề xuất gốc, bao gồm hệ thống tiền tệ, kinh tế, cuộc đua quiz tập trung vào kiến thức và cơ chế mở trứng tức thì
