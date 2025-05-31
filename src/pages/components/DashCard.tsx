import React from "react";
import { Card, Box, Typography } from "@mui/material";

interface DashCardProps {
  title: string;
  icon?: React.ReactNode;
  headerBg?: string;
  headerColor?: string;
  onClick?: () => void;
  solid?: boolean;
  solidBg?: string;
  solidColor?: string;
  mainValue: string | number;
  mainUnit?: string | React.ReactNode;
  caption?: string;
}

const DashCard: React.FC<DashCardProps> = ({ title, icon, headerBg = '#ffe5e9', headerColor = '#bf1e2d', onClick, solid = false, solidBg = '#1976d2', solidColor = '#fff', mainValue, mainUnit, caption }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        minWidth: 140,
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        background: solid ? solidBg : '#fff',
        backgroundImage: solid ? 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(0,0,0,0.06))' : undefined,
        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        borderRadius: '14px',
        border: solid ? 'none' : `0.5px solid ${headerColor}`,
        transition: 'transform .1s ease, box-shadow .1s ease',
        '&:hover': onClick ? { transform: 'translateY(-1px)', boxShadow: '0 10px 24px rgba(0,0,0,0.14)' } : undefined,
        '&:active': onClick ? { transform: 'translateY(0)' } : undefined,
      }}
    >
      {!solid && (
        <Box
          sx={{
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            background: headerBg,
            color: headerColor,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: headerColor, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3 }}>{title}</Typography>
        </Box>
      )}
      <Box sx={{ px: 2, py: 1.2, display: 'flex', flexDirection: 'column', alignItems: solid ? 'flex-start' : 'center', textAlign: solid ? 'left' : 'center', color: solid ? solidColor : 'inherit' }}>
        {solid && (
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: solidColor, fontSize: 18, mb: 0.25 }}>
            {title}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          {icon && <Box sx={{ fontSize: 26, color: solid ? solidColor : headerColor }}>{icon}</Box>}
          <Typography variant="h3" sx={{ fontWeight: 800, color: solid ? solidColor : headerColor, fontSize: '1.3rem', m: 0 }}>
            {mainValue}{mainUnit && <span style={{ fontSize: 22, marginLeft: 6 }}>{mainUnit}</span>}
          </Typography>
        </Box>
        {caption && (
          <Typography variant="caption" sx={{ color: solid ? 'rgba(255,255,255,0.85)' : '#888' }}>{caption}</Typography>
        )}
      </Box>
    </Card>
  );
};

export default DashCard;

