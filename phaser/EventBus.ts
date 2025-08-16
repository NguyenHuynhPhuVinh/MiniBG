import { Events } from 'phaser';

/**
 * 📡 EVENT BUS - Cầu nối giao tiếp giữa React và Phaser
 *
 * CHỨC NĂNG:
 * - Cho phép React components lắng nghe events từ Phaser scenes
 * - Cho phép Phaser scenes gửi data về React components
 *
 * SỬ DỤNG:
 * - Trong Phaser: EventBus.emit('event-name', data)
 * - Trong React: EventBus.on('event-name', callback)
 *
 * VÍ DỤ:
 * - GameScene emit 'current-scene-ready' khi scene khởi tạo xong
 * - React component nhận scene instance để tương tác
 */
export const EventBus = new Events.EventEmitter();
