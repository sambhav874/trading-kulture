'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

export default function SalesChart({ sales }: { sales: { createdAt: string; amount: number }[] }) {
  // Process sales data to group by month and year
  const monthlySales = sales.reduce((acc: Record<string, number>, sale: { createdAt: string; amount: number }) => {
    const date = new Date(sale.createdAt);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`; // Format as MM/YYYY
    acc[monthYear] = (acc[monthYear] || 0) + sale.amount; // Aggregate sales amount
    return acc;
  }, {});

  // Transform data into an array suitable for Recharts
  const chartData = Object.entries(monthlySales).map(([monthYear, amount]) => ({
    monthYear,
    amount,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="monthYear" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="amount" fill="rgba(75, 192, 192, 0.6)" name="Monthly Sales" />
      </BarChart>
    </ResponsiveContainer>
  );
}