import { memo } from "react";
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import PaymentFailed from "./components/payment/PaymentFailed";
import PaymentHome from "./components/payment/PaymentHome";
import PaymentSuccess from "./components/payment/PaymentSuccess";

interface IProps {}

const App: React.FC<IProps> = () => {
  const router = createBrowserRouter([
    {
      index: true,
      path: "/",
      element: <PaymentHome />, 
    },
    {
      path: "/success",
      element: <PaymentSuccess />,
    },
    {
      path: "/failure",
      element: <PaymentFailed />,
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default memo(App);
