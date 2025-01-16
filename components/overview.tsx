"use client";

import {
  Chart as ChartJS,
  registerables,
  ChartOptions
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(...registerables);

interface OverviewProps {
  data: any[];
  customersData: any[];
}

export const Overview: React.FC<OverviewProps> = ({
  data,
  customersData
}) => {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Customers'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Revenue',
        data: data.map((item) => item.total),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Total Customers',
        data: customersData.map((item) => item.total),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
        yAxisID: 'y1',
        tension: 0.4,
        fill: false
      }
    ]
  };

  return (
    <div className="h-[75vh] w-full">
      <Chart 
        type='bar'
        options={options} 
        data={chartData as any} 
      />
    </div>
  );
};
