import myDataJson from "@/mocks/data/avatar.my-data.mock.json" assert { type: "json" };
import available from "@/mocks/data/avatar.available-items.mock.json" assert { type: "json" };
import progress from "@/mocks/data/avatar.collection-progress.mock.json" assert { type: "json" };

// Tạo state cục bộ để mô phỏng thay đổi khi trang bị
let myDataState: typeof myDataJson = JSON.parse(JSON.stringify(myDataJson));

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const avatarMockHandlers = {
  async getMyAvatarData() {
    return deepClone(myDataState);
  },
  async getAvailableItems() {
    return deepClone(available);
  },
  async getCollectionProgress() {
    return deepClone(progress);
  },
  async equipItem(payload: {
    itemType: "avatar" | "frame" | "name_effect" | "emoji";
    itemId: number;
  }) {
    // Cập nhật state tùy theo loại item
    if (payload.itemType === "avatar") {
      myDataState.customization.equipped_avatar_id = payload.itemId;
    } else if (payload.itemType === "frame") {
      myDataState.customization.equipped_frame_id = payload.itemId;
    } else if (payload.itemType === "name_effect") {
      myDataState.customization.equipped_name_effect_id = payload.itemId;
    }

    // Trả về customization đúng contract của service.equipItem()
    return deepClone(myDataState.customization);
  },

  async unequipFrame() {
    // Bỏ trang bị frame (set về 0 hoặc null)
    myDataState.customization.equipped_frame_id = 0;

    // Trả về customization đúng contract
    return deepClone(myDataState.customization);
  },
};
