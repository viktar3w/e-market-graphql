"use server";

import { SocialType } from "@prisma/client";
import { db } from "@/db";
import { ATTEMPT_LIMIT, BLOCK_DURATION } from "@/lib/constants";

export const isBlocked = async (
  chatId: number,
  type: SocialType = SocialType.TELEGRAM,
): Promise<boolean> => {
  const blockedUser = await db.blockedUser.findUnique({
    where: { chatId_type: { chatId, type } },
  });
  if (!blockedUser) return false;
  if (blockedUser.expiresAt && new Date() > blockedUser.expiresAt) {
    await db.blockedUser.update({
      where: { chatId_type: { chatId, type } },
      data: { limit: ATTEMPT_LIMIT, expiresAt: null },
    });
    return false;
  }
  return !!blockedUser.expiresAt;
};

export const handleFailedAttempt = async (
  chatId: number,
  type: SocialType = SocialType.TELEGRAM,
  reason?: string,
): Promise<void> => {
  const blockedUser = await db.blockedUser.findUnique({
    where: { chatId_type: { type, chatId } },
  });
  if (!blockedUser) {
    await db.blockedUser.create({
      data: { chatId, limit: 4, reason },
    });
    return;
  }
  if (blockedUser.limit > 1) {
    await db.blockedUser.update({
      where: { chatId },
      data: { limit: blockedUser.limit - 1 },
    });
  } else {
    await db.blockedUser.update({
      where: { chatId },
      data: {
        limit: 0,
        expiresAt: new Date(Date.now() + BLOCK_DURATION),
        reason: reason || "Too many failed attempts",
      },
    });
  }
};