
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { getLast7Days } from "../../lib/features";

ChartJS.register(
  Tooltip,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  ArcElement,
  Legend
);

const labels = getLast7Days();

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: 'hsl(var(--muted-foreground))',
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'hsl(var(--border))',
        drawBorder: false,
      },
      ticks: {
        color: 'hsl(var(--muted-foreground))',
        stepSize: 1,
      },
    },
  },
};

const LineChart = ({ value = [] }) => {
  const data = {
    labels,
    datasets: [
      {
        data: value,
        label: "Messages",
        fill: true,
        backgroundColor: 'rgba(139, 92, 246, 0.1)', // violet with opacity
        borderColor: 'rgb(139, 92, 246)', // violet
        tension: 0.4,
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(139, 92, 246)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  return <Line data={data} options={lineChartOptions} />;
};

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    },
  },
  cutout: '70%',
  spacing: 2,
};

const DoughnutChart = ({ value = [], labels = [] }) => {
  const data = {
    labels,
    datasets: [
      {
        data: value,
        backgroundColor: [
          'rgb(59, 130, 246)',   // blue-500
          'rgb(168, 85, 247)',   // purple-500
          'rgb(236, 72, 153)',   // pink-500
          'rgb(34, 197, 94)',    // green-500
          'rgb(251, 146, 60)',   // orange-500
        ],
        hoverBackgroundColor: [
          'rgb(96, 165, 250)',   // blue-400
          'rgb(192, 132, 252)',  // purple-400
          'rgb(244, 114, 182)',  // pink-400
          'rgb(74, 222, 128)',   // green-400
          'rgb(251, 191, 36)',   // orange-400
        ],
        borderColor: 'rgb(255, 255, 255)',
        borderWidth: 3,
        hoverBorderColor: 'rgb(255, 255, 255)',
        hoverBorderWidth: 4,
        offset: 8,
      },
    ],
  };
  
  return (
    <Doughnut
      data={data}
      options={doughnutChartOptions}
    />
  );
};

export { DoughnutChart, LineChart };