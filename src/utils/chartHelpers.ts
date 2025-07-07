import { CandlestickData, HistogramData, LineData, Time } from 'lightweight-charts';
import { ChartData, Timeframe } from '@/types/chart';

export const generateSampleData = (
  basePrice: number = 107000,
  periods: number = 100,
  timeframe: Timeframe = '15m'
): ChartData => {
  const volatility = getVolatilityForTimeframe(timeframe);
  const interval = getIntervalForTimeframe(timeframe);
  
  const candlestickData: CandlestickData[] = [];
  let currentPrice = basePrice + (Math.random() - 0.5) * 1000;
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = 0; i < periods; i++) {
    const time = (now - (periods - i) * interval) as Time;
    
    const open = currentPrice;
    const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
    const high = open + Math.abs(change) * (1 + Math.random() * 0.5);
    const low = open - Math.abs(change) * (1 + Math.random() * 0.5);
    const close = open + change;
    
    candlestickData.push({
      time,
      open: Math.round(open * 10) / 10,
      high: Math.round(high * 10) / 10,
      low: Math.round(low * 10) / 10,
      close: Math.round(close * 10) / 10,
    });
    
    currentPrice = close;
  }
  
  const volumeData: HistogramData[] = candlestickData.map(candle => ({
    time: candle.time,
    value: Math.random() * 50 + 5,
    color: candle.close > candle.open ? '#00c851' : '#ff4444'
  }));
  
  const maData = calculateMovingAverage(candlestickData, 20);
  
  return {
    candlestick: candlestickData,
    volume: volumeData,
    ma: maData
  };
};

export const calculateMovingAverage = (
  data: CandlestickData[],
  period: number = 20
): LineData[] => {
  const maData: LineData[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, candle) => acc + candle.close, 0);
    maData.push({
      time: data[i].time,
      value: sum / period
    });
  }
  
  return maData;
};

export const getVolatilityForTimeframe = (timeframe: Timeframe): number => {
  switch (timeframe) {
    case '1m': return 0.005;
    case '5m': return 0.01;
    case '15m': return 0.015;
    case '1h': return 0.02;
    case '4h': return 0.025;
    case '1d': return 0.03;
    default: return 0.015;
  }
};

export const getIntervalForTimeframe = (timeframe: Timeframe): number => {
  switch (timeframe) {
    case '1m': return 60;
    case '5m': return 300;
    case '15m': return 900;
    case '1h': return 3600;
    case '4h': return 14400;
    case '1d': return 86400;
    default: return 900;
  }
};

export const getPeriodsForTimeframe = (timeframe: Timeframe): number => {
  switch (timeframe) {
    case '1m': return 100;
    case '5m': return 120;
    case '15m': return 100;
    case '1h': return 200;
    case '4h': return 150;
    case '1d': return 100;
    default: return 100;
  }
};

export const formatPrice = (price: number): string => {
  return price.toFixed(1);
};

export const formatVolume = (volume: number): string => {
  return volume.toFixed(3);
};