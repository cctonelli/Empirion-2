import React from 'react';
import Chart from 'react-apexcharts';

interface EmpirionGaugeProps {
  id: string;
  title: string;
  value: number; // 0 a 100
  label?: string;
  min?: number;
  max?: number;
  formatter?: (val: number) => string;
}

export const EmpirionGauge: React.FC<EmpirionGaugeProps> = ({
  id,
  title,
  value,
  label = 'Score',
  min = 0,
  max = 100,
  formatter
}) => {
  // Escalar para porcentagem
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  const chartOptions: any = {
    chart: {
      id: `gauge-${id}`,
      type: 'radialBar',
      sparkline: {
        enabled: true
      },
      background: 'transparent'
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "rgba(255, 255, 255, 0.05)",
          strokeWidth: '97%',
          margin: 5,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif',
            color: '#64748b',
            offsetY: -10
          },
          value: {
            offsetY: -5,
            fontSize: '18px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: '900',
            color: '#ffffff',
            formatter: (val: number) => {
              const rescaled = min + (val / 100) * (max - min);
              return formatter ? formatter(rescaled) : rescaled.toFixed(1);
            }
          }
        }
      }
    },
    grid: {
      padding: {
        top: -15,
        bottom: 0,
        left: 2,
        right: 2
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: [percentage > 75 ? '#2563eb' : percentage > 50 ? '#10b981' : percentage > 30 ? '#ef4444' : '#ef4444'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    colors: [percentage > 75 ? '#3b82f6' : percentage > 50 ? '#10b981' : percentage > 30 ? '#f59e0b' : '#ef4444'],
    labels: [label],
  };

  return (
    <div id={`chart-container-gauge-${id}`} className="bg-slate-900/40 border border-white/5 p-3 pb-1 rounded-[2rem] shadow-xl relative overflow-hidden backdrop-blur-3xl flex flex-col justify-between items-center group hover:border-white/15 transition-all min-h-[190px]">
      <h3 id={`gauge-title-${id}`} className="text-white text-xs font-black uppercase tracking-widest text-center italic mb-4 w-full">{title}</h3>
      <div id={`apex-chart-wrapper-gauge-${id}`} className="w-full flex justify-center items-center">
        <Chart
          options={chartOptions}
          series={[percentage]}
          type="radialBar"
          height={140}
          width={180}
        />
      </div>
    </div>
  );
};

export default EmpirionGauge;
