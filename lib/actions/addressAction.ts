import {
  CheckoutDeliverySchema,
  CheckoutDeliveryValidation,
} from "@/lib/validations/checkout";
import { sanitize } from "@/lib/utils";

export const prepareAddress = (address: CheckoutDeliverySchema) => {
  const shippingAddressData = CheckoutDeliveryValidation.parse(address);
  return {
    firstname: sanitize(shippingAddressData.firstname),
    lastname: sanitize(shippingAddressData.lastname),
    email: sanitize(shippingAddressData.email),
    phone: sanitize(shippingAddressData.phone),
    state: sanitize(shippingAddressData.state),
    street: sanitize(shippingAddressData.street),
    country: sanitize(shippingAddressData.country),
    city: sanitize(shippingAddressData.city),
    postcode: sanitize(shippingAddressData.postcode),
  };
};
