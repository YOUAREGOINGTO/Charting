import React, { useEffect } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import Papa from 'papaparse';

const fetchCSVData = async () => {
  try {
    const response = await fetch('stock_data.csv');
    const data = await response.text();
    
    // Log the raw CSV data
    console.log('Raw CSV data:', data);
    
    const parsedData = Papa.parse(data, { header: true });
    
    // Log the parsed data
    console.log('Parsed CSV data:', parsedData.data);
    
    const cdata = parsedData.data.map((row) => {
      return {
        time: row.Date,
        open: parseFloat(row.Open),
        high: parseFloat(row.High),
        low: parseFloat(row.Low),
        close: parseFloat(row.Close),
      };
    });
    
    // Filter out invalid data
    const validData = cdata.filter((item) => (
      !isNaN(item.open) && !isNaN(item.high) && !isNaN(item.low) && !isNaN(item.close)
    ));
    
    return validData;
  } catch (error) {
    console.error('Error fetching or parsing CSV data:', error);
    return [];
  }
};

const StockChart = () => {
  useEffect(() => {
    const displayChart = async () => {
      const chartProperties = {
        width: 1500,
        height: 600,
        timeScale: {
          timeVisible: true,
          secondsVisible: true,
          crosshair: {
            mode: CrosshairMode.Normal,
          },
        },
      };

      const domElement = document.getElementById('tvchart');
      const chart = createChart(domElement, chartProperties);
      const candleSeries = chart.addCandlestickSeries();
      const klineData = await fetchCSVData();
      
      // Log the final data to be set in the chart
      console.log('Kline data:', klineData);
      
      candleSeries.setData(klineData);
    };

    displayChart();
  }, []);

  return <div id="tvchart" style={{ width: '1500px', height: '600px' }} />;
};

export default StockChart;
