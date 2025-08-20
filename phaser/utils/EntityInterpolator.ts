interface StateSnapshot {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * ENTITY INTERPOLATOR - Quản lý bộ đệm trạng thái và tính toán vị trí nội suy mượt mà
 * Cho mỗi thực thể (remote player/NPC/vật thể điều khiển bởi server), khởi tạo một instance riêng.
 */
export class EntityInterpolator {
  private buffer: StateSnapshot[] = [];
  private readonly INTERPOLATION_DELAY_MS = 100;
  private readonly BUFFER_SIZE_LIMIT = 30;

  public addSnapshot(x: number, y: number): void {
    const timestamp = Date.now();
    this.buffer.push({ x, y, timestamp });
    if (this.buffer.length > this.BUFFER_SIZE_LIMIT) {
      this.buffer.shift();
    }
  }

  public update(): { x: number; y: number } | null {
    const renderTimestamp = Date.now() - this.INTERPOLATION_DELAY_MS;
    if (this.buffer.length < 2) {
      return null;
    }

    let point1: StateSnapshot | null = null;
    let point2: StateSnapshot | null = null;

    for (let i = this.buffer.length - 1; i >= 0; i--) {
      if (this.buffer[i].timestamp <= renderTimestamp) {
        point1 = this.buffer[i];
        point2 = this.buffer[i + 1] || this.buffer[i];
        break;
      }
    }

    if (point1 && point2) {
      const denom = point2.timestamp - point1.timestamp || 1;
      const t = (renderTimestamp - point1.timestamp) / denom;
      const x = Phaser.Math.Linear(point1.x, point2.x, t);
      const y = Phaser.Math.Linear(point1.y, point2.y, t);
      return { x, y };
    }

    const latest = this.buffer[this.buffer.length - 1];
    return { x: latest.x, y: latest.y };
  }
}


