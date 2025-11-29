import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
    const transport = new StdioClientTransport({
        command: "node",
        args: ["dist/index.js"],
        stderr: "inherit",
    });

    const client = new Client({ name: "test", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);

    console.log("=".repeat(80));
    console.log("TESTING NEW FEATURES");
    console.log("=".repeat(80));

    // Test 1: BIST Auto-Suffix
    console.log("\n1. Testing BIST Auto-Suffix (THYAO -> THYAO.IS)");
    try {
        const result: any = await client.request({
            method: "tools/call",
            params: { name: "get_company_info", arguments: { ticker: "THYAO" } }
        }, {} as any);
        console.log("✅ BIST auto-suffix works!");
        console.log("Preview:", (result.content[0] as any).text.substring(0, 100));
    } catch (e: any) {
        console.log("❌ Error:", e.message);
    }

    // Test 2: Technical Analysis
    console.log("\n2. Testing Technical Analysis (AAPL)");
    try {
        const result: any = await client.request({
            method: "tools/call",
            params: { name: "get_technical_analysis", arguments: { ticker: "AAPL", period: "6mo" } }
        }, {} as any);
        const analysis = JSON.parse((result.content[0] as any).text);
        console.log("✅ Technical Analysis:");
        console.log(`   RSI: ${analysis.rsi_14}`);
        console.log(`   SMA 50: ${analysis.sma_50}`);
        console.log(`   SMA 200: ${analysis.sma_200}`);
        console.log(`   Trend: ${analysis.trend}`);
        console.log(`   Bollinger Bands: ${analysis.bollinger_lower} - ${analysis.bollinger_upper}`);
    } catch (e: any) {
        console.log("❌ Error:", e.message);
    }

    // Test 3: Pivot Points
    console.log("\n3. Testing Pivot Points (MSFT)");
    try {
        const result: any = await client.request({
            method: "tools/call",
            params: { name: "get_pivot_points", arguments: { ticker: "MSFT" } }
        }, {} as any);
        const pivots = JSON.parse((result.content[0] as any).text);
        console.log("✅ Pivot Points:");
        console.log(`   PP: ${pivots.pp}`);
        console.log(`   R1-R3: ${pivots.r1}, ${pivots.r2}, ${pivots.r3}`);
        console.log(`   S1-S3: ${pivots.s1}, ${pivots.s2}, ${pivots.s3}`);
        console.log(`   Current: ${pivots.current_price} (${pivots.position})`);
        console.log(`   Nearest Support: ${pivots.nearest_support}, Resistance: ${pivots.nearest_resistance}`);
    } catch (e: any) {
        console.log("❌ Error:", e.message);
    }

    // Test 4: Batch Company Info
    console.log("\n4. Testing Batch Company Info (5 tickers)");
    try {
        const result: any = await client.request({
            method: "tools/call",
            params: {
                name: "batch_company_info",
                arguments: { tickers: ["AAPL", "MSFT", "GOOGL", "THYAO", "GARAN"] }
            }
        }, {} as any);
        const batch = JSON.parse((result.content[0] as any).text);
        console.log(`✅ Batch Results: ${batch.successful}/${batch.total} successful`);
        batch.data.forEach((d: any) => {
            console.log(`   ${d.ticker}: ${d.name} - $${d.price} (${d.sector})`);
        });
    } catch (e: any) {
        console.log("❌ Error:", e.message);
    }

    // Test 5: Turkish Stock with Technical Analysis
    console.log("\n5. Testing Turkish Stock Technical Analysis (GARAN)");
    try {
        const result: any = await client.request({
            method: "tools/call",
            params: { name: "get_technical_analysis", arguments: { ticker: "GARAN", period: "3mo" } }
        }, {} as any);
        const analysis = JSON.parse((result.content[0] as any).text);
        console.log("✅ GARAN Technical Analysis:");
        console.log(`   Current Price: ${analysis.current_price}`);
        console.log(`   RSI: ${analysis.rsi_14}`);
        console.log(`   Trend: ${analysis.trend}`);
    } catch (e: any) {
        console.log("❌ Error:", e.message);
    }

    console.log("\n" + "=".repeat(80));
    console.log("TESTS COMPLETE");
    console.log("=".repeat(80));

    await client.close();
}

main().catch(console.error);
