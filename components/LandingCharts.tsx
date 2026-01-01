
import React from 'react';
import Chart from 'react-apexcharts';

const LandingCharts: React.FC = () => {
  const options: any = {
    chart: {
      id: 'realtime-arena',
      toolbar: { show: false },
      sparkline: { enabled: false },
      background: 'transparent'
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#fbbf24'],
    theme: { mode: 'dark' },
    stroke: { curve: 'smooth', width: 3 },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    xaxis: {
      categories: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
      labels: { style: { colors: '#475569', fontSize: '10px', fontWeight: 800 } }
    },
    yaxis: {
      labels: { style: { colors: '#475569', fontSize: '10px', fontWeight: 800 } }
    },
    legend: { show: false },
    tooltip: { theme: 'dark' }
  };

  const series = [
    { name: 'Empresa Alpha', data: [31, 40, 28, 51, 42, 109] },
    { name: 'Empresa Beta', data: [11, 32, 45, 32, 34, 52] }
  ];

  return (
    <div className="w-full h-full p-4">
      <Chart options={options} series={series} type="area" height="100%" width="100%" />
    </div>
  );
};

export default LandingCharts;
