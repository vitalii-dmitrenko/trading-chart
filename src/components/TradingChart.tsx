'use client';

import React, { useEffect, useState } from 'react';
import { MainChart } from './MainChart';
import { VolumeChart } from './VolumeChart';
import { generateRandomData } from '../utils/generateData'; // Your existing data generator

export function TradingChart() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const data = generateRandomData('5m', 300);
    setChartData(data);
  }, []);

  if (!chartData) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-gray-900 p-4">
      <MainChart
        candleData={chartData.candleData}
        ma7Data={chartData.ma7Data}
        ma14Data={chartData.ma14Data}
        ma30Data={chartData.ma30Data}
      />
      <VolumeChart volumeData={chartData.volumeData} />
    </div>
  );
}
