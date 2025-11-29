import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

async function main() {
    console.log("=".repeat(80));
    console.log("COMPREHENSIVE TEST - Direct Yahoo Finance API");
    console.log("=".repeat(80));

    const scenarios = [
        {
            name: "US Stock - Apple (AAPL)",
            ticker: "AAPL",
            tests: ["market_1d", "market_1mo", "income_annual", "balance_quarterly", "cashflow_annual", "info", "news"],
        },
        {
            name: "Turkish Stock - Türk Hava Yolları (THYAO.IS)",
            ticker: "THYAO.IS",
            tests: ["market_1mo", "market_1y", "income_annual", "info", "news"],
        },
        {
            name: "Turkish Stock - Garanti Bankası (GARAN.IS)",
            ticker: "GARAN.IS",
            tests: ["market_5d", "balance_annual", "info"],
        },
        {
            name: "Turkish Stock - Ereğli Demir Çelik (EREGL.IS)",
            ticker: "EREGL.IS",
            tests: ["market_1mo", "info"],
        },
        {
            name: "Turkish Stock - BIST 100 (XU100.IS)",
            ticker: "XU100.IS",
            tests: ["market_1mo", "info"],
        },
        {
            name: "Crypto - Bitcoin (BTC-USD)",
            ticker: "BTC-USD",
            tests: ["market_5d_1h", "info"],
        },
        {
            name: "US Stock - Microsoft (MSFT)",
            ticker: "MSFT",
            tests: ["market_1y", "cashflow_quarterly", "info"],
        },
    ];

    for (const scenario of scenarios) {
        console.log("\n" + "=".repeat(80));
        console.log(`SCENARIO: ${scenario.name}`);
        console.log("=".repeat(80));

        for (const test of scenario.tests) {
            try {
                let result: any;
                let output: string;

                if (test.startsWith("market_")) {
                    const parts = test.split("_");
                    const period = parts[1];
                    const interval = parts[2] || "1d";

                    let period1: Date;
                    if (period === "1d") period1 = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
                    else if (period === "5d") period1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
                    else if (period === "1mo") period1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    else if (period === "1y") period1 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                    else period1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

                    result = await yahooFinance.chart(scenario.ticker, {
                        period1,
                        interval: interval as any,
                    });

                    const quotes = result.quotes || [];
                    const minified = quotes.map((r: any) => [
                        r.date.toISOString(),
                        r.open?.toFixed(2),
                        r.high?.toFixed(2),
                        r.low?.toFixed(2),
                        r.close?.toFixed(2),
                        r.volume,
                        r.adjclose?.toFixed(2),
                    ]);
                    output = JSON.stringify([["D", "O", "H", "L", "C", "V", "AC"], ...minified.slice(0, 3)]);
                    console.log(`\n✅ ${test}: ${quotes.length} data points`);
                    console.log(`   Sample: ${output.substring(0, 200)}...`);
                } else if (test.includes("income") || test.includes("balance") || test.includes("cashflow")) {
                    const [type, frequency] = test.split("_");
                    let moduleName = "";
                    if (type === "income") moduleName = "financials";
                    if (type === "balance") moduleName = "balance-sheet";
                    if (type === "cashflow") moduleName = "cash-flow";

                    result = await yahooFinance.fundamentalsTimeSeries(scenario.ticker, {
                        module: moduleName,
                        type: frequency === "quarterly" ? "quarterly" : "annual",
                        period1: "1900-01-01",
                    });

                    const sorted = result.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    console.log(`\n✅ ${test}: ${result.length} periods`);
                    if (sorted.length > 0) {
                        console.log(`   Latest: ${sorted[0].date.toISOString()} - Revenue: ${sorted[0].totalRevenue || "N/A"}`);
                    }
                } else if (test === "info") {
                    result = await yahooFinance.quoteSummary(scenario.ticker, {
                        modules: ["summaryDetail", "price", "summaryProfile"] as any,
                    });

                    const info = {
                        name: result.price?.shortName,
                        currency: result.price?.currency,
                        marketCap: result.price?.marketCap,
                        sector: result.summaryProfile?.sector,
                        price: result.price?.regularMarketPrice,
                    };

                    console.log(`\n✅ ${test}:`);
                    console.log(`   ${JSON.stringify(info)}`);
                } else if (test === "news") {
                    result = await yahooFinance.search(scenario.ticker, { newsCount: 3 });
                    console.log(`\n✅ ${test}: ${result.news.length} articles`);
                    if (result.news.length > 0) {
                        console.log(`   Latest: ${result.news[0].title}`);
                    }
                }
            } catch (error: any) {
                console.log(`\n❌ ${test}: ${error.message.substring(0, 100)}`);
            }
        }
    }

    console.log("\n" + "=".repeat(80));
    console.log("TEST COMPLETE");
    console.log("=".repeat(80));
}

main().catch(console.error);
