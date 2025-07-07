'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, HistogramSeries, IChartApi, CrosshairMode } from 'lightweight-charts';

export function VolumeChart({
  volumeData,
  width,
  height = 150,
}: {
  volumeData: any[];
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

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#00d4aa',
      priceFormat: { type: 'volume' },
    });

    volumeSeries.setData(volumeData);

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [volumeData, width, height]);

  return <div ref={chartContainerRef} style={{ height, width: '100%' }} />;
}
