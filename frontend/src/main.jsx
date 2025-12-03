import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { ThemeProvider } from "./contexts/ThemeProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <ThemeProvider>
          <div onContextMenu={(e) => e.preventDefault()}>
            <App />
          </div>
        </ThemeProvider>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);