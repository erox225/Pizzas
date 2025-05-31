import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts";

export type CategoryPoint = { name: string; total: number };

interface Props {
  data: CategoryPoint[];
  color?: string;
  unitSuffix?: string; // e.g., " uds"
  colors?: string[]; // optional palette per category
  colorMap?: Record<string, string>; // optional mapping name -> color
}

const CatTooltip = ({ active, payload, unitSuffix = '' }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as CategoryPoint;
    return (
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 10, boxShadow: '0 2px 8px #0001' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{item.name}</div>
        <div>Total: <b>{item.total}{unitSuffix}</b></div>
      </div>
    );
  }
  return null;
};

const CategoryBarChart: React.FC<Props> = ({ data, color = '#bf1e2d', unitSuffix = '', colors, colorMap }) => {
  const height = Math.max(180, data.length * 44 + 40);

  const getFill = (idx: number, name: string) => {
    if (colorMap && colorMap[name]) return colorMap[name];
    if (colors && colors.length) return colors[idx % colors.length];
    return color;
  };

  const isDark = (hex: string) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return true;
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
    // relative luminance
    const lum = (0.2126*r + 0.7152*g + 0.0722*b)/255;
    return lum < 0.6;
  };

  const ValueLabel = (props: any) => {
    const { x, y, width, height: h, value } = props;
    const tx = (x ?? 0) + Math.max((width ?? 0) - 8, 12);
    const ty = (y ?? 0) + (h ?? 0) / 2;
    const idx = props.index ?? 0;
    const name = data[idx]?.name ?? '';
    const fill = getFill(idx, name);
    return (
      <text x={tx} y={ty} fill={isDark(fill) ? '#fff' : '#1a1a1a'} fontSize={12} fontWeight={700} textAnchor="end" dominantBaseline="middle">
        {value}{unitSuffix}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} tickFormatter={(v: any) => `${v}${unitSuffix}`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 13 }} width={80} />
        <Tooltip content={<CatTooltip unitSuffix={unitSuffix} />} cursor={{ fill: '#00000010' }} />
        <Bar dataKey="total" fill={color} radius={[0, 8, 8, 0]}>
          {data.map((d, idx) => (
            <Cell key={`cell-${idx}`} fill={getFill(idx, d.name)} />
          ))}
          <LabelList dataKey="total" content={<ValueLabel />} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryBarChart;

