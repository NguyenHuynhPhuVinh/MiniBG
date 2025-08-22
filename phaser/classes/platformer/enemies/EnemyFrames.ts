import { FrameData, frameAt, framesAt } from "../CharacterFrames";

// Giao diện mới bao gồm cả swim và sleep
export interface EnemyFrames {
  swim: FrameData[];
  sleep: FrameData[];
}

// Tọa độ frame dựa trên spritesheet của bạn (kích thước 64x64)
// frameAt(col, row, frameSize)
const FRAME_SIZE = 64;

export const BLUE_FISH_FRAMES: EnemyFrames = {
  // Cá xanh dương: hàng 8, cột 1-2-3 (index 7, 0-1-2)
  swim: framesAt(
    [
      [6, 3],
      [6, 4],
    ],
    FRAME_SIZE
  ),
  sleep: [frameAt(6, 5, FRAME_SIZE)],
};

export const GOLD_FISH_FRAMES: EnemyFrames = {
  // Cá vàng: hàng 7, cột 1-2-3 (index 6, 0-1-2)
  swim: framesAt(
    [
      [5, 5],
      [5, 6],
    ],
    FRAME_SIZE
  ),
  sleep: [frameAt(5, 7, FRAME_SIZE)],
};

export const PIRANHA_FRAMES: EnemyFrames = {
  // Cá Piranha (đỏ): hàng 7, cột 4-5-6 (index 6, 3-4-5)
  swim: framesAt(
    [
      [3, 6],
      [4, 6],
    ],
    FRAME_SIZE
  ),
  sleep: [frameAt(5, 6, FRAME_SIZE)],
};

export const FLYING_SAW_FRAMES: EnemyFrames = {
  // Lưỡi cưa bay: hàng 9, cột 1-2-3 (giả định tọa độ - bạn cần điều chỉnh theo spritesheet thực tế)
  swim: framesAt(
    [
      [3, 6], // Cột 1, Hàng 9 (bay frame 1)
      [3, 7], // Cột 2, Hàng 9 (bay frame 2)
    ],
    FRAME_SIZE
  ),
  sleep: [frameAt(7, 3, FRAME_SIZE)], // Cột 3, Hàng 9 (idle frame)
};

export const ENEMY_TYPES = {
  BLUE_FISH: BLUE_FISH_FRAMES,
  GOLD_FISH: GOLD_FISH_FRAMES,
  PIRANHA: PIRANHA_FRAMES,
  FLYING_SAW: FLYING_SAW_FRAMES,
} as const;

export type EnemyType = keyof typeof ENEMY_TYPES;
