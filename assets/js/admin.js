import React from "react";
import { createRoot } from "react-dom/client";

window.basename = "/";

import sizes from "../scss/admin.scss";
import Admin from "./pages/Admin";
console.log("sizes", sizes);

createRoot(document.getElementById("app")).render(<Admin />);

if (module.hot) module.hot.accept();
