"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { User, Trophy, Star, Target } from "lucide-react";
import { ConnectedAvatarDisplay } from "@/components/features/avatar";
import {
  CustomizationTabs,
  type CustomizationTab,
} from "@/components/features/avatar/customization-tabs";
import { AvatarGrid } from "@/components/features/avatar/avatar-grid";
import { FrameGrid } from "@/components/features/avatar/frame-grid";
import { EmojiGrid } from "@/components/features/avatar/emoji-grid";
import { useAvatar } from "@/lib/hooks/use-avatar";

export default function StudentProfilePage() {
  const { getUser } = useAuthStatus();
  const user = getUser();
  const {
    myAvatarData,
    availableItems,
    collectionProgress,
    isLoading,
    isCollectionProgressLoading,
    isEquipping,
    equipItem,
    unequipFrame,
  } = useAvatar();

  const [activeTab, setActiveTab] = useState<CustomizationTab>("avatars");

  const equippedAvatarId = useMemo(
    () => myAvatarData?.customization?.equipped_avatar_id,
    [myAvatarData]
  );
  const equippedFrameId = useMemo(
    () => myAvatarData?.customization?.equipped_frame_id,
    [myAvatarData]
  );

  const handleEquipAvatar = useCallback(
    async (avatarId: number) => {
      await equipItem({ itemType: "avatar", itemId: avatarId });
    },
    [equipItem]
  );

  const handleEquipFrame = useCallback(
    async (frameId: number) => {
      // Nếu frame đã được trang bị, thì bỏ trang bị
      if (frameId === equippedFrameId) {
        await unequipFrame();
      } else {
        // Ngược lại, trang bị frame mới
        await equipItem({ itemType: "frame", itemId: frameId });
      }
    },
    [equipItem, unequipFrame, equippedFrameId]
  );

  const handleEquipEmoji = useCallback(
    async (emojiId: number) => {
      await equipItem({ itemType: "emoji", itemId: emojiId });
    },
    [equipItem]
  );

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa đăng nhập</h3>
            <p className="text-muted-foreground text-center">
              Vui lòng đăng nhập để xem thông tin cá nhân.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Hồ Sơ Cá Nhân</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin và thành tích của bạn
        </p>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 flex-1">
              <ConnectedAvatarDisplay
                key={`avatar-${equippedAvatarId}-${equippedFrameId}`}
                size="large"
                showName={true}
                showRarity={true}
              />

              <div className="text-center lg:text-left space-y-2">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{user.fullName}</h2>
                </div>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">Sinh viên</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tiến Độ Sưu Tập
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCollectionProgressLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border border-border">
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : collectionProgress ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Overall Progress */}
              <Card className="border border-border bg-gradient-to-br from-purple-50 to-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <h3 className="font-semibold text-purple-800">Tổng Quan</h3>
                  </div>
                  <div className="text-2xl font-bold text-purple-800">
                    {collectionProgress.overall.unlocked_items}/
                    {collectionProgress.overall.total_items}
                  </div>
                  <p className="text-sm text-purple-600">
                    {collectionProgress.overall.completion_rate} hoàn thành
                  </p>
                </CardContent>
              </Card>

              {/* Tiến độ Ảnh đại diện */}
              <Card className="border border-border bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-green-600" />
                    <h3 className="font-semibold text-green-800">
                      Ảnh đại diện
                    </h3>
                  </div>
                  <div className="text-2xl font-bold text-green-800">
                    {collectionProgress.avatars.unlocked}/
                    {collectionProgress.avatars.total_available}
                  </div>
                  <p className="text-sm text-green-600">
                    {collectionProgress.avatars.completion_rate} hoàn thành
                  </p>
                </CardContent>
              </Card>

              {/* Tiến độ Khung */}
              <Card className="border border-border bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Khung</h3>
                  </div>
                  <div className="text-2xl font-bold text-blue-800">
                    {collectionProgress.frames.unlocked}/
                    {collectionProgress.frames.total_available}
                  </div>
                  <p className="text-sm text-blue-600">
                    {collectionProgress.frames.completion_rate} hoàn thành
                  </p>
                </CardContent>
              </Card>

              {/* Tiến độ Biểu tượng cảm xúc */}
              <Card className="border border-border bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">😊</span>
                    <h3 className="font-semibold text-orange-800">
                      Biểu tượng cảm xúc
                    </h3>
                  </div>
                  <div className="text-2xl font-bold text-orange-800">
                    {collectionProgress.emojis.unlocked}/
                    {collectionProgress.emojis.total_available}
                  </div>
                  <p className="text-sm text-orange-600">
                    {collectionProgress.emojis.completion_rate} hoàn thành
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Không thể tải tiến độ sưu tập</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quản lý & Tùy chỉnh Ảnh đại diện trực tiếp trong Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Quản lý & Tùy chỉnh Ảnh đại diện</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomizationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            avatarsContent={
              <AvatarGrid
                ownedAvatars={availableItems?.avatars?.owned ?? []}
                lockedAvatars={availableItems?.avatars?.locked ?? []}
                equippedAvatarId={equippedAvatarId}
                onEquipAvatar={handleEquipAvatar}
                isLoading={isLoading}
                isEquipping={isEquipping}
              />
            }
            framesContent={
              <FrameGrid
                ownedFrames={availableItems?.frames?.owned ?? []}
                lockedFrames={availableItems?.frames?.locked ?? []}
                equippedFrameId={equippedFrameId}
                onEquipFrame={handleEquipFrame}
                isLoading={isLoading}
                isEquipping={isEquipping}
              />
            }
            emojisContent={
              <EmojiGrid
                ownedEmojis={availableItems?.emojis?.owned ?? []}
                lockedEmojis={availableItems?.emojis?.locked ?? []}
                equippedEmojiId={undefined}
                onEquipEmoji={handleEquipEmoji}
                isLoading={isLoading}
                isEquipping={isEquipping}
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
