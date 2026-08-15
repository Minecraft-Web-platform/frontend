import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, AreaSeries } from 'lightweight-charts';
import { ICompany } from '../types/economy.types';
import { economyService } from '../services/economy.service';

interface TradingChartProps {
  company: ICompany;
}

export const TradingChart: React.FC<TradingChartProps> = ({ company }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const history = await economyService.getCompanySharePriceHistory(company.id);
        
        if (!isMounted) return;

        // Форматируем данные для lightweight-charts
        // Данные должны быть отсортированы по времени
        // lightweight-charts принимает time в формате UNIX timestamp (в секундах) или YYYY-MM-DD
        const chartData = history.map(h => {
          // Если цены менялись несколько раз в секунду, могут быть дубликаты времени.
          // Для простоты используем Date.getTime() / 1000
          const time = Math.floor(new Date(h.createdAt).getTime() / 1000);
          return {
            time: time as any, // Приводим к any, чтобы TS не ругался на формат time
            value: h.price,
          };
        });

        // Убираем дубликаты по времени (lightweight-charts требует уникального времени)
        const uniqueData: any[] = [];
        const seenTimes = new Set();
        for (const item of chartData) {
          if (!seenTimes.has(item.time)) {
            seenTimes.add(item.time);
            uniqueData.push(item);
          }
        }

        if (chartContainerRef.current) {
          // Инициализация графика
          if (!chartRef.current) {
            const chart = createChart(chartContainerRef.current, {
              layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#333',
                attributionLogo: false,
              },
              grid: {
                vertLines: { color: '#f0f3fa' },
                horzLines: { color: '#f0f3fa' },
              },
              width: chartContainerRef.current.clientWidth,
              height: 400,
              timeScale: {
                timeVisible: true,
                secondsVisible: false,
              }
            });

            chartRef.current = chart;
            
            const newSeries = chart.addSeries(AreaSeries, {
              lineColor: '#2962FF',
              topColor: '#2962FF',
              bottomColor: 'rgba(41, 98, 255, 0.28)',
              lineWidth: 2,
            });
            seriesRef.current = newSeries;
          }

          if (seriesRef.current && uniqueData.length > 0) {
            seriesRef.current.setData(uniqueData);
            chartRef.current?.timeScale().fitContent();
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        if (isMounted) {
          setError('Ошибка загрузки графика');
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [company.id, company.sharePrice]);

  // Обработка изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
          Загрузка графика...
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, color: 'red' }}>
          {error}
        </div>
      )}
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
