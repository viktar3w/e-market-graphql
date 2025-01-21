import { Body } from "@react-email/body";
import { Html } from "@react-email/html";

import { CartState } from "@/lib/types/cart";
import { OrderState } from "@/lib/types/checkout";
import { formatPrice } from "@/lib/utils";
type OrderEmailProps = {
  order: OrderState;
  cart: CartState;
};
const OrderEmail = ({ order, cart }: OrderEmailProps) => {
  return (
    <Html lang="en">
      <Body
        style={{
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f4f4f5",
          padding: "20px",
        }}
      >
        <table
          width="100%"
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#4CAF50", color: "#ffffff" }}>
              <td
                style={{
                  padding: "15px",
                  textAlign: "center",
                  fontSize: "24px",
                }}
              >
                Order Confirmation
              </td>
            </tr>
            <tr>
              <td style={{ padding: "20px" }}>
                <p style={{ fontSize: "18px" }}>
                  Hello, {cart.shippingAddress!.firstname}
                </p>
                <p>
                  Thank you for your purchase! Your order ID is{" "}
                  <strong>{order.token}</strong>.
                </p>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "20px" }}>
                <table
                  width="100%"
                  style={{
                    border: "1px solid #ddd",
                    borderCollapse: "collapse",
                  }}
                >
                  <tr style={{ backgroundColor: "#f9f9f9" }}>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                      Item
                    </th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                      Quantity
                    </th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                      Price
                    </th>
                  </tr>
                  {cart.cartItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                        {item.name}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        {item.qty}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          border: "1px solid #ddd",
                          textAlign: "right",
                        }}
                      >
                        {formatPrice(item.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </table>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td
                style={{
                  padding: "20px",
                  textAlign: "right",
                  fontSize: "18px",
                  borderTop: "1px solid #ddd",
                }}
              >
                <strong>Tax Amount: {formatPrice(order.taxAmount)}</strong>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "20px",
                  textAlign: "right",
                  fontSize: "18px",
                  borderTop: "1px solid #ddd",
                }}
              >
                <strong>
                  Shipping Amount: {formatPrice(order.shippingAmount)}
                </strong>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "20px",
                  textAlign: "right",
                  fontSize: "18px",
                  borderTop: "1px solid #ddd",
                }}
              >
                <strong>
                  Summary Amount: {formatPrice(order.summaryAmount)}
                </strong>
              </td>
            </tr>
            <tr style={{ backgroundColor: "#4CAF50", color: "#ffffff" }}>
              <td
                style={{
                  padding: "15px",
                  textAlign: "center",
                  fontSize: "14px",
                }}
              >
                Thank you for shopping with us!
              </td>
            </tr>
          </tfoot>
        </table>
      </Body>
    </Html>
  );
};

export default OrderEmail;
