import { OrderStatus, Prisma } from '@prisma/client';
import Stripe from 'stripe';

import { db } from '@/db';
export const updateOrder = async (session: Stripe.Checkout.Session, type: string): Promise<string | boolean> => {
  try {
    const token = session?.metadata?.token;
    if (!token) {
      return 'Invalid token';
    }
    const order = await db.order.findFirst({
      where: {
        token,
      },
      include: {
        billingAddress: true,
        shippingAddress: true,
      },
    });
    if (!order) {
      return 'Invalid order';
    }
    const data: Prisma.OrderUpdateInput = {
      status: order.status,
    };
    const billingAddress: Stripe.Checkout.Session.CustomerDetails | null =
      // @ts-ignore
      session?.customer_details;
    switch (type) {
      case 'checkout.session.async_payment_failed':
        data.status = OrderStatus.CANCELLED;
        break;
      case 'checkout.session.async_payment_succeeded':
        break;
      case 'checkout.session.completed':
        const customText = (session?.custom_text || {}) as Stripe.Checkout.Session.CustomText;
        data.status = OrderStatus.SUCCEEDED;
        data.paymentId = session.id;
        data.items = {
          status: String(session?.status),
          custom_text: {
            ...customText,
          },
        } as Prisma.InputJsonObject;
        if (!order.billingAddress && !!billingAddress) {
          const name = billingAddress?.name?.split(' ') || [
            order.shippingAddress.firstname,
            order.shippingAddress.lastname,
          ];
          data.billingAddress = {
            create: {
              city: billingAddress.address?.city || order.shippingAddress.city,
              country: billingAddress.address?.country || order.shippingAddress.country,
              street: [billingAddress.address?.line1 || '', billingAddress.address?.line2 || ''].join(' '),
              postcode: billingAddress.address?.postal_code || order.shippingAddress.postcode,
              state: billingAddress.address?.state || order.shippingAddress.state,
              firstname: name[0],
              lastname: name[1] || order.shippingAddress.lastname,
              phone: billingAddress.phone || order.shippingAddress.phone,
              // @ts-ignore
              email: billingAddress?.email || order.shippingAddress.email,
            },
          };
        }
        break;
    }
    await db.order.update({
      data: data,
      where: {
        id: order.id,
      },
    });
    return true;
  } catch (e: any) {
    console.log('[ERROR] checkout stripe webhook: ', e.message);
  }
  return false;
};
