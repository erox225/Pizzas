import React from "react";
import { Box } from "@mui/material";

interface Props {
  children: React.ReactNode;
}

const ProductList: React.FC<Props> = ({ children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
      gap: 2,
      mt: 1,
    }}
  >
    {children}
  </Box>
);

export default ProductList;

