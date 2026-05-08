import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./styles.css"

/*
React entry point. Wrap App in BrowserRouter so any route hooks/links work
anywhere in the tree, and in StrictMode to surface side-effect bugs early
(it intentionally double-invokes effects in dev).
*/
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
