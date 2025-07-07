'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, CandlestickSeries, LineSeries, IChartApi } from 'lightweight-charts';

export function MainChart({
  candleData,
  ma7Data,
  ma14Data,
  ma30Data,
  width,
  height = 400,
}: {
  candleData: any[];
  ma7Data: any[];
  ma14Data: any[];
  ma30Data: any[];
  width?: number;
  height?: number;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { color: '#1a1a1a' }, textColor: '#d1d5db' },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { timeVisible: true, secondsVisible: false },
      width: width || chartContainerRef.current.clientWidth,
      height,
    });

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

    return () => chart.remove();
  }, [candleData, ma7Data, ma14Data, ma30Data, width, height]);

  return <div ref={chartContainerRef} style={{ height, width: '100%' }} />;
}
