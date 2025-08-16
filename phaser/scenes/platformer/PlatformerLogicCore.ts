import { IPlatformerRules } from "./rules/IPlatformerRules";
import { BasePlatformerScene } from "./BasePlatformerScene";

/**
 * 🎮 PLATFORMER LOGIC CORE - Cỗ máy logic thuần túy (Pure Logic Engine)
 *
 * KIẾN TRÚC CUỐI CÙNG - STATELESS LOGIC ENGINE:
 * - Hoàn toàn không trạng thái (stateless)
 * - Nhận scene như tham số tạm thời, không lưu trữ
 * - Chỉ là "detector" thuần túy phát hiện và phân loại sự kiện
 * - Ủy quyền HOÀN TOÀN cho IPlatformerRules
 * - Zero scene dependency - Pure functions only
 *
 * TRÁCH NHIỆM:
 * - Phát hiện và phân loại tile interactions
 * - Xử lý logic chung (remove tiles)
 * - Ủy quyền mọi logic nghiệp vụ cho Strategy (Rules)
 * - Cung cấp helper methods cho tile detection
 *
 * KIẾN TRÚC:
 * - Strategy Pattern: 100% dependency injection với IPlatformerRules
 * - Pure Function Style: Scene và objects được truyền vào method calls
 * - Stateless Design: Không lưu trữ bất kỳ state nào
 */
export class PlatformerLogicCore {
  private rules: IPlatformerRules;

  constructor(rules: IPlatformerRules) {
    this.rules = rules;
    console.log(
      `🎮 PlatformerLogicCore: Initialized as stateless logic engine with strategy pattern`
    );
  }

  // === TILE INTERACTION LOGIC ===

  /**
   * 💰 HANDLE TILE OVERLAP - Stateless collision detection and delegation
   *
   * PURE FUNCTION APPROACH:
   * - Nhận scene như tham số tạm thời
   * - Phát hiện loại tile và xử lý logic chung
   * - Ủy quyền hoàn toàn cho Strategy (Rules)
   * - Không lưu trữ bất kỳ state nào
   *
   * @param tile - Tile mà player chạm vào
   * @param tilemapLayer - TilemapLayer để xóa tile (optional)
   * @param scene - Scene được truyền từ collision callback
   */
  public handleTileOverlap(
    tile: Phaser.Tilemaps.Tile,
    tilemapLayer: Phaser.Tilemaps.TilemapLayer | undefined,
    scene: BasePlatformerScene
  ): void {
    // 1. Phát hiện và phân loại tile
    if (this.isCollectibleTile(tile)) {
      // 2. Xử lý logic chung: xóa tile collectible
      this.removeTileFromMap(tile, tilemapLayer);

      // 3. Ủy quyền hoàn toàn cho Strategy Pattern
      this.rules.handleCollectible(tile, scene);
    } else if (this.isTrapTile(tile)) {
      // Trap tiles không xóa, chỉ trigger effect
      this.rules.handleCollectible(tile, scene);
    }
  }

  // === OBJECT INTERACTION LOGIC ===

  /**
   * 🎯 HANDLE INTERACTIVE OBJECT - Pure delegation to Strategy Pattern
   *
   * STATELESS APPROACH:
   * - Nhận scene như tham số, không lưu trữ
   * - Ủy quyền hoàn toàn cho rules implementation
   * - Không có logic nghiệp vụ trong core
   *
   * @param objectName - Tên object từ Tiled
   * @param objectData - Data object từ Tiled
   * @param scene - Scene được truyền từ interaction callback
   */
  public handleInteractiveObject(
    objectName: string,
    objectData: any,
    scene: BasePlatformerScene
  ): void {
    // Hoàn toàn ủy quyền cho Strategy Pattern
    this.rules.handleInteractiveObject(objectName, objectData, scene);
  }

  // === PUBLIC HELPER METHODS - Utility functions for tile detection ===

  /**
   * 🪙 IS COIN TILE - Public utility for tile type detection
   */
  public isCoinTile(tile: Phaser.Tilemaps.Tile): boolean {
    return (
      tile.properties &&
      tile.properties.type === "collectible" &&
      tile.properties.name === "xu"
    );
  }

  /**
   * ⚡ IS POWER UP TILE - Public utility for tile type detection
   */
  public isPowerUpTile(tile: Phaser.Tilemaps.Tile): boolean {
    return (
      tile.properties &&
      tile.properties.type === "collectible" &&
      tile.properties.name === "powerup"
    );
  }

  /**
   * 🕳️ IS TRAP TILE - Public utility for tile type detection
   */
  public isTrapTile(tile: Phaser.Tilemaps.Tile): boolean {
    return tile.properties && tile.properties.type === "trap";
  }

  /**
   * 💎 IS COLLECTIBLE TILE - Public utility for general collectible detection
   */
  public isCollectibleTile(tile: Phaser.Tilemaps.Tile): boolean {
    return tile.properties && tile.properties.type === "collectible";
  }

  /**
   * 🗑️ REMOVE TILE FROM MAP - Shared utility for tile removal
   */
  private removeTileFromMap(
    tile: Phaser.Tilemaps.Tile,
    tilemapLayer?: Phaser.Tilemaps.TilemapLayer
  ): void {
    if (tilemapLayer) {
      tilemapLayer.removeTileAt(tile.x, tile.y, true, true);
    } else if (tile.tilemap && tile.layer) {
      tile.tilemap.removeTileAt(
        tile.x,
        tile.y,
        true,
        true,
        tile.layer.tilemapLayer
      );
    }
  }

  // === CLEANUP ===

  /**
   * 🗑️ CLEANUP - Stateless cleanup, delegates to rules
   */
  public cleanup(): void {
    console.log("🗑️ PlatformerLogicCore: Stateless logic engine cleanup");
    // Cleanup Strategy Pattern rules
    this.rules.cleanup();
  }
}
