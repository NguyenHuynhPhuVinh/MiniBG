# **Hệ Thống Minigame Platformer (React, Phaser & Colyseus)**

Chào mừng đến với dự án Minigame Platformer! Đây là một nền tảng minigame multiplayer được xây dựng với kiến trúc phần mềm hiện đại, có khả năng mở rộng và bảo trì cao. Dự án kết hợp sức mạnh của:

- **Phaser 3:** Cho game engine vật lý và render phía client.
- **React/Next.js:** Cho giao diện người dùng (UI), overlays, và quản lý trạng thái.
- **Colyseus:** Cho máy chủ game multiplayer real-time, xử lý logic và đồng bộ hóa trạng thái.
- **TypeScript:** Để đảm bảo sự chặt chẽ và an toàn cho toàn bộ mã nguồn.

Mục tiêu chính là xây dựng một nền tảng vững chắc, nơi logic game được tách biệt khỏi giao diện, logic server được cô lập, cho phép phát triển các tính năng phức tạp một cách có tổ chức và hiệu quả.

## ✨ Các Tính Năng và Điểm Nổi Bật

- **🎮 Kiến trúc Module hóa:** Toàn bộ code được phân tách thành các module chuyên biệt: `core` (lõi game dùng chung), `platformer` (gameplay), `scenes` (màn chơi), `React components` (UI), và `game-server` (logic backend).
- **🤝 Multiplayer Real-time:** Tích hợp với **Colyseus** để đồng bộ hóa trạng thái người chơi, kẻ thù, và các vật thể tương tác (bom, bẫy, nền tảng biến mất), mang lại trải nghiệm multiplayer mượt mà.
- **🌉 Cầu nối React ↔️ Phaser:** Sử dụng `EventBus` để giao tiếp hai chiều, cho phép React hiển thị thông tin game (điểm, thời gian) và gửi dữ liệu (thông tin quiz) vào game một cách liền mạch.
- **🕹️ Cơ chế Tương tác Người chơi Nâng cao:** Người chơi có thể tương tác với nhau thông qua các hành động như **nắm, bế, và ném**, được xử lý hoàn toàn trên server để đảm bảo tính công bằng.
- **🧠 Mẫu Thiết kế Phần mềm Hiện đại:**
  - **Strategy Pattern:** Cho phép thay đổi "luật chơi" của mỗi màn (ví dụ: điểm số, hiệu ứng môi trường) mà không cần sửa mã nguồn màn chơi, thông qua các lớp `IPlatformerRules`.
  - **Composition over Inheritance (Nguyên tắc "Chuyên gia"):** `BasePlatformerScene` ủy quyền các tác vụ cho các lớp chuyên gia như `PlatformerWorldBuilder` (xây dựng thế giới), `PlatformerPlayerHandler` (quản lý người chơi), và `PlatformerNetworkHandler` (xử lý mạng).
  - **Behavior-Driven Tiles (Strategy/Factory):** Hệ thống `ITileBehavior` cho phép gán các hành vi phức tạp (cát lún, tuyết trơn, nước, lò xo) cho các tile trực tiếp trong Tiled editor.
  - **Status & Environmental Effects:** Hệ thống hiệu ứng trạng thái (`IStatusEffect`) và môi trường (`IEnvironmentalEffect`) cho phép thêm các logic như làm chậm, đẩy lùi, hoặc gió thổi một cách linh hoạt.
- **🤖 AI Điều khiển bởi Server (Server-Authoritative AI):** Kẻ thù được quản lý trên server, sử dụng **Behavior Trees** để tạo ra các hành vi phức tạp (tuần tra, ngủ, bỏ chạy khi gặp người chơi), đảm bảo logic AI nhất quán cho mọi người chơi.
- **🗺️ Hệ thống Màn chơi Linh hoạt:** Các màn chơi (`OriginValleyScene`, `TempestPeakScene`, `WhisperingCavernsScene`) kế thừa từ `BasePlatformerScene` và được "tiêm" một bộ luật (`IPlatformerRules`) riêng, giúp việc tạo màn chơi mới trở nên cực kỳ nhanh chóng.
- **💡 Hệ thống Ánh sáng Động:** Màn chơi `WhisperingCavernsScene` sử dụng hệ thống `Light2D` của Phaser để tạo ra môi trường tối với các nguồn sáng động từ đuốc và người chơi.
- **📱 Hỗ trợ Di động:** Tự động hiển thị các nút điều khiển ảo trên màn hình cảm ứng, với layout đáp ứng (responsive) cho cả màn hình ngang và dọc.

## 🏛️ Triết lý Kiến trúc

Hệ thống được xây dựng dựa trên các nguyên tắc thiết kế vững chắc để đảm bảo khả năng mở rộng, bảo trì và kiểm thử.

1.  **Client-Server Architecture (Colyseus):**

    - **Server-Authoritative:** Các hành động quan trọng (va chạm, tính điểm, trạng thái kẻ thù, tương tác người chơi) được quyết định bởi server để chống gian lận và đảm bảo đồng bộ.
    - **Client-Side Prediction:** Client (người chơi chính) ngay lập tức mô phỏng hành động của mình để tạo cảm giác nhạy, trong khi chờ xác nhận từ server.
    - **Entity Interpolation:** Chuyển động của những người chơi khác được làm mượt bằng kỹ thuật nội suy, giảm thiểu hiện tượng giật/lag do độ trễ mạng.

2.  **The "Expert" Principle (Composition over Inheritance):**

    - Thay vì tạo ra các lớp "biết tuốt" (God Classes), mỗi lớp có một trách nhiệm duy nhất.
    - `PlatformerWorldBuilder`: Chỉ biết cách xây dựng thế giới từ dữ liệu Tiled.
    - `PlatformerPlayerHandler`: Chỉ biết cách tạo và thiết lập vật lý cho người chơi.
    - `PlatformerNetworkHandler`: Chỉ biết cách đồng bộ trạng thái giữa client và server.
    - `PlatformerLogicCore`: Chỉ biết cách phát hiện va chạm và ủy quyền cho bộ luật (`Rules`).

3.  **Behavior-Driven Tiles (Strategy Pattern & Factory Pattern):**

    - Đây là một trong những hệ thống mạnh mẽ nhất của dự án.
    - Trong Tiled, mỗi tile có thể được gán một thuộc tính `behavior` (ví dụ: "snow", "water", "sinkingSand").
    - `TileBehaviorFactory` sẽ tạo ra một đối tượng hành vi tương ứng.
    - Khi người chơi tương tác với tile, `PlatformerPlayerHandler` sẽ gọi phương thức trên đối tượng hành vi đó, cho phép các tile có logic phức tạp mà không cần mã hóa cứng trong scene.

4.  **Server-Side AI with Behavior Trees:**
    - Logic AI của kẻ thù không chạy trên client mà trên `game-server`.
    - Mỗi loại kẻ thù (ví dụ: `FishEnemy`) có một **Behavior Tree** định nghĩa các hành vi phức tạp:
      - `Selector`: Chọn hành động ưu tiên cao nhất (ví dụ: nếu thấy người chơi thì _bỏ chạy_, nếu không thì _tuần tra_).
      - `Sequence`: Thực hiện một chuỗi các hành động (ví dụ: _đi đến điểm A_, sau đó _dừng lại_, sau đó _quay lại_).
    - Cách tiếp cận này giúp AI thông minh, nhất quán và giảm tải xử lý cho client.

---

## 📁 Cấu trúc Toàn bộ Dự án

```
└── nguyenhuynhphuvinh-ql_cdtd/
    ├── frontend/
    │   ├── phaser/  (Mã nguồn của game engine Phaser)
    │   │   ├── README.md (Tài liệu này)
    │   │   ├── EventBus.ts (Cầu nối giao tiếp React <-> Phaser)
    │   │   ├── GameEngine.ts (Điểm khởi tạo game Phaser)
    │   │   ├── index.ts (Export các thành phần chính)
    │   │   ├── classes/ (Tất cả các lớp logic của game)
    │   │   │   ├── core/ (Các lớp logic lõi, dùng chung cho mọi game)
    │   │   │   │   ├── MinigameCore.ts (Quản lý điểm số, trigger quiz)
    │   │   │   │   ├── NetworkManager.ts (Singleton quản lý kết nối Colyseus)
    │   │   │   │   ├── RoundManager.ts (Quản lý 4 vòng chơi và màn chơi)
    │   │   │   │   ├── SceneManager.ts (Tiện ích quản lý thông tin scene)
    │   │   │   │   ├── TimerManager.ts (Quản lý thời gian trong game)
    │   │   │   │   └── types/
    │   │   │   │       └── GameRoomState.ts (Bản sao Schema từ server cho client)
    │   │   │   ├── interactive/ (Lớp cho các vật thể động, tương tác)
    │   │   │   │   ├── BombView.ts (Logic hiển thị và vật lý cho quả bom)
    │   │   │   │   ├── IInteractiveObjectView.ts (Interface cho các vật thể)
    │   │   │   │   └── InteractiveObjectManager.ts (Quản lý spawn/despawn vật thể)
    │   │   │   └── platformer/ (Các lớp chuyên biệt cho gameplay platformer)
    │   │   │       ├── AnimationManager.ts (Quản lý hoạt ảnh nhân vật)
    │   │   │       ├── CameraManager.ts (Quản lý camera, hiệu ứng)
    │   │   │       ├── InputManager.ts (Đọc trạng thái bàn phím và mobile)
    │   │   │       ├── MobileUIHandler.ts (Tạo và quản lý nút ảo trên di động)
    │   │   │       ├── PlatformerNetworkHandler.ts (CHUYÊN GIA: Đồng bộ multiplayer)
    │   │   │       ├── Player.ts (Lớp nhân vật chính, xử lý input và vật lý)
    │   │   │       ├── SwingingSawTrap.ts (Logic cho bẫy cưa máy phức tạp)
    │   │   │       ├── behaviors/ (STRATEGY PATTERN: Các hành vi của tile)
    │   │   │       │   ├── ITileBehavior.ts (Interface chung)
    │   │   │       │   ├── TileBehaviorFactory.ts (Nhà máy tạo behavior)
    │   │   │       │   ├── DisappearingBehavior.ts (Nền tảng biến mất)
    │   │   │       │   ├── SinkingSandBehavior.ts (Cát lún)
    │   │   │       │   ├── SnowBehavior.ts (Tuyết trơn trượt)
    │   │   │       │   ├── SpringBehavior.ts (Lò xo)
    │   │   │       │   └── WaterBehavior.ts (Nước)
    │   │   │       ├── effects/ (Hệ thống hiệu ứng trạng thái & môi trường)
    │   │   │       │   ├── IStatusEffect.ts (Hiệu ứng trên người chơi: choáng, chậm)
    │   │   │       │   ├── IEnvironmentalEffect.ts (Hiệu ứng toàn màn chơi: gió)
    │   │   │       │   ├── KnockbackEffect.ts (Hiệu ứng bị đẩy lùi)
    │   │   │       │   ├── SwimmingEffect.ts (Hiệu ứng bơi)
    │   │   │       │   └── WindEffect.ts (Hiệu ứng gió)
    │   │   │       └── enemies/ (Logic hiển thị cho kẻ thù điều khiển bởi server)
    │   │   │           └── RemoteEnemy.ts (Lớp hiển thị và nội suy chuyển động kẻ thù)
    │   │   ├── config/ (Tệp cấu hình và hằng số)
    │   │   ├── scenes/ (Các màn chơi)
    │   │   │   ├── BaseGameScene.ts (Lớp cơ sở trừu tượng cho mọi màn chơi)
    │   │   │   ├── PreloadScene.ts (Màn chơi đặc biệt để khởi tạo game)
    │   │   │   └── platformer/ (Các màn chơi thuộc thể loại Platformer)
    │   │   │       ├── BasePlatformerScene.ts (Lớp cơ sở cho màn platformer, chứa các "chuyên gia")
    │   │   │       ├── OriginValleyScene.ts (Màn chơi Thung lũng)
    │   │   │       ├── TempestPeakScene.ts (Màn chơi Đỉnh núi gió)
    │   │   │       ├── WhisperingCavernsScene.ts (Màn chơi Hang động tối)
    │   │   │       ├── PlatformerLogicCore.ts (CHUYÊN GIA: Xử lý logic va chạm, ủy quyền cho Rules)
    │   │   │       ├── PlatformerPlayerHandler.ts (CHUYÊN GIA: Tạo và quản lý Player)
    │   │   │       ├── PlatformerWorldBuilder.ts (CHUYÊN GIA: Xây dựng thế giới từ Tiled)
    │   │   │       └── rules/ (STRATEGY PATTERN: Các bộ "luật chơi")
    │   │   │           ├── IPlatformerRules.ts (Interface cho mọi bộ luật)
    │   │   │           ├── StandardRules.ts (Bộ luật tiêu chuẩn)
    │   │   │           └── DesertSpecificRules.ts (Bộ luật riêng cho sa mạc/núi gió)
    │   │   └── utils/ (Các tiện ích dùng chung)
    │   │       ├── EntityInterpolator.ts (Làm mượt chuyển động của remote players)
    │   │       └── SeededRandom.ts (Tạo số ngẫu nhiên dựa trên seed)
    │   └── src/
    │       └── components/
    │           └── features/
    │               └── game/ (Các component React làm giao diện cho game)
    │                   ├── MinigameOverlay.tsx (Hiển thị điểm, thời gian)
    │                   ├── QuizGameWrapper.tsx (Component chính để render game và các overlay)
    │                   ├── QuizRoundOverlay.tsx (Hiển thị giao diện làm quiz giữa các vòng)
    │                   ├── SceneLoadingOverlay.tsx (Màn hình chờ khi tải màn chơi mới)
    │                   └── TestGameWrapper.tsx (Wrapper để chạy thử một scene riêng lẻ)
    └── game-server/ (Mã nguồn máy chủ game Colyseus)
        ├── package.json
        └── src/
            ├── index.ts (Điểm khởi tạo server)
            ├── entities/ (Các lớp thực thể logic trên server)
            │   ├── BaseEnemy.ts (Lớp cơ sở cho mọi kẻ thù, chứa Behavior Tree)
            │   ├── FishEnemy.ts (Logic AI cụ thể cho kẻ thù loại cá)
            │   └── ai/
            │       └── fish/
            │           └── nodes/ (Các "viên gạch" hành vi cho Behavior Tree)
            │               ├── Flee.ts (Hành vi: Bỏ chạy)
            │               ├── IdleAndDecide.ts (Hành vi: Đứng yên và ra quyết định)
            │               ├── IsPlayerNearby.ts (Điều kiện: Kiểm tra người chơi)
            │               ├── Patrol.ts (Hành vi: Tuần tra)
            │               └── Sleep.ts (Hành vi: Ngủ)
            ├── logic/ (Logic chính của các chế độ chơi)
            │   ├── IGameLogic.ts (Interface cho các chế độ chơi)
            │   └── PlatformerLogic.ts (Logic cho chế độ Platformer: xử lý grab, throw, bom...)
            ├── managers/ (Các lớp quản lý cấp cao trên server)
            │   ├── InteractiveObjectManager.ts (Quản lý bom, vật phẩm trên server)
            │   └── ServerEnemyManager.ts (Quản lý vòng đời và AI của kẻ thù)
            ├── objects/ (Các vật thể tương tác trên server)
            │   ├── BombObject.ts (Logic của quả bom: nổ, gây sát thương)
            │   └── IInteractiveObject.ts (Interface cho các vật thể)
            └── rooms/ (Logic phòng game Colyseus)
                ├── GameRoom.ts (Phòng game chính, xử lý kết nối người chơi)
                └── schema/
                    └── GameRoomState.ts (Định nghĩa trạng thái đồng bộ hóa với client)
```

## 🚀 Lộ trình Kiến trúc Tương lai

Dựa trên nền tảng vững chắc hiện tại, dự án có một lộ trình rõ ràng để phát triển các tính năng phức tạp hơn bằng cách áp dụng các mẫu thiết kế phù hợp khi cần thiết.

| Mẫu Thiết Kế    | Khi nào cần (Tính năng Tương lai)                          | Mức độ ưu tiên |
| :-------------- | :--------------------------------------------------------- | :------------- |
| **Object Pool** | Đạn, hiệu ứng hạt, kẻ thù sinh ra liên tục                 | **Cao**        |
| **Prototype**   | Tạo nhiều biến thể của kẻ thù hoặc vật phẩm                | **Cao**        |
| **Decorator**   | Hệ thống Power-up, Buffs/Debuffs (Hiệu ứng tạm thời)       | **Trung bình** |
| **Memento**     | Hệ thống Checkpoint, Save/Load Game                        | **Trung bình** |
| **Proxy**       | Game có tài nguyên lớn, cần tối ưu bộ nhớ và thời gian tải | **Thấp**       |
| **Adapter**     | Tích hợp thư viện bên thứ ba (vật lý, âm thanh, analytics) | **Thấp**       |

Việc hiểu rõ các mẫu thiết kế này sẽ giúp đội ngũ đưa ra những quyết định đúng đắn khi tiếp tục mở rộng và phát triển dự án.
