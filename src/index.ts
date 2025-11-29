import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from "@modelcontextprotocol/sdk/types.js";
import YahooFinance from "yahoo-finance2";
import { performTechnicalAnalysis, calculatePivotPoints } from "./technical_analysis.js";

const yahooFinance = new YahooFinance();
// @ts-ignore
// yahooFinance.suppressNotices(["yahooSurvey"]);

// Helper: Auto-append .IS for BIST tickers (inspired by Python provider)
const getTicker = (ticker_kodu: string): string => {
    const upper = ticker_kodu.toUpperCase();

    // If it already has a dot (like AAPL.US or GARAN.IS), leave it
    if (upper.includes('.')) {
        return upper;
    }

    // US tickers are typically 1-4 characters (AAPL, MSFT, GOOGL, META)
    // Turkish BIST tickers are typically 4-5 characters (THYAO, GARAN, EREGL, ASELS)
    // If 4+ chars and no dot, assume BIST and add .IS
    // Exception: well-known US tickers with 4-5 chars (AAPL, MSFT, GOOGL, AMZN, etc.)
    const commonUS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'AMD', 'INTC',
        'NFLX', 'DIS', 'PYPL', 'SHOP', 'UBER', 'ABNB', 'COIN', 'RBLX', 'SNAP'];

    if (commonUS.includes(upper)) {
        return upper;
    }

    // If 4 or more characters and not in common US list, assume BIST
    if (upper.length >= 4) {
        return `${upper}.IS`;
    }

    // 1-3 character tickers are always US (A, AA, AAA)
    return upper;
};

// Helper to format numbers to reduce token count
const fmt = (num: number | undefined | null) => {
    if (num === undefined || num === null) return null;
    return Number(num.toFixed(2));
};

const server = new Server(
    {
        name: "stocks-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Helper for large numbers if needed, but for now we keep raw numbers for accuracy unless requested otherwise.
// The user asked for "minified or array format".

server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools: Tool[] = [
        {
            name: "get_market_data",
            description:
                "Get historical or live market data. Returns array: [Date, Open, High, Low, Close, Volume, AdjClose]. For live data, returns a snapshot object.",
            inputSchema: {
                type: "object",
                properties: {
                    ticker: { type: "string", description: "Stock ticker symbol (e.g., AAPL)" },
                    period: {
                        type: "string",
                        description: "Period for historical data (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)",
                        default: "1d",
                    },
                    interval: {
                        type: "string",
                        description: "Interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)",
                        default: "1d"
                    }
                },
                required: ["ticker"],
            },
        },
        {
            name: "get_financials",
            description:
                "Get financial statements (Income, Balance Sheet, Cash Flow). Returns minified arrays of recent periods.",
            inputSchema: {
                type: "object",
                properties: {
                    ticker: { type: "string" },
                    type: {
                        type: "string",
                        enum: ["income", "balance", "cashflow"],
                        description: "Type of financial statement",
                    },
                    frequency: {
                        type: "string",
                        enum: ["annual", "quarterly"],
                        default: "annual",
                    },
                },
                required: ["ticker", "type"],
            },
        },
        {
            name: "get_company_info",
            description: "Get company profile and summary stats in a compact object.",
            inputSchema: {
                type: "object",
                properties: {
                    ticker: { type: "string" },
                },
                required: ["ticker"],
            },
        },
        {
            name: "get_holders",
            description: "Get major, institutional, and mutual fund holders.",
            inputSchema: {
                type: "object",
                properties: {
                    ticker: { type: "string" },
                },
                required: ["ticker"],
            },
        },
        {
            name: "get_extra_data",
            description: "Get options, events, news, or analyst recommendations.",
            inputSchema: {
                type: "object",
                properties: {
                    ticker: { type: "string" },
                    type: {
                        type: "string",
                        enum: ["options", "events", "news", "recommendations"],
                    },
                },
                required: ["ticker", "type"],
            },
        },
        {
            name: "get_technical_analysis",
            description: "Get comprehensive technical analysis including RSI, MACD, SMA, Bollinger Bands. Returns indicators with buy/sell signals.",
            inputSchema: {
                type: "object",
                properties: {
                    ticker: { type: "string", description: "Stock ticker symbol" },
                    period: { type: "string", description: "Historical period for analysis (default: 6mo)", default: "6mo" },
                },
                required: ["ticker"],
            },
        },
        {
            name: "get_pivot_points",
            description: "Calculate pivot points (PP, R1-R3, S1-S3) for support/resistance levels. Based on previous day's H/L/C.",
            inputSchema: {
                type: "object",
                properties: {
                    ticker: { type: "string", description: "Stock ticker symbol" },
                },
                required: ["ticker"],
            },
        },
        {
            name: "batch_company_info",
            description: "Get company info for multiple tickers in parallel (max 50). Returns array of company data.",
            inputSchema: {
                type: "object",
                properties: {
                    tickers: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of ticker symbols (max 50)",
                        maxItems: 50,
                    },
                },
                required: ["tickers"],
            },
        },
        {
            name: "get_screener",
            description: "Get predefined stock lists like day_gainers, day_losers, most_actives, undervalued_large_caps, etc.",
            inputSchema: {
                type: "object",
                properties: {
                    scrId: {
                        type: "string",
                        description: "Screener ID (day_gainers, day_losers, most_actives, undervalued_large_caps, growth_technology_stocks, aggressive_small_caps, etc.)",
                        default: "day_gainers"
                    },
                    count: {
                        type: "number",
                        description: "Number of results (default: 10, max: 50)",
                        default: 10
                    }
                },
                required: ["scrId"],
            },
        },
        {
            name: "get_peers",
            description: "Find similar stocks or peers for a given ticker.",
            inputSchema: {
                type: "object",
                properties: {
                    ticker: { type: "string", description: "Stock ticker symbol" },
                },
                required: ["ticker"],
            },
        },
        {
            name: "filter_stocks",
            description: "Filter a list of stocks based on criteria like PE ratio, Market Cap, Price, etc.",
            inputSchema: {
                type: "object",
                properties: {
                    tickers: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of tickers to filter"
                    },
                    criteria: {
                        type: "object",
                        description: "Filter criteria (min_pe, max_pe, min_mc, max_mc, min_price, max_price)",
                        properties: {
                            min_pe: { type: "number" },
                            max_pe: { type: "number" },
                            min_mc: { type: "number", description: "Min Market Cap in Billions" },
                            max_mc: { type: "number", description: "Max Market Cap in Billions" },
                            min_price: { type: "number" },
                            max_price: { type: "number" }
                        }
                    }
                },
                required: ["tickers", "criteria"],
            },
        },
        {
            name: "get_earnings",
            description: "Get earnings calendar and estimates for a ticker.",
            inputSchema: {
                type: "object",
                properties: {
                    ticker: { type: "string", description: "Stock ticker symbol" },
                },
                required: ["ticker"],
            },
        },
    ];
    return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "get_market_data") {
            const ticker = getTicker(String(args?.ticker));
            const period = String(args?.period || "1d");
            const interval = String(args?.interval || "1d");

            // Calculate period1 based on period
            // Convert shorthand periods to dates
            let period1: Date;
            if (period === "1d") period1 = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
            else if (period === "5d") period1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
            else if (period === "1mo") period1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            else if (period === "3mo") period1 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            else if (period === "6mo") period1 = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
            else if (period === "1y") period1 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
            else if (period === "2y") period1 = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
            else if (period === "5y") period1 = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000);
            else period1 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // default 1y

            const result: any = await yahooFinance.chart(ticker, {
                period1,
                interval: interval as any,
            });

            // chart returns { meta, quotes, ... }
            const quotes = result.quotes;

            if (!quotes || !Array.isArray(quotes)) {
                return { content: [{ type: "text", text: "No data found" }] };
            }

            // Minify: [Date(ISO), Open, High, Low, Close, Volume]
            const minified = quotes.map((r: any) => [
                r.date.toISOString(), // Full ISO datetime
                fmt(r.open),
                fmt(r.high),
                fmt(r.low),
                fmt(r.close),
                r.volume,
                fmt(r.adjclose),
            ]);

            const header = ["D", "O", "H", "L", "C", "V", "AC"];

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify([header, ...minified]),
                    },
                ],
            };
        }

        if (name === "get_financials") {
            const ticker = getTicker(String(args?.ticker));
            const type = String(args?.type);
            const frequency = String(args?.frequency || "annual");

            // Map to module names
            let moduleName = "";
            if (type === "income") moduleName = "financials";
            if (type === "balance") moduleName = "balance-sheet";
            if (type === "cashflow") moduleName = "cash-flow";

            // Map to type (quarterly, annual, trailing)
            let typeParam = frequency === "quarterly" ? "quarterly" : "annual";

            const result: any = await yahooFinance.fundamentalsTimeSeries(ticker, {
                module: moduleName,
                type: typeParam,
                period1: "1900-01-01", // Get all available data
            });

            // result is array of objects
            if (!result || !Array.isArray(result) || result.length === 0) {
                return { content: [{ type: "text", text: "No data found" }] };
            }

            // Sort by date desc (most recent first)
            const sorted = result.sort(
                (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            // Minify
            let keys: string[] = [];
            let mapped: any[] = [];

            if (type === "income") {
                keys = ["Date", "Rev", "GrPrf", "NetInc", "OpExp"];
                mapped = sorted.map((s: any) => [
                    s.date.toISOString(), // Full ISO datetime
                    s.totalRevenue,
                    s.grossProfit,
                    s.netIncome,
                    s.operatingExpense,
                ]);
            } else if (type === "balance") {
                keys = ["Date", "Assets", "Liab", "Eq", "Cash"];
                mapped = sorted.map((s: any) => [
                    s.date.toISOString(), // Full ISO datetime
                    s.totalAssets,
                    s.totalLiabilitiesNetMinorityInterest,
                    s.totalEquityGrossMinorityInterest,
                    s.cashAndCashEquivalents,
                ]);
            } else if (type === "cashflow") {
                keys = ["Date", "Op", "Inv", "Fin", "FreeCF"];
                mapped = sorted.map((s: any) => [
                    s.date.toISOString(), // Full ISO datetime
                    s.operatingCashFlow,
                    s.investingCashFlow,
                    s.financingCashFlow,
                    s.freeCashFlow,
                ]);
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify([keys, ...mapped]),
                    },
                ],
            };
        }

        if (name === "get_company_info") {
            const ticker = getTicker(String(args?.ticker));
            const modules = ["summaryDetail", "defaultKeyStatistics", "price", "summaryProfile"];
            const result: any = await yahooFinance.quoteSummary(ticker, { modules: modules as any });

            const summary = result.summaryDetail;
            const stats = result.defaultKeyStatistics;
            const price = result.price;
            const profile = result.summaryProfile;

            const info = {
                name: price?.shortName,
                sec: profile?.sector,
                ind: profile?.industry,
                pe: fmt(summary?.trailingPE),
                fPe: fmt(summary?.forwardPE),
                mc: summary?.marketCap,
                eps: fmt(stats?.trailingEps),
                pb: fmt(stats?.priceToBook),
                peg: fmt(stats?.pegRatio),
                beta: fmt(summary?.beta),
                hi52: fmt(summary?.fiftyTwoWeekHigh),
                lo52: fmt(summary?.fiftyTwoWeekLow),
                divY: fmt(summary?.dividendYield),
                web: profile?.website,
                desc: profile?.longBusinessSummary?.substring(0, 200) + "...", // Truncate
            };

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(info),
                    },
                ],
            };
        }

        if (name === "get_holders") {
            const ticker = getTicker(String(args?.ticker));
            const result: any = await yahooFinance.quoteSummary(ticker, { modules: ["majorHoldersBreakdown", "institutionOwnership", "fundOwnership"] });

            const major = result.majorHoldersBreakdown;
            const inst = result.institutionOwnership;
            const fund = result.fundOwnership;

            // Minify
            const majorArr = [
                ["Insiders", fmt(major?.insidersPercentHeld)],
                ["Inst", fmt(major?.institutionsPercentHeld)]
            ];

            const instArr = inst?.map((i: any) => [i.organization, fmt(i.pctHeld), i.position]).slice(0, 5) || [];
            const fundArr = fund?.map((f: any) => [f.organization, fmt(f.pctHeld), f.position]).slice(0, 5) || [];

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            major: majorArr,
                            inst: instArr, // [Name, %, Count]
                            fund: fundArr  // [Name, %, Count]
                        }),
                    },
                ],
            };
        }

        if (name === "get_extra_data") {
            const ticker = getTicker(String(args?.ticker));
            const type = String(args?.type);

            if (type === "news") {
                const news: any = await yahooFinance.search(ticker, { newsCount: 5 });
                const headlines = news.news.map((n: any) => [n.title, n.link, n.providerPublishTime]);
                return { content: [{ type: "text", text: JSON.stringify(headlines) }] };
            }

            if (type === "recommendations") {
                const result: any = await yahooFinance.quoteSummary(ticker, { modules: ["recommendationTrend", "financialData"] });
                const trend = result.recommendationTrend?.trend?.[0]; // Latest
                const target = result.financialData;

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            rec: trend, // { strongBuy, buy, hold, sell, strongSell }
                            target: {
                                low: target?.targetLowPrice,
                                high: target?.targetHighPrice,
                                mean: target?.targetMeanPrice,
                                median: target?.targetMedianPrice
                            }
                        })
                    }]
                };
            }

            if (type === "events") {
                const result: any = await yahooFinance.quoteSummary(ticker, { modules: ["calendarEvents"] });
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(result.calendarEvents)
                    }]
                };
            }

            // Options is complex, yahoo-finance2 has 'options' method
            if (type === "options") {
                // Just get the nearest expiration date summary
                const opts: any = await yahooFinance.options(ticker, {});
                const calls = opts.options[0].calls.slice(0, 5).map((c: any) => [c.strike, c.lastPrice, c.volume]);
                const puts = opts.options[0].puts.slice(0, 5).map((p: any) => [p.strike, p.lastPrice, p.volume]);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            exp: opts.options[0].expirationDate,
                            calls: calls, // [Strike, Price, Vol]
                            puts: puts
                        })
                    }]
                };
            }

            return { content: [{ type: "text", text: "Unknown type" }] };
        }

        if (name === "get_technical_analysis") {
            const ticker = getTicker(String(args?.ticker));
            const period = String(args?.period || "6mo");

            // Get historical data
            let period1: Date;
            if (period === "1mo") period1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            else if (period === "3mo") period1 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            else if (period === "6mo") period1 = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
            else if (period === "1y") period1 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
            else period1 = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

            const result: any = await yahooFinance.chart(ticker, {
                period1,
                interval: "1d",
            });

            if (!result.quotes || result.quotes.length < 20) {
                return { content: [{ type: "text", text: "Insufficient data for technical analysis" }] };
            }

            // Extract close prices
            const closePrices = result.quotes.map((q: any) => q.close).filter((p: any) => p !== null);

            // Perform technical analysis
            const analysis = performTechnicalAnalysis(closePrices);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(analysis)
                }]
            };
        }

        if (name === "get_pivot_points") {
            const ticker = getTicker(String(args?.ticker));

            // Get last 5 days to ensure we have previous day's data
            const result: any = await yahooFinance.chart(ticker, {
                period1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                interval: "1d",
            });

            if (!result.quotes || result.quotes.length < 2) {
                return { content: [{ type: "text", text: "Insufficient data for pivot points" }] };
            }

            // Use previous day (second to last)
            const prevDay = result.quotes[result.quotes.length - 2];
            const currentDay = result.quotes[result.quotes.length - 1];

            const pivots = calculatePivotPoints(
                prevDay.high,
                prevDay.low,
                prevDay.close
            );

            const currentPrice = currentDay.close;

            // Determine position relative to pivot
            let position = "at_pivot";
            if (currentPrice > pivots.pp * 1.002) position = "above_pivot";
            else if (currentPrice < pivots.pp * 0.998) position = "below_pivot";

            // Find nearest support and resistance
            const resistances = [
                { level: "R1", price: pivots.r1 },
                { level: "R2", price: pivots.r2 },
                { level: "R3", price: pivots.r3 },
            ];

            const supports = [
                { level: "S1", price: pivots.s1 },
                { level: "S2", price: pivots.s2 },
                { level: "S3", price: pivots.s3 },
            ];

            const nearestResistance = resistances.find(r => r.price > currentPrice);
            const nearestSupport = [...supports].reverse().find(s => s.price < currentPrice);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        ...pivots,
                        current_price: fmt(currentPrice),
                        position,
                        nearest_resistance: nearestResistance?.level,
                        nearest_support: nearestSupport?.level,
                        reference_date: prevDay.date.toISOString().split('T')[0]
                    })
                }]
            };
        }

        if (name === "batch_company_info") {
            const tickers = args?.tickers as string[];

            if (!tickers || !Array.isArray(tickers)) {
                return { content: [{ type: "text", text: "Invalid tickers array" }] };
            }

            if (tickers.length > 50) {
                return { content: [{ type: "text", text: "Maximum 50 tickers allowed" }] };
            }

            // Process tickers in parallel
            const results = await Promise.allSettled(
                tickers.map(async (t) => {
                    const ticker = getTicker(t);
                    const modules = ["summaryDetail", "defaultKeyStatistics", "price", "summaryProfile"];
                    const result: any = await yahooFinance.quoteSummary(ticker, { modules: modules as any });

                    const summary = result.summaryDetail;
                    const stats = result.defaultKeyStatistics;
                    const price = result.price;
                    const profile = result.summaryProfile;

                    return {
                        ticker: t,
                        name: price?.shortName,
                        sector: profile?.sector,
                        price: fmt(summary?.regularMarketPrice || price?.regularMarketPrice),
                        pe: fmt(summary?.trailingPE),
                        mc: summary?.marketCap,
                        change: fmt(summary?.regularMarketChangePercent),
                    };
                })
            );

            const successful = results
                .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
                .map(r => r.value);

            const failed = results
                .filter(r => r.status === "rejected")
                .length;

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        total: tickers.length,
                        successful: successful.length,
                        failed,
                        data: successful
                    })
                }]
            };
        }

        if (name === "get_screener") {
            const scrId = String(args?.scrId || "day_gainers");
            const count = Math.min(Number(args?.count || 10), 50);

            const result: any = await yahooFinance.screener({
                scrIds: scrId as any,
                count: count
            });

            const quotes = result.quotes.map((q: any) => ({
                symbol: q.symbol,
                name: q.shortName,
                price: fmt(q.regularMarketPrice),
                change: fmt(q.regularMarketChangePercent),
                volume: q.regularMarketVolume,
                pe: fmt(q.trailingPE),
                mc: q.marketCap
            }));

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        id: result.id,
                        title: result.title,
                        count: quotes.length,
                        quotes: quotes
                    })
                }]
            };
        }

        if (name === "get_peers") {
            const ticker = getTicker(String(args?.ticker));

            // Use recommendationsBySymbol to find peers
            const result: any = await yahooFinance.recommendationsBySymbol(ticker);

            const peers = result.recommendedSymbols.map((r: any) => ({
                symbol: r.symbol,
                score: fmt(r.score)
            }));

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        ticker: ticker,
                        peers: peers
                    })
                }]
            };
        }

        if (name === "filter_stocks") {
            const tickers = args?.tickers as string[];
            const criteria = args?.criteria as any;

            if (!tickers || !Array.isArray(tickers)) {
                return { content: [{ type: "text", text: "Invalid tickers array" }] };
            }

            // Fetch data for all tickers
            const results = await Promise.allSettled(
                tickers.map(async (t) => {
                    const ticker = getTicker(t);
                    const modules = ["summaryDetail", "defaultKeyStatistics", "price"];
                    const result: any = await yahooFinance.quoteSummary(ticker, { modules: modules as any });

                    const summary = result.summaryDetail;
                    const price = result.price;

                    return {
                        symbol: t,
                        price: summary?.regularMarketPrice || price?.regularMarketPrice,
                        pe: summary?.trailingPE,
                        mc: summary?.marketCap,
                        name: price?.shortName
                    };
                })
            );

            const data = results
                .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
                .map(r => r.value);

            // Filter based on criteria
            const filtered = data.filter(stock => {
                if (criteria.min_pe && (!stock.pe || stock.pe < criteria.min_pe)) return false;
                if (criteria.max_pe && (!stock.pe || stock.pe > criteria.max_pe)) return false;

                if (criteria.min_mc && (!stock.mc || stock.mc < criteria.min_mc * 1e9)) return false;
                if (criteria.max_mc && (!stock.mc || stock.mc > criteria.max_mc * 1e9)) return false;

                if (criteria.min_price && (!stock.price || stock.price < criteria.min_price)) return false;
                if (criteria.max_price && (!stock.price || stock.price > criteria.max_price)) return false;

                return true;
            });

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        total_checked: data.length,
                        matches: filtered.length,
                        results: filtered.map(f => ({
                            symbol: f.symbol,
                            price: fmt(f.price),
                            pe: fmt(f.pe),
                            mc: f.mc
                        }))
                    })
                }]
            };
        }

        if (name === "get_earnings") {
            const ticker = getTicker(String(args?.ticker));

            const result: any = await yahooFinance.quoteSummary(ticker, {
                modules: ["calendarEvents", "earnings"]
            });

            const calendar = result.calendarEvents;
            const earnings = result.earnings;

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        earnings_date: calendar?.earnings?.earningsDate,
                        earnings_avg: fmt(calendar?.earnings?.earningsAverage),
                        earnings_low: fmt(calendar?.earnings?.earningsLow),
                        earnings_high: fmt(calendar?.earnings?.earningsHigh),
                        revenue_avg: calendar?.earnings?.revenueAverage,
                        financials_chart: earnings?.financialsChart,
                        earnings_chart: earnings?.earningsChart
                    })
                }]
            };
        }

        throw new Error(`Unknown tool: ${name}`);
    } catch (error: any) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});

(async () => {
    const transport = new StdioServerTransport();
    await server.connect(transport);
})();
