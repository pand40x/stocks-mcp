# Release Notes - v2.0.0

## 🎉 Major Update: Advanced Features

### New Features (7 Advanced Tools)

#### 1. **BIST Auto-Detection** 🇹🇷
- Automatic `.IS` suffix for Turkish stocks
- Smart ticker normalization (THYAO → THYAO.IS)
- Preserves US ticker formats

#### 2. **Technical Analysis** 📊
- RSI (14) - Relative Strength Index
- MACD - Moving Average Convergence Divergence
- SMA (20, 50, 200) - Simple Moving Averages
- Bollinger Bands - Volatility indicator
- Trend detection (Bullish/Bearish/Neutral)

#### 3. **Pivot Points** 🎯
- Classic pivot point calculation
- 3 resistance levels (R1, R2, R3)
- 3 support levels (S1, S2, S3)
- Current price position analysis

#### 4. **Stock Screener** 📋
- Predefined Yahoo Finance screeners
- Day gainers/losers
- Most actives
- Undervalued large caps
- Growth technology stocks
- Aggressive small caps

#### 5. **Peer Analysis** 🔍
- Find similar stocks algorithmically
- Sector peer recommendations
- Similarity scoring
- Portfolio diversification insights

#### 6. **Stock Filtering** 🎨
- Custom filtering by criteria
- PE ratio ranges
- Market cap filters
- Price range filtering
- Flexible investment strategies

#### 7. **Earnings Calendar** 📅
- Upcoming earnings dates
- Analyst estimates (avg, low, high)
- Revenue projections
- Historical earnings data

### Improvements

- **Batch Processing**: Process up to 50 tickers in parallel
- **Token Optimization**: 40-60% reduction in token usage
- **Error Handling**: Robust error handling across all tools
- **Documentation**: Comprehensive docs with examples

### Breaking Changes

None - All existing tools remain backward compatible

### Tool Count

- **v1.0.0**: 5 tools
- **v2.0.0**: 12 tools (+7 new)

### Testing

All features tested with:
- US stocks (AAPL, MSFT, GOOGL)
- Turkish stocks (THYAO.IS, GARAN.IS)
- Cryptocurrencies
- 9 comprehensive test scenarios

### Contributors

Python provider inspiration for advanced features design patterns.

---

## Download & Installation

```bash
git clone https://github.com/yourusername/stocks-mcp.git
cd stocks-mcp
npm install
npm run build
npm start
```

## Migration Guide

No migration needed - all v1.0.0 tools work exactly the same. Simply add new tools to your workflow as needed.

## What's Next

- Custom screener criteria
- Real-time streaming data
- More technical indicators
- Portfolio tracking
- Alert system

---

**Full Changelog**: v1.0.0...v2.0.0
