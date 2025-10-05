import React from 'react';
import { LineChart as RLineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface TimelineLineChartProps {
  data: any[];
}

const TimelineLineChart: React.FC<TimelineLineChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="sent" stroke="#10b981" name="Réussies" />
        <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Échecs" />
      </RLineChart>
    </ResponsiveContainer>
  );
};

export default TimelineLineChart;