import React from "react";
import { Card, Typography } from "@mui/material";

interface Props {
  name: string;
  total: number;
  price?: number;
  color?: string;
  onClick?: () => void;
}

const ProductCard: React.FC<Props> = ({ name, total, price, color, onClick }) => (
  <Card
    sx={{ p: 2, cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow 0.2s', ':hover': { boxShadow: onClick ? 6 : undefined, background: onClick ? '#fffbe7' : undefined } }}
    onClick={onClick}
  >
    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: color || '#222', mb: 1 }}>
      {name}
    </Typography>
    <Typography variant="body2" sx={{ color: '#888' }}>Unidades: <b>{total}</b></Typography>
    {price !== undefined && (
      <Typography variant="body2" sx={{ color: '#888' }}>Total €: <b>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total * price)}</b></Typography>
    )}
  </Card>
);

export default ProductCard;

