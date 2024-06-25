import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import './App.css';

const App = () => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candleSeriesRef = useRef();
  const maSeriesRef = useRef(null);
  const [maLength, setMaLength] = useState(14);
  const [maColor, setMaColor] = useState('#FF0000');
  const [maWidth, setMaWidth] = useState(1);
  const [klinedata, setKlinedata] = useState([]);

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: 'solid', color: '#1E1E1E' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: '#2B2B2B' },
        horzLines: { color: '#2B2B2B' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#4E5B85',
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: '#FFFFFF',
          style: 1,
          labelBackgroundColor: '#2B2B2B',
        },
        horzLine: {
          color: '#FFFFFF',
          labelBackgroundColor: '#2B2B2B',
        },
      },
    });

    chartRef.current = chart;
    candleSeriesRef.current = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const fetchData = async () => {
      try {
        const res = await fetch('stock_data.csv');  // Update with your actual path
        const resp = await res.text();
        const rows = resp.split('\n');
        const cdata = rows.slice(1).map(row => {
          const [Date, Open, High, Low, Close] = row.split(',');
          return {
            time: Date,
            open: parseFloat(Open),
            high: parseFloat(High),
            low: parseFloat(Low),
            close: parseFloat(Close),
          };
        });
        setKlinedata(cdata);
        candleSeriesRef.current.setData(cdata);
        console.log('Fetched data:', cdata);
      } catch (error) {
        console.error('Error fetching the data:', error);
      }
    };

    fetchData();

    const handleResize = () => {
      chart.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  const calculateSMA = (data, period) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      sma.push({ time: data[i].time, value: sum / period });
    }
    return sma;
  };

  const drawMovingAverages = () => {
    if (!chartRef.current || klinedata.length === 0 || isNaN(maLength) || isNaN(maWidth)) {
      console.error('Chart, data, or moving average length/width not available.');
      return;
    }

    const smaData = calculateSMA(klinedata, maLength);
    console.log('SMA Data:', smaData);

    if (maSeriesRef.current) {
      chartRef.current.removeSeries(maSeriesRef.current);
    }

    maSeriesRef.current = chartRef.current.addLineSeries({
      color: maColor,
      lineWidth: maWidth,
      priceLineVisible: false,
      axisLabelVisible: false,
      crossHairMarkerVisible: false,
    });

    maSeriesRef.current.setData(smaData);
  };

  const updateMovingAverages = () => {
    drawMovingAverages();
  };

  const deleteMovingAverages = () => {
    if (maSeriesRef.current) {
      chartRef.current.removeSeries(maSeriesRef.current);
      maSeriesRef.current = null;
    }
  };

  return (
    <div className="App">
      <div ref={chartContainerRef} id="tvchart" style={{ position: 'relative', width: '100vw', height: '90vh' }}></div>
      <div id="controls" style={{
        position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000,
        backgroundColor: 'rgba(30, 30, 30, 0.8)', padding: '10px', borderRadius: '5px',
        color: '#D9D9D9'
      }}>
        <label htmlFor="maLength">MA Length:</label>
        <input type="number" id="maLength" min="1" max="100" value={maLength} onChange={e => setMaLength(parseInt(e.target.value))} />

        <label htmlFor="maColor">Color:</label>
        <input type="color" id="maColor" value={maColor} onChange={e => setMaColor(e.target.value)} />

        <label htmlFor="maWidth">Line Width:</label>
        <input type="number" id="maWidth" min="1" max="10" value={maWidth} onChange={e => setMaWidth(parseInt(e.target.value))} />

        <button onClick={drawMovingAverages}>Draw MAs</button>
        <button onClick={updateMovingAverages}>Update MAs</button>
        <button onClick={deleteMovingAverages}>Delete MAs</button>
      </div>
    </div>
  );
};

export default App;