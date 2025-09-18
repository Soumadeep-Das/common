import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Make sure Tailwind CSS is imported

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
