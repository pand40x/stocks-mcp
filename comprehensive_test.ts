import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
    const transport = new StdioClientTransport({
        command: "node",
        args: ["dist/index.js"],
        stderr: "inherit",
    });

    const client = new Client(
        {
            name: "test-client",
            version: "1.0.0",
        },
        {
            capabilities: {},
        }
    );

    await client.connect(transport);

    console.log("=".repeat(80));
    console.log("COMPREHENSIVE STOCKS-MCP TEST SUITE");
    console.log("=".repeat(80));

    // Test scenarios
    const scenarios = [
        {
            name: "US Tech Stock - Apple",
            tests: [
                { tool: "get_market_data", args: { ticker: "AAPL", period: "5d", interval: "1d" } },
                { tool: "get_market_data", args: { ticker: "AAPL", period: "1mo", interval: "1wk" } },
                { tool: "get_financials", args: { ticker: "AAPL", type: "income", frequency: "annual" } },
                { tool: "get_financials", args: { ticker: "AAPL", type: "balance", frequency: "quarterly" } },
                { tool: "get_financials", args: { ticker: "AAPL", type: "cashflow", frequency: "annual" } },
                { tool: "get_company_info", args: { ticker: "AAPL" } },
                { tool: "get_holders", args: { ticker: "AAPL" } },
                { tool: "get_extra_data", args: { ticker: "AAPL", type: "news" } },
                { tool: "get_extra_data", args: { ticker: "AAPL", type: "recommendations" } },
            ],
        },
        {
            name: "Turkish Stock - BIST (Türk Hava Yolları)",
            tests: [
                { tool: "get_market_data", args: { ticker: "THYAO.IS", period: "1mo", interval: "1d" } },
                { tool: "get_market_data", args: { ticker: "THYAO.IS", period: "1y", interval: "1wk" } },
                { tool: "get_financials", args: { ticker: "THYAO.IS", type: "income", frequency: "annual" } },
                { tool: "get_company_info", args: { ticker: "THYAO.IS" } },
                { tool: "get_extra_data", args: { ticker: "THYAO.IS", type: "news" } },
            ],
        },
        {
            name: "Turkish Stock - BIST (Garanti Bankası)",
            tests: [
                { tool: "get_market_data", args: { ticker: "GARAN.IS", period: "5d", interval: "1d" } },
                { tool: "get_financials", args: { ticker: "GARAN.IS", type: "balance", frequency: "annual" } },
                { tool: "get_company_info", args: { ticker: "GARAN.IS" } },
            ],
        },
        {
            name: "Turkish Stock - BIST (Ereğli Demir Çelik)",
            tests: [
                { tool: "get_market_data", args: { ticker: "EREGL.IS", period: "1mo", interval: "1d" } },
                { tool: "get_company_info", args: { ticker: "EREGL.IS" } },
            ],
        },
        {
            name: "Cryptocurrency - Bitcoin",
            tests: [
                { tool: "get_market_data", args: { ticker: "BTC-USD", period: "5d", interval: "1h" } },
                { tool: "get_company_info", args: { ticker: "BTC-USD" } },
            ],
        },
        {
            name: "US Stock - Microsoft",
            tests: [
                { tool: "get_market_data", args: { ticker: "MSFT", period: "1y", interval: "1mo" } },
                { tool: "get_financials", args: { ticker: "MSFT", type: "cashflow", frequency: "quarterly" } },
                { tool: "get_company_info", args: { ticker: "MSFT" } },
            ],
        },
    ];

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    for (const scenario of scenarios) {
        console.log("\n" + "=".repeat(80));
        console.log(`SCENARIO: ${scenario.name}`);
        console.log("=".repeat(80));

        for (const test of scenario.tests) {
            totalTests++;
            const testName = `${test.tool}(${JSON.stringify(test.args)})`;

            try {
                const startTime = Date.now();
                const result: any = await client.request(
                    {
                        method: "tools/call",
                        params: {
                            name: test.tool,
                            arguments: test.args,
                        },
                    },
                    {} as any
                );
                const duration = Date.now() - startTime;

                const content = (result.content[0] as any).text;
                const isError = result.isError || content.startsWith("Error:");

                if (isError) {
                    failedTests++;
                    console.log(`\n❌ FAILED: ${testName}`);
                    console.log(`   Error: ${content.substring(0, 200)}`);
                } else {
                    passedTests++;
                    const outputLength = content.length;
                    const preview = content.substring(0, 150);

                    console.log(`\n✅ PASSED: ${testName}`);
                    console.log(`   Duration: ${duration}ms`);
                    console.log(`   Output Size: ${outputLength} chars`);
                    console.log(`   Preview: ${preview}${outputLength > 150 ? "..." : ""}`);
                }
            } catch (error: any) {
                failedTests++;
                console.log(`\n❌ EXCEPTION: ${testName}`);
                console.log(`   Error: ${error.message}`);
            }
        }
    }

    console.log("\n" + "=".repeat(80));
    console.log("TEST SUMMARY");
    console.log("=".repeat(80));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);
    console.log("=".repeat(80));

    await client.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
