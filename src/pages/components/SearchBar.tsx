// components/SearchBar.tsx
import React from "react";
import { Box, TextField } from "@mui/material";

export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <Box p={2} sx={{ backgroundColor: '#fff' }}>
      <TextField
        fullWidth
        label="Buscar pizza por nombre"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ input: { color: '#111' }, label: { color: '#333' }, fieldset: { borderColor: '#bf1e2d' } }}
      />
    </Box>
  );
}
