import React, { useEffect, useRef } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid, ReferenceLine, LabelList } from "recharts";


export type HourlyPoint = { hour: string; total: number };

interface Props {
  data: HourlyPoint[];
  unitSuffix?: string;
  height?: number;
  showAverage?: boolean;
  highlightHour?: string;
  chartRef?: React.RefObject<HTMLDivElement>;
  highlightBars?: { hour: string; color: string }[];
}

const HourlyTooltip = ({ active, payload, unitSuffix = '' }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as HourlyPoint;
    return (
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 10, boxShadow: '0 2px 8px #0001' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{item.hour}</div>
        <div>Total: <b>{item.total}{unitSuffix}</b></div>
      </div>
    );
  }
  return null;
};

const HourlySalesChart: React.FC<Props> = ({ data, unitSuffix = ' uds', height = 260, showAverage = true, highlightHour, chartRef, highlightBars }) => {
  // ref para el contenedor scrollable
  const containerRef = chartRef || useRef<HTMLDivElement>(null);
  const maxVal = Math.max(...data.map(d => d.total));
  const nonZero = data.filter(d => d.total > 0);
  const avgNZ = nonZero.length ? nonZero.reduce((a, b) => a + b.total, 0) / nonZero.length : 0;
  const chartHeight = Math.max(height, data.length * 36 + 70);
  const ZeroLabel = (props: any) => {
    const { x, y, height: h, value } = props;
    if (value !== 0) return null;
    const tx = (x ?? 0) + 6;
    const ty = (y ?? 0) + (h ?? 0) / 2;
    return (
      <text x={tx} y={ty} fill="#9ca3af" fontSize={11} fontWeight={600} textAnchor="start" dominantBaseline="middle">
        Sin ventas
      </text>
    );
  };
  const ValueLabelInside = (props: any) => {
    const { x, y, width, height: h, value, index } = props;
    if (!width || value === 0) return null;
    if (typeof value === 'number' && value <= avgNZ) return null;
    const tx = (x ?? 0) + Math.max((width ?? 0) - 6, 12);
    const ty = (y ?? 0) + (h ?? 0) / 2;
    const entry = data[index ?? 0];
    let textColor = '#ffffff';
    // Si la barra es color aire, texto negro
    if (Array.isArray(highlightBars)) {
      const isHighlight = highlightBars.some(hb => hb.hour === entry.hour);
      if (!isHighlight) textColor = '#1a1a1a';
    } else {
      textColor = '#1a1a1a';
    }
    return (
      <text x={tx} y={ty} fill={textColor} fontSize={12} fontWeight={700} textAnchor="end" dominantBaseline="middle">
        {value}{unitSuffix}
      </text>
    );
  };
  // Efecto para hacer scroll a un marcador HTML invisible alineado con la barra
  useEffect(() => {
    if (highlightHour && containerRef.current) {
      const marker = containerRef.current.querySelector(
        `[data-hour-marker="${highlightHour}"]`
      );
      if (marker) {
        (marker as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightHour, data]);

  // Renderizar marcadores invisibles alineados con las barras y la gráfica
  // Color aire: #e2e9e3
  const aireColor = '#e2e9e3';
  return (
    <div ref={containerRef} style={{ width: '100%', height: chartHeight, overflowY: 'auto', position: 'relative' }}>
      {/* Marcadores invisibles para scroll, uno por cada hora */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1, height: chartHeight, pointerEvents: 'none', zIndex: 1 }}>
        {data.map((entry, idx) => (
          <div
            key={entry.hour}
            data-hour-marker={entry.hour}
            style={{ height: 36, marginTop: idx === 0 ? 34 : 0 }}
          />
        ))}
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" barCategoryGap="40%" barGap={8} margin={{ top: 10, right: 16, left: 10, bottom: 10 }}>
          <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fontSize: 13 }} allowDecimals={false} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="hour" tick={{ fontSize: 15 }} width={68} axisLine={false} tickLine={false} />
          {showAverage && (
            <ReferenceLine x={avgNZ} stroke="#9ca3af" strokeDasharray="4 4" strokeWidth={2} label={{ value: `Media: ${avgNZ.toFixed(0)}${unitSuffix}` as any, position: 'top', fill: '#6b7280', fontSize: 11 }} />
          )}
          <Tooltip content={<HourlyTooltip unitSuffix={unitSuffix} />} cursor={{ fill: '#00000010' }} />
          <Bar dataKey="total" barSize={28} radius={[0, 8, 8, 0]} fill="#e2e9e3">
            {data.map((entry, idx) => {
              let fill = "#e2e9e3";
              if (Array.isArray(highlightBars)) {
                const found = highlightBars.find(hb => hb.hour === entry.hour);
                if (found) fill = found.color;
              }
              return <Cell key={`cell-${idx}`} fill={fill} />;
            })}
            <LabelList content={<ValueLabelInside />} />
            <LabelList content={<ZeroLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HourlySalesChart;

