'use client';

import { useState, useEffect } from 'react';
import { ChartData, Timeframe } from '@/types/chart';
import { generateSampleData, getPeriodsForTimeframe } from '@/utils/chartHelpers';

interface UseChartDataProps {
  symbol: string;
  timeframe: Timeframe;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useChartData = ({
  symbol,
  timeframe,
  autoRefresh = false,
  refreshInterval = 30000
}: UseChartDataProps) => {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // In a real app, you would fetch from an API like:
      // const response = await fetch(`/api/charts/${symbol}/${timeframe}`);
      // const data = await response.json();

      const periods = getPeriodsForTimeframe(timeframe);
      const chartData = generateSampleData(107000, periods, timeframe);
      
      setData(chartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [symbol, timeframe]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, symbol, timeframe]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};