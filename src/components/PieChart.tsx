import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
    }[];
  };
  options?: any;
}

const PieChart: React.FC<PieChartProps> = ({ data, options }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = data.labels[context.dataIndex];
            const value = context.parsed;
            return `${label}: R$ ${value.toFixed(2)}`;
          }
        }
      },
      legend: {
        display: false
      }
    }
  };

  return <Doughnut data={data} options={options || defaultOptions} />;
};

export default PieChart;
