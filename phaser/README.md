# Hệ Thống Minigame Platformer (Tích hợp React & Phaser)

Chào mừng đến với dự án Minigame Platformer! Đây không chỉ là một trò chơi đơn thuần mà còn là một sản phẩm thể hiện kiến trúc phần mềm hiện đại, có khả năng mở rộng và bảo trì cao, được xây dựng bằng cách kết hợp sức mạnh của **Phaser 3** cho game engine và **React/Next.js** cho giao diện người dùng.

Mục tiêu chính của dự án là xây dựng một nền tảng vững chắc, nơi logic game được tách biệt hoàn toàn khỏi giao diện, cho phép phát triển các tính năng phức tạp một cách có tổ chức.

## ✨ Các Tính Năng và Điểm Nổi Bật

- **🎮 Kiến trúc Module hóa:** Toàn bộ code được phân tách thành các module có trách nhiệm rõ ràng: Core (lõi game), Platformer (gameplay), Scenes (màn chơi), và UI (React components).
- **🌉 Cầu nối React ↔️ Phaser:** Sử dụng `EventBus` để giao tiếp hai chiều, cho phép React hiển thị thông tin (điểm số, thời gian) và gửi dữ liệu (thông tin quiz) vào game một cách mượt mà.
- **🕹️ Hệ thống Điều khiển Nâng cao:** Nhân vật được điều khiển bởi một `StateMachine` và `Command Pattern`, hỗ trợ các kỹ thuật platformer hiện đại như _Coyote Time_ và _Jump Buffering_ để mang lại cảm giác chơi nhạy và chuyên nghiệp.
- **🧠 Mẫu Thiết kế Phần mềm Hiện đại:**
  - **State Pattern:** Quản lý trạng thái của người chơi (Đứng yên, Di chuyển, Nhảy, Rơi).
  - **Command Pattern:** Tách biệt input (bàn phím, AI, replay) khỏi hành động của nhân vật.
  - **Strategy Pattern:** Cho phép thay đổi "luật chơi" của mỗi màn (ví dụ: điểm số, hiệu ứng) mà không cần thay đổi mã nguồn của màn chơi đó.
- **🗺️ Hệ thống Màn chơi Linh hoạt:** Các màn chơi (`ForestScene`, `DesertScene`) kế thừa từ một `BasePlatformerScene` và được "tiêm" một bộ luật chơi (`IPlatformerRules`) riêng, giúp việc tạo màn chơi mới trở nên cực kỳ nhanh chóng.
- **🎯 Quản lý Vòng chơi (Rounds):** `RoundManager` điều phối 4 vòng chơi, chọn màn chơi ngẫu nhiên (dựa trên seed) và quản lý tiến trình của người chơi qua các vòng.
- **🎲 Sinh Ngẫu nhiên Dựa trên Seed:** `SeededRandom` đảm bảo rằng chuỗi màn chơi và các yếu tố ngẫu nhiên khác sẽ giống hệt nhau cho tất cả người chơi nếu họ có cùng một bộ câu hỏi, tạo ra sự công bằng.

## 🏛️ Triết lý Kiến trúc

Hệ thống được xây dựng dựa trên các nguyên tắc thiết kế phần mềm vững chắc để đảm bảo khả năng mở rộng và dễ bảo trì.

### 1. Mẫu State Machine (State Pattern)

- **Mục đích:** Quản lý trạng thái phức tạp của nhân vật. Thay vì dùng một chuỗi `if/else` rối rắm để kiểm tra `isJumping`, `isFalling`, v.v., mỗi trạng thái ( `IdleState`, `MoveState`, `JumpState`, `FallState`) là một lớp riêng biệt, tự chứa logic của mình.
- **Luồng hoạt động:** `Player` sở hữu một `StateMachine`. `StateMachine` chỉ giữ một tham chiếu đến trạng thái hiện tại. Khi một sự kiện xảy ra (ví dụ: nhấn nút di chuyển), nó sẽ chuyển sang một trạng thái mới, đồng thời gọi `exit()` của trạng thái cũ và `enter()` của trạng thái mới.

### 2. Mẫu Mệnh Lệnh (Command Pattern)

- **Mục đích:** Tách biệt hoàn toàn "ý định" của người dùng khỏi "hành động" của nhân vật. `CommandInputManager` dịch các thao tác nhấn phím thành các đối tượng lệnh (`MoveCommand`, `JumpCommand`).
- **Lợi ích:**
  - **AI & Replay:** Dễ dàng tạo ra AI hoặc hệ thống replay bằng cách đưa các `Command` vào `Player` mà không cần giả lập việc nhấn phím.
  - **Tách biệt:** `Player` không cần biết input đến từ đâu (bàn phím, gamepad, AI), nó chỉ cần biết cách xử lý các `Command`.

### 3. Mẫu Chiến Lược (Strategy Pattern)

- **Mục đích:** Cho phép thay đổi linh hoạt hành vi hoặc thuật toán của một đối tượng tại thời điểm chạy. Đây là cốt lõi của hệ thống màn chơi.
- **Ví dụ thực tế:**
  - `ForestScene` sử dụng `StandardRules`: nhặt xu được 10 điểm.
  - `DesertScene` sử dụng `DesertSpecificRules`: nhặt xu được 15 điểm (vì khó hơn) và có các hiệu ứng đặc biệt.
  - Cả hai màn chơi đều kế thừa từ `BasePlatformerScene` nhưng có "luật chơi" khác nhau. LogicCore sẽ gọi các phương thức trên bộ luật được cung cấp, làm cho nó hoàn toàn độc lập với màn chơi cụ thể.

### 4. Composition over Inheritance (Nguyên tắc "Chuyên gia")

- **Mục đích:** Tránh tạo ra các lớp "biết tuốt" (God Classes). Thay vì `BasePlatformerScene` làm mọi thứ, nó ủy quyền các nhiệm vụ chuyên biệt cho các lớp "chuyên gia":
  - `PlatformerWorldBuilder`: Chỉ biết cách xây dựng thế giới từ dữ liệu Tiled.
  - `PlatformerPlayerHandler`: Chỉ biết cách tạo và thiết lập vật lý cho người chơi.
  - `PlatformerLogicCore`: Chỉ biết cách xử lý logic va chạm và ủy quyền cho bộ luật (Rules).

---

## 📁 Cấu trúc Thư mục và Tệp tin

```
└── nguyenhuynhphuvinh-ql_cdtd/
    └── frontend/
        ├── phaser/  (Toàn bộ mã nguồn của game engine Phaser)
        │   ├── README.md
        │   ├── EventBus.ts (Cầu nối giao tiếp React <-> Phaser)
        │   ├── GameEngine.ts (Điểm khởi tạo game Phaser)
        │   ├── index.ts (Export các thành phần chính ra bên ngoài)
        │   ├── classes/ (Nơi chứa tất cả các lớp logic của game)
        │   │   ├── core/ (Các lớp logic lõi, dùng chung cho mọi game)
        │   │   │   ├── MinigameCore.ts (Quản lý điểm số chung)
        │   │   │   ├── RoundManager.ts (Quản lý 4 vòng chơi và màn chơi)
        │   │   │   ├── SceneManager.ts (Tiện ích quản lý thông tin scene)
        │   │   │   └── TimerManager.ts (Quản lý thời gian trong game)
        │   │   └── platformer/ (Các lớp chuyên biệt cho gameplay platformer)
        │   │       ├── AnimationManager.ts (Quản lý hoạt ảnh nhân vật)
        │   │       ├── CameraManager.ts (Quản lý camera, hiệu ứng)
        │   │       ├── CharacterFrames.ts (Định nghĩa các khung hình cho nhân vật)
        │   │       ├── CommandInputManager.ts (Dịch input thành Command)
        │   │       ├── InputManager.ts (Đọc trạng thái bàn phím)
        │   │       ├── Player.ts (Lớp nhân vật chính, chứa StateMachine)
        │   │       ├── commands/ (Mẫu Command: Đóng gói các hành động)
        │   │       │   ├── ICommand.ts (Interface chung cho mọi Command)
        │   │       │   ├── JumpCommand.ts
        │   │       │   ├── MoveCommand.ts
        │   │       │   └── StopMoveCommand.ts
        │   │       └── states/ (Mẫu State: Đóng gói các trạng thái của nhân vật)
        │   │           ├── IState.ts (Interface chung cho mọi State)
        │   │           ├── StateMachine.ts (Cỗ máy quản lý việc chuyển đổi State)
        │   │           ├── IdleState.ts (Trạng thái đứng yên)
        │   │           ├── MoveState.ts (Trạng thái di chuyển)
        │   │           ├── JumpState.ts (Trạng thái nhảy)
        │   │           └── FallState.ts (Trạng thái rơi)
        │   ├── config/ (Tệp cấu hình và các hằng số)
        │   │   ├── constants.ts (Hằng số: kích thước, màu sắc, key)
        │   │   └── gameConfig.ts (Cấu hình chính cho Phaser.Game)
        │   ├── scenes/ (Các màn chơi của game)
        │   │   ├── BaseGameScene.ts (Lớp cơ sở trừu tượng cho mọi màn chơi)
        │   │   ├── PreloadScene.ts (Màn chơi đặc biệt để khởi tạo và tải dữ liệu)
        │   │   └── platformer/ (Các màn chơi thuộc thể loại Platformer)
        │   │       ├── BasePlatformerScene.ts (Lớp cơ sở cho mọi màn platformer)
        │   │       ├── ForestScene.ts (Màn chơi Rừng)
        │   │       ├── DesertScene.ts (Màn chơi Sa mạc)
        │   │       ├── PlatformerLogicCore.ts (Lõi xử lý logic va chạm)
        │   │       ├── PlatformerPlayerHandler.ts (Chuyên gia tạo và quản lý Player)
        │   │       ├── PlatformerWorldBuilder.ts (Chuyên gia xây dựng thế giới từ Tiled)
        │   │       └── rules/ (Mẫu Strategy: Các bộ "luật chơi")
        │   │           ├── IPlatformerRules.ts (Interface cho mọi bộ luật)
        │   │           ├── StandardRules.ts (Bộ luật tiêu chuẩn)
        │   │           └── DesertSpecificRules.ts (Bộ luật riêng cho sa mạc)
        │   ├── types/ (Định nghĩa các kiểu dữ liệu TypeScript)
        │   │   └── QuizTypes.ts
        │   └── utils/ (Các tiện ích dùng chung)
        │       └── SeededRandom.ts (Tạo số ngẫu nhiên dựa trên seed)
        └── src/
            └── components/
                └── features/
                    └── game/ (Các component React làm giao diện cho game)
                        ├── MinigameOverlay.tsx (Hiển thị điểm, thời gian)
                        ├── QuizGameWrapper.tsx (Component chính để render game và các overlay)
                        ├── QuizRoundOverlay.tsx (Hiển thị giao diện làm quiz giữa các vòng)
                        └── SceneLoadingOverlay.tsx (Màn hình chờ khi tải màn chơi mới)
```
