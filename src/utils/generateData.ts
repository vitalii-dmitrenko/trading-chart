import { TimeInterval } from '@/types/chart'; // assuming you extract your types

const INTERVAL_CONFIG: any = {
  '1m': { minutes: 1 },
  '5m': { minutes: 5 },
  '15m': { minutes: 15 },
  '30m': { minutes: 30 },
  '1h': { minutes: 60 },
  '3h': { minutes: 180 },
  '4h': { minutes: 240 },
  '6h': { minutes: 360 },
  '12h': { minutes: 720 },
  'D': { minutes: 1440 },
  'W': { minutes: 10080 },
};

// Generates mock OHLC, volume, and moving averages
export function generateRandomData(interval: TimeInterval, numberOfPoints = 500) {
  const candleData: any[] = [];
  const volumeData: any[] = [];
  const ma7Data: any[] = [];
  const ma14Data: any[] = [];
  const ma30Data: any[] = [];

  const intervalMinutes = INTERVAL_CONFIG[interval].minutes;

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  let currentPrice = 107000 + Math.random() * 1000;
  const ma7Buffer: number[] = [];
  const ma14Buffer: number[] = [];
  const ma30Buffer: number[] = [];

  for (let i = 0; i < numberOfPoints; i++) {
    const time = new Date(startDate);
    time.setMinutes(startDate.getMinutes() + i * intervalMinutes);
    const timestamp = Math.floor(time.getTime() / 1000);

    const priceChange = (Math.random() - 0.5) * 200;
    currentPrice = Math.max(50000, currentPrice + priceChange);

    const open = currentPrice;
    const close = currentPrice + (Math.random() - 0.5) * 150;
    const high = Math.max(open, close) + Math.random() * 100;
    const low = Math.min(open, close) - Math.random() * 100;

    const priceVolatility = Math.abs(high - low);
    const baseVolume = 0.1 + Math.random() * 0.5;
    const volume = baseVolume * (1 + priceVolatility * 0.001);
    const volumeColor = close >= open ? '#00d4aa' : '#ff6b6b';

    candleData.push({ time: timestamp, open, high, low, close });
    volumeData.push({ time: timestamp, value: volume, color: volumeColor });

    // Moving Averages
    ma7Buffer.push(close);
    ma14Buffer.push(close);
    ma30Buffer.push(close);

    if (ma7Buffer.length > 7) ma7Buffer.shift();
    if (ma14Buffer.length > 14) ma14Buffer.shift();
    if (ma30Buffer.length > 30) ma30Buffer.shift();

    if (i >= 6) ma7Data.push({ time: timestamp, value: average(ma7Buffer) });
    if (i >= 13) ma14Data.push({ time: timestamp, value: average(ma14Buffer) });
    if (i >= 29) ma30Data.push({ time: timestamp, value: average(ma30Buffer) });

    currentPrice = close;
  }

  return { candleData, volumeData, ma7Data, ma14Data, ma30Data };
}

function average(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
