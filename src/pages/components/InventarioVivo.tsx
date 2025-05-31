import React from "react";
import {
  Card,
  Typography,
  Box,
  LinearProgress,
  LinearProgressProps,
  Chip,
  Button,
  ButtonGroup,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CloseIcon from "@mui/icons-material/Close";
// removed trend/fast icons

export interface Pizza {
  id: number;
  name: string;
  slices: number;
  highlight?: { badge: string; label: string; color: string; value?: string, borderColor: string };
}

function InventoryBar(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ width: "100%", mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={props.value}
        sx={{
          height: 8,
          borderRadius: 5,
          backgroundColor: "#424242",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#ff7043",
          },
        }}
      />
    </Box>
  );
}

interface InventarioVivoProps {
  pizzas: Pizza[];
  onPizzaClick: (pizza: Pizza) => void;
  selectedPizzaName: string;
}

const InventarioVivo: React.FC<InventarioVivoProps> = ({
  pizzas,
  onPizzaClick,
  selectedPizzaName,
}) => {
  const [tipo, setTipo] = React.useState<'Todas' | 'Clásicas' | 'BBQ' | 'Veggie' | 'Especiales'>('Todas');
  const [orden, setOrden] = React.useState<'Por defecto' | 'Más trozos' | 'Menos trozos' | 'A-Z' | 'Z-A'>('Por defecto');
  // Blink cuando una pizza pasa a 0 trozos
  const [blinkZero, setBlinkZero] = React.useState<Set<number>>(new Set());
  const prevSlicesRef = React.useRef<Record<number, number>>({});

  const categoriaDe = (name: string): 'Clásicas' | 'BBQ' | 'Veggie' | 'Especiales' => {
    const n = (name || '').toLowerCase();
    if (n.includes('bbq')) return 'BBQ';
    if (/veggie|vegana|vegetal/.test(n)) return 'Veggie';
    if (/trufa|cuatro quesos|4 quesos|diavola|prosciutto|margar|margarita|margherita|pepperoni|hawaiana|hawai|carbonara/.test(n)) return 'Clásicas';
    return 'Especiales';
  };

  const filtered = React.useMemo(() => {
    let arr = [...pizzas];
    if (tipo !== 'Todas') arr = arr.filter(p => categoriaDe(p.name) === tipo);
    switch (orden) {
      case 'Más trozos':
        arr.sort((a,b) => (b.slices||0) - (a.slices||0)); break;
      case 'Menos trozos':
        arr.sort((a,b) => (a.slices||0) - (b.slices||0)); break;
      case 'A-Z':
        arr.sort((a,b) => a.name.localeCompare(b.name)); break;
      case 'Z-A':
        arr.sort((a,b) => b.name.localeCompare(a.name)); break;
    }
    return arr;
  }, [pizzas, tipo, orden]);

  React.useEffect(() => {
    const prev = prevSlicesRef.current;
    const now: Record<number, number> = {};
    const becameZero: number[] = [];
    pizzas.forEach(p => {
      now[p.id] = p.slices;
      if ((prev[p.id] ?? p.slices) > 0 && p.slices === 0) becameZero.push(p.id);
    });
    if (becameZero.length) {
      setBlinkZero(prevSet => {
        const next = new Set(prevSet);
        becameZero.forEach(id => {
          next.add(id);
          setTimeout(() => {
            setBlinkZero(curr => { const copy = new Set(curr); copy.delete(id); return copy; });
          }, 1000);
        });
        return next;
      });
    }
    prevSlicesRef.current = now;
  }, [pizzas]);

  const tipoColor = (t: 'Clásicas' | 'BBQ' | 'Veggie' | 'Especiales') => {
    switch (t) {
      case 'Clásicas':
        return { bg: '#1976d2', border: '#90caf9' };
      case 'BBQ':
        return { bg: '#bf360c', border: '#ffab91' };
      case 'Veggie':
        return { bg: '#2e7d32', border: '#a5d6a7' };
      default:
        return { bg: '#6a1b9a', border: '#ce93d8' };
    }
  };

  // Handler para navegación
  const handleNavChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "Cocina") {
      window.location.href = "/cocina";
    } else if (value === "Barra") {
      window.location.href = "/barra";
    } else if (value === "Dashboard") {
      window.location.href = "/dashboard";
    }
  };

  return (
    <>
      <style>{`
        /* Borde rojo: se desvanece a 0 y vuelve suave */
        @keyframes borderFlashRed {
          0% { border-color: rgba(183,28,28,1); border-width: 1px; }
          50% { border-color: rgba(183,28,28,0); border-width: 0px; }
          100% { border-color: rgba(183,28,28,1); border-width: 1px; }
        }
        /* Efecto flotante sutil para los números */
        @keyframes floatDigits {
          0% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
          100% { transform: translateY(0); }
        }
        /* Aparición al cambiar los números */
        @keyframes numberChange {
          0% { transform: translateY(4px) scale(0.94); opacity: 0; }
          60% { transform: translateY(-1px) scale(1.06); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
      <Card
      sx={{
        backgroundColor: "#1e1e1e",
        borderRadius: 4,
        p: 3,
        boxShadow: 4,
        fontFamily: "'Roboto Slab', serif",
        color: "#fff",
        mt: 2,
        transition: 'box-shadow 240ms cubic-bezier(.22,.8,.36,1)'
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "#ffa726" }}
        >
          📊 Inventario en Vivo
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#3a3a3a",
              borderRadius: "999px",
              border: "2px solid #b0b0b0",
              px: 2,
              py: 0.5,
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 18, color: "#b0b0b0", mr: 1 }} />
            <Typography variant="caption" sx={{ color: "#ffffff", textTransform: "uppercase" }}>
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                  day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#3a3a3a",
              borderRadius: "999px",
              border: "2px solid #b0b0b0",
              px: 2,
              py: 0.5,
            }}
          >
            <span style={{ fontSize: "20px", marginRight: "8px" }}>🍕</span>
            <Typography variant="body1" sx={{ color: "white", fontWeight: "bold" }}>
              0
            </Typography>
          </Box>
          {/* filtros antiguos eliminados: ahora usamos chips + botones debajo */}
        </Box>
      </Box>

      {/* Controles de filtro/orden (fijos arriba, fuera del scroll) */}
      <Box sx={{ width: '100%', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {['Todas','Clásicas','BBQ','Veggie','Especiales'].map(t => (
            <Chip
              key={t}
              label={t}
              onClick={() => setTipo(t as any)}
              color={tipo === t ? 'warning' : undefined}
              variant={tipo === t ? 'filled' : 'outlined'}
              sx={{
                borderColor: '#666',
                color: '#fff',
                '&.MuiChip-filled': { backgroundColor: '#bf1e2d', color: '#fff' }
              }}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#bbb' }}>Ordenar:</Typography>
          <ButtonGroup size="small" variant="outlined">
            <Button
              onClick={() => setOrden('Más trozos')}
              sx={{ color: '#fff', borderColor: '#666', backgroundColor: orden === 'Más trozos' ? '#37474f' : 'transparent' }}
            >Más trozos</Button>
            <Button
              onClick={() => setOrden('Menos trozos')}
              sx={{ color: '#fff', borderColor: '#666', backgroundColor: orden === 'Menos trozos' ? '#37474f' : 'transparent' }}
            >Menos trozos</Button>
          </ButtonGroup>
        </Box>
      </Box>

      <Box sx={{ display: "flex", overflowX: "auto", gap: 4, pb: 2, pt: 2 }}>
        {filtered.map((pizza, index) => {
          // Degradado según cantidad de trozos (0-16), misma gama, claro-oscuro
          const max = 16;
          const t = Math.max(0, Math.min(1, (pizza.slices || 0) / max));
          const hue = 20; // gama cálida
          const sat = 80; // saturación
          const light = 30 + t * 30; // 30% a 60%
          const start = `hsl(${hue} ${sat}% ${Math.min(light + 8, 70)}%)`;
          const end = `hsl(${hue} ${sat}% ${Math.max(light - 8, 15)}%)`;
          const isSelected = pizza.name === selectedPizzaName;
          const startSel = `hsl(${hue} ${sat}% ${Math.min(light + 14, 78)}%)`;
          const endSel = `hsl(${hue} ${sat}% ${Math.max(light - 14, 12)}%)`;
          const avgLight = (Math.min(light + 8, 70) + Math.max(light - 8, 15)) / 2;
          const textColor = avgLight < 45 ? '#fff' : '#333';
          const twoDigits = String(Math.max(0, pizza.slices || 0)).padStart(2, '0');
          const isZero = twoDigits === '00';
          const liftY = isSelected ? -6 : 0;

          // badges removed

          return (
            <Box
              key={index}
              sx={{ width: 230, minWidth: 230, flex: "0 0 auto", position: "relative", cursor: "pointer", ...(index === 0 ? { ml: '16px' } : {}) }}
              onClick={() => onPizzaClick(pizza)}
            >
              <Card
                sx={{
                  p: 1.8,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${isSelected ? startSel : start}, ${isSelected ? endSel : end})`,
                  boxShadow: isSelected
                    ? '0 6px 18px rgba(0,0,0,0.35), 0 0 0 3px rgba(249,244,234,0.12)'
                    : 3,
                  color: textColor,
                  transition: 'transform 200ms cubic-bezier(.22,.8,.36,1), box-shadow 240ms cubic-bezier(.22,.8,.36,1), background 240ms cubic-bezier(.22,.8,.36,1), border-color 240ms cubic-bezier(.22,.8,.36,1)',
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  borderColor: isSelected ? 'rgba(249,244,234,0.4)' : 'transparent',
                  overflow: 'visible'
                }}
              >
                {/* Número grande sobresaliendo a la izquierda */}
                <Box sx={{ position: 'relative', minHeight: 50 }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: isZero ? '50%' : -32,
                      top: isZero ? -52 : -15,
                      transform: isZero ? 'translateX(-50%)' : 'none',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 0.5,
                      zIndex: 2,
                      transition: 'left 260ms cubic-bezier(.22,.8,.36,1), top 260ms cubic-bezier(.22,.8,.36,1), transform 260ms cubic-bezier(.22,.8,.36,1)',
                      willChange: 'left, top, transform'
                    }}
                  >
                    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 0.5 }}>
                      <Typography
                        key={twoDigits}
                        component="div"
                        sx={{
                          fontSize: 71,
                          fontWeight: 900,
                          fontFamily: "'Jost','Futura PT','Futura','Avenir Next','Montserrat','Arial Black',sans-serif",
                          letterSpacing: 0.5,
                          lineHeight: 1,
                          color: '#f9f4ea',
                          filter: pizza.name === selectedPizzaName
                            ? 'drop-shadow(0 8px 14px rgba(0,0,0,0.22)) drop-shadow(0 3px 6px rgba(0,0,0,0.30))'
                            : 'drop-shadow(0 6px 10px rgba(0,0,0,0.18)) drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
                          animation: 'numberChange 260ms cubic-bezier(.22,.8,.36,1)',
                          transform: `translateZ(0) translateY(${pizza.name === selectedPizzaName ? -6 : 0}px)`,
                          transition: 'transform 220ms cubic-bezier(.22,.8,.36,1), filter 220ms cubic-bezier(.22,.8,.36,1)'
                        }}
                      >
                        {isZero ? (
                          <CloseIcon sx={{ fontSize: 115, color: '#ff1744' }} />
                        ) : (
                          twoDigits
                        )}
                      </Typography>
                    </Box>
                    {!isZero && (
                    <Typography
                      component="span"
                      sx={{
                        mt: '41px',
                        fontSize: 10,
                        fontWeight: 800,
                        color: '#f9f4ea',
                        opacity: 0.85,
                        letterSpacing: 0.6,
                        textTransform: 'lowercase'
                      }}
                    >
                      uds.
                    </Typography>
                    )}
                  </Box>
                </Box>
                {/* Nombre del producto en la fila siguiente */}
                <Typography
                  sx={{
                    mt: 0.25,
                    fontWeight: 700,
                    fontSize: 18,
                    color: '#f9f4ea',
                    fontFamily: "'Inter','Montserrat','Jost','Manrope','Roboto Slab',sans-serif",
                    letterSpacing: 0.2,
                    textTransform: 'none',
                    lineHeight: 1.15
                  }}
                >
                  {pizza.name}
                </Typography>

                {/* Barra progresiva inferior (5 puntos coloreados por criticidad + símbolo "+" si supera) */}
                {(() => {
                  const STEP = 8; // tamaño por "Pizza hecha"
                  const MAX_POINTS = 5;
                  const multiples = Math.floor((pizza.slices || 0) / STEP);
                  const filled = Math.min(MAX_POINTS, multiples);
                  const COLORS = ['#ff1744', '#ff6d00', '#ffd600', '#64dd17', '#00c853'];
                  return (
                    <Box sx={{ mt: 1.2, display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          position: 'relative',
                          height: 7,
                          borderRadius: 999,
                          background: 'rgba(255,255,255,0.12)',
                          flex: '1 1 auto'
                        }}
                      >
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
                          {Array.from({ length: MAX_POINTS }).map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 22,
                                height: 5,
                                borderRadius: 999,
                                backgroundColor: COLORS[i],
                                opacity: i < filled ? 1 : 0.4,
                                transition: 'opacity 260ms ease, transform 200ms ease, box-shadow 200ms ease',
                                transform: i < filled ? 'scale(1)' : 'scale(0.98)',
                                boxShadow: i < filled
                                  ? '0 0 0 1px rgba(255,255,255,0.15) inset, 0 1px 2px rgba(0,0,0,0.35)'
                                  : '0 0 0 1px rgba(255,255,255,0.08) inset'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  );
                })()}
              </Card>
            </Box>
          );
        })}
      </Box>
      </Card>
    </>
  );
};

export default InventarioVivo;
