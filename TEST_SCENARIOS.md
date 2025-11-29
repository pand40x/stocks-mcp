# Test Scenarios and Parameters List

## Tool Parameters Reference

### 1. `get_market_data`

**Parameters:**
| Parameter | Type | Required | Options | Default | Description |
|-----------|------|----------|---------|---------|-------------|
| `ticker` | string | ✅ | Any valid ticker | - | Stock ticker symbol (e.g., "AAPL", "THYAO.IS") |
| `period` | string | ❌ | "1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y" | "1d" | Time period for historical data |
| `interval` | string | ❌ | "1m", "5m", "1h", "1d", "1wk", "1mo" | "1d" | Data interval |

**Example Scenarios:**

```typescript
// US Stock - Daily data for last 5 days
{ ticker: "AAPL", period: "5d", interval: "1d" }

// Turkish Stock - Monthly data for 1 year
{ ticker: "THYAO.IS", period: "1y", interval: "1wk" }

// Crypto - Hourly data for 5 days
{ ticker: "BTC-USD", period: "5d", interval: "1h" }

// BIST Index - Daily data for 1 month
{ ticker: "XU100.IS", period: "1mo", interval: "1d" }
```

---

### 2. `get_financials`

**Parameters:**
| Parameter | Type | Required | Options | Default | Description |
|-----------|------|----------|---------|---------|-------------|
| `ticker` | string | ✅ | Any valid ticker | - | Stock ticker symbol |
| `type` | string | ✅ | "income", "balance", "cashflow" | - | Type of financial statement |
| `frequency` | string | ❌ | "annual", "quarterly" | "annual" | Reporting frequency |

**Example Scenarios:**

```typescript
// Income statement - Annual
{ ticker: "AAPL", type: "income", frequency: "annual" }

// Balance sheet - Quarterly
{ ticker: "MSFT", type: "balance", frequency: "quarterly" }

// Cash flow - Annual
{ ticker: "THYAO.IS", type: "cashflow", frequency: "annual" }
```

**Note:** Some Turkish stocks may have limited financial data availability.

---

### 3. `get_company_info`

**Parameters:**
| Parameter | Type | Required | Options | Default | Description |
|-----------|------|----------|---------|---------|-------------|
| `ticker` | string | ✅ | Any valid ticker | - | Stock ticker symbol |

**Example Scenarios:**

```typescript
// US Tech Stock
{ ticker: "AAPL" }

// Turkish Stock
{ ticker: "GARAN.IS" }

// Crypto
{ ticker: "BTC-USD" }

// BIST Index
{ ticker: "XU100.IS" }
```

---

### 4. `get_holders`

**Parameters:**
| Parameter | Type | Required | Options | Default | Description |
|-----------|------|----------|---------|---------|-------------|
| `ticker` | string | ✅ | Any valid ticker | - | Stock ticker symbol |

**Example Scenarios:**

```typescript
// US Stock holders
{ ticker: "AAPL" }

// Turkish Stock holders (may have limited data)
{ ticker: "THYAO.IS" }
```

---

### 5. `get_extra_data`

**Parameters:**
| Parameter | Type | Required | Options | Default | Description |
|-----------|------|----------|---------|---------|-------------|
| `ticker` | string | ✅ | Any valid ticker | - | Stock ticker symbol |
| `type` | string | ✅ | "options", "events", "news", "recommendations" | - | Type of extra data |

**Example Scenarios:**

```typescript
// Latest news
{ ticker: "AAPL", type: "news" }

// Analyst recommendations
{ ticker: "MSFT", type: "recommendations" }

// Corporate events
{ ticker: "THYAO.IS", type: "events" }

// Options data (US stocks only typically)
{ ticker: "AAPL", type: "options" }
```

---

## Turkish Stock Ticker Format

BIST (Borsa Istanbul) stocks use `.IS` suffix:

| Company | Ticker | Sector |
|---------|--------|--------|
| Türk Hava Yolları | THYAO.IS | Airlines |
| Garanti Bankası | GARAN.IS | Banking |
| Ereğli Demir Çelik | EREGL.IS | Steel |
| Arçelik | ARCLK.IS | Consumer Goods |
| Türk Telekom | TTKOM.IS | Telecommunications |
| Aselsan | ASELS.IS | Defense |
| BIM | BIMAS.IS | Retail |
| BIST 100 Index | XU100.IS | Index |
| BIST 30 Index | XU030.IS | Index |

---

## Test Results Summary

### ✅ Supported Features

**All Stocks (US & Turkish):**
- ✅ Market data (chart/historical prices)
- ✅ Company info (profile, prices, sector)
- ✅ News articles

**US Stocks Only:**
- ✅ Financial statements (full support)
- ✅ Holder information
- ✅ Options data
- ✅ Analyst recommendations

**Turkish Stocks:**
- ⚠️ Limited financial statement data (varies by company)
- ⚠️ Limited holder information
- ❌ No options data
- ⚠️ Limited analyst recommendations

**Crypto:**
- ✅ Market data
- ✅ Basic info
- ❌ No financial statements
- ❌ No holders/options

---

## Complete Test Example

```typescript
// Test all tools with Apple
const tests = [
  // Market data - different periods
  { tool: "get_market_data", args: { ticker: "AAPL", period: "5d" } },
  { tool: "get_market_data", args: { ticker: "AAPL", period: "1mo", interval: "1wk" } },
  
  // All financial statements
  { tool: "get_financials", args: { ticker: "AAPL", type: "income", frequency: "annual" } },
  { tool: "get_financials", args: { ticker: "AAPL", type: "balance", frequency: "quarterly" } },
  { tool: "get_financials", args: { ticker: "AAPL", type: "cashflow", frequency: "annual" } },
  
  // Company info
  { tool: "get_company_info", args: { ticker: "AAPL" } },
  
  // Holders
  { tool: "get_holders", args: { ticker: "AAPL" } },
  
  // Extra data
  { tool: "get_extra_data", args: { ticker: "AAPL", type: "news" } },
  { tool: "get_extra_data", args: { ticker: "AAPL", type: "recommendations" } },
];

// Test Turkish stock
const turkishTests = [
  { tool: "get_market_data", args: { ticker: "THYAO.IS", period: "1mo" } },
  { tool: "get_company_info", args: { ticker: "THYAO.IS" } },
  { tool: "get_extra_data", args: { ticker: "THYAO.IS", type: "news" } },
];
```

---

## Output Size Comparison

| Tool | Ticker | Output Size | Token Est. |
|------|--------|-------------|------------|
| get_market_data (5d) | AAPL | ~800 chars | ~200 tokens |
| get_market_data (1mo) | THYAO.IS | ~3.5K chars | ~900 tokens |
| get_financials (annual) | AAPL | ~1.2K chars | ~300 tokens |
| get_company_info | AAPL | ~400 chars | ~100 tokens |
| get_holders | AAPL | ~800 chars | ~200 tokens |
| get_extra_data (news) | AAPL | ~1.5K chars | ~400 tokens |

*Token estimates are approximate (1 token ≈ 4 characters)*
