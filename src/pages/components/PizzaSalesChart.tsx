import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export type PizzaSale = {
  name: string;
  total: number;
  breakdown: Record<string, number>;
};

interface PizzaSalesChartProps {
  data: PizzaSale[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const sale: PizzaSale = payload[0].payload;
    return (
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12, minWidth: 180, boxShadow: '0 2px 8px #0001' }}>
        <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{sale.name}</div>
        <div style={{ fontSize: 15, marginBottom: 6 }}>Total: <span style={{ color: '#bf1e2d', fontWeight: 'bold' }}>{sale.total}</span></div>
        <div style={{ fontSize: 14, color: '#333' }}>
          {Object.entries(sale.breakdown).map(([hora, unidades]) => (
            <div key={hora} style={{ marginBottom: 2 }}>🕒 {hora} → <b>{unidades}</b></div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PizzaSalesChart: React.FC<PizzaSalesChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={340} >
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
        barCategoryGap={"20%"}
      >
        <XAxis dataKey="name" tick={{ fontSize: 14 }} interval={0} angle={-15} dy={10} />
        <YAxis tick={{ fontSize: 13 }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f7b32b22' }} />
        <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="#bf1e2d">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? '#bf1e2d' : '#f7b32b'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PizzaSalesChart;

