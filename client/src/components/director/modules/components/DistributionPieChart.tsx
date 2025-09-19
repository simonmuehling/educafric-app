import React from 'react';
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DistributionPieChartProps {
  data: any;
  statusColors: Record<string, string>;
}

const DistributionPieChart: React.FC<DistributionPieChartProps> = ({ data, statusColors }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RPieChart>
        <Pie
          data={Object.entries(data.statusBreakdown || {}).map(([status, count]) => ({
            name: status,
            value: count,
            fill: statusColors[status as keyof typeof statusColors] || '#6b7280'
          }))}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          label={({name, value}) => `${name}: ${value}`}
        >
          {Object.entries(data.statusBreakdown || {}).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={statusColors[entry[0] as keyof typeof statusColors] || '#6b7280'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RPieChart>
    </ResponsiveContainer>
  );
};

export default DistributionPieChart;