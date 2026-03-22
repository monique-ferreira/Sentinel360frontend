import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { InactiveFiles } from "./components/InactiveFiles";
import { SensitiveData } from "./components/SensitiveData";
import { Integrations } from "./components/Integrations";
import { Reports } from "./components/Reports";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "inactive-files", Component: InactiveFiles },
      { path: "sensitive-data", Component: SensitiveData },
      { path: "integrations", Component: Integrations },
      { path: "reports", Component: Reports },
    ],
  },
]);
