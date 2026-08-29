import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, AreaSeries } from 'lightweight-charts';

interface MiniHistoryChartProps {
  fetchHistory: () => Promise<{ createdAt: string | Date; rate?: number; price?: number }[]>;
  color?: string;
  triggerRefetch?: string | number;
}

export const MiniHistoryChart: React.FC<MiniHistoryChartProps> = ({
  fetchHistory,
  color = '#10b981', // emerald-500 default for currencies
  triggerRefetch
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const history = await fetchHistory();
        if (!isMounted) return;

        // Filter last 4 days roughly if needed, or just show all
        const chartData = history.map(h => ({
// eslint-disable-next-line @typescript-eslint/no-explicit-any
          time: Math.floor(new Date(h.createdAt).getTime() / 1000) as any,
          value: h.rate ?? h.price ?? 0,
        }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uniqueData: any[] = [];
        const seenTimes = new Set();
        for (const item of chartData) {
          if (!seenTimes.has(item.time)) {
            seenTimes.add(item.time);
            uniqueData.push(item);
          }
        }

        if (uniqueData.length === 1) {
          uniqueData.unshift({
            time: uniqueData[0].time - 60,
            value: uniqueData[0].value,
          });
        }

        if (uniqueData.length > 0) {
          setHasData(true);
        } else {
          setHasData(false);
          return;
        }

        if (chartContainerRef.current) {
          if (!chartRef.current) {
            const chart = createChart(chartContainerRef.current, {
              layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: 'transparent',
                attributionLogo: false,
              },
              grid: {
                vertLines: { visible: false },
                horzLines: { visible: false },
              },
              width: chartContainerRef.current.clientWidth,
              height: 60,
              timeScale: {
                visible: false,
              },
              rightPriceScale: {
                visible: false,
              },
              crosshair: {
                vertLine: { visible: false },
                horzLine: { visible: false }
              },
              handleScroll: false,
              handleScale: false,
            });

            chartRef.current = chart;

            const newSeries = chart.addSeries(AreaSeries, {
              lineColor: color,
              topColor: color,
              bottomColor: 'rgba(16, 185, 129, 0.05)',
              lineWidth: 2,
              crosshairMarkerVisible: false,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            seriesRef.current = newSeries;
          }

          if (seriesRef.current) {
            seriesRef.current.setData(uniqueData);
            chartRef.current?.timeScale().fitContent();
          }
        }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        console.error("Failed to load mini chart data");
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchHistory, triggerRefetch, color]);

  return (
    <div style={{ width: '100%', height: '60px', marginTop: '12px', position: 'relative' }}>
      {!hasData && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px', fontStyle: 'italic', background: '#f8fafc', borderRadius: '8px', zIndex: 10 }}>
          Нет истории
        </div>
      )}
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%', opacity: hasData ? 1 : 0 }} />
    </div>
  );
};
