import React from "react";
import { Box } from "@mui/material";
import HomePage from "../components/HomePage";

export default function Home() {
  return (
    <Box className="body-borderless" sx={{ marginLeft: "-265px !important" }}>
      <HomePage />
    </Box>
  );
}
