import React from 'react';
import Chart from 'react-apexcharts';

interface EmpirionLineChartProps {
  id: string;
  title: string;
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
  height?: number;
  color?: string;
  currency?: string;
}

export const EmpirionLineChart: React.FC<EmpirionLineChartProps> = ({
  id,
  title,
  categories,
  series,
  height = 300,
  color = '#3b82f6',
  currency = 'BRL'
}) => {
  const chartOptions: any = {
    chart: {
      id: `line-${id}`,
      type: 'line',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      background: 'transparent'
    },
    colors: [color],
    stroke: {
      curve: 'smooth',
      width: 3
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
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        left: 2,
        right: 2,
        top: 2,
        bottom: 0
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace'
        },
        formatter: (val: number) => {
          if (val === 0) return '0';
          if (Math.abs(val) >= 1e6) {
            return `${(val / 1e6).toFixed(1)}M`;
          }
          if (Math.abs(val) >= 1e3) {
            return `${(val / 1e3).toFixed(0)}k`;
          }
          return val.toFixed(0);
        }
      }
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => {
          return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(val);
        }
      }
    },
    markers: {
      size: 4,
      colors: ['#0f172a'],
      strokeColors: color,
      strokeWidth: 2,
      hover: {
        size: 6
      }
    }
  };

  return (
    <div id={`chart-container-line-${id}`} className="bg-slate-900/40 border border-white/5 p-3 pb-1 rounded-[2rem] shadow-xl relative overflow-hidden backdrop-blur-3xl group hover:border-white/15 transition-all">
      <div id={`apex-chart-wrapper-line-${id}`} className="w-full">
        <Chart
          options={chartOptions}
          series={series}
          type="line"
          height={height}
        />
      </div>
    </div>
  );
};

export default EmpirionLineChart;
