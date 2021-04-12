import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

import styles from "./priceCart.module.css";

function formatDate(date = new Date()) {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

function datePrototype(date) {
  date = new Date(date);
  return `${date.getDate().toString()} ${date.toLocaleString("en-us", {
    month: "short",
  })}`;
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
        borderColor: "rgb(0, 255, 20)",
        backgroundColor: "rgba(0, 255, 0,0.10)",
        fill: "origin",
      },
    ],
  };
  for (const date in res.bpi) {
    result.datasets[0].data.push({ x: date, y: res.bpi[date] });
  }
  result.datasets[0].data.sort((a, b) => b.x - a.x);
  console.log(result.datasets[0].data);
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
      responsive: true,
      plugins: {
        filler: {
          propagate: false,
        },
        title: {
          display: true,
          text: "Last 60 days trend",
          font: { size: "40px" },
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
      scales: {
        y: {
          ticks: {
            callback: function (value, index, values) {
              return index % 2 === 0 ? value : "";
            },
            font: { size: "35px" },
          },
        },
        x: {
          ticks: {
            callback: function (value, index, values) {
              console.log(value, index, this.getLabelForValue(value));
              return index===30
                ? datePrototype(this.getLabelForValue(value))
                : "";
            },
            font: { size: "30px" },
          },
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
        <p style={{ textAlign: "left" }}>1 Bitcoin equals</p>
        <select
          className={styles.select}
          value={currency}
          onChange={(e) => {
            setCurrency(e.target.value);
          }}
        >
          <option value="EUR"> EUR</option>
          <option value="USD"> USD</option>
          <option value="GBP"> GBP</option>
        </select>
        <h1
          style={{ textAlign: "left", marginBlock: "0px", marginTop: "50px" }}
        >
          {" "}
          {currenValue}
        </h1>
        <h1 style={{ textAlign: "left", marginBlock: "0px" }}> {currency}</h1>
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
