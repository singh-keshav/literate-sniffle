import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

import styles from "./priceCart.module.css";


async function fetchApiData(curr, start, end) {
  const res = await fetch(
    `https://api.coindesk.com/v1/bpi/historical/close.json?currency=${curr}&start=${start}&end=${end}`
  );
  return res.json();
}

function apiToChartData(res) {
  const result = {
    datasets: [
      {
        label: "price",
        data: [],
        borderColor: "rgba(255,0,0,0.8)",
        backgroundColor: "rgba(255,0,0,0.25)",
        fill: true,
      },
    ],
  };
  for (const date in res.bpi) {
    result.datasets[0].data.push({ x: date, y: res.bpi[date] });
  }
  return result;
}

let chart;

async function initChart(ctx, curr, start, end) {
  if (chart) {
    chart.destroy();
  }
  const apiData = await fetchApiData(curr, start, end);

  const config = {
    type: "line",
    data: apiToChartData(apiData),
    options: {
      plugins: {
        filler: {
          propagate: false,
        },
        title: {
          display: true,
          text: (ctx) => "Fill: " + ctx.chart.data.datasets[0].fill,
        },
        legend: {
          fullSize: true,
        },
      },
      interaction: {
        intersect: false,
      },
      elements: {
        line: {
          tension: 0.4,
        },
      },
    },
  };

  chart = new Chart(ctx, config);
}



function PriceChart() {
  const canvasRef = useRef(null);

  const [currency, setCurrency] = useState("EUR");
  const [start, setStart] = useState("2013-09-01");
  const [end, setEnd] = useState("2013-09-10");

//   const [currentVaule, setCurrentVaule] = useState({});

  useEffect(() => {
    //TODO: initialise chart.js
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");

    initChart(ctx, currency, start, end);


    return () => {
      chart.destroy();
    };
  }, [currency, end, start]);

  

  return (
    <div className={styles.container}>
      <div className={styles.selector}>
        <p>1 bitcoin equals</p>
        <select
          className
          value={currency}
          onChange={(e) => {
            setCurrency(e.target.value);
          }}
        >
          <option value="EUR"> EUR</option>
          <option value="USD"> USD</option>
          <option value="GBP"> GBP</option>
        </select>
       
      </div>

      <canvas
        className={styles.canvaas}
        ref={canvasRef}
        width={100}
        height={110}
      ></canvas>
    </div>
  );
}

export default PriceChart;
