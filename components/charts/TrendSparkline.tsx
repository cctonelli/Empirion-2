import React from 'react';
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
  const chartOptions: any = {
    chart: {
      id: `sparkline-${id}`,
      type: 'line',
      sparkline: {
        enabled: true
      },
      background: 'transparent'
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
    <div id={`chart-container-sparkline-${id}`} className="inline-block" style={{ width: typeof width === 'number' ? `${width}px` : width, height: `${height}px` }}>
      <Chart
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
