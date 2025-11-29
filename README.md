# Stocks MCP Server

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

MCP (Model Context Protocol) server for comprehensive stock market data using Yahoo Finance. Designed for LLMs and Telegram bots with token-optimized output.

## 🚀 Features

### Core Data Tools
- ✅ **Market Data** - Historical OHLCV with customizable periods/intervals
- ✅ **Financials** - Income statements, balance sheets, cash flow
- ✅ **Company Info** - Profile, valuation ratios, key statistics
- ✅ **Holders** - Major shareholders, institutional ownership
- ✅ **Extra Data** - Options, events, news, analyst recommendations

### Advanced Analysis Tools
- 🆕 **Technical Analysis** - RSI, MACD, SMA, Bollinger Bands, trend detection
- 🆕 **Pivot Points** - Support/resistance levels (PP, R1-R3, S1-S3)
- 🆕 **Stock Screener** - Predefined Yahoo screeners (day gainers, undervalued stocks)
- 🆕 **Peer Analysis** - Find similar stocks and sector peers
- 🆕 **Stock Filtering** - Custom filtering by PE, Market Cap, Price
- 🆕 **Earnings Calendar** - Upcoming earnings dates and estimates
- 🆕 **Batch Processing** - Process up to 50 tickers in parallel

### Market Support
- 🇺🇸 **US Markets** - Full support for all US stocks
- 🇹🇷 **Turkish BIST** - Auto-detection with `.IS` suffix
- 🪙 **Cryptocurrencies** - BTC, ETH, and other crypto assets
- 🌍 **International** - Any Yahoo Finance supported ticker

## 📦 Installation

```bash
git clone https://github.com/yourusername/stocks-mcp.git
cd stocks-mcp
npm install
npm run build
```

## 🎯 Quick Start

### Running the Server

```bash
node dist/index.js
```

### MCP Client Usage

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"],
});

const client = new Client({ name: "my-client", version: "1.0.0" }, { capabilities: {} });
await client.connect(transport);

// Example: Get technical analysis
const result = await client.request({
  method: "tools/call",
  params: {
    name: "get_technical_analysis",
    arguments: { ticker: "AAPL", period: "6mo" }
  }
});
```

## 🛠️ Available Tools

### 1. `get_market_data`
Get historical OHLCV data.

**Parameters:**
- `ticker` (required): Stock symbol (e.g., "AAPL" or "THYAO" for Turkish stocks)
- `period` (optional): "1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max" (default: "1d")
- `interval` (optional): "1m", "5m", "15m", "1h", "1d", "1wk", "1mo" (default: "1d")

**Output:** Minified array `[["D","O","H","L","C","V","AC"], [date, open, high, low, close, volume, adjClose], ...]`

### 2. `get_financials`
Get financial statements.

**Parameters:**
- `ticker` (required): Stock symbol
- `type` (required): "income", "balance", or "cashflow"
- `frequency` (optional): "annual" or "quarterly" (default: "annual")

**Output:** Minified arrays with statement-specific keys

### 3. `get_company_info`
Get company profile and statistics.

**Parameters:**
- `ticker` (required): Stock symbol

**Output:** Compact JSON `{name, sec, pe, mc, ...}`

### 4. `get_holders`
Get ownership data.

**Parameters:**
- `ticker` (required): Stock symbol

**Output:** Arrays for major/institutional/fund holders

### 5. `get_extra_data`
Get news, events, options, or recommendations.

**Parameters:**
- `ticker` (required): Stock symbol
- `type` (required): "news", "events", "options", "recommendations"

### 6. `get_technical_analysis` 🆕
Comprehensive technical indicators.

**Parameters:**
- `ticker` (required): Stock symbol
- `period` (optional): "1mo", "3mo", "6mo", "1y" (default: "6mo")

**Output:**
```json
{
  "current_price": 278.85,
  "rsi_14": 68.3,
  "sma_20": 271.59,
  "sma_50": 262.64,
  "macd": 4.14,
  "bollinger_upper": 278.77,
  "bollinger_lower": 264.42,
  "trend": "bullish"
}
```

### 7. `get_pivot_points` 🆕
Calculate support/resistance levels.

**Parameters:**
- `ticker` (required): Stock symbol

**Output:**
```json
{
  "pp": 485.00,
  "r1": 488.81, "r2": 492.11, "r3": 495.92,
  "s1": 481.70, "s2": 477.89, "s3": 474.59,
  "current_price": 492.01,
  "position": "above_pivot"
}
```

### 8. `batch_company_info` 🆕
Get data for multiple tickers in parallel.

**Parameters:**
- `tickers` (required): Array of symbols (max 50)

**Output:** `{total, successful, failed, data: [{ticker, name, price, pe, mc}]}`

### 9. `get_screener` 🆕
Access predefined Yahoo screeners.

**Parameters:**
- `scrId` (required): "day_gainers", "day_losers", "most_actives", "undervalued_large_caps", "growth_technology_stocks", "aggressive_small_caps", etc.
- `count` (optional): Number of results (default: 10, max: 50)

**Output:** `{id, title, count, quotes: [{symbol, name, price, change, volume}]}`

### 10. `get_peers` 🆕
Find similar stocks.

**Parameters:**
- `ticker` (required): Stock symbol

**Output:** `{ticker, peers: [{symbol, score}]}`

### 11. `filter_stocks` 🆕
Filter stocks by criteria.

**Parameters:**
- `tickers` (required): Array of symbols
- `criteria` (required): Object with `min_pe`, `max_pe`, `min_mc`, `max_mc`, `min_price`, `max_price`

**Output:** `{total_checked, matches, results: [{symbol, price, pe, mc}]}`

### 12. `get_earnings` 🆕
Get earnings calendar.

**Parameters:**
- `ticker` (required): Stock symbol

**Output:** `{earnings_date, earnings_avg, earnings_low, earnings_high, revenue_avg}`

## 🇹🇷 Turkish Stock Support (BIST)

**Auto-Detection:** The server automatically appends `.IS` suffix for Turkish tickers (4+ characters).

**Examples:**
- `THYAO` → `THYAO.IS` (Turkish Airlines)
- `GARAN` → `GARAN.IS` (Garanti Bank)
- `AAPL` → `AAPL` (US stocks preserved)

```typescript
// All these work automatically
await client.request({
  method: "tools/call",
  params: { name: "get_technical_analysis", arguments: { ticker: "THYAO" } }
});

await client.request({
  method: "tools/call",
  params: { name: "get_market_data", arguments: { ticker: "GARAN", period: "1mo" } }
});
```

**Popular BIST Tickers:**
- `THYAO` - Turkish Airlines
- `GARAN` - Garanti Bankası
- `EREGL` - Ereğli Demir Çelik
- `ASELS` - ASELSAN
- `TUPRS` - Tüpraş
- `XU100` - BIST 100 Index

## 📊 Example Use Cases

### Day Trading Setup
```typescript
// 1. Get pivot points for intraday levels
await client.request({
  method: "tools/call",
  params: { name: "get_pivot_points", arguments: { ticker: "AAPL" } }
});

// 2. Check technical momentum
await client.request({
  method: "tools/call",
  params: { name: "get_technical_analysis", arguments: { ticker: "AAPL", period: "1mo" } }
});

// 3. Get recent price action
await client.request({
  method: "tools/call",
  params: { name: "get_market_data", arguments: { ticker: "AAPL", period: "5d", interval: "15m" } }
});
```

### Portfolio Screening
```typescript
// Find day gainers
await client.request({
  method: "tools/call",
  params: { name: "get_screener", arguments: { scrId: "day_gainers", count: 20 } }
});

// Filter by criteria
await client.request({
  method: "tools/call",
  params: {
    name: "filter_stocks",
    arguments: {
      tickers: ["AAPL", "MSFT", "GOOGL", "META", "AMZN"],
      criteria: { min_pe: 20, max_pe: 40, min_mc: 1 }
    }
  }
});
```

### Sector Analysis
```typescript
// Find peers for a stock
await client.request({
  method: "tools/call",
  params: { name: "get_peers", arguments: { ticker: "AAPL" } }
});

// Batch analyze peers
await client.request({
  method: "tools/call",
  params: { name: "batch_company_info", arguments: { tickers: ["AAPL", "MSFT", "GOOGL"] } }
});
```

## ⚡ Output Optimization

All outputs are token-optimized:
- **Short keys**: `"Rev"` instead of `"totalRevenue"`
- **Array format**: Data as arrays where applicable
- **Number precision**: 2 decimal places
- **Compact dates**: ISO format

**Estimated Token Savings:**
- Market data (5 days): ~200 tokens
- Technical analysis: ~100 tokens
- Pivot points: ~80 tokens
- Batch (10 tickers): ~300 tokens

**Total:** 40-60% reduction vs. traditional JSON

## 📖 Documentation

- [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) - Detailed technical documentation
- [TEST_SCENARIOS.md](TEST_SCENARIOS.md) - Test scenarios and examples
- [walkthrough.md](.gemini/antigravity/brain/.../walkthrough.md) - Development walkthrough

## 🧪 Testing

```bash
# Run direct API tests
npx tsc test_direct_api.ts --module NodeNext --target ES2022 --moduleResolution NodeNext --skipLibCheck
node test_direct_api.js

# Run comprehensive tests
npx tsc comprehensive_test.ts --module NodeNext --target ES2022 --moduleResolution NodeNext --skipLibCheck
node comprehensive_test.js
```

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

ISC License - see [LICENSE](LICENSE) file for details

## 🔗 Links

- [Yahoo Finance API (yahoo-finance2)](https://github.com/gadicc/yahoo-finance2)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## ⭐ Support

If you find this useful, please consider starring the repository!

---

**Version:** 2.0.0  
**Author:** Your Name  
**Last Updated:** November 2024
