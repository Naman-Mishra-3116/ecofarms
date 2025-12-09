import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { memo } from "react";

const client = new QueryClient();

interface IProps {
  children: React.ReactNode;
}

const QueryContext: React.FC<IProps> = ({ children }) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default memo(QueryContext);
