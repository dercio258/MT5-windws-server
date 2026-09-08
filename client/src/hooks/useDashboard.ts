import { useQuery } from '@tanstack/react-query';
import api from '../api';

export interface DashboardStats {
    totalPnL: number;
    winRate: number;
    totalTrades: number;
    profitFactor: number;
    radarMetrics: {
        consistency: number;
        riskManagement: number;
        discipline: number;
        profitability: number;
        winRate: number;
    };
    dailyPnL: { date: string; value: number; ticket?: string }[];
    distribution: { wins: number; losses: number; breakeven: number };
    healthScore?: { score: number; details: any };
    bySession?: any[];
    bySymbol?: any[];
    isConsolidated?: boolean;
    currencies?: string[];
    hasMultipleCurrencies?: boolean;
    accountBreakdown?: any[];
    targetAccount?: any;
    propFirmStatus?: {
        hasRules: boolean;
        profitTarget: number;
        profitTargetProgress: number | null;
        dailyLossLimit: number;
        todayPnL: number;
        dailyLossMargin: number | null;
        maxDrawdownLimit: number;
        maxDrawdownRecorded: number;
    } | null;
}

export const useSubscriptionStatus = () => {
    return useQuery({
        queryKey: ['subscription', 'status'],
        queryFn: async () => {
            const { data } = await api.get('/subscription/status');
            return data;
        },
    });
};

export const useDashboardStats = (startDate: string, endDate: string, accountId?: string) => {
    const normalizedAccountId = (!accountId || accountId === 'all' || accountId === 'undefined') ? undefined : accountId;

    return useQuery<DashboardStats>({
        queryKey: ['dashboard', 'stats', normalizedAccountId || 'all', startDate, endDate],
        queryFn: async () => {
            const params: any = { startDate, endDate };
            if (normalizedAccountId) {
                params.accountId = normalizedAccountId;
            }

            const [perfRes, scoreRes] = await Promise.all([
                api.get('/dashboard/performance', { params }),
                api.get('/alerts/score', { params }).catch(() => ({ data: null }))
            ]);

            const data = perfRes.data;
            
            // Transform data as needed
            const mappedDaily = data.dailyPnL?.map((d: any) => ({
                date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                value: isNaN(Number(d.value ?? d.pnl)) ? 0 : Number(d.value ?? d.pnl)
            })) || [];

            return {
                ...data,
                dailyPnL: data.tradePnL ? data.tradePnL.map((t: any) => ({
                    date: new Date(t.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
                    value: Number(t.value) || 0,
                    ticket: t.ticket
                })).reverse() : mappedDaily,
                distribution: data.distribution || { wins: 0, losses: 0, breakeven: 0 },
                healthScore: scoreRes?.data
            };
        },
        enabled: !!startDate && !!endDate,
    });
};

export const useTradesFallback = (accountId?: string) => {
    const normalizedAccountId = (!accountId || accountId === 'all' || accountId === 'undefined') ? undefined : accountId;

    return useQuery({
        queryKey: ['trades', normalizedAccountId || 'all'],
        queryFn: async () => {
            const params: any = {};
            if (normalizedAccountId) params.accountId = normalizedAccountId;
            const { data } = await api.get('/dashboard/trades', { params });
            return data;
        },
    });
};
