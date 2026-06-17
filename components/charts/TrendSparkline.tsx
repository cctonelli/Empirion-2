import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';

interface TrendSparklineProps {
  id: string;
  data: number[];
  color?: string;
  height?: number;
  width?: number | string;
}

export const TrendSparkline: React.FC<TrendSparklineProps> = ({
  id,
  data,
  color = '#f97316',
  height = 40,
  width = '100%'
}) => {
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderKey(prev => prev + 1);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('resize'));
      }
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const chartOptions: any = {
    chart: {
      id: `sparkline-${id}`,
      type: 'line',
      sparkline: {
        enabled: true
      },
      background: 'transparent',
      dropShadow: {
        enabled: true,
        top: 2,
        left: 0,
        blur: 5,
        color: [color],
        opacity: 0.5
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    colors: [color],
    tooltip: {
      fixed: {
        enabled: false
      },
      x: {
        show: false
      },
      y: {
        title: {
          formatter: () => ''
        }
      },
      marker: {
        show: false
      },
      theme: 'dark'
    }
  };

  const series = [{
    data: data
  }];

  return (
    <div id={`chart-container-sparkline-${id}`} className="inline-block w-full" style={{ width: typeof width === 'number' ? `${width}px` : width, height: `${height}px` }}>
      <Chart
        key={`${id}-${renderKey}`}
        options={chartOptions}
        series={series}
        type="line"
        height={height}
        width="100%"
      />
    </div>
  );
};

export default TrendSparkline;
