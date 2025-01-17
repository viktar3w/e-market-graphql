import { SupportPlan } from '@prisma/client';
import Stripe from 'stripe';

import { db } from '@/db';

export const updateUserPlan = async (session: Stripe.Checkout.Session, type: string) => {
  if (type !== 'checkout.session.completed') {
    return false;
  }
  const { supportId } = session.metadata || { supportId: null };
  if (!supportId) {
    return 'Invalid metadata';
  }
  try {
    await db.support.update({
      where: {
        id: supportId,
      },
      data: {
        plan: SupportPlan.PRO,
      },
    });
    return true;
  } catch (e: any) {
    return `[ERROR] webhook updateUserPlan: ${e.message}`;
  }
};
