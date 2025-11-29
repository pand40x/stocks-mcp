import YahooFinance from "yahoo-finance2";
import { performTechnicalAnalysis, calculatePivotPoints } from "./dist/technical_analysis.js";

const yahooFinance = new YahooFinance();

// Helper: Auto-append .IS for BIST tickers
const getTicker = (ticker_kodu: string): string => {
    const upper = ticker_kodu.toUpperCase();
    if (upper.includes('.')) return upper;
    const commonUS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'AMD', 'INTC',
        'NFLX', 'DIS', 'PYPL', 'SHOP', 'UBER', 'ABNB', 'COIN', 'RBLX', 'SNAP'];
    if (commonUS.includes(upper)) return upper;
    if (upper.length >= 4) return `${upper}.IS`;
    return upper;
};

async function main() {
    console.log("=".repeat(80));
    console.log("DIRECT API TEST - NEW FEATURES");
    console.log("=".repeat(80));

    // Test 1: BIST Auto-Suffix
    console.log("\n1. Testing BIST Auto-Suffix");
    const thyaoTicker = getTicker("THYAO");
    console.log(`   Input: THYAO -> Output: ${thyaoTicker}`);
    console.log(`   ✅ ${thyaoTicker === "THYAO.IS" ? "PASS" : "FAIL"}`);

    const aaplTicker = getTicker("AAPL");
    console.log(`   Input: AAPL -> Output: ${aaplTicker}`);
    console.log(`   ✅ ${aaplTicker === "AAPL" ? "PASS" : "FAIL"}`);

    // Test 2: Fetch BIST stock
    console.log("\n2. Testing THYAO.IS Data Fetch");
    try {
        const result = await yahooFinance.quoteSummary(thyaoTicker, {
            modules: ["price", "summaryProfile"] as any
        });
        console.log(`   ✅ Success: ${result.price?.shortName}`);
        console.log(`   Sector: ${result.summaryProfile?.sector}`);
    } catch (e: any) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    // Test 3: Technical Analysis
    console.log("\n3. Testing Technical Analysis (AAPL)");
    try {
        const hist = await yahooFinance.chart("AAPL", {
            period1: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            interval: "1d"
        });

        const closePrices = hist.quotes.map(q => q.close).filter(p => p !== null);
        const analysis = performTechnicalAnalysis(closePrices);

        console.log(`   ✅ Technical Analysis Complete:`);
        console.log(`      Current Price: $${analysis.current_price}`);
        console.log(`      RSI (14): ${analysis.rsi_14}`);
        console.log(`      SMA 20: ${analysis.sma_20}`);
        console.log(`      SMA 50: ${analysis.sma_50}`);
        console.log(`      SMA 200: ${analysis.sma_200}`);
        console.log(`      MACD: ${analysis.macd}`);
        console.log(`      Bollinger Bands: [${analysis.bollinger_lower}, ${analysis.bollinger_middle}, ${analysis.bollinger_upper}]`);
        console.log(`      Trend: ${analysis.trend}`);
    } catch (e: any) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    // Test 4: Pivot Points
    console.log("\n4. Testing Pivot Points (MSFT)");
    try {
        const hist = await yahooFinance.chart("MSFT", {
            period1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            interval: "1d"
        });

        if (hist.quotes.length >= 2) {
            const prevDay = hist.quotes[hist.quotes.length - 2];
            const pivots = calculatePivotPoints(prevDay.high, prevDay.low, prevDay.close);

            console.log(`   ✅ Pivot Points Calculated:`);
            console.log(`      Pivot Point: ${pivots.pp}`);
            console.log(`      Resistance: R1=${pivots.r1}, R2=${pivots.r2}, R3=${pivots.r3}`);
            console.log(`      Support: S1=${pivots.s1}, S2=${pivots.s2}, S3=${pivots.s3}`);
            console.log(`      Current Price: ${hist.quotes[hist.quotes.length - 1].close.toFixed(2)}`);
        }
    } catch (e: any) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    // Test 5: Batch Processing
    console.log("\n5. Testing Batch Processing (5 stocks)");
    const tickers = ["AAPL", "MSFT", "GOOGL", "THYAO", "GARAN"];
    try {
        const results = await Promise.allSettled(
            tickers.map(async (t) => {
                const ticker = getTicker(t);
                const result = await yahooFinance.quoteSummary(ticker, {
                    modules: ["price", "summaryDetail"] as any
                });
                return {
                    original: t,
                    normalized: ticker,
                    name: result.price?.shortName,
                    price: result.price?.regularMarketPrice?.toFixed(2)
                };
            })
        );

        console.log(`   ✅ Batch Processing Complete:`);
        results.forEach((r, i) => {
            if (r.status === "fulfilled") {
                const d = r.value;
                console.log(`      ${d.original} (${d.normalized}): ${d.name} - $${d.price}`);
            } else {
                console.log(`      ${tickers[i]}: Failed - ${r.reason.message.substring(0, 50)}`);
            }
        });
    } catch (e: any) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    // Test 6: Turkish Stock Technical Analysis
    console.log("\n6. Testing Turkish Stock TA (GARAN.IS)");
    try {
        const garanTicker = getTicker("GARAN");
        const hist = await yahooFinance.chart(garanTicker, {
            period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            interval: "1d"
        });

        const closePrices = hist.quotes.map(q => q.close).filter(p => p !== null);
        const analysis = performTechnicalAnalysis(closePrices);

        console.log(`   ✅ GARAN.IS Technical Analysis:`);
        console.log(`      Current: ${analysis.current_price} TRY`);
        console.log(`      RSI: ${analysis.rsi_14} (${analysis.rsi_14 < 30 ? 'Oversold' : analysis.rsi_14 > 70 ? 'Overbought' : 'Neutral'})`);
        console.log(`      Trend: ${analysis.trend}`);
    } catch (e: any) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    // Test 7: Screener (Day Gainers)
    console.log("\n7. Testing Screener (Day Gainers)");
    try {
        const result = await yahooFinance.screener({ scrIds: "day_gainers", count: 5 });
        console.log(`   ✅ Screener Results (${result.quotes.length} items):`);
        result.quotes.slice(0, 3).forEach((q: any) => {
            console.log(`      ${q.symbol}: $${q.regularMarketPrice} (${q.regularMarketChangePercent.toFixed(2)}%)`);
        });
    } catch (e: any) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    // Test 8: Peers (Recommendations)
    console.log("\n8. Testing Peers (AAPL)");
    try {
        const result = await yahooFinance.recommendationsBySymbol("AAPL");
        console.log(`   ✅ Peers Found (${result.recommendedSymbols.length}):`);
        result.recommendedSymbols.slice(0, 5).forEach((r: any) => {
            console.log(`      ${r.symbol} (Score: ${r.score.toFixed(2)})`);
        });
    } catch (e: any) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    // Test 9: Earnings Calendar
    console.log("\n9. Testing Earnings (MSFT)");
    try {
        const result = await yahooFinance.quoteSummary("MSFT", { modules: ["calendarEvents", "earnings"] as any });
        const cal = result.calendarEvents;
        console.log(`   ✅ Earnings Date: ${cal?.earnings?.earningsDate}`);
        console.log(`      Avg Estimate: ${cal?.earnings?.earningsAverage}`);
        console.log(`      Revenue Avg: ${cal?.earnings?.revenueAverage}`);
    } catch (e: any) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    console.log("\n" + "=".repeat(80));
    console.log("ALL TESTS COMPLETE");
    console.log("=".repeat(80));
}

main().catch(console.error);
