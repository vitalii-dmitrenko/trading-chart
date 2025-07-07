import { CandlestickData, HistogramData, LineData, Time } from 'lightweight-charts';

export interface ChartData {
  candlestick: CandlestickData[];
  volume: HistogramData[];
  ma: LineData[];
}

export interface PriceInfo {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Supported time intervals
export type TimeInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '3h' | '4h' | '6h' | '12h' | 'D' | 'W';

// Supported update frequencies (in ms)
export type UpdateFrequency = 1000 | 2000 | 5000 | 10000;


export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface ChartProps {
  symbol: string;
  timeframe: Timeframe;
  exchange?: string;
  width?: number;
  height?: number;
}

export interface CandlestickDataPoint {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeDataPoint {
  time: Time;
  value: number;
  color?: string;
}