import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts";

export type WeeklyPoint = { day: string; total: number };

interface WeeklySalesChartProps {
  data: WeeklyPoint[];
  color?: string;
  highlightColor?: string;
  highlightDay?: string; // e.g., 'Lun'
  unitSuffix?: string; // e.g., " uds"
}

const WeeklyTooltip = ({ active, payload, unitSuffix = '' }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as WeeklyPoint;
    return (
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 10, boxShadow: '0 2px 8px #0001' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{item.day}</div>
        <div>Total: <b>{item.total}{unitSuffix}</b></div>
      </div>
    );
  }
  return null;
};

const WeeklySalesChart: React.FC<WeeklySalesChartProps> = ({ data, color = '#bf1e2d', highlightColor = '#f7b32b', highlightDay, unitSuffix = '' }) => {
  const today = highlightDay; // highlight only if provided from parent (by date)
  const ValueLabel = (props: any) => {
    const { x, y, width, height, value, index } = props;
    const tx = (x ?? 0) + Math.max((width ?? 0) - 8, 12);
    const ty = (y ?? 0) + (height ?? 0) / 2;
    const isHighlight = data?.[index ?? 0]?.day === today;
    const fillColor = isHighlight ? '#1a1a1a' : '#ffffff';
    // Si el unitSuffix es ' €' o incluye euro, lo mostramos siempre
    return (
      <text x={tx} y={ty} fill={fillColor} fontSize={12} fontWeight={600} textAnchor="end" dominantBaseline="middle">
        {value}€
      </text>
    );
  };
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
      >
        <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} tickFormatter={(v:any) => `${v}${unitSuffix}`} />
        <YAxis type="category" dataKey="day" tick={{ fontSize: 13 }} width={40} />
        <Tooltip content={<WeeklyTooltip unitSuffix={unitSuffix} />} cursor={{ fill: '#00000010' }} />
        <Bar dataKey="total" fill={color} radius={[0, 8, 8, 0]}>
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.day === today ? highlightColor : color} />
          ))}
          <LabelList dataKey="total" content={<ValueLabel />} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklySalesChart;

