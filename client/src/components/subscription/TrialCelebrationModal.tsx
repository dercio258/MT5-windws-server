import React from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, CheckCircle2, ArrowRight, X, ShieldCheck, Zap, BarChart3, Brain, Users } from 'lucide-react';

interface TrialCelebrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    days?: number;
}

export const TrialCelebrationModal: React.FC<TrialCelebrationModalProps> = ({
    isOpen,
    onClose,
    days = 30,
}) => {
    if (!isOpen) return null;

    const handleAcknowledge = () => {
        localStorage.setItem('torex_trial_modal_seen', 'true');
        onClose();
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#08090C]/85 backdrop-blur-md animate-in fade-in duration-300"
            onClick={handleAcknowledge}
        >
            <div 
                className="bg-[#111319] border border-emerald-500/30 p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden text-left animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Glow decorativo de fundo */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Botão Fechar X */}
                <button
                    onClick={handleAcknowledge}
                    className="absolute top-4 right-4 p-2 rounded-xl text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#161822] transition-colors"
                    title="Fechar"
                >
                    <X size={18} />
                </button>

                {/* Topo / Badges */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                Presente Torex Journal
                            </span>
                            <span className="text-[10px] font-bold text-[#9CA3AF] flex items-center gap-1">
                                <ShieldCheck size={12} className="text-emerald-400" /> VIP
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-[#F3F4F6] tracking-tight mt-0.5">
                            {days} Dias de Plano Premium Liberados!
                        </h2>
                    </div>
                </div>

                <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed mb-5">
                    Você ganhou <strong className="text-emerald-400 font-bold">{days} dias de acesso gratuito e irrestrito</strong> ao plano institucional mais completo do mercado para turbinar seus resultados.
                </p>

                {/* Recursos Desbloqueados */}
                <div className="bg-[#0C0D12] border border-white/[0.08] rounded-2xl p-4 mb-6 space-y-3">
                    <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">
                        Ferramentas Ativas no seu Painel:
                    </span>

                    <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                        <div className="flex items-start gap-2 text-[#F3F4F6]">
                            <Zap size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>Auto-Sync MT5 / Deriv:</strong> importação instantânea de trades</span>
                        </div>

                        <div className="flex items-start gap-2 text-[#F3F4F6]">
                            <BarChart3 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>Diário Quantitativo:</strong> métricas de consistência e PnL</span>
                        </div>

                        <div className="flex items-start gap-2 text-[#F3F4F6]">
                            <Brain size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>Gestão Emocional:</strong> psicologia e controle comportamental</span>
                        </div>

                        <div className="flex items-start gap-2 text-[#F3F4F6]">
                            <Users size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>Network Torex:</strong> posts, ideias e conexão entre traders</span>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#9CA3AF]">
                        <span>Cobrança automática:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 size={13} /> Nenhuma (Totalmente Gratuito)
                        </span>
                    </div>
                </div>

                {/* Botão de Ação */}
                <button
                    onClick={handleAcknowledge}
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3.5 px-6 rounded-xl transition-all shadow-xl shadow-emerald-500/20 active:scale-98 text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                    Começar a Usar Meu Plano Premium
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>,
        document.body
    );
};
