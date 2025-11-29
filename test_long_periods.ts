import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

async function testLongPeriods() {
    console.log("=".repeat(80));
    console.log("TURKISH STOCKS - LONG PERIOD HISTORICAL DATA TEST");
    console.log("=".repeat(80));

    const testStocks = [
        { ticker: "THYAO.IS", name: "Türk Hava Yolları" },
        { ticker: "GARAN.IS", name: "Garanti Bankası" },
        { ticker: "ASELS.IS", name: "ASELSAN" }
    ];

    const periods = [
        { name: "3 months", days: 90 },
        { name: "6 months", days: 180 },
        { name: "9 months", days: 270 },
        { name: "12 months (1 year)", days: 365 }
    ];

    for (const stock of testStocks) {
        console.log(`\n${"=".repeat(70)}`);
        console.log(`${stock.name} (${stock.ticker})`);
        console.log("=".repeat(70));

        for (const period of periods) {
            console.log(`\n[${period.name}]`);
            try {
                const result = await yahooFinance.chart(stock.ticker, {
                    period1: new Date(Date.now() - period.days * 24 * 60 * 60 * 1000),
                    interval: "1d"
                });

                if (result.quotes.length > 0) {
                    const first = result.quotes[0];
                    const last = result.quotes[result.quotes.length - 1];
                    const priceChange = ((last.close! / first.close! - 1) * 100);

                    console.log(`  ✅ Data points: ${result.quotes.length}`);
                    console.log(`  📅 Range: ${first.date.toISOString().split('T')[0]} → ${last.date.toISOString().split('T')[0]}`);
                    console.log(`  💰 Price: ${first.close?.toFixed(2)} → ${last.close?.toFixed(2)} TRY`);
                    console.log(`  📊 Change: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`);

                    // Calculate some stats
                    const prices = result.quotes.map(q => q.close!);
                    const high = Math.max(...prices);
                    const low = Math.min(...prices);
                    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

                    console.log(`  📈 High: ${high.toFixed(2)} | Low: ${low.toFixed(2)} | Avg: ${avg.toFixed(2)} TRY`);
                } else {
                    console.log(`  ⚠️ No data available`);
                }
            } catch (e: any) {
                console.log(`  ❌ Error: ${e.message}`);
            }
        }
    }

    console.log("\n" + "=".repeat(80));
    console.log("EXTENDED PERIOD TEST - 2 YEARS");
    console.log("=".repeat(80));

    // Test 2 years for one stock
    const testStock = "THYAO.IS";
    console.log(`\nTesting: ${testStock}`);

    try {
        const result = await yahooFinance.chart(testStock, {
            period1: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000), // 2 years
            interval: "1d"
        });

        if (result.quotes.length > 0) {
            const first = result.quotes[0];
            const last = result.quotes[result.quotes.length - 1];
            const priceChange = ((last.close! / first.close! - 1) * 100);

            console.log(`✅ Data points: ${result.quotes.length}`);
            console.log(`📅 Range: ${first.date.toISOString().split('T')[0]} → ${last.date.toISOString().split('T')[0]}`);
            console.log(`💰 Price: ${first.close?.toFixed(2)} → ${last.close?.toFixed(2)} TRY`);
            console.log(`📊 Change: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`);

            // Year markers
            const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
            const oneYearData = result.quotes.find(q => {
                const diff = Math.abs(q.date.getTime() - oneYearAgo.getTime());
                return diff < 7 * 24 * 60 * 60 * 1000; // Within 7 days
            });

            if (oneYearData) {
                const yearChange = ((last.close! / oneYearData.close! - 1) * 100);
                console.log(`📆 1-year performance: ${yearChange > 0 ? '+' : ''}${yearChange.toFixed(2)}%`);
            }
        }
    } catch (e: any) {
        console.log(`❌ Error: ${e.message}`);
    }

    console.log("\n" + "=".repeat(80));
    console.log("TEST COMPLETE");
    console.log("=".repeat(80));
}

testLongPeriods().catch(console.error);
