import React from "react";
import { Box, Typography, Grow, Button, Chip, Popover, Stack, Tooltip } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import PizzaCardSmall from "./PizzaCardSmall";
import DrinkCard from "./DrinkCard";

interface Props {
  pizzas: any[];
  drinks: any[];
  quantities: Record<string, number>;
  summaryQuantities: Record<string, number>;
  handleIncrement: (id: string) => void;
  handleDecrement: (id: string) => void;
  viewMode: "pizzas" | "drinks";
  selectedOrder: any;
  onToggleView: (mode: "pizzas" | "drinks") => void;
  editMode?: boolean;
}

export default function PizzaDrinkSection({
  pizzas,
  drinks,
  quantities,
  summaryQuantities,
  handleIncrement,
  handleDecrement,
  viewMode,
  selectedOrder,
  onToggleView,
  editMode = false
}: Props) {
  const [shakeIds, setShakeIds] = React.useState<Set<string>>(new Set());
  const lockedNewOrder = !selectedOrder && !!editMode;
  const triggerShake = (id: string) => {
    setShakeIds(prev => new Set(prev).add(id));
    setTimeout(() => setShakeIds(prev => { const next = new Set(prev); next.delete(id); return next; }), 300);
  };
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);

  const toggleFilter = (tag: string) => {
    setSelectedFilters(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const categorize = (list: string[]) => {
    const groups: Record<string, string[]> = {};
    const push = (k: string, v: string) => { if (!groups[k]) groups[k] = []; if (!groups[k].includes(v)) groups[k].push(v); };
    list.forEach((raw) => {
      const v = raw.trim();
      const low = v.toLowerCase();
      if (/(queso|mozzarella|gorgonzola|parmesan|parmigiano|emmental|pecorino|taleggio)/.test(low)) push('Quesos', v);
      else if (/(jamón|pepperoni|salami|longaniza|pollo|speck|bacon|carbonara)/.test(low)) push('Proteínas', v);
      else if (/(tomate|rúcula|cebolla|pimiento|piña|champiñ|berenjena|alcachofa|aceituna|trufa)/.test(low)) push('Verduras', v);
      else if (/(salsa|bbq)/.test(low)) push('Salsas', v);
      else push('Otros', v);
    });
    return groups;
  };

  const availableFilters = React.useMemo(() => {
    if (viewMode === 'pizzas') {
      const all: string[] = [];
      pizzas.forEach((p: any) => (p.ingredients || []).forEach((i: string) => all.push(i)));
      return categorize(all);
    } else {
      const all: string[] = [];
      drinks.forEach((d: any) => (d.tags || []).forEach((t: string) => all.push(t)));
      return { Etiquetas: Array.from(new Set(all)) } as Record<string, string[]>;
    }
  }, [viewMode, pizzas, drinks]);

  const emojiFor = (name: string) => {
    const low = name.toLowerCase();
    if (/tomate|salsa/.test(low)) return '🍅';
    if (/queso|mozzarella|emmental|gorgonzola|parmesan|parmigiano|pecorino|taleggio/.test(low)) return '🧀';
    if (/pollo|jamón|pepperoni|salami|longaniza|bacon|speck/.test(low)) return '🥩';
    if (/rúcula|alcachofa|trufa/.test(low)) return '🌿';
    if (/champiñ|seta/.test(low)) return '🍄';
    if (/pimiento/.test(low)) return '🫑';
    if (/cebolla/.test(low)) return '🧅';
    if (/piña/.test(low)) return '🍍';
    if (/berenjena/.test(low)) return '🍆';
    if (/aceituna/.test(low)) return '🫒';
    if (/fría|hielo|fresco/.test(low)) return '🧊';
    if (/sin alcohol/.test(low)) return '🚫🍺';
    return '🍕';
  };

  const passFilters = (item: any) => {
    if (selectedFilters.length === 0) return true;
    const list = viewMode === 'pizzas' ? (item.ingredients || []) : (item.tags || []);
    return selectedFilters.every(f => list.includes(f));
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 1, alignItems: 'center', pr: 1 }}>
        <Button
          variant="contained"
          onClick={() => onToggleView("pizzas")}
          startIcon={<LocalPizzaIcon />}
          sx={{
            borderRadius: 5,
            textTransform: "none",
            fontWeight: "bold",
            backgroundColor: viewMode === "pizzas" ? "#bf1e2d" : "transparent",
            color: viewMode === "pizzas" ? "#fff" : "#bf1e2d",
            border: "2px solid #bf1e2d",
            mr: 1,
            "&:hover": {
              backgroundColor: viewMode === "pizzas" ? "#a81a26" : "#fce4ec"
            }
          }}
        >
          Pizzas
        </Button>

        <Button
          variant="contained"
          onClick={() => onToggleView("drinks")}
          startIcon={<LocalBarIcon />}
          sx={{
            borderRadius: 5,
            textTransform: "none",
            fontWeight: "bold",
            backgroundColor: viewMode === "drinks" ? "#bf1e2d" : "transparent",
            color: viewMode === "drinks" ? "#fff" : "#bf1e2d",
            border: "2px solid #bf1e2d",
            mr: 1,
            "&:hover": {
              backgroundColor: viewMode === "drinks" ? "#a81a26" : "#fce4ec"
            }
          }}
        >
          Bebidas
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          variant={selectedFilters.length ? "contained" : "outlined"}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold' }}
        >
          Filtrar {selectedFilters.length > 0 && <WarningAmberIcon sx={{ ml: 0.5, fontSize: 18, color: '#ffa000' }} />}
        </Button>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { p: 1.5, borderRadius: 2, minWidth: 220, maxHeight: 350, overflowY: 'auto' } }}
      >
        <Stack spacing={1}>
          {Object.keys(availableFilters).length === 0 && (
            <Typography variant="body2" color="text.secondary">Sin opciones</Typography>
          )}
          {Object.entries(availableFilters).map(([section, tags]) => (
            <Box key={section} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>{section}</Typography>
              <Stack spacing={0.5}>
                {tags.map(tag => (
                  <Chip
                    key={tag}
                    label={(
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{emojiFor(tag)}</span>
                        <span>{tag}</span>
                      </Box>
                    )}
                    onClick={() => toggleFilter(tag)}
                    color={selectedFilters.includes(tag) ? 'primary' : 'default'}
                    variant={selectedFilters.includes(tag) ? 'filled' : 'outlined'}
                    sx={{ width: '100%', justifyContent: 'flex-start' }}
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Popover>

      <Box sx={{ maxHeight: "calc(100vh - 293px)", overflowY: "auto", overflowX: "hidden", pr: 1 }}>
        <style>{`
          @keyframes cardShake { 0%{transform:translateX(0)} 20%{transform:translateX(-2px)} 40%{transform:translateX(2px)} 60%{transform:translateX(-2px)} 80%{transform:translateX(2px)} 100%{transform:translateX(0)} }
        `}</style>
        {viewMode === "pizzas" && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 3,
              mt: 2
            }}
          >
            {[...pizzas]
              .filter(passFilters)
              .map((pizza) => {
                const picked = summaryQuantities[pizza.id] || 0;
                const baseSlices = typeof (pizza as any).slices === 'number'
                  ? (pizza as any).slices
                  : (typeof (pizza as any).availableSlices === 'number' ? (pizza as any).availableSlices : 8);
                const remaining = Math.max(baseSlices - picked, 0);
                const isInOrder = picked > 0;
                const lockOthers = !!selectedOrder && (selectedOrder.estado === 'Preparando' || selectedOrder.estado === 'Entregado');
                const dimThis = lockOthers && !isInOrder;
                return (
                  <Grow in key={pizza.id}>
                    {(dimThis) ? (
                      <Tooltip title="No pertenece a esta orden" arrow placement="top" disableInteractive enterTouchDelay={500} leaveTouchDelay={1200}>
                        <div style={{ position: 'relative', animation: lockedNewOrder && shakeIds.has(pizza.id) ? 'cardShake 0.3s' : undefined, cursor: (lockedNewOrder || dimThis) ? 'not-allowed' : undefined, opacity: (lockedNewOrder || dimThis) ? 0.6 : 1, filter: dimThis ? 'grayscale(0.3)' : 'none' }}>
                          <PizzaCardSmall
                            pizza={pizza}
                            quantity={picked}
                            onIncrement={() => {
                              if (lockedNewOrder) { triggerShake(pizza.id); return; }
                              if (remaining <= 0) { triggerShake(pizza.id); return; }
                              if (dimThis) { triggerShake(pizza.id); return; }
                              handleIncrement(pizza.id);
                            }}
                            onDecrement={() => (lockedNewOrder || dimThis) ? triggerShake(pizza.id) : handleDecrement(pizza.id)}
                            isInOrder={isInOrder}
                            disabled={lockedNewOrder || dimThis}
                            availableSlices={remaining}
                            disableIncrement={remaining <= 0 || dimThis}
                          />
                          {lockedNewOrder && (
                            <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'linear-gradient(0deg, rgba(255,255,255,0.35), rgba(255,255,255,0.35))', pointerEvents: 'none' }} />
                          )}
                          {dimThis && (
                            <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'linear-gradient(0deg, rgba(255,255,255,0.25), rgba(255,255,255,0.25))', pointerEvents: 'none' }} />
                          )}
                        </div>
                      </Tooltip>
                    ) : (
                        <div style={{ position: 'relative', animation: lockedNewOrder && shakeIds.has(pizza.id) ? 'cardShake 0.3s' : undefined, cursor: (lockedNewOrder || dimThis) ? 'not-allowed' : undefined, opacity: (lockedNewOrder || dimThis) ? 0.6 : 1, filter: dimThis ? 'grayscale(0.3)' : 'none' }}>
                          <PizzaCardSmall
                            pizza={pizza}
                            quantity={picked}
                            onIncrement={() => {
                              if (lockedNewOrder) { triggerShake(pizza.id); return; }
                              if (remaining <= 0) { triggerShake(pizza.id); return; }
                              if (dimThis) { triggerShake(pizza.id); return; }
                              handleIncrement(pizza.id);
                            }}
                            onDecrement={() => (lockedNewOrder || dimThis) ? triggerShake(pizza.id) : handleDecrement(pizza.id)}
                            isInOrder={isInOrder}
                            disabled={lockedNewOrder || dimThis}
                            availableSlices={remaining}
                            disableIncrement={remaining <= 0 || dimThis}
                          />
                          {lockedNewOrder && (
                            <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'linear-gradient(0deg, rgba(255,255,255,0.35), rgba(255,255,255,0.35))', pointerEvents: 'none' }} />
                          )}
                          {dimThis && (
                            <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'linear-gradient(0deg, rgba(255,255,255,0.25), rgba(255,255,255,0.25))', pointerEvents: 'none' }} />
                          )}
                        </div>
                    )}
                  </Grow>
                );
              })}
          </Box>
        )}

        {viewMode === "drinks" && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 3,
              pt: 1.5
            }}
          >
            {drinks.filter(passFilters).map((drink) => {
              const isInOrder = (summaryQuantities[drink.id] || 0) > 0;
              const lockOthers = !!selectedOrder && (selectedOrder.estado === 'Preparando' || selectedOrder.estado === 'Entregado');
              const dimThis = lockOthers && !isInOrder;
              return (
              <Grow in key={drink.id}>
                {dimThis ? (
                  <Tooltip title="No pertenece a esta orden" arrow placement="top" disableInteractive enterTouchDelay={500} leaveTouchDelay={1200}>
                    <div style={{ position: 'relative', animation: lockedNewOrder && shakeIds.has(drink.id) ? 'cardShake 0.3s' : undefined, cursor: (lockedNewOrder || dimThis) ? 'not-allowed' : undefined, opacity: (lockedNewOrder || dimThis) ? 0.6 : 1, filter: dimThis ? 'grayscale(0.3)' : 'none' }}>
                      <DrinkCard
                        drink={drink}
                        quantity={summaryQuantities[drink.id] || 0}
                        onIncrement={() => (lockedNewOrder || dimThis) ? triggerShake(drink.id) : handleIncrement(drink.id)}
                        onDecrement={() => (lockedNewOrder || dimThis) ? triggerShake(drink.id) : handleDecrement(drink.id)}
                        disabled={lockedNewOrder || dimThis}
                        isInOrder={isInOrder}
                      />
                      {lockedNewOrder && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'linear-gradient(0deg, rgba(255,255,255,0.35), rgba(255,255,255,0.35))', pointerEvents: 'none' }} />
                      )}
                      {dimThis && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'linear-gradient(0deg, rgba(255,255,255,0.25), rgba(255,255,255,0.25))', pointerEvents: 'none' }} />
                      )}
                    </div>
                  </Tooltip>
                ) : (
                  <div style={{ position: 'relative', animation: lockedNewOrder && shakeIds.has(drink.id) ? 'cardShake 0.3s' : undefined, cursor: (lockedNewOrder || dimThis) ? 'not-allowed' : undefined, opacity: (lockedNewOrder || dimThis) ? 0.6 : 1, filter: dimThis ? 'grayscale(0.3)' : 'none' }}>
                    <DrinkCard
                      drink={drink}
                      quantity={summaryQuantities[drink.id] || 0}
                      onIncrement={() => (lockedNewOrder || dimThis) ? triggerShake(drink.id) : handleIncrement(drink.id)}
                      onDecrement={() => (lockedNewOrder || dimThis) ? triggerShake(drink.id) : handleDecrement(drink.id)}
                      disabled={lockedNewOrder || dimThis}
                      isInOrder={isInOrder}
                    />
                    {lockedNewOrder && (
                      <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'linear-gradient(0deg, rgba(255,255,255,0.35), rgba(255,255,255,0.35))', pointerEvents: 'none' }} />
                    )}
                    {dimThis && (
                      <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'linear-gradient(0deg, rgba(255,255,255,0.25), rgba(255,255,255,0.25))', pointerEvents: 'none' }} />
                    )}
                  </div>
                )}
              </Grow>
            );})}
          </Box>
        )}
      </Box>
    </Box>
  );
}
