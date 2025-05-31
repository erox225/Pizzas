import React from 'react';
import { Box, Tabs, Tab, Fade } from '@mui/material';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import LocalBarIcon from '@mui/icons-material/LocalBar';

interface ViewTabsProps {
  viewMode: 'pizzas' | 'drinks';
  setViewMode: (mode: 'pizzas' | 'drinks') => void;
  pizzasContent: React.ReactNode;
  drinksContent: React.ReactNode;
}

const ViewTabs: React.FC<ViewTabsProps> = ({
  viewMode,
  setViewMode,
  pizzasContent,
  drinksContent,
}) => {
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setViewMode(newValue === 0 ? 'pizzas' : 'drinks');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={viewMode === 'pizzas' ? 0 : 1}
        onChange={handleChange}
        centered
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab icon={<LocalPizzaIcon />} label="Pizzas" />
        <Tab icon={<LocalBarIcon />} label="Bebidas" />
      </Tabs>

      <Box sx={{ position: 'relative', minHeight: 500 }}>
        <Fade in={viewMode === 'pizzas'} timeout={300} unmountOnExit>
          <Box sx={{ position: 'absolute', width: '100%' }}>
            {pizzasContent}
          </Box>
        </Fade>
        <Fade in={viewMode === 'drinks'} timeout={300} unmountOnExit>
          <Box sx={{ position: 'absolute', width: '100%' }}>
            {drinksContent}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default ViewTabs;