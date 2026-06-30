# SignalA

## معرفی پروژه

SignalA یک پلتفرم هوشمند تحلیل بازارهای مالی است که با معماری **Event-Driven** و **Microservices** طراحی شده است.

هدف پروژه، جمع‌آوری داده‌های زنده از صرافی‌های مختلف، پردازش لحظه‌ای اطلاعات بازار، استخراج Featureهای تخصصی، تحلیل رفتار بازار، تشخیص فرصت‌های معاملاتی و در نهایت تولید سیگنال‌های هوشمند با استفاده از قوانین، تحلیل آماری و هوش مصنوعی است.

پروژه به گونه‌ای طراحی شده که بتواند صدها نماد معاملاتی را به صورت همزمان با حداقل تأخیر پردازش کند.

---

# معماری کلی سیستم

```
                  Exchanges

 Binance
 Bybit
 OKX
 Hyperliquid
 Gate
 MEXC
 ...

        │
        ▼

+----------------------+
|      Collector       |
+----------------------+

        │

 Redis Streams

        │

        ▼

+----------------------+
|   Feature Engine     |
+----------------------+

        │

        ▼

+----------------------+
| Indicator Engine     |
+----------------------+

        │

        ▼

+----------------------+
| Whale Engine         |
+----------------------+

        │

        ▼

+----------------------+
| Liquidity Engine     |
+----------------------+

        │

        ▼

+----------------------+
| Market State Engine  |
+----------------------+

        │

        ▼

+----------------------+
| Signal Engine        |
+----------------------+

        │

        ▼

+----------------------+
| Risk Engine          |
+----------------------+

        │

        ▼

 Notification
 Dashboard
 AI
 Backtest
 Portfolio
```

---

# مسیر جریان داده

```
Exchange

↓

Collector

↓

Redis Streams

↓

Feature Extraction

↓

Indicators

↓

Market Analysis

↓

Signal Generation

↓

Risk Analysis

↓

Notification

↓

Dashboard

↓

AI Learning
```

---

# ساختار کلی پروژه

```
apps/

collector

feature-engine

indicator-engine

whale-engine

liquidity-engine

market-state-engine

signal-engine

risk-engine

notification-engine

backtest-engine

strategy-engine

portfolio-engine

ai-engine

dashboard-api

packages/

shared
```

---

# وظیفه هر Engine

## Collector

جمع‌آوری داده‌های لحظه‌ای از صرافی‌ها

خروجی:

- Trades
- OrderBook
- BookTicker
- Funding
- Open Interest
- Liquidations
- Klines
- Mark Price

---

## Feature Engine

تبدیل داده خام بازار به Featureهای قابل استفاده.

نمونه Featureها:

- VWAP
- Delta Volume
- Spread
- Order Imbalance
- Volatility
- Liquidity Metrics

---

## Indicator Engine

محاسبه اندیکاتورها.

اندیکاتورهای فعلی:

- EMA
- SMA
- RSI
- MACD
- ATR
- Bollinger Bands
- ADX
- SuperTrend

قابل توسعه به ده‌ها اندیکاتور دیگر.

---

## Whale Engine

تحلیل رفتار نهنگ‌ها.

نمونه تحلیل:

- Large Trades
- Iceberg Orders
- Absorption
- Aggressive Buyers
- Aggressive Sellers
- Whale Score

---

## Liquidity Engine

تحلیل نقدینگی بازار.

نمونه خروجی:

- Liquidity Zones
- Liquidity Grab
- Order Book Pressure
- Market Pressure
- Imbalance

---

## Market State Engine

تشخیص وضعیت بازار.

حالت‌های فعلی:

- Trend
- Range
- Expansion
- Compression

همراه با:

- Trend Score
- Volatility
- Market Confidence

---

## Signal Engine

هسته اصلی پروژه.

وظایف:

- دریافت خروجی تمام Engineها
- ساخت Context بازار
- امتیازدهی
- ترکیب Featureها
- تولید سیگنال نهایی

خروجی:

- Direction
- Score
- Confidence
- Entry
- Stop Loss
- Take Profit

---

## Risk Engine

تحلیل ریسک معامله.

شامل:

- Position Size
- Dynamic Stop Loss
- Dynamic Take Profit
- Risk / Reward
- Trade Quality
- Suggested Leverage

---

## Notification Engine

ارسال سیگنال‌ها به:

- Telegram
- Discord
- Webhook
- Email
- Dashboard

---

# Engineهای برنامه‌ریزی شده

## Correlation Engine

تحلیل همبستگی نمادها.

---

## Funding Engine

تحلیل Funding Rate.

---

## Open Interest Engine

تحلیل تغییرات OI.

---

## Liquidation Engine

تحلیل لیکویید شدن معامله‌گران.

---

## Pattern Engine

تشخیص الگوهای کلاسیک و آماری.

---

## Strategy Engine

اجرای استراتژی‌های مختلف معاملاتی.

---

## Backtest Engine

اجرای استراتژی روی داده‌های گذشته.

---

## Replay Engine

بازپخش داده‌های تاریخی برای تست.

---

## Portfolio Engine

مدیریت سرمایه.

---

## Paper Trading Engine

معامله آزمایشی.

---

## AI Engine

وزن‌دهی هوشمند Featureها.

تشخیص شرایط بازار.

بهبود کیفیت سیگنال.

---

## Machine Learning Engine

یادگیری از معاملات گذشته.

بهینه‌سازی وزن Featureها.

پیش‌بینی موفقیت سیگنال‌ها.

---

# Shared Package

بخش مشترک پروژه.

شامل:

- Redis Bus
- Event Bus
- WebSocket Manager
- Base Engine
- Indicators
- OrderBook
- Pipeline
- Logger
- Config
- PostgreSQL
- Utilities
- Types

---

# معماری ارتباط

تمام ارتباط بین Engineها از طریق Redis Streams انجام می‌شود.

هیچ Engine به صورت مستقیم Engine دیگری را فراخوانی نمی‌کند.

مزایا:

- Loose Coupling
- Scalability
- Fault Tolerance
- Horizontal Scaling
- High Throughput

---

# اصول طراحی پروژه

- Event-Driven Architecture
- Microservices
- Domain Driven Design
- SOLID Principles
- Clean Architecture
- High Performance
- Low Latency
- Extensible
- Exchange Agnostic
- AI Ready

---

# وضعیت فعلی پروژه

پیاده‌سازی شده:

- Shared Core
- WebSocket Manager
- Redis Bus
- Pipeline
- OrderBook
- Feature Engine
- Indicator Engine
- Whale Engine
- Liquidity Engine
- Market State Engine
- Signal Engine (نسخه اولیه)
- Risk Engine (نسخه اولیه)
- Collector (در حال توسعه)

در حال توسعه:

- Collector Production
- Backtest Engine
- Strategy Engine
- AI Engine
- Machine Learning
- Portfolio
- Notification
- Dashboard API

---

# چشم‌انداز پروژه

هدف نهایی SignalA ایجاد یک موتور هوشمند تحلیل بازار است که بتواند:

- داده‌های لحظه‌ای چندین صرافی را پردازش کند.
- رفتار بازار را در زمان واقعی تحلیل کند.
- فرصت‌های معاملاتی را با احتمال موفقیت بالا شناسایی کند.
- مدیریت ریسک را به صورت خودکار انجام دهد.
- از نتایج معاملات گذشته یاد بگیرد.
- کیفیت سیگنال‌ها را به مرور زمان بهبود دهد.
- به عنوان هسته یک پلتفرم معاملاتی حرفه‌ای و مقیاس‌پذیر مورد استفاده قرار گیرد.

# SignalA

Enterprise Smart Trading Signal Platform

## Stack

- Node.js
- TypeScript
- Redis
- PostgreSQL
- TurboRepo
- pnpm
