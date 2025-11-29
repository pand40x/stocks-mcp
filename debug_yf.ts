import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

async function main() {
    console.log("Testing chart...");
    try {
        const result = await yahooFinance.chart("AAPL", {
            period1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            interval: "1d",
        });
        console.log("Chart success:", result.quotes.length);
        console.log("Sample quote:", result.quotes[0]);
    } catch (e: any) {
        console.error("Chart error:", e.message);
    }

    console.log("\nTesting fundamentalsTimeSeries...");
    try {
        const result = await yahooFinance.fundamentalsTimeSeries("AAPL", {
            module: "financials",
            type: "annual",
            period1: "2020-01-01",
        });
        console.log("FTS success:", result.length);
        if (result.length > 0) {
            console.log("Sample result:", result[0]);
        }
    } catch (e: any) {
        console.error("FTS error:", e.message);
    }
}

main();
