'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CandleChart } from './CandleChart';
import { VolumeChart } from './VolumeChart';
import { generateRandomData } from '../utils/generateData';
import type { TimeInterval } from '@/types/chart';

const TIMEFRAMES: { label: string; value: TimeInterval }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: 'D', value: 'D' },
];

const DATE_RANGES = [
  { label: 'auto', value: 'auto' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
];

function getNextCandle(lastCandle: any, interval: TimeInterval) {
  const intervalMinutes = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '3h': 180,
    '4h': 240,
    '6h': 360,
    '12h': 720,
    'D': 1440,
    'W': 10080,
  }[interval] || 5;
  const timestamp = lastCandle.time + intervalMinutes * 60;
  const open = lastCandle.close;
  const close = open + (Math.random() - 0.5) * 150;
  const high = Math.max(open, close) + Math.random() * 100;
  const low = Math.min(open, close) - Math.random() * 100;
  const priceVolatility = Math.abs(high - low);
  const baseVolume = 0.1 + Math.random() * 0.5;
  const volume = baseVolume * (1 + priceVolatility * 0.001);
  const volumeColor = close >= open ? '#00d4aa' : '#ff6b6b';
  return {
    candle: { time: timestamp, open, high, low, close },
    volume: { time: timestamp, value: volume, color: volumeColor },
    close,
  };
}

function calcMA(data: number[], period: number) {
  if (data.length < period) return null;
  return data.slice(-period).reduce((a, b) => a + b, 0) / period;
}

// Helper to get number of candles for a date range and interval
function getWindowSize(interval: TimeInterval, dateRange: string) {
  const minutesPerCandle = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '3h': 180,
    '4h': 240,
    '6h': 360,
    '12h': 720,
    'D': 1440,
    'W': 10080,
  }[interval] || 5;
  if (dateRange === 'auto') return 50;
  if (dateRange === '1D') return Math.ceil(1440 / minutesPerCandle);
  if (dateRange === '1W') return Math.ceil(10080 / minutesPerCandle);
  if (dateRange === '1M') return Math.ceil(43200 / minutesPerCandle); // 30 days
  return 50;
}

// Helper to get earliest timestamp for a date range and interval
function getEarliestTimestamp(interval: TimeInterval, dateRange: string, now: Date) {
  const minutesPerCandle = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '3h': 180,
    '4h': 240,
    '6h': 360,
    '12h': 720,
    'D': 1440,
    'W': 10080,
  }[interval] || 5;
  let minutes = 0;
  if (dateRange === '1D') minutes = 1440;
  else if (dateRange === '1W') minutes = 10080;
  else if (dateRange === '1M') minutes = 43200; // 30 days
  else return null; // 'auto' or unknown
  const earliest = new Date(now.getTime() - minutes * 60 * 1000);
  return Math.floor(earliest.getTime() / 1000);
}

// Helper to get update interval (ms) for each timeframe
function getUpdateMs(interval: TimeInterval) {
  switch (interval) {
    case '1m': return 1000;
    case '5m': return 5000;
    case '15m': return 15000;
    case '30m': return 30000;
    case '1h': return 60000;
    case '3h': return 180000;
    case '4h': return 240000;
    case '6h': return 360000;
    case '12h': return 720000;
    case 'D': return 1440000;
    case 'W': return 10080000;
    default: return 1000;
  }
}

export function TradingChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [interval, setIntervalValue] = useState<TimeInterval>('5m');
  const [dateRange, setDateRange] = useState('auto');
  const closesRef = useRef<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [hoveredCandle, setHoveredCandle] = useState<any | null>(null);

  useEffect(() => {
    // Start with 50 points for quick loading
    const initial = generateRandomData(interval, 50);
    closesRef.current = initial.candleData.map((c: any) => c.close);
    setChartData(initial);

    if (intervalRef.current) clearInterval(intervalRef.current);
    const updateMs = getUpdateMs(interval);
    intervalRef.current = setInterval(() => {
      setChartData((prev: any) => {
        if (!prev) return prev;
        const lastCandle = prev.candleData[prev.candleData.length - 1];
        const { candle, volume, close } = getNextCandle(lastCandle, interval);
        const newCandleData = [...prev.candleData, candle];
        const newVolumeData = [...prev.volumeData, volume];
        closesRef.current.push(close);
        // Moving averages
        const ma7 = calcMA(closesRef.current, 7);
        const ma14 = calcMA(closesRef.current, 14);
        const ma30 = calcMA(closesRef.current, 30);
        const ma7Data = ma7 ? [...prev.ma7Data, { time: candle.time, value: ma7 }] : prev.ma7Data;
        const ma14Data = ma14 ? [...prev.ma14Data, { time: candle.time, value: ma14 }] : prev.ma14Data;
        const ma30Data = ma30 ? [...prev.ma30Data, { time: candle.time, value: ma30 }] : prev.ma30Data;
        return {
          candleData: newCandleData,
          volumeData: newVolumeData,
          ma7Data,
          ma14Data,
          ma30Data,
        };
      });
    }, updateMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [interval]);

  // Update UTC time every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!chartData) return <div className="text-white">Loading...</div>;

  // Get latest values
  const lastCandle = chartData.candleData[chartData.candleData.length - 1];
  const lastMA7 = chartData.ma7Data[chartData.ma7Data.length - 1];
  const lastMA14 = chartData.ma14Data[chartData.ma14Data.length - 1];
  const lastMA30 = chartData.ma30Data[chartData.ma30Data.length - 1];

  // Set display range based on date range and interval
  let candleData = chartData.candleData;
  let volumeData = chartData.volumeData;
  let ma7Data = chartData.ma7Data;
  let ma14Data = chartData.ma14Data;
  let ma30Data = chartData.ma30Data;

  if (dateRange !== 'auto') {
    const earliestTimestamp = getEarliestTimestamp(interval, dateRange, now);
    if (earliestTimestamp) {
      candleData = candleData.filter((c: any) => c.time >= earliestTimestamp);
      volumeData = volumeData.filter((v: any) => v.time >= earliestTimestamp);
      ma7Data = ma7Data.filter((m: any) => m.time >= earliestTimestamp);
      ma14Data = ma14Data.filter((m: any) => m.time >= earliestTimestamp);
      ma30Data = ma30Data.filter((m: any) => m.time >= earliestTimestamp);
    }
  } else {
    // fallback to last 50 for 'auto'
    candleData = candleData.slice(-50);
    volumeData = volumeData.slice(-50);
    ma7Data = ma7Data.slice(-50);
    ma14Data = ma14Data.slice(-50);
    ma30Data = ma30Data.slice(-50);
  }

  return (
    <div className="w-full min-h-screen bg-[#181a20]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#23262f] bg-[#181a20]">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white font-bold">BTCUSDT</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-300">5</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-400">Phemex</span>
          <span className="ml-2 text-[#6c7284] text-xs">.MBTCUSDT</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#ff6b6b] font-bold">107007.1</span>
          <span className="text-gray-400 text-xs">H107014.7 L106988.6</span>
          <span className="text-[#ff6b6b] text-xs">-7.5 (-0.01%)</span>
          <span className="text-gray-400 text-xs">Ampl 0.24%</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Icons: use emoji or SVGs */}
          <span>📈</span>
          <span>⚙️</span>
        </div>
      </div>

      {/* Timeframe Buttons */}
      <div className="flex gap-1 px-4 py-2 bg-[#181a20] border-b border-[#23262f]">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf.value}
            className={`px- py-2 text-xs font-medium transition-all duration-200 relative
              ${interval === tf.value
                ? 'bg-gradient-to-r from-[#f7931a] to-[#ff8c00] text-black shadow-lg shadow-orange-500/20 scale-105'
                : 'bg-[#1a1d23] text-gray-400 hover:bg-[#23262f] hover:text-gray-200 border border-[#23262f]'}
              rounded-md
            `}
            onClick={() => setIntervalValue(tf.value)}
          >
            {tf.label}
            {interval === tf.value && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#f7931a] rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="relative bg-[#181a20] px-0 pt-0 pb-0">
        {/* Tooltip on hover */}
        {hoveredCandle && (
          <div className="absolute left-4 top-2 z-20 bg-[#23262f] bg-opacity-95 rounded-md shadow-lg p-3 text-xs text-white border border-[#333] min-w-[180px]">
            <div className="flex gap-2"><span className="text-gray-400">Time:</span> <span>{new Date(hoveredCandle.time * 1000).toLocaleString()}</span></div>
            <div className="flex gap-2"><span className="text-gray-400">Open:</span> <span>{hoveredCandle.open.toFixed(2)}</span></div>
            <div className="flex gap-2"><span className="text-gray-400">High:</span> <span>{hoveredCandle.high.toFixed(2)}</span></div>
            <div className="flex gap-2"><span className="text-gray-400">Low:</span> <span>{hoveredCandle.low.toFixed(2)}</span></div>
            <div className="flex gap-2"><span className="text-gray-400">Close:</span> <span>{hoveredCandle.close.toFixed(2)}</span></div>
            <div className="flex gap-2"><span className="text-gray-400">Volume:</span> <span>{hoveredCandle.value ? hoveredCandle.value.toFixed(3) : ''}</span></div>
            <div className="flex gap-2"><span className="text-gray-400">MA7:</span> <span style={{ color: '#f7931a' }}>{hoveredCandle.ma7 ? hoveredCandle.ma7.toFixed(2) : '-'}</span></div>
            <div className="flex gap-2"><span className="text-gray-400">MA14:</span> <span style={{ color: '#00d4aa' }}>{hoveredCandle.ma14 ? hoveredCandle.ma14.toFixed(2) : '-'}</span></div>
            <div className="flex gap-2"><span className="text-gray-400">MA30:</span> <span style={{ color: '#e052a0' }}>{hoveredCandle.ma30 ? hoveredCandle.ma30.toFixed(2) : '-'}</span></div>
          </div>
        )}
        {/* MA Legend */}
        <div className="absolute left-4 top-4 flex flex-col gap-1 z-10 text-xs">
          <span className="flex items-center gap-1" style={{ color: '#f7931a' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#f7931a' }}></span>
            MA 7 close 0 <span className="font-bold">{lastMA7?.value.toFixed(1)}</span>
          </span>
          <span className="flex items-center gap-1" style={{ color: '#00d4aa' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#00d4aa' }}></span>
            MA 14 close 0 <span className="font-bold">{lastMA14?.value.toFixed(1)}</span>
          </span>
          <span className="flex items-center gap-1" style={{ color: '#e052a0' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#e052a0' }}></span>
            MA 30 close 0 <span className="font-bold">{lastMA30?.value.toFixed(1)}</span>
          </span>
          <span className="text-gray-400 text-xs mt-1 cursor-pointer">^</span>
        </div>
        <CandleChart
          candleData={candleData}
          ma7Data={ma7Data}
          ma14Data={ma14Data}
          ma30Data={ma30Data}
          onCrosshairMove={setHoveredCandle}
        />
        {/* Volume */}
        <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold ml-4 mt-2">
          Volume <span className="text-[#ff6b6b]">{volumeData[volumeData.length - 1]?.value.toFixed(3)}</span>
        </div>
        <VolumeChart volumeData={volumeData} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181a20] border-t border-[#23262f] text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <span>Date Range</span>
          <select
            className="bg-[#23262f] border border-[#23262f] rounded px-1 py-0.5 text-xs text-gray-200"
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
          >
            {DATE_RANGES.map(dr => (
              <option key={dr.value} value={dr.value}>{dr.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>168ms</span>
          <span className="text-gray-400">{now.toUTCString()}</span>
        </div>
      </div>
    </div>
  );
}
