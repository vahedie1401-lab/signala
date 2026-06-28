// src/index.ts

import dotenv from "dotenv";
import { startBinanceWS } from "./binance.ws";

dotenv.config();

const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];

function start() {
  console.log("Starting Collector Service...");

  symbols.forEach((symbol) => {
    startBinanceWS(symbol);
  });
}

start();
