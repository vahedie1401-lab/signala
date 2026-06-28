// src/binance.ws.ts

import WebSocket from "ws";
import { normalizeTrade } from "./normalize";
import { redis } from "./redis.client";

export function startBinanceWS(symbol: string) {
  console.log(`Starting stream for ${symbol}`);

  const stream = `${symbol.toLowerCase()}@trade`;
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`);

  ws.on("open", () => {
    console.log(`Connected to Binance: ${symbol}`);
  });

  ws.on("message", async (msg: any) => {
    const data = JSON.parse(msg.toString());

    const trade = normalizeTrade(data);

    // console.log(trade.symbol, trade.price, trade.volume);

    // ارسال به Redis Stream
    const id = await redis.xadd(`stream:trades:${symbol}`, "*", "data", JSON.stringify(trade));

    // console.log("saved", id);
  });

  ws.on("close", () => {
    console.log("Reconnecting...");
    setTimeout(() => startBinanceWS(symbol), 3000);
  });
}
