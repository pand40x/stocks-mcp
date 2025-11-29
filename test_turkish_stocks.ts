import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

async function testTurkishStocks() {
    console.log("=".repeat(80));
    console.log("TURKISH STOCKS HISTORICAL DATA TEST");
    console.log("=".repeat(80));

    const turkishStocks = [
        { ticker: "THYAO.IS", name: "Türk Hava Yolları" },
        { ticker: "GARAN.IS", name: "Garanti Bankası" },
        { ticker: "EREGL.IS", name: "Ereğli Demir Çelik" },
        { ticker: "ASELS.IS", name: "ASELSAN" },
        { ticker: "TUPRS.IS", name: "Tüpraş" }
    ];

    for (const stock of turkishStocks) {
        console.log(`\n${"=".repeat(60)}`);
        console.log(`Testing: ${stock.name} (${stock.ticker})`);
        console.log("=".repeat(60));

        // Test 1: 5 day data
        console.log("\n1. Historical Data (5 days):");
        try {
            const result = await yahooFinance.chart(stock.ticker, {
                period1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                interval: "1d"
            });

            console.log(`   ✅ Success! Got ${result.quotes.length} data points`);
            if (result.quotes.length > 0) {
                const latest = result.quotes[result.quotes.length - 1];
                console.log(`   Latest: ${latest.date.toISOString().split('T')[0]} - Close: ${latest.close?.toFixed(2) || 'N/A'} TRY`);

                // Show all dates
                console.log(`   Dates: ${result.quotes.map(q => q.date.toISOString().split('T')[0]).join(', ')}`);
            }
        } catch (e: any) {
            console.log(`   ❌ Error: ${e.message}`);
        }

        // Test 2: 1 month data
        console.log("\n2. Historical Data (1 month):");
        try {
            const result = await yahooFinance.chart(stock.ticker, {
                period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                interval: "1d"
            });

            console.log(`   ✅ Success! Got ${result.quotes.length} data points`);
            if (result.quotes.length > 0) {
                const first = result.quotes[0];
                const last = result.quotes[result.quotes.length - 1];
                console.log(`   Range: ${first.date.toISOString().split('T')[0]} to ${last.date.toISOString().split('T')[0]}`);
                console.log(`   Price change: ${first.close?.toFixed(2)} → ${last.close?.toFixed(2)} TRY`);
            }
        } catch (e: any) {
            console.log(`   ❌ Error: ${e.message}`);
        }

        // Test 3: Company info
        console.log("\n3. Company Info:");
        try {
            const info = await yahooFinance.quoteSummary(stock.ticker, {
                modules: ["price", "summaryDetail"] as any
            });
            console.log(`   ✅ Name: ${info.price?.shortName}`);
            console.log(`   Current Price: ${info.price?.regularMarketPrice?.toFixed(2)} TRY`);
            console.log(`   Market Cap: ${(info.summaryDetail?.marketCap || 0) / 1e9}B TRY`);
        } catch (e: any) {
            console.log(`   ❌ Error: ${e.message}`);
        }
    }

    console.log("\n" + "=".repeat(80));
    console.log("TEST COMPLETE");
    console.log("=".repeat(80));
}

testTurkishStocks().catch(console.error);
