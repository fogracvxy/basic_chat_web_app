import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
// Assuming your HTML file has a div with id="root"
const container = document.getElementById("root");
const root = createRoot(container!); // '!' to assert that it's non-null

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App  />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
