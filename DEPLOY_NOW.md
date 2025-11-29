# 🚀 Quick Deployment Commands

## 1. Final Pre-Check
```bash
# Build and verify
npm run build

# Run tests
npm test

# Check git status
git status
```

## 2. Git Initialization (if needed)
```bash
# If not a git repo yet
git init

# Add remote (update with your GitHub username)
git remote add origin https://github.com/YOURUSERNAME/stocks-mcp.git
```

## 3. Commit All Changes
```bash
# Add all files
git add .

# Commit
git commit -m "Release v2.0.0: Advanced features with 12 tools

- Add BIST auto-detection for Turkish stocks
- Add technical analysis (RSI, MACD, SMA, Bollinger Bands)
- Add pivot points calculation
- Add stock screener (predefined Yahoo screeners)
- Add peer analysis (find similar stocks)
- Add custom stock filtering
- Add earnings calendar
- Add batch processing (up to 50 tickers)
- Update documentation (README, ADVANCED_FEATURES)
- Token-optimized outputs (40-60% reduction)
- Full test coverage (9/9 scenarios passing)"
```

## 4. Push to GitHub
```bash
# Push to main
git push -u origin main

# Or push to master if that's your default branch
git push -u origin master
```

## 5. Create GitHub Release

### Option A: Via GitHub Web
1. Go to: `https://github.com/YOURUSERNAME/stocks-mcp/releases/new`
2. Tag: `v2.0.0`
3. Title: `v2.0.0 - Advanced Features Update`
4. Description: Copy from `RELEASE_NOTES.md`
5. Click "Publish release"

### Option B: Via GitHub CLI
```bash
gh release create v2.0.0 \
  --title "v2.0.0 - Advanced Features Update" \
  --notes-file RELEASE_NOTES.md
```

## 6. Update Repository Settings

Go to your GitHub repository settings:

**Description:**
```
MCP server for comprehensive stock market data. Token-optimized for LLMs with 12 tools including technical analysis, screeners, pivot points, and BIST support.
```

**Topics:** (Add these tags)
```
mcp, model-context-protocol, stock-market, yahoo-finance, technical-analysis, 
typescript, nodejs, llm, ai, stocks, bist, turkish-stocks, cryptocurrency
```

## 7. Verify Deployment
```bash
# Clone in a new directory to test
cd /tmp
git clone https://github.com/YOURUSERNAME/stocks-mcp.git
cd stocks-mcp
npm install
npm run build
npm start
```

## Troubleshooting

### If remote already exists:
```bash
git remote remove origin
git remote add origin https://github.com/YOURUSERNAME/stocks-mcp.git
```

### If authentication fails:
```bash
# Use Personal Access Token
git remote set-url origin https://YOUR_TOKEN@github.com/YOURUSERNAME/stocks-mcp.git

# Or configure SSH
git remote set-url origin git@github.com:YOURUSERNAME/stocks-mcp.git
```

### If you need to update package.json author:
```bash
# Edit package.json and update:
# "author": "Your Name <your@email.com>",
# "repository": "https://github.com/YOURUSERNAME/stocks-mcp.git"
```

---

## ✅ Checklist Before Deploy

- [x] Code builds without errors (`npm run build`)
- [x] Tests pass (`npm test`)
- [x] README.md complete
- [x] package.json updated to v2.0.0
- [x] .gitignore configured
- [x] LICENSE file exists
- [x] RELEASE_NOTES.md ready
- [x] Author info updated in package.json
- [ ] GitHub username updated in all files
- [ ] Repository URL updated

**Status: READY TO DEPLOY! 🎉**
