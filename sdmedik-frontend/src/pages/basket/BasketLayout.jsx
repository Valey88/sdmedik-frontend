import { Box, Container } from "@mui/material";
import React from "react";
import Basket from "./components/Basket";
import RightBar from "./components/RightBar";

export default function BasketLayout() {
  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gridGap: { xs: 30, md: 0 },
          flexDirection: { xs: "column-reverse", lg: "unset" },
          mt: 5,
          mb: 5,
        }}
      >
        <Basket />
        <RightBar />
      </Box>
    </Container>
  );
}
