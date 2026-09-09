import { ITradeAdapter } from '../trade-adapter.interface';
import { NormalizedTradeDto } from '../normalized-trade.dto';

export const DERIV_SYMBOL_MAP: Record<string, string> = {
    '1HZ100V': 'Volatility 100 (1s) Index',
    '1HZ10V': 'Volatility 10 (1s) Index',
    '1HZ25V': 'Volatility 25 (1s) Index',
    '1HZ50V': 'Volatility 50 (1s) Index',
    '1HZ75V': 'Volatility 75 (1s) Index',
    '1HZ30V': 'Volatility 30 (1s) Index',
    '1HZ150V': 'Volatility 150 (1s) Index',
    '1HZ250V': 'Volatility 250 (1s) Index',
    'R_10': 'Volatility 10 Index',
    'R_25': 'Volatility 25 Index',
    'R_50': 'Volatility 50 Index',
    'R_75': 'Volatility 75 Index',
    'R_100': 'Volatility 100 Index',
    'BOOM300': 'Boom 300 Index',
    'BOOM500': 'Boom 500 Index',
    'BOOM1000': 'Boom 1000 Index',
    'CRASH300': 'Crash 300 Index',
    'CRASH500': 'Crash 500 Index',
    'CRASH1000': 'Crash 1000 Index',
    'STEP': 'Step Index',
    'JUMP10': 'Jump 10 Index',
    'JUMP25': 'Jump 25 Index',
    'JUMP50': 'Jump 50 Index',
    'JUMP75': 'Jump 75 Index',
    'JUMP100': 'Jump 100 Index'
};

export class DerivAdapter implements ITradeAdapter {

    normalize(rawData: any): NormalizedTradeDto | null {
        if (!rawData) return null;

        // Deriv payloads can be from 'proposal_open_contract' or 'transaction' (statement / profit_table)
        const contractDetails = rawData;
        const contractId = (contractDetails.contract_id || contractDetails.transaction_id)?.toString();

        if (!contractId) return null;

        const symbol = this.extractSymbol(contractDetails);
        const openTime = this.safeDate(contractDetails.purchase_time || contractDetails.transaction_time);

        if (!openTime) return null;

        const closeTime = this.safeDate(contractDetails.sell_time || contractDetails.date_expiry);
        const buyAmount = Math.abs(parseFloat(contractDetails.buy_price || contractDetails.amount || 0));
        const sellPrice = parseFloat(contractDetails.sell_price || 0);

        let netPnl = 0;
        const rawStatus = (contractDetails.status || '').toLowerCase();

        if (contractDetails.profit !== undefined && contractDetails.profit !== null) {
            netPnl = parseFloat(contractDetails.profit);
        } else if (rawStatus === 'won') {
            netPnl = sellPrice > 0 ? (sellPrice - buyAmount) : (parseFloat(contractDetails.payout || 0) - buyAmount);
        } else if (rawStatus === 'lost') {
            netPnl = -buyAmount;
        } else if (contractDetails.is_sold === 1 || contractDetails.action_type === 'sell') {
            netPnl = sellPrice - buyAmount;
        } else {
            // Estimate floating P&L using current bid
            const currentPrice = parseFloat(contractDetails.bid_price) || 0;
            if (currentPrice > 0 && buyAmount > 0) {
                netPnl = currentPrice - buyAmount;
            }
        }

        // Spot prices (NEVER use stake/buy_price or payout/sell_price as spot levels)
        const entryPrice = parseFloat(
            contractDetails.entry_spot ||
            contractDetails.entry_tick ||
            contractDetails.barrier
        ) || 0;

        const exitPrice = parseFloat(
            contractDetails.exit_spot ||
            contractDetails.exit_tick ||
            contractDetails.sell_spot ||
            contractDetails.current_spot
        ) || 0;

        const isClosed = contractDetails.is_sold === 1 ||
            contractDetails.is_expired === 1 ||
            rawStatus === 'closed' ||
            rawStatus === 'won' ||
            rawStatus === 'lost' ||
            contractDetails.action_type === 'sell';

        // Contract type: Sell for Put/Fall/Lower/MultDown, Buy for Call/Rise/Higher/MultUp
        const typeStr = (contractDetails.contract_type || contractDetails.shortcode || '').toUpperCase();
        const isSell = typeStr.includes('PUT') || typeStr.includes('FALL') || typeStr.includes('LOWER') || typeStr.includes('MULTDOWN');
        const tradeType = isSell ? 'Sell' : 'Buy';

        // Check for Deriv quality issues
        const flags: any = {};
        if (isClosed && !closeTime) flags.missing_close_time = true;

        let quality: 'ok' | 'partial' | 'broken' = 'ok';
        if (Object.keys(flags).length >= 2) quality = 'broken';
        else if (Object.keys(flags).length === 1) quality = 'partial';

        return {
            ticket: contractId, // Use contractId as primary ticket for Deriv
            contractId: contractId,
            symbol: symbol,
            type: tradeType,
            volume: buyAmount, // Treat the stake/buy price as volume for Deriv
            openPrice: entryPrice,
            closePrice: exitPrice,
            profit: netPnl,
            commission: 0, // Deriv bakes commission into the payout usually
            swap: 0,
            openTime: openTime,
            closeTime: closeTime,
            status: isClosed ? 'CLOSED' : 'OPEN',
            comment: contractDetails.longcode || contractDetails.shortcode || '',
            session: this.calculateSession(openTime),
            qualityFlags: flags,
            dataQuality: quality,
            buyTransactionId: contractDetails.transaction_ids?.buy ? `buy_${contractDetails.transaction_ids.buy}` : undefined,
            sellTransactionId: contractDetails.transaction_ids?.sell ? `sell_${contractDetails.transaction_ids.sell}` : undefined,
            raw: rawData
        };
    }

    private extractSymbol(t: any): string {
        const rawSymbol = t.underlying_symbol || t.underlying;
        if (rawSymbol) {
            const upper = rawSymbol.toUpperCase();
            return DERIV_SYMBOL_MAP[upper] || upper;
        }

        const shortcode = t.shortcode || '';
        if (shortcode) {
            const prefixes = ['CALL_', 'PUT_', 'MULT_', 'VAN_', 'ONETOUCH_', 'NOTOUCH_', 'RANGE_', 'UPORDOWN_', 'EXPIRYRANGE_', 'EXPIRYMISS_'];
            let cleanCode = shortcode;
            for (const p of prefixes) {
                if (cleanCode.startsWith(p)) {
                    cleanCode = cleanCode.substring(p.length);
                    break;
                }
            }
            if (cleanCode.startsWith('FRX')) cleanCode = cleanCode.substring(3);
            const parts = cleanCode.split('_');
            const symbol = parts[0];
            if (symbol === 'R' && parts.length > 1 && !isNaN(parseInt(parts[1]))) {
                const code = `R_${parts[1]}`;
                return DERIV_SYMBOL_MAP[code] || code;
            }
            if (symbol) {
                const upper = symbol.toUpperCase();
                return DERIV_SYMBOL_MAP[upper] || upper;
            }
        }

        if (t.display_name) return t.display_name;

        // Fallback to parsing longcode
        const longcode = t.longcode || '';
        if (longcode) {
            const match = longcode.match(/if (.*?) (is|after|touches)/i);
            if (match && match[1]) return match[1].trim();
        }

        return 'Unknown';
    }

    private safeDate(dateInput: any): Date | null {
        if (!dateInput) return null;
        const timestamp = typeof dateInput === 'number' && dateInput < 10000000000 ? dateInput * 1000 : dateInput;
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
    }

    private calculateSession(date: Date): string {
        const hour = date.getUTCHours();
        const sessions = [];
        if (hour >= 22 || hour < 7) sessions.push('Sydney');
        if (hour >= 0 && hour < 9) sessions.push('Tokyo');
        if (hour >= 8 && hour < 17) sessions.push('London');
        if (hour >= 13 && hour < 22) sessions.push('New York');

        return sessions.join(' / ') || 'Off-Session';
    }
}
