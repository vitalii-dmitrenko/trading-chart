'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, CandlestickSeries, LineSeries, IChartApi } from 'lightweight-charts';

export function CandleChart({
  candleData,
  ma7Data,
  ma14Data,
  ma30Data,
  width,
  height = 400,
  onCrosshairMove,
}: {
  candleData: any[];
  ma7Data: any[];
  ma14Data: any[];
  ma30Data: any[];
  width?: number;
  height?: number;
  onCrosshairMove?: (data: any | null) => void;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { color: '#1a1a1a' }, textColor: '#d1d5db' },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { timeVisible: true, secondsVisible: false },
      width: width || chartContainerRef.current.clientWidth,
      height,
    });
    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00d4aa',
      downColor: '#ff6b6b',
      wickUpColor: '#00d4aa',
      wickDownColor: '#ff6b6b',
    });
    candlestickSeries.setData(candleData);

    const ma7 = chart.addSeries(LineSeries, { color: '#f7931a', lineWidth: 2 });
    const ma14 = chart.addSeries(LineSeries, { color: '#00d4aa', lineWidth: 2 });
    const ma30 = chart.addSeries(LineSeries, { color: '#e052a0', lineWidth: 2 });

    ma7.setData(ma7Data);
    ma14.setData(ma14Data);
    ma30.setData(ma30Data);

    chart.timeScale().fitContent();

    // Crosshair move event
    if (onCrosshairMove) {
      chart.subscribeCrosshairMove(param => {
        if (!param || !param.time || !param.seriesData) {
          onCrosshairMove(null);
          return;
        }
        // Find the hovered candle
        const price = param.seriesData.get(candlestickSeries);
        if (!price) {
          onCrosshairMove(null);
          return;
        }
        // Find the full candle data by time
        const hoveredCandle = candleData.find(c => c.time === param.time);
        if (!hoveredCandle) {
          onCrosshairMove(null);
          return;
        }
        // Find MA values by time
        const ma7 = ma7Data.find(m => m.time === param.time);
        const ma14 = ma14Data.find(m => m.time === param.time);
        const ma30 = ma30Data.find(m => m.time === param.time);
        onCrosshairMove({
          ...hoveredCandle,
          ma7: ma7?.value,
          ma14: ma14?.value,
          ma30: ma30?.value,
        });
      });
    }

    return () => chart.remove();
  }, [candleData, ma7Data, ma14Data, ma30Data, width, height, onCrosshairMove]);

  return <div ref={chartContainerRef} style={{ height, width: '100%' }} />;
}
