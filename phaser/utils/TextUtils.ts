/**
 * 🎨 TEXT UTILITIES - Công cụ tạo text chất lượng cao
 *
 * Tập hợp các utility functions để tạo text với chất lượng hiển thị tốt nhất
 */

export interface HighQualityTextStyle {
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  strokeColor?: string;
  strokeThickness?: number;
  shadowColor?: string;
  shadowOffset?: { x: number; y: number };
  shadowBlur?: number;
  fontWeight?:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
}

/**
 * 🎯 CREATE HIGH QUALITY TEXT - Tạo text với chất lượng cao
 */
export class TextUtils {
  /**
   * 👤 Tạo name tag cho người chơi với chất lượng cao
   */
  static createPlayerNameTag(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    isLocalPlayer: boolean = false
  ): Phaser.GameObjects.Text {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
      fontSize: "14px",
      color: isLocalPlayer ? "#f0e130" : "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
      fontStyle: "bold",
      resolution: 2, // Tăng độ phân giải cho text sắc nét
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: "#000000",
        blur: 2,
        fill: true,
      },
      padding: {
        left: 2,
        right: 2,
        top: 2,
        bottom: 2,
      },
    };

    return scene.add.text(x, y, text, style).setOrigin(0.5).setDepth(1000); // Luôn hiển thị trên cùng
  }

  /**
   * 🏆 Tạo score text với hiệu ứng
   */
  static createScoreText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    score: number
  ): Phaser.GameObjects.Text {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
      fontSize: "20px",
      color: "#ffff00",
      stroke: "#000000",
      strokeThickness: 4,
      fontStyle: "bold",
      resolution: 2,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: "#000000",
        blur: 3,
        fill: true,
      },
    };

    return scene.add
      .text(x, y, `+${score}`, style)
      .setOrigin(0.5)
      .setDepth(1001);
  }

  /**
   * ⚠️ Tạo warning text
   */
  static createWarningText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string
  ): Phaser.GameObjects.Text {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
      fontSize: "16px",
      color: "#ff4444",
      stroke: "#ffffff",
      strokeThickness: 2,
      fontStyle: "bold",
      resolution: 2,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: "#000000",
        blur: 2,
        fill: true,
      },
    };

    return scene.add.text(x, y, text, style).setOrigin(0.5).setDepth(1000);
  }

  /**
   * 🎮 Tạo UI text chung
   */
  static createUIText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    customStyle?: Partial<Phaser.Types.GameObjects.Text.TextStyle>
  ): Phaser.GameObjects.Text {
    const defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
      fontSize: "16px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
      fontStyle: "normal",
      resolution: 2,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: "#000000",
        blur: 1,
        fill: true,
      },
    };

    const finalStyle = { ...defaultStyle, ...customStyle };

    return scene.add.text(x, y, text, finalStyle).setOrigin(0.5).setDepth(500);
  }

  /**
   * ✨ Thêm hiệu ứng fade in cho text
   */
  static fadeInText(
    text: Phaser.GameObjects.Text,
    duration: number = 500
  ): void {
    text.setAlpha(0);
    text.scene.tweens.add({
      targets: text,
      alpha: 1,
      duration: duration,
      ease: "Power2",
    });
  }

  /**
   * 💫 Thêm hiệu ứng bounce cho text
   */
  static bounceText(text: Phaser.GameObjects.Text, scale: number = 1.2): void {
    text.scene.tweens.add({
      targets: text,
      scaleX: scale,
      scaleY: scale,
      duration: 200,
      yoyo: true,
      ease: "Power2",
    });
  }

  /**
   * 🌟 Thêm hiệu ứng glow (nhấp nháy)
   */
  static addGlowEffect(text: Phaser.GameObjects.Text): void {
    text.scene.tweens.add({
      targets: text,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
