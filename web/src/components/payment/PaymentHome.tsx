import { Button, Center } from "@mantine/core";
import { memo } from "react";
import axios from "axios";

interface IProps {}

const PaymentHome: React.FC<IProps> = () => {
  const onPayment = async () => {
    try {
      const payload = {
        userId: "6921b758a7ca797d132cd2f8",
        amount: 1,
        productId: "PARK_VISIT",
        quantity: 1,
      };

      const response = await axios.post(
        "http://localhost:3000/payment/create",
        payload
      );

      const data = await response.data;

      const options = {
        key: import.meta.env.VITE_PAYMENT_KEY,
        amount: data.amount,
        currency: "INR",
        order_id: data.orderId,
        name: "Vrakshalaya Pvt Ltd",
        description: "Payment",
        handler: async (response: any) => {
          await fetch("http://localhost:3000/payment/success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentDbId: data._id,
            }),
          });
        },
        prefill: {
          name: "Naman Mishra",
          email: "namanwebd@gmail.com",
          contact: "+919479988886",
        },
        theme: {
          color: "#3399cc",
        },
      };
      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Center>
      <Button onClick={onPayment}>Create Payment</Button>
    </Center>
  );
};

export default memo(PaymentHome);
