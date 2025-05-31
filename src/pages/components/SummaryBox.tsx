import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  color?: string;
  bg?: string;
  strong?: boolean;
}

const SummaryBox: React.FC<Props> = ({ title, value, subtitle, color, bg, strong }) => (
  <Box sx={{ mt: 1, p: 2, background: bg || '#f1f5f9', borderRadius: 2, border: '1px solid #0001' }}>
    <Typography variant="subtitle2" sx={{ color: color || '#475569', fontWeight: 700, mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant={strong ? "h5" : "h6"} sx={{ fontWeight: 800, color: color || '#222' }}>
      {value}
    </Typography>
    {subtitle && <Typography variant="caption" sx={{ color: '#555' }}>{subtitle}</Typography>}
  </Box>
);

export default SummaryBox;

