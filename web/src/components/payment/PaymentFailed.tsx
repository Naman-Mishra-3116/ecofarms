import { memo } from "react";

interface IProps {}

const PaymentFailed: React.FC<IProps> = () => {
  return <>Payment could not be processed</>;
};

export default memo(PaymentFailed);