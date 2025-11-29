import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListToolsResultSchema, CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";

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

    console.log("Connected to server.");

    // List tools
    const tools = await client.request({ method: "tools/list" }, ListToolsResultSchema);
    console.log("Tools:", tools.tools.map((t) => t.name));

    // Test get_market_data
    console.log("\nTesting get_market_data (AAPL)...");
    const marketData = await client.request(
        {
            method: "tools/call",
            params: {
                name: "get_market_data",
                arguments: { ticker: "AAPL", period: "5d" },
            },
        },
        CallToolResultSchema
    );
    console.log("Market Data Result:", (marketData.content[0] as any).text.substring(0, 200) + "...");

    // Test get_company_info
    console.log("\nTesting get_company_info (AAPL)...");
    const info = await client.request(
        {
            method: "tools/call",
            params: {
                name: "get_company_info",
                arguments: { ticker: "AAPL" },
            },
        },
        CallToolResultSchema
    );
    console.log("Company Info Result:", (info.content[0] as any).text);

    // Test get_financials
    console.log("\nTesting get_financials (AAPL, income)...");
    const financials = await client.request(
        {
            method: "tools/call",
            params: {
                name: "get_financials",
                arguments: { ticker: "AAPL", type: "income" },
            },
        },
        CallToolResultSchema
    );
    console.log("Financials Result:", (financials.content[0] as any).text.substring(0, 200) + "...");

    await client.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
