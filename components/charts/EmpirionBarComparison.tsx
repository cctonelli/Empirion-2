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
      background: 'transparent',
      dropShadow: {
        enabled: true,
        top: 2,
        left: 0,
        blur: 6,
        color: ['#f97316', '#3b82f6', '#10b981', '#a855f7'],
        opacity: 0.4
      }
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
      enabled: false
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
      },
      padding: {
        left: 2,
        right: 2,
        top: 2,
        bottom: 0
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
        },
        formatter: (val: number) => {
          if (val === undefined || isNaN(val)) return '';
          return parseFloat(val.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
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
      theme: 'dark',
      y: {
        formatter: (val: number, { seriesIndex, w }: any) => {
          const seriesName = w?.config?.series?.[seriesIndex]?.name || '';
          const chartTitle = w?.config?.title?.text || '';
          const isPercent = 
            seriesName.toLowerCase().includes('share') || 
            seriesName.toLowerCase().includes('tsr') || 
            seriesName.toLowerCase().includes('%') ||
            chartTitle.includes('(%)');
            
          if (isPercent && typeof val === 'number') {
            return `${val.toFixed(1).replace('.', ',')}%`;
          }
          return typeof val === 'number' ? val.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : val;
        }
      }
    }
  };

  return (
    <div id={`chart-container-bar-${id}`} className="bg-slate-900/40 border border-white/5 p-3 pb-1 rounded-[2rem] shadow-xl relative overflow-hidden backdrop-blur-3xl group hover:border-white/15 transition-all">
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
