import React from 'react';
import Chart from 'react-apexcharts';

interface EmpirionRadarChartProps {
  id: string;
  title: string;
  metrics: string[];
  series: {
    name: string;
    data: number[];
  }[];
  height?: number;
}

export const EmpirionRadarChart: React.FC<EmpirionRadarChartProps> = ({
  id,
  title,
  metrics,
  series,
  height = 320
}) => {
  const chartOptions: any = {
    chart: {
      id: `radar-${id}`,
      type: 'radar',
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    colors: ['#f97316', '#3b82f6', '#10b981'],
    stroke: {
      width: 2
    },
    fill: {
      opacity: 0.15
    },
    markers: {
      size: 4,
      hover: {
        size: 6
      }
    },
    title: {
      text: title,
      align: 'left',
      style: {
        fontSize: '14px',
        fontWeight: '900',
        fontFamily: 'Inter, sans-serif',
        color: '#f8fafc'
      }
    },
    xaxis: {
      categories: metrics,
      labels: {
        show: true,
        style: {
          colors: Array(metrics.length).fill('#64748b'),
          fontSize: '9px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700
        }
      }
    },
    yaxis: {
      show: false
    },
    legend: {
      show: true,
      position: 'bottom',
      labels: {
        colors: '#94a3b8'
      },
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px'
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      padding: {
        left: 2,
        right: 2,
        top: 2,
        bottom: 0
      }
    },
    tooltip: {
      theme: 'dark'
    }
  };

  return (
    <div id={`chart-container-radar-${id}`} className="bg-slate-900/40 border border-white/5 p-3 pb-1 rounded-[2rem] shadow-xl relative overflow-hidden backdrop-blur-3xl group hover:border-white/15 transition-all">
      <div id={`apex-chart-wrapper-radar-${id}`} className="w-full">
        <Chart
          options={chartOptions}
          series={series}
          type="radar"
          height={height}
        />
      </div>
    </div>
  );
};

export default EmpirionRadarChart;
