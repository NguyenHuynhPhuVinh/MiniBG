/**
 * 🎮 CÁC HẰNG SỐ GAME - Tập trung tất cả config ở đây để dễ điều chỉnh
 */

// === CẤU HÌNH GAME CƠ BẢN ===
export const GAME_CONFIG = {
  WIDTH: 800, // Chiều rộng game (không dùng vì responsive)
  HEIGHT: 600, // Chiều cao game (không dùng vì responsive)
  BACKGROUND_COLOR: "#87CEEB", // Màu nền sky blue - phù hợp platformer
} as const;

// === KEYS CỦA CÁC SCENE ===
export const SCENE_KEYS = {
  PRELOAD: "PreloadScene", // Scene loading assets
  ORIGIN_VALLEY: "OriginValleyScene", // New name for Forest
  TEMPEST_PEAK: "TempestPeakScene", // New name for Desert
  WHISPERING_CAVERNS: "WhisperingCavernsScene", // Hang Động Thì Thầm

  // Legacy keys (deprecated - giữ tạm cho tương thích ngược)
  GAME: "GameScene", // @deprecated
  FOREST: "OriginValleyScene",
  DESERT: "TempestPeakScene",
} as const;

// === BẢNG MÀU GAME ===
export const COLORS = {
  SKY_BLUE: "#87CEEB", // Màu nền chính
  DARK_BLUE: "#4682B4", // Màu loading bar background
  WHITE: "#FFFFFF", // Màu text
  BLACK: "#000000", // Màu viền text
} as const;

// === CẤU HÌNH CAMERA - CHỈNH Ở ĐÂY để tất cả camera effects tự động update ===
export const CAMERA_CONFIG = {
  // Offset chính - điều chỉnh góc nhìn toàn bộ game
  DEFAULT_OFFSET: { x: 0, y: -50 }, // Âm = nhìn lên, Dương = nhìn xuống

  // Các offset động khi player di chuyển (cộng vào DEFAULT_OFFSET)
  JUMP_OFFSET_MODIFIER: -30, // Nhìn lên khi nhảy
  FALL_OFFSET_MODIFIER: 20, // Nhìn xuống khi rơi
  FAST_FALL_OFFSET_MODIFIER: 40, // Nhìn xuống nhiều khi rơi nhanh

  // Tốc độ camera follow (càng nhỏ càng mượt)
  LERP_SPEED: { x: 0.1, y: 0.1 },
} as const;

// === CẤU HÌNH THỜI GIAN ===
export const TIMER_CONFIG = {
  GAME_TIME_LIMIT: 60, // Thời gian chơi game (60 giây)
  QUIZ_TIME_LIMIT: 90, // Thời gian làm toàn bộ quiz (90 giây cho 3 câu)
  QUIZ_RESULT_DELAY: 2, // Delay hiển thị kết quả câu (2 giây)
  QUIZ_COMPLETION_DELAY: 3, // Delay sau khi hoàn thành quiz (3 giây)
  WARNING_TIME: 10, // Thời gian cảnh báo (10 giây cuối)
} as const;
