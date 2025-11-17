import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "@mui/material";
import { theme } from "./theme/theme.js";
import { Quill } from 'react-quill';
import ImageResize from 'quill-image-resize-module-react';

Quill.register("modules/imageResize", ImageResize);


createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
);
