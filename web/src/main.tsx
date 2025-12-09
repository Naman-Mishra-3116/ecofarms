import { StrictMode } from "react";
import "@mantine/core/styles.css";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { MantineProvider } from "@mantine/core";
import QueryContext from "./context/QueryContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <QueryContext>
        <App />
      </QueryContext>
    </MantineProvider>
  </StrictMode>
);
