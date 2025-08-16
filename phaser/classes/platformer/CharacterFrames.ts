/**
 * 🖼️ CHARACTER FRAME DEFINITIONS - Hệ thống frame thủ công cho spritesheet
 *
 * CHỨC NĂNG:
 * - Định nghĩa vị trí frames trong spritesheet 128x128 không theo thứ tự logic
 * - Cung cấp helper functions để tạo frame data dễ dàng
 * - Hỗ trợ nhiều characters với animations khác nhau
 */

// === INTERFACES ===
export interface FrameData {
  x: number; // Tọa độ X trong spritesheet (pixel)
  y: number; // Tọa độ Y trong spritesheet (pixel)
  width: number; // Chiều rộng frame (thường 128)
  height: number; // Chiều cao frame (thường 128)
}

export interface CharacterAnimations {
  idle: FrameData[]; // Frames cho animation đứng yên
  walk: FrameData[]; // Frames cho animation đi bộ
  jump: FrameData[]; // Frames cho animation nhảy
  fall: FrameData[]; // Frames cho animation rơi
}

// === HELPER FUNCTIONS ===

/**
 * 📍 TẠO FRAME TỪ VỊ TRÍ GRID
 * @param col - Cột trong grid (bắt đầu từ 0)
 * @param row - Hàng trong grid (bắt đầu từ 0)
 * @param frameSize - Kích thước mỗi frame (default: 128)
 * @returns FrameData với tọa độ pixel chính xác
 */
export function frameAt(
  col: number,
  row: number,
  frameSize: number = 128
): FrameData {
  return {
    x: col * frameSize,
    y: row * frameSize,
    width: frameSize,
    height: frameSize,
  };
}

/**
 * 📍 TẠO NHIỀU FRAMES TỪ DANH SÁCH VỊ TRÍ
 * @param positions - Mảng [col, row] positions
 * @param frameSize - Kích thước mỗi frame (default: 128)
 * @returns Mảng FrameData
 */
export function framesAt(
  positions: [number, number][],
  frameSize: number = 128
): FrameData[] {
  return positions.map(([col, row]) => frameAt(col, row, frameSize));
}

// === HƯỚNG DẪN SỬ DỤNG ===
// frameAt(col, row) - Tạo 1 frame tại vị trí cột, hàng (bắt đầu từ 0)
// framesAt([[col1, row1], [col2, row2], ...]) - Tạo nhiều frames
//
// VÍ DỤ:
// frameAt(0, 0) = frame ở góc trái trên
// frameAt(1, 0) = frame cột 2, hàng 1
// framesAt([[0,0], [2,1], [4,0]]) = 3 frames ở các vị trí khác nhau

// === CHARACTER DEFINITIONS ===

/**
 * 🟠 ORANGE CHARACTER - Character chính được sử dụng trong game
 * Frames được điều chỉnh theo spritesheet thực tế
 */
export const ORANGE_CHARACTER: CharacterAnimations = {
  idle: [frameAt(0, 3)], // Đứng yên
  walk: framesAt([
    // Animation đi bộ
    [0, 1], // Frame 1
    [0, 0], // Frame 2
    [0, 3], // Quay về idle
  ]),
  jump: [frameAt(0, 2)], // Nhảy lên
  fall: [frameAt(0, 4)], // Rơi xuống
};

/**
 * 🟣 PURPLE CHARACTER - Character phụ (có thể dùng để thay đổi)
 */
export const PURPLE_CHARACTER: CharacterAnimations = {
  idle: [frameAt(0, 2)],
  walk: framesAt([
    [1, 2],
    [2, 2],
    [3, 2],
    [0, 2],
  ]),
  jump: [frameAt(4, 2)],
  fall: [frameAt(5, 2)],
};

/**
 * 🟢 GREEN CHARACTER - Character phụ (có thể dùng để thay đổi)
 */
export const GREEN_CHARACTER: CharacterAnimations = {
  idle: [frameAt(0, 4)],
  walk: framesAt([
    [1, 4],
    [2, 4],
    [3, 4],
    [0, 4],
  ]),
  jump: [frameAt(4, 4)],
  fall: [frameAt(5, 4)],
};

/**
 * 🩷 PINK CHARACTER - Character phụ (có thể dùng để thay đổi)
 */
export const PINK_CHARACTER: CharacterAnimations = {
  idle: [frameAt(0, 3)],
  walk: framesAt([
    [1, 3],
    [2, 3],
    [3, 3],
    [0, 3],
  ]),
  jump: [frameAt(4, 3)],
  fall: [frameAt(5, 3)],
};

// === EXPORTS ===

/**
 * 📦 TẤT CẢ CHARACTERS - Object chứa tất cả character definitions
 */
export const CHARACTERS = {
  ORANGE: ORANGE_CHARACTER, // Character chính
  PURPLE: PURPLE_CHARACTER, // Character phụ
  GREEN: GREEN_CHARACTER, // Character phụ
  PINK: PINK_CHARACTER, // Character phụ
} as const;

/**
 * 🎯 DEFAULT CHARACTER - Character được sử dụng mặc định
 */
export const DEFAULT_CHARACTER = CHARACTERS.ORANGE;

/**
 * ⚙️ CẤU HÌNH ANIMATION - Settings cho walk animation
 */
export const ANIMATION_CONFIG = {
  frameRate: 8, // 8 FPS cho walk animation (mượt mà)
  repeat: -1, // Lặp vô hạn
  yoyo: false, // Không reverse animation
} as const;

/**
 * 📏 KÍCH THƯỚC FRAME - Kích thước chuẩn của mỗi character frame
 */
export const CHARACTER_FRAME_SIZE = {
  width: 128, // Chiều rộng frame
  height: 128, // Chiều cao frame
} as const;

// === HƯỚNG DẪN DEBUGGING ===
// 🔧 CÁCH DEBUG KHI FRAME HIỂN THỊ SAI:
// 1. Mở game và xem character hiển thị frame nào
// 2. Nếu sai, thay đổi số trong frameAt(col, row)
// 3. Col = cột (0,1,2,3,4,5...), Row = hàng (0,1,2,3,4,5...)
// 4. Lưu file và reload game để test
//
// VÍ DỤ:
// - Idle frame sai: thay frameAt(0, 0) → frameAt(1, 0) hoặc frameAt(0, 1)
// - Walk animation sai: thay đổi các số trong framesAt([...])
//
// 📝 TEMPLATE TẠO CHARACTER MỚI:
// export const NEW_CHARACTER: CharacterAnimations = {
//   idle: [frameAt(col, row)],
//   walk: framesAt([[col1, row1], [col2, row2], [col3, row3], [col4, row4]]),
//   jump: [frameAt(col, row)],
//   fall: [frameAt(col, row)]
// };
