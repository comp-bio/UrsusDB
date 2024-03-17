import React from "react";
import { createRoot } from "react-dom/client";

window.basename = document.querySelector("base").attributes.href.value;

import sizes from "../scss/client.scss";
import Client from "./pages/Client";
console.log("sizes", sizes);

createRoot(document.getElementById("app")).render(<Client />);

if (module.hot) module.hot.accept();
