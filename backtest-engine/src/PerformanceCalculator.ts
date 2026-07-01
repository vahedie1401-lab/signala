import type { ClosedTrade } from "./BacktestPosition";

export interface EquityPoint {
  time: number;

  balance: number;
}

export interface PerformanceReport {
  totalTrades: number;

  wins: number;

  losses: number;

  winRate: number;

  totalPnl: number;

  totalFees: number;

  grossProfit: number;

  grossLoss: number;

  profitFactor: number;

  averageWin: number;

  averageLoss: number;

  largestWin: number;

  largestLoss: number;

  maxDrawdown: number;

  maxDrawdownPercent: number;

  finalBalance: number;

  returnPercent: number;

  equityCurve: EquityPoint[];
}

export class PerformanceCalculator {
  calculate(initialBalance: number, trades: ClosedTrade[]): PerformanceReport {
    const equityCurve: EquityPoint[] = [
      { time: trades[0]?.entryTime ?? 0, balance: initialBalance },
    ];

    let balance = initialBalance;
    let peak = initialBalance;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;

    let grossProfit = 0;
    let grossLoss = 0;
    let totalFees = 0;
    let wins = 0;
    let losses = 0;
    let largestWin = 0;
    let largestLoss = 0;

    for (const trade of trades) {
      balance += trade.pnl;
      totalFees += trade.fees;

      if (trade.pnl >= 0) {
        wins += 1;
        grossProfit += trade.pnl;
        largestWin = Math.max(largestWin, trade.pnl);
      } else {
        losses += 1;
        grossLoss += Math.abs(trade.pnl);
        largestLoss = Math.min(largestLoss, trade.pnl);
      }

      peak = Math.max(peak, balance);

      const drawdown = peak - balance;
      const drawdownPercent = peak === 0 ? 0 : (drawdown / peak) * 100;

      maxDrawdown = Math.max(maxDrawdown, drawdown);
      maxDrawdownPercent = Math.max(maxDrawdownPercent, drawdownPercent);

      equityCurve.push({ time: trade.exitTime, balance });
    }

    const totalTrades = trades.length;
    const totalPnl = balance - initialBalance;

    return {
      totalTrades,
      wins,
      losses,
      winRate: totalTrades === 0 ? 0 : (wins / totalTrades) * 100,
      totalPnl,
      totalFees,
      grossProfit,
      grossLoss,
      profitFactor: grossLoss === 0 ? grossProfit : grossProfit / grossLoss,
      averageWin: wins === 0 ? 0 : grossProfit / wins,
      averageLoss: losses === 0 ? 0 : -grossLoss / losses,
      largestWin,
      largestLoss,
      maxDrawdown,
      maxDrawdownPercent,
      finalBalance: balance,
      returnPercent: initialBalance === 0 ? 0 : (totalPnl / initialBalance) * 100,
      equityCurve,
    };
  }
}
