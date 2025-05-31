import React, { useState, useRef } from "react";
import {
  Paper,
  Typography,
  Box,
  Collapse,
  Menu,
  MenuItem,
  Fade,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import "react-vertical-timeline-component/style.min.css";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";

import type { KitchenOrderRecord } from "../kitchen.types";

const Historial: React.FC<{ historial: KitchenOrderRecord[] }> = ({ historial }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("Todas");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleExpanded = (idx: number) => {
    setExpandedIndex(prev => (prev === idx ? null : idx));
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMenuItemClick = (status: string) => {
    setFilterStatus(status);
    handleClose();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        backgroundColor: "#2b2b2b",
        color: "#212121",
        boxSizing: "border-box",
        p: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      ref={containerRef}
    >
      <Box display="flex" alignItems="center" mb={2} sx={{ pl: 1 }}>
        <FilterAltIcon
          sx={{ color: "#e65100", mr: 1, cursor: "pointer" }}
          aria-controls={open ? 'fade-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        />
        <Typography variant="h5" fontWeight="bold" color="#fff">
          PEDIDOS
        </Typography>
        <Menu
          id="fade-menu"
          MenuListProps={{
            'aria-labelledby': 'fade-button',
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          TransitionComponent={Fade}
        >
          <MenuItem selected={filterStatus === "Todas"} onClick={() => handleMenuItemClick("Todas")}>Todas</MenuItem>
          <MenuItem selected={filterStatus === "Preparando"} onClick={() => handleMenuItemClick("Preparando")}>Preparando</MenuItem>
          <MenuItem selected={filterStatus === "Entregado"} onClick={() => handleMenuItemClick("Entregado")}>Entregado</MenuItem>
        </Menu>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          pr: 1,
        }}
        ref={containerRef}
      >
      <VerticalTimeline layout="1-column" lineColor="#fb8c00" className="custom-timeline">
        {[...historial]
          .sort((a, b) => b.time.localeCompare(a.time))
          .filter(record => filterStatus === "Todas" || record.status === filterStatus)
          .map((record, idx) => {
          const originalIndex = historial.findIndex(item => item.id === record.id);
          return (
          <VerticalTimelineElement
            key={record.id}
            
            contentStyle={{
              background: "#FCE5BB",
              borderRadius: "42px 5px 5px 42px",
              boxShadow: "none",
              borderRight: "4px solid grey"
            }}
            contentArrowStyle={{ display: "none" }}
            iconStyle={{
              background: "#fff",
              color: "#fb8c00",
              boxShadow: record.status === "Preparando" ? "0 0 0 4px #fb8c00" : "0 0 0 4px #43a047",
              width: "20px",
              height: "20px",
              marginLeft: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop : "42px",
              
            }}
            icon={
              <Typography variant="h6" color="black" fontWeight="bold">
                {historial.length - originalIndex}
              </Typography>
            }
          >
            <Box
              onClick={() => toggleExpanded(idx)}
              sx={{
                cursor: "pointer",
                py: 0.5,
                px: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 0.5,

              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography
                    component="div"
                    sx={{ fontSize: "1.2rem", fontWeight: 600, color: "text.primary" }}
                  >
                    Orden #{record.id}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#555",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  {expandedIndex === idx ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1} ml="32px">
                <AccessTimeIcon sx={{ color: "#f57c00", fontSize: 18 }} />
                <Typography variant="caption" fontWeight={500} color="text.secondary">
                  {record.time}
                </Typography>
   <Box
                  sx={{
                    backgroundColor: record.status === "Preparando" ? "#fb8c00" : "#43a047",
                    color: "#fff",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    px: 1,
                    py: 0.2,
                    borderRadius: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  {record.status}
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1} ml="32px">
     
               
              </Box>
            </Box>
            <Collapse in={expandedIndex === idx} timeout="auto" unmountOnExit>
              <Box>
                {record.pizzas.map((pizza, i) => (
                  <Box
                    key={i}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ pr: 2 }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {pizza.name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box display="flex">
                        {Array.from({ length: pizza.quantity }).map((_, j) => (
                          <span key={j} style={{ fontSize: "18px" }}>🍕</span>
                        ))}
                      </Box>
                      <Box
                        sx={{
                          backgroundColor: "#555",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.8rem",
                        }}
                      >
                        {pizza.quantity}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </VerticalTimelineElement>
        )})}
      </VerticalTimeline>
      </Box>
    <style>
      {`
        .custom-timeline::before {
          background: #fb8c00;
          width: 6px;
          left: 20px;
          top: 0;
          bottom: 0;
        }
      `}
    </style>
    </Paper>
  );
};

export default Historial;
