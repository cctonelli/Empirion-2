import React from 'react';
import Chart from 'react-apexcharts';

interface EmpirionBarComparisonProps {
  id: string;
  title: string;
  teams: string[];
  series: {
    name: string;
    data: number[];
  }[];
  height?: number;
  isHorizontal?: boolean;
}

export const EmpirionBarComparison: React.FC<EmpirionBarComparisonProps> = ({
  id,
  title,
  teams,
  series,
  height = 300,
  isHorizontal = false
}) => {
  const chartOptions: any = {
    chart: {
      id: `bar-${id}`,
      type: 'bar',
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        horizontal: isHorizontal,
        columnWidth: '55%',
        borderRadius: 8,
        borderRadiusApplication: 'end',
        dataLabels: {
          position: 'top'
        }
      }
    },
    colors: ['#f97316', '#3b82f6', '#10b981', '#a855f7'],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(1);
      },
      offsetY: -20,
      style: {
        fontSize: '10px',
        fontFamily: 'JetBrains Mono, monospace',
        colors: ['#ffffff'],
        fontWeight: 'bold'
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
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
      }
    },
    xaxis: {
      categories: teams,
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '10px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600
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
        }
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: '#94a3b8'
      },
      fontFamily: 'Inter, sans-serif'
    },
    tooltip: {
      theme: 'dark'
    }
  };

  return (
    <div id={`chart-container-bar-${id}`} className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden backdrop-blur-3xl group hover:border-white/15 transition-all">
      <div id={`apex-chart-wrapper-bar-${id}`} className="w-full">
        <Chart
          options={chartOptions}
          series={series}
          type="bar"
          height={height}
        />
      </div>
    </div>
  );
};

export default EmpirionBarComparison;
