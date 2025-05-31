import React from "react";
import { Box, Typography, FormControl, Select, MenuItem } from "@mui/material";

interface Props {
  isSheetOpen: boolean;
  filterType: "Pizzas" | "Bebidas";
  setFilterType: React.Dispatch<React.SetStateAction<"Pizzas" | "Bebidas">>;
  setProductFilter: React.Dispatch<React.SetStateAction<string>>;
}

const StickyProductListHeader: React.FC<Props> = ({ isSheetOpen, filterType, setFilterType, setProductFilter }) => {
  if (isSheetOpen) return null;
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(255,255,255,0.95)',
        borderBottom: '1px solid #eee',
      }}
    >
      <Box sx={{
        pt: 2, pb: 1, px: 2,
        display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', gap: 1,
        backgroundColor:'#fdf6e3',
        borderBottom: '1px solid #eee',
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)'
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 , textTransform:'uppercase'}}>
          <Box component="span" aria-hidden sx={{ fontSize: 18, lineHeight: 1 }}>🧾</Box>
          Listado de productos
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value={filterType} onChange={(e) => { setFilterType(e.target.value as any); setProductFilter('Todos'); }}>
              <MenuItem value={'Pizzas'}>Pizzas</MenuItem>
              <MenuItem value={'Bebidas'}>Bebidas</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Box>
  );
};

export default StickyProductListHeader;

