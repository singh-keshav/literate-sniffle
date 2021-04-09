import "./App.css";
import { useState } from "react";

import PriceChart from "./components/priceCart";


function App() {
  return (
    <div className="App">
      <PriceChart className="price-chart"/>
    </div>
  );
}

export default App;
