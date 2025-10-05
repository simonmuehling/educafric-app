import React from 'react';
import { BarChart as RBarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface SuccessRateBarChartProps {
  data: any;
  channelColors: Record<string, string>;
}

const SuccessRateBarChart: React.FC<SuccessRateBarChartProps> = ({ data, channelColors }) => {
  const chartData = [
    { channel: 'Email', rate: data.distributionRates?.email || 0, fill: channelColors.email },
    { channel: 'SMS', rate: data.distributionRates?.sms || 0, fill: channelColors.sms },
    { channel: 'WhatsApp', rate: data.distributionRates?.whatsapp || 0, fill: channelColors.whatsapp }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RBarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="channel" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value}%`, 'Taux de réussite']} />
        <Bar dataKey="rate" />
      </RBarChart>
    </ResponsiveContainer>
  );
};

export default SuccessRateBarChart;