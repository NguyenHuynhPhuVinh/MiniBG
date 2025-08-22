import { EntityInterpolator } from "../../../utils/EntityInterpolator";
import { Enemy as EnemyState } from "../../core/types/GameRoomState";
import { ENEMY_TYPES, EnemyFrames } from "./EnemyFrames";
import { FrameData } from "../CharacterFrames";

/**
 * RemoteEnemy - Chỉ hiển thị Enemy được điều khiển bởi server
 * Không chạy AI, chỉ nhận state từ server và hiển thị mượt mà
 */
export class RemoteEnemy {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public interpolator: EntityInterpolator = new EntityInterpolator();
    private scene: Phaser.Scene;
    private enemyType: string;
    private currentAnimState: string = "";
    
    constructor(scene: Phaser.Scene, x: number, y: number, type: string) {
        this.scene = scene;
        this.enemyType = type;
        
        // Tạo sprite với physics
        this.sprite = scene.physics.add.sprite(x, y, "spritesheet-enemies");
        this.sprite.setImmovable(true);
        
        // Tắt gravity cho enemy (chúng được điều khiển bởi server)
        if (this.sprite.body) {
            (this.sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        }

        // Khởi tạo frames và animations dựa trên type
        this.initializeAnimations();

        // Set frame ban đầu trước khi play animation
        const enemyFrames = ENEMY_TYPES[this.enemyType as keyof typeof ENEMY_TYPES];
        if (enemyFrames && enemyFrames.swim.length > 0) {
            const firstFrame = enemyFrames.swim[0];
            const frameKey = `enemy_${firstFrame.x}_${firstFrame.y}_0`;
            this.sprite.setFrame(frameKey);
        }

        // Bắt đầu với animation swim
        this.playAnimation("swim");
        
        console.log(`[RemoteEnemy] Created ${type} at (${x}, ${y})`);
    }

    /**
     * Khởi tạo animations cho enemy type này
     */
    private initializeAnimations(): void {
        // Tạo frames và animations cho enemy type này
        this.setupEnemyFrames();
        this.createEnemyAnimations();
    }

    /**
     * Update được gọi mỗi frame từ PlatformerNetworkHandler
     */
    public update(): void {
        // Lấy vị trí nội suy từ EntityInterpolator
        const targetPos = this.interpolator.update();
        if (targetPos && this.sprite.body) {
            // Di chuyển sprite đến vị trí được nội suy
            this.sprite.setPosition(targetPos.x, targetPos.y);
        }
    }

    /**
     * Cập nhật state từ server với optimizations
     */
    public updateState(newState: EnemyState): void {
        // Chỉ thêm snapshot nếu vị trí thay đổi đáng kể (tối ưu network)
        const currentPos = this.getPosition();
        const distance = Math.sqrt(
            Math.pow(newState.x - currentPos.x, 2) +
            Math.pow(newState.y - currentPos.y, 2)
        );

        // Chỉ update vị trí nếu di chuyển > 1 pixel hoặc enemy đang active
        if (distance > 1 || newState.isActive !== this.sprite.active) {
            this.interpolator.addSnapshot(newState.x, newState.y);
        }

        // Cập nhật flip chỉ khi thay đổi
        if (this.sprite.flipX !== newState.flipX) {
            this.sprite.setFlipX(newState.flipX);
        }

        // Cập nhật animation chỉ khi thay đổi
        if (newState.animState !== this.currentAnimState) {
            this.playAnimation(newState.animState);
        }

        // Cập nhật visibility chỉ khi thay đổi
        if (this.sprite.visible !== newState.isActive || this.sprite.active !== newState.isActive) {
            this.sprite.setVisible(newState.isActive);
            this.sprite.setActive(newState.isActive);
        }
    }

    /**
     * Phát animation
     */
    private playAnimation(animState: string): void {
        const animKey = `${this.enemyType}_${animState}`;
        
        // Kiểm tra animation có tồn tại không
        if (this.scene.anims.exists(animKey)) {
            this.sprite.play(animKey, true);
            this.currentAnimState = animState;
        } else {
            console.warn(`[RemoteEnemy] Animation ${animKey} not found, falling back to swim`);
            const fallbackKey = `${this.enemyType}_swim`;
            if (this.scene.anims.exists(fallbackKey)) {
                this.sprite.play(fallbackKey, true);
                this.currentAnimState = "swim";
            }
        }
    }

    /**
     * Lấy sprite để setup collision
     */
    public getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.sprite;
    }

    /**
     * Lấy enemy type
     */
    public getEnemyType(): string {
        return this.enemyType;
    }

    /**
     * Kiểm tra enemy có đang active không
     */
    public isActive(): boolean {
        return this.sprite.active && this.sprite.visible;
    }

    /**
     * Destroy enemy sprite
     */
    public destroy(): void {
        console.log(`[RemoteEnemy] Destroying ${this.enemyType}`);
        if (this.sprite) {
            this.sprite.destroy();
        }
    }

    /**
     * Tạm dừng/tiếp tục enemy
     */
    public setActive(active: boolean): void {
        this.sprite.setActive(active);
        this.sprite.setVisible(active);
        
        if (this.sprite.body) {
            this.sprite.body.enable = active;
        }
    }

    /**
     * Lấy vị trí hiện tại
     */
    public getPosition(): { x: number; y: number } {
        return {
            x: this.sprite.x,
            y: this.sprite.y
        };
    }

    /**
     * Setup frames cho enemy type này
     */
    private setupEnemyFrames(): void {
        const texture = this.scene.textures.get("spritesheet-enemies");
        const enemyFrames = ENEMY_TYPES[this.enemyType as keyof typeof ENEMY_TYPES];

        if (!enemyFrames) {
            console.warn(`[RemoteEnemy] No frames found for enemy type: ${this.enemyType}`);
            return;
        }

        // Setup swim frames
        enemyFrames.swim.forEach((frame: FrameData, index: number) => {
            const frameKey = `enemy_${frame.x}_${frame.y}_${index}`;
            if (!texture.has(frameKey)) {
                texture.add(frameKey, 0, frame.x, frame.y, frame.width, frame.height);
            }
        });

        // Setup sleep frames
        enemyFrames.sleep.forEach((frame: FrameData, index: number) => {
            const frameKey = `enemy_sleep_${frame.x}_${frame.y}_${index}`;
            if (!texture.has(frameKey)) {
                texture.add(frameKey, 0, frame.x, frame.y, frame.width, frame.height);
            }
        });
    }

    /**
     * Tạo animations cho enemy type này
     */
    private createEnemyAnimations(): void {
        const enemyFrames = ENEMY_TYPES[this.enemyType as keyof typeof ENEMY_TYPES];

        if (!enemyFrames) {
            console.warn(`[RemoteEnemy] No frames found for enemy type: ${this.enemyType}`);
            return;
        }

        // Tạo swim animation
        const swimAnimKey = `${this.enemyType}_swim`;
        if (!this.scene.anims.exists(swimAnimKey)) {
            const swimFrames = this.generateFrames(enemyFrames.swim, false);
            this.scene.anims.create({
                key: swimAnimKey,
                frames: swimFrames,
                frameRate: 8,
                repeat: -1
            });
        }

        // Tạo sleep animation
        const sleepAnimKey = `${this.enemyType}_sleep`;
        if (!this.scene.anims.exists(sleepAnimKey)) {
            const sleepFrames = this.generateFrames(enemyFrames.sleep, true);
            this.scene.anims.create({
                key: sleepAnimKey,
                frames: sleepFrames,
                frameRate: 2,
                repeat: -1
            });
        }
    }

    /**
     * Helper để tạo frame data cho animation
     */
    private generateFrames(frameData: FrameData[], isSleep: boolean): Phaser.Types.Animations.AnimationFrame[] {
        return frameData.map((frame, index) => ({
            key: 'spritesheet-enemies',
            frame: isSleep ? `enemy_sleep_${frame.x}_${frame.y}_${index}` : `enemy_${frame.x}_${frame.y}_${index}`,
        }));
    }

    /**
     * Áp dụng lighting pipeline nếu cần
     */
    public applyLightingPipeline(): void {
        if (this.sprite && this.sprite.scene) {
            try {
                this.sprite.setPipeline('Light2D');
                console.log(`[RemoteEnemy] Applied Light2D pipeline to ${this.enemyType}`);
            } catch (error) {
                console.warn(`[RemoteEnemy] Failed to apply Light2D pipeline:`, error);
            }
        }
    }
}
