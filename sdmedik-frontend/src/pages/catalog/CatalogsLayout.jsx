import { Box, Container } from "@mui/material";
import React from "react";
import SidebarFilter from "./components/SidebarFilter";
import CatalogDynamicPage from "./components/CatalogDynamicPage";

export default function CatalogsLayout() {
  return (
    <Container sx={{}}>
      <CatalogDynamicPage />
    </Container>
  );
}
