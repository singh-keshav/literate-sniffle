import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

import styles from "./priceCart.module.css";

function formatDate(date = new Date()) {
  return `${date.getFullYear()}-${date
    .getMonth()
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

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

  const [currenValue, setCurrenValue] = useState("");

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");

    const end = formatDate();
    const start = formatDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000));

    initChart(ctx, currency, start, end);
    fetch(`https://api.coindesk.com/v1/bpi/currentprice.json`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setCurrenValue(res.bpi[currency].rate);
      });

    return () => {
      chart.destroy();
    };
  }, [currency]);

  return (
    <div className={styles.container}>
      <div className={styles.selector}>
        <p>1 bitcoin equals</p>
        <select
          value={currency}
          onChange={(e) => {
            setCurrency(e.target.value);
          }}
        >
          <option value="EUR"> EUR</option>
          <option value="USD"> USD</option>
          <option value="GBP"> GBP</option>
        </select>
        <p>current value is {currenValue}</p>
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
