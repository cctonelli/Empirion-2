import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

interface EmpirionLiquidityChartProps {
  id: string;
  visibleHistory: any[];
  height?: number;
}

export const EmpirionLiquidityChart: React.FC<EmpirionLiquidityChartProps> = ({
  id,
  visibleHistory,
  height = 340
}) => {
  const chartData = useMemo(() => {
    // Desconsidere o P-00 (INICIAL) neste gráfico conforme exigência do usuário
    const historyWithoutP0 = visibleHistory.filter(h => h.round > 0);

    const findNodeVal = (nodes: any[] | undefined | null, targetId: string): number => {
      if (!nodes || !Array.isArray(nodes)) return 0;
      for (const node of nodes) {
        if (node.id === targetId) return node.value || 0;
        if (node.children) {
          const val = findNodeVal(node.children, targetId);
          if (val !== 0) return val;
        }
      }
      return 0;
    };

    const categories = historyWithoutP0.map(h => `R-${h.round < 10 ? '0' : ''}${h.round}`);
    
    const currentData: number[] = [];
    const dryData: number[] = [];
    const generalData: number[] = [];

    for (const h of historyWithoutP0) {
      const bs = h.kpis?.statements?.balance_sheet;
      const currentLiq = h.kpis?.liquidity_current || 0;

      if (bs) {
        const currentAssets = findNodeVal(bs, 'assets.current');
        const currentLiabilities = findNodeVal(bs, 'liabilities.current');
        const stockVal = findNodeVal(bs, 'assets.current.stock') || 
          (findNodeVal(bs, 'assets.current.stock.pa') + 
           findNodeVal(bs, 'assets.current.stock.mpa') + 
           findNodeVal(bs, 'assets.current.stock.mpb') + 
           findNodeVal(bs, 'assets.current.stock.wip'));
        const longTermLiabilities = findNodeVal(bs, 'liabilities.longterm') || findNodeVal(bs, 'liabilities.longterm.loans_lt');

        const computedCurrent = currentLiabilities > 0 ? (currentAssets / currentLiabilities) : (currentLiq || 0);
        const computedDry = currentLiabilities > 0 ? ((currentAssets - stockVal) / currentLiabilities) : (currentLiq ? currentLiq * 0.75 : 0);
        const computedGeneral = (currentLiabilities + longTermLiabilities) > 0 ? (currentAssets / (currentLiabilities + longTermLiabilities)) : (currentLiq ? currentLiq * 0.85 : 0);

        currentData.push(parseFloat(computedCurrent.toFixed(2)));
        dryData.push(parseFloat(computedDry.toFixed(2)));
        generalData.push(parseFloat(computedGeneral.toFixed(2)));
      } else {
        // Fallback robusto se os demonstrativos ainda não estiverem compilados no round
        currentData.push(parseFloat(currentLiq.toFixed(2)));
        dryData.push(parseFloat((currentLiq * 0.76).toFixed(2)));
        generalData.push(parseFloat((currentLiq * 0.90).toFixed(2)));
      }
    }

    return {
      categories,
      series: [
        { name: 'Liquidez Seca', data: dryData },
        { name: 'Liquidez Corrente', data: currentData },
        { name: 'Liquidez Geral', data: generalData }
      ]
    };
  }, [visibleHistory]);

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
      background: 'transparent',
      sparkline: {
        enabled: false
      }
    },
    colors: ['#3b82f6', '#10b981', '#f97316'], // Azul (Seca), Verde (Corrente), Laranja (Geral)
    stroke: {
      curve: 'smooth',
      width: 3.5
    },
    title: {
      text: 'Índices de Liquidez por Período',
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
      strokeDashArray: 4,
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
        left: 10,
        right: 15,
        top: 20,
        bottom: 5
      }
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: '900'
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
          colors: '#e2e8f0',
          fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: '800'
        },
        formatter: (val: number) => {
          if (val === undefined || isNaN(val)) return '';
          return val.toFixed(2).replace('.', ',');
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '10px',
        fontWeight: '900',
        fontFamily: 'JetBrains Mono, monospace',
        colors: ['#ffffff', '#ffffff', '#ffffff']
      },
      background: {
        enabled: true,
        foreColor: '#0f172a',
        padding: 5,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        opacity: 0.95
      },
      offsetY: -8
    },
    markers: {
      size: 5,
      colors: ['#0f172a'],
      strokeColors: ['#3b82f6', '#10b981', '#f97316'],
      strokeWidth: 2,
      hover: {
        size: 7
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      fontWeight: '700',
      labels: {
        colors: '#94a3b8'
      },
      markers: {
        width: 10,
        height: 10,
        radius: 12
      },
      itemMargin: {
        horizontal: 16,
        vertical: 8
      }
    },
    tooltip: {
      theme: 'dark'
    }
  };

  return (
    <div id={`chart-container-area-${id}`} className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden backdrop-blur-3xl group hover:border-white/15 transition-all w-full h-full flex flex-col justify-between">
      <div id={`apex-chart-wrapper-area-${id}`} className="w-full flex-1 min-h-[300px]">
        {chartData.categories.length > 0 ? (
          <Chart
            options={chartOptions}
            series={chartData.series}
            type="line"
            height={height}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Nenhum dado de rodada fechada disponível
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpirionLiquidityChart;
