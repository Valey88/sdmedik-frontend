import { Box, Container } from "@mui/material";
import React from "react";
import SidebarFilter from "./components/SidebarFilter";
import CatalogDynamicPage from "./components/CatalogDynamicPage";
import CatalogDynamicCertificatePage from "./components/CatalogDynamicCertificatePage";

export default function CatalogsCertificateLayout() {
  return (
    <Container sx={{ widh: "1540px" }}>
      <CatalogDynamicCertificatePage />
    </Container>
  );
}
