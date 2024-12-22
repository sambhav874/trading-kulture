'use client'
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SalesChart({ sales }) {
  const monthlySales = sales.reduce((acc, sale) => {
    const date = new Date(sale.createdAt);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    acc[monthYear] = (acc[monthYear] || 0) + sale.amount;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(monthlySales),
    datasets: [
      {
        label: 'Monthly Sales',
        data: Object.values(monthlySales),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Sales Overview'
      }
    }
  };

  return <Bar options={options} data={data} />;
}

