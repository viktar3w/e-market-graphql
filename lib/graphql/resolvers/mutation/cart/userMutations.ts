import { MutationUpdatePersonalDataProps } from "@/lib/types/cart";
import { CheckoutPersonalDataValidation } from "@/lib/validations/checkout";
import { sanitize } from "@/lib/utils";

const mutations = {
  updatePersonalData: async (
    cart: MutationUpdatePersonalDataProps["parent"],
    args: MutationUpdatePersonalDataProps["args"],
    context: MutationUpdatePersonalDataProps["context"],
  ) => {
    const { prisma } = context;
    const personalData = CheckoutPersonalDataValidation.parse(args.input);
    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        firstname: sanitize(personalData.firstname),
        lastname: sanitize(personalData.lastname),
        email: sanitize(personalData.email),
        phone: sanitize(personalData.phone),
      },
    });
    return { success: true };
  },
};

export default mutations;
