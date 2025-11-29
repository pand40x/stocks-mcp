/**
 * Technical Analysis Utilities
 * Inspired by Python provider's technical analysis features
 */

interface TechnicalAnalysisResult {
    rsi_14?: number;
    macd?: number;
    macd_signal?: number;
    macd_histogram?: number;
    sma_20?: number;
    sma_50?: number;
    sma_200?: number;
    bollinger_upper?: number;
    bollinger_middle?: number;
    bollinger_lower?: number;
    current_price: number;
    trend: 'bullish' | 'bearish' | 'neutral';
}

// RSI Calculator
export function calculateRSI(prices: number[], period: number = 14): number | null {
    if (prices.length < period + 1) return null;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i - 1];
        if (change >= 0) {
            gains += change;
        } else {
            losses -= change;
        }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];

        if (change >= 0) {
            avgGain = (avgGain * (period - 1) + change) / period;
            avgLoss = (avgLoss * (period - 1)) / period;
        } else {
            avgGain = (avgGain * (period - 1)) / period;
            avgLoss = (avgLoss * (period - 1) - change) / period;
        }
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

// SMA Calculator
export function calculateSMA(prices: number[], period: number): number | null {
    if (prices.length < period) return null;

    const slice = prices.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
}

// MACD Calculator
export function calculateMACD(prices: number[]): { macd: number | null, signal: number | null, histogram: number | null } {
    if (prices.length < 26) {
        return { macd: null, signal: null, histogram: null };
    }

    // Calculate 12-period EMA
    const ema12 = calculateEMA(prices, 12);
    // Calculate 26-period EMA
    const ema26 = calculateEMA(prices, 26);

    if (ema12 === null || ema26 === null) {
        return { macd: null, signal: null, histogram: null };
    }

    const macd = ema12 - ema26;

    // For signal line, we'd need MACD history to calculate 9-period EMA
    // Simplified: return null for signal
    const signal = null;
    const histogram = null;

    return { macd, signal, histogram };
}

// EMA Calculator
export function calculateEMA(prices: number[], period: number): number | null {
    if (prices.length < period) return null;

    const k = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k);
    }

    return ema;
}

// Bollinger Bands
export function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
    upper: number | null,
    middle: number | null,
    lower: number | null
} {
    if (prices.length < period) {
        return { upper: null, middle: null, lower: null };
    }

    const sma = calculateSMA(prices, period);
    if (sma === null) return { upper: null, middle: null, lower: null };

    const slice = prices.slice(-period);
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const std = Math.sqrt(variance);

    return {
        upper: sma + (std * stdDev),
        middle: sma,
        lower: sma - (std * stdDev)
    };
}

// Comprehensive Technical Analysis
export function performTechnicalAnalysis(prices: number[]): TechnicalAnalysisResult {
    const currentPrice = prices[prices.length - 1];

    const rsi = calculateRSI(prices, 14);
    const macd = calculateMACD(prices);
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    const sma200 = calculateSMA(prices, 200);
    const bollinger = calculateBollingerBands(prices, 20);

    // Determine trend
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (sma50 !== null && sma200 !== null) {
        if (sma50 > sma200 && currentPrice > sma50) {
            trend = 'bullish';
        } else if (sma50 < sma200 && currentPrice < sma50) {
            trend = 'bearish';
        }
    }

    return {
        rsi_14: rsi !== null ? Number(rsi.toFixed(2)) : undefined,
        macd: macd.macd !== null ? Number(macd.macd.toFixed(2)) : undefined,
        macd_signal: macd.signal !== null ? Number(macd.signal.toFixed(2)) : undefined,
        macd_histogram: macd.histogram !== null ? Number(macd.histogram.toFixed(2)) : undefined,
        sma_20: sma20 !== null ? Number(sma20.toFixed(2)) : undefined,
        sma_50: sma50 !== null ? Number(sma50.toFixed(2)) : undefined,
        sma_200: sma200 !== null ? Number(sma200.toFixed(2)) : undefined,
        bollinger_upper: bollinger.upper !== null ? Number(bollinger.upper.toFixed(2)) : undefined,
        bollinger_middle: bollinger.middle !== null ? Number(bollinger.middle.toFixed(2)) : undefined,
        bollinger_lower: bollinger.lower !== null ? Number(bollinger.lower.toFixed(2)) : undefined,
        current_price: Number(currentPrice.toFixed(2)),
        trend
    };
}

// Pivot Points Calculator (inspired by Python provider)
export function calculatePivotPoints(high: number, low: number, close: number): {
    pp: number,
    r1: number,
    r2: number,
    r3: number,
    s1: number,
    s2: number,
    s3: number
} {
    const pp = (high + low + close) / 3;
    const r1 = (2 * pp) - low;
    const r2 = pp + (high - low);
    const r3 = high + 2 * (pp - low);
    const s1 = (2 * pp) - high;
    const s2 = pp - (high - low);
    const s3 = low - 2 * (high - pp);

    return {
        pp: Number(pp.toFixed(2)),
        r1: Number(r1.toFixed(2)),
        r2: Number(r2.toFixed(2)),
        r3: Number(r3.toFixed(2)),
        s1: Number(s1.toFixed(2)),
        s2: Number(s2.toFixed(2)),
        s3: Number(s3.toFixed(2))
    };
}
