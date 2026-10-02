
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    Check,
    ArrowRight,
    AlertCircle,
    Loader2,
    Eye,
    EyeOff,
    Github
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { CandlestickHeroBackground } from '../components/landing/CandlestickBackground';

const TOREX_ICON = "https://pub-354475384fd04c1e8c075e14e17ed14d.r2.dev/produtos/originals/1790957899791_0521d2dc46a60392_touro_design_1.jpeg";

// --- Custom UI Components (Local for Login Layout) ---

const LoginInput = ({ label, icon, type = "text", error, ...props }: any) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="space-y-1.5 group">
            <label className={`text-xs font-semibold uppercase tracking-wider transition-colors ${isFocused ? 'text-emerald-400' : 'text-[#9CA3AF]'}`}>
                {label}
            </label>
            <div className={`relative flex items-center bg-[#08090C]/80 border rounded-xl transition-all duration-300 ${error
                ? 'border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                : isFocused
                    ? 'border-emerald-500/60 shadow-[0_0_16px_rgba(16,185,129,0.2)]'
                    : 'border-white/[0.08] hover:border-white/[0.16]'
                }`}>
                <div className={`pl-4 pr-3 ${isFocused ? 'text-emerald-400' : 'text-[#6B7280]'}`}>
                    {icon}
                </div>
                <input
                    type={inputType}
                    className="w-full bg-transparent border-none text-[#F3F4F6] placeholder:text-[#6B7280] focus:ring-0 py-3.5 pl-0 pr-4 text-sm font-medium focus:outline-none"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-[#6B7280] hover:text-[#F3F4F6] transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs animate-in slide-in-from-left-1">
                    <AlertCircle size={12} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

const Checkbox = ({ checked, onChange, label }: any) => (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 ${checked
            ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
            : 'bg-[#08090C]/80 border-white/[0.12] group-hover:border-emerald-500/40'
            }`}>
            {checked && <Check size={13} strokeWidth={3.5} />}
        </div>
        <span className={`text-xs sm:text-sm transition-colors ${checked ? 'text-[#F3F4F6]' : 'text-[#9CA3AF] group-hover:text-[#F3F4F6]'}`}>
            {label}
        </span>
        <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
);

const LoginButton = ({ children, isLoading, variant = 'primary', className = '', ...props }: any) => {
    const baseStyles = "relative w-full h-12 rounded-xl font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants: any = {
        primary: "bg-[#10B981] hover:bg-[#34D399] text-[#04110C] shadow-md hover:shadow-[0_0_24px_rgba(16,185,129,0.30)] border border-transparent",
        outline: "bg-[#111319] hover:bg-[#161822] border border-white/[0.08] hover:border-emerald-500/30 text-[#9CA3AF] hover:text-[#F3F4F6]"
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
            {isLoading ? (
                <Loader2 className="animate-spin text-current" size={20} />
            ) : (
                children
            )}
        </button>
    );
};

// Simple SVG Component for Google
const GoogleIcon = ({ className }: { className?: string }) => (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // View State: 'login' | 'forgot-password' | '2fa'
    const [view, setView] = useState<'login' | 'forgot-password' | '2fa'>('login');

    // Login Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);

    // 2FA State
    const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null);
    const [twoFactorEmail, setTwoFactorEmail] = useState<string | null>(null);
    const [twoFactorOtp, setTwoFactorOtp] = useState('');
    const [twoFactorCooldownTimer, setTwoFactorCooldownTimer] = useState(0);

    // Forgot Password Form State
    const [fpEmail, setFpEmail] = useState('');
    const [fpOtp, setFpOtp] = useState('');
    const [fpNewPassword, setFpNewPassword] = useState('');
    const [fpToken, setFpToken] = useState('');
    const [fpSig, setFpSig] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);

    // Lockout and Cooldown States
    const [loginCooldownTimer, setLoginCooldownTimer] = useState(0);

    // Common State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Timer Logic for OTP Code Re-request
    React.useEffect(() => {
        let interval: any;
        if (otpTimer > 0) {
            interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    // Timer Logic for Login Cooldown
    React.useEffect(() => {
        let interval: any;
        if (loginCooldownTimer > 0) {
            interval = setInterval(() => setLoginCooldownTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [loginCooldownTimer]);

    // Timer Logic for 2FA Cooldown
    React.useEffect(() => {
        let interval: any;
        if (twoFactorCooldownTimer > 0) {
            interval = setInterval(() => setTwoFactorCooldownTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [twoFactorCooldownTimer]);

    // Handle URL query parameters for social 2FA redirects and email recovery links
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const twoFactorRequiredParam = params.get('twoFactorRequired');
        const userIdParam = params.get('userId');
        const emailParam = params.get('email');
        const recoverParam = params.get('recover');
        const tokenParam = params.get('token');
        const sigParam = params.get('sig');

        if (twoFactorRequiredParam === 'true' && userIdParam && emailParam) {
            setTwoFactorUserId(userIdParam);
            setTwoFactorEmail(emailParam);
            setView('2fa');
        } else if (recoverParam === 'true' && emailParam && tokenParam && sigParam) {
            setFpEmail(emailParam);
            setFpToken(tokenParam);
            setFpSig(sigParam);
            setOtpSent(true);
            setView('forgot-password');
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await api.post('/auth/login', { email, password });

            if (res.data.success) {
                if (res.data.twoFactorRequired) {
                    navigate(`/2fa?twoFactorToken=${res.data.twoFactorToken}`);
                } else {
                    login(res.data.token);
                    navigate('/dashboard');
                }
            } else {
                setError(res.data.message || 'Credenciais inválidas');
            }
        } catch (err: any) {
            console.error(err);
            const errMsg = err.response?.data?.message || 'Erro ao conectar com o servidor';
            setError(errMsg);

            if (err.response?.status === 429) {
                if (errMsg.includes('15 segundos')) {
                    setLoginCooldownTimer(15);
                } else if (errMsg.includes('5 minutos') || errMsg.includes('5 minutes')) {
                    setLoginCooldownTimer(300);
                } else {
                    setLoginCooldownTimer(60);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!twoFactorOtp) {
            setError('Por favor, insira o código de verificação.');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const res = await api.post('/auth/verify-2fa', {
                userId: twoFactorUserId,
                otp: twoFactorOtp
            });

            if (res.data.success) {
                login(res.data.token);
                navigate('/dashboard');
            } else {
                setError(res.data.message || 'Código inválido');
            }
        } catch (err: any) {
            console.error(err);
            const errMsg = err.response?.data?.message || 'Erro ao verificar código';
            setError(errMsg);

            if (err.response?.status === 429) {
                const match = errMsg.match(/por (\d+) minutos/);
                if (match && match[1]) {
                    setTwoFactorCooldownTimer(parseInt(match[1]) * 60);
                } else {
                    setTwoFactorCooldownTimer(300);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fpEmail) {
            setError('Por favor, informe seu e-mail.');
            return;
        }
        setError(null);
        setSuccessMsg(null);
        setIsLoading(true);

        try {
            const res = await api.post('/auth/forgot-password', { email: fpEmail });
            if (res.data.success) {
                setFpToken(res.data.token);
                setFpSig(res.data.sig);
                setOtpSent(true);
                setOtpTimer(300); // 5 minutes request cooldown
                setSuccessMsg('Código enviado para o seu e-mail.');
            } else {
                setError(res.data.message || 'Erro ao enviar código.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Erro ao conectar com o servidor');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fpOtp || !fpNewPassword) {
            setError('Preencha todos os campos.');
            return;
        }
        if (fpNewPassword.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setError(null);
        setSuccessMsg(null);
        setIsLoading(true);

        try {
            const res = await api.post('/auth/reset-password', {
                email: fpEmail,
                code: fpOtp,
                token: fpToken,
                sig: fpSig,
                newPassword: fpNewPassword
            });

            if (res.data.success || res.status === 200 || res.status === 201) {
                setSuccessMsg('Senha redefinida com sucesso! Redirecionando...');
                setTimeout(() => {
                    setView('login');
                    setOtpSent(false);
                    setFpEmail('');
                    setFpOtp('');
                    setFpNewPassword('');
                    setFpToken('');
                    setFpSig('');
                    setSuccessMsg(null);
                }, 2000);
            } else {
                setError(res.data.message || 'Erro ao redefinir senha.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Erro ao realizar a solicitação.');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to switch view and reset states
    const switchView = (newView: 'login' | 'forgot-password' | '2fa') => {
        setView(newView);
        setError(null);
        setSuccessMsg(null);
        setOtpSent(false);
        setFpEmail('');
        setFpOtp('');
        setFpNewPassword('');
        setFpToken('');
        setFpSig('');
        setTwoFactorOtp('');
        setTwoFactorCooldownTimer(0);
        setLoginCooldownTimer(0);
    };

    return (
        <div className="min-h-screen bg-[#08090C] text-[#F3F4F6] flex items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden isolate">
            {/* Candlestick Trading Background */}
            <CandlestickHeroBackground opacity="opacity-50 sm:opacity-65" />

            {/* Ambient Radial Glow */}
            <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[0%] right-[0%] w-[45%] h-[45%] bg-teal-500/8 rounded-full blur-[120px] pointer-events-none" />

            {/* Logo Absolute Top-Left */}
            <Link to="/" className="absolute top-6 left-6 md:top-8 md:left-8 z-30 flex items-center gap-3 group cursor-pointer">
                <img
                    src={TOREX_ICON}
                    alt="Torex Journal Logo"
                    className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                />
                <span className="font-bold text-xl tracking-tight text-[#F3F4F6]">
                    TOREX <span className="text-emerald-400">JOURNAL</span>
                </span>
            </Link>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-20 pt-16 lg:pt-0">

                {/* Left Column (Marketing/Brand) - Desktop Only */}
                <div className="hidden lg:block space-y-8 pr-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111319] border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Sincronização em tempo real ativa</span>
                    </div>

                    <h1 className="text-5xl font-black text-[#F3F4F6] tracking-tight leading-[1.15]">
                        Transforme dados em <span className="text-emerald-400">consistência.</span>
                    </h1>

                    <p className="text-[#9CA3AF] text-base sm:text-lg leading-relaxed max-w-md">
                        Acesse seu diário automatizado e descubra os padrões ocultos que estão drenando ou alavancando seu capital.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-4 rounded-2xl bg-[#111319]/80 border border-white/[0.08] backdrop-blur-md shadow-sm">
                            <div className="text-3xl font-black text-emerald-400 font-mono mb-1">94%</div>
                            <div className="text-xs text-[#9CA3AF] uppercase font-bold tracking-wider">Assertividade Média</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#111319]/80 border border-white/[0.08] backdrop-blur-md shadow-sm">
                            <div className="text-3xl font-black text-[#F3F4F6] font-mono mb-1">1.2M+</div>
                            <div className="text-xs text-[#9CA3AF] uppercase font-bold tracking-wider">Trades Analisados</div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Form Card) */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-[#0E1017]/85 backdrop-blur-2xl border border-white/[0.08] p-8 md:p-10 rounded-3xl shadow-2xl relative group">
                        {/* Glow Effect on Card Border */}
                        <div className="absolute -inset-0.5 bg-gradient-to-b from-emerald-500/25 to-teal-500/5 rounded-3xl opacity-60 pointer-events-none -z-10 blur-sm" />

                        {view === 'login' && (
                            <>
                                <div className="flex flex-col items-center mb-8">
                                    <img
                                        src={TOREX_ICON}
                                        alt="Torex Journal Logo"
                                        className="w-12 h-12 object-contain drop-shadow-md mb-3"
                                    />
                                    <h2 className="text-2xl font-black text-[#F3F4F6] tracking-tight">Bem-vindo de volta</h2>
                                    <p className="text-[#9CA3AF] text-sm mt-1.5 text-center">Insira suas credenciais para acessar o painel.</p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-5">
                                    <LoginInput
                                        label="E-mail"
                                        placeholder="exemplo@torex.com"
                                        type="email"
                                        icon={<Mail size={18} />}
                                        value={email}
                                        onChange={(e: any) => setEmail(e.target.value)}
                                        error={error && !password ? " " : undefined}
                                    />

                                    <div className="space-y-1">
                                        <LoginInput
                                            label="Senha"
                                            placeholder="••••••••"
                                            type="password"
                                            icon={<Lock size={18} />}
                                            value={password}
                                            onChange={(e: any) => setPassword(e.target.value)}
                                        />
                                        <div className="flex justify-end pt-1">
                                            <button
                                                type="button"
                                                onClick={() => switchView('forgot-password')}
                                                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                                            >
                                                Esqueceu a senha?
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-3 text-rose-400 text-xs sm:text-sm animate-pulse">
                                            <AlertCircle size={18} className="shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {successMsg && (
                                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 text-emerald-400 text-xs sm:text-sm animate-in slide-in-from-top-2">
                                            <Check size={18} className="shrink-0" />
                                            <span>{successMsg}</span>
                                        </div>
                                    )}

                                    <Checkbox
                                        label="Manter conectado por 30 dias"
                                        checked={remember}
                                        onChange={setRemember}
                                    />

                                    <LoginButton type="submit" isLoading={isLoading} disabled={loginCooldownTimer > 0}>
                                        {loginCooldownTimer > 0 ? (
                                            `Aguarde ${loginCooldownTimer}s`
                                        ) : (
                                            <>Entrar na Plataforma <ArrowRight size={18} className="ml-2 opacity-90" /></>
                                        )}
                                    </LoginButton>
                                </form>

                                <div className="relative my-7">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/[0.08]"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-[#0E1017] px-4 text-[#6B7280] font-semibold tracking-wider">Ou continue com</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3.5">
                                    <LoginButton
                                        variant="outline"
                                        className="h-11 text-xs sm:text-sm font-semibold"
                                        onClick={() => {
                                            window.location.href = '/api/auth/google';
                                        }}
                                    >
                                        <GoogleIcon className="mr-2" /> Google
                                    </LoginButton>
                                    <LoginButton
                                        variant="outline"
                                        className="h-11 text-xs sm:text-sm font-semibold"
                                        onClick={() => {
                                            window.location.href = '/api/auth/github';
                                        }}
                                    >
                                        <Github size={16} className="mr-2" /> GitHub
                                    </LoginButton>
                                </div>

                                <div className="mt-7 text-center">
                                    <p className="text-[#9CA3AF] text-sm">
                                        Não tem uma conta?
                                        <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold ml-1.5 transition-colors">
                                            Começar teste grátis
                                        </Link>
                                    </p>
                                </div>
                            </>
                        )}

                        {view === '2fa' && (
                            <>
                                <div className="flex flex-col items-center mb-8">
                                    <button
                                        onClick={() => switchView('login')}
                                        className="self-start mb-4 text-[#9CA3AF] hover:text-[#F3F4F6] flex items-center gap-2 text-xs font-semibold transition-colors"
                                    >
                                        ← Voltar para login
                                    </button>
                                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-3">
                                        <Lock className="text-emerald-400 w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-[#F3F4F6] tracking-tight">Verificação 2FA</h2>
                                    <p className="text-[#9CA3AF] text-sm mt-1.5 text-center leading-relaxed">
                                        Sua conta possui autenticação de dois fatores ativa. <br />
                                        Insira o código enviado para <b className="text-[#F3F4F6]">{twoFactorEmail}</b>.
                                    </p>
                                </div>

                                <form onSubmit={handleVerify2FA} className="space-y-6">
                                    <LoginInput
                                        label="Código de Verificação"
                                        placeholder="123456"
                                        type="text"
                                        icon={<Lock size={18} />}
                                        value={twoFactorOtp}
                                        onChange={(e: any) => setTwoFactorOtp(e.target.value)}
                                        maxLength={6}
                                        autoComplete="one-time-code"
                                    />

                                    {error && (
                                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-3 text-rose-400 text-xs sm:text-sm animate-pulse">
                                            <AlertCircle size={18} className="shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <LoginButton type="submit" isLoading={isLoading} disabled={twoFactorCooldownTimer > 0}>
                                        {twoFactorCooldownTimer > 0 ? (
                                            `Aguarde ${twoFactorCooldownTimer}s`
                                        ) : (
                                            <>Verificar e Acessar <ArrowRight size={18} className="ml-2 opacity-90" /></>
                                        )}
                                    </LoginButton>
                                </form>
                            </>
                        )}

                        {view === 'forgot-password' && (
                            // FORGOT PASSWORD WIZARD
                            <>
                                <div className="flex flex-col items-center mb-8">
                                    <button
                                        onClick={() => switchView('login')}
                                        className="self-start mb-4 text-[#9CA3AF] hover:text-[#F3F4F6] flex items-center gap-2 text-xs font-semibold transition-colors"
                                    >
                                        ← Voltar para login
                                    </button>
                                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-3">
                                        <Lock className="text-emerald-400 w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-[#F3F4F6] tracking-tight">Recuperar Senha</h2>
                                    <p className="text-[#9CA3AF] text-sm mt-1.5 text-center leading-relaxed">
                                        {otpSent
                                            ? 'Insira o código enviado ao seu e-mail e defina uma nova senha.'
                                            : 'Informe seu e-mail cadastrado para receber um código de recuperação.'}
                                    </p>
                                </div>

                                {!otpSent ? (
                                    // STEP 1: SEND EMAIL
                                    <form onSubmit={handleSendOtp} className="space-y-6">
                                        <LoginInput
                                            label="E-mail cadastrado"
                                            placeholder="exemplo@torex.com"
                                            type="email"
                                            icon={<Mail size={18} />}
                                            value={fpEmail}
                                            onChange={(e: any) => setFpEmail(e.target.value)}
                                        />

                                        {error && (
                                            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-3 text-rose-400 text-xs sm:text-sm animate-pulse">
                                                <AlertCircle size={18} className="shrink-0" />
                                                <span>{error}</span>
                                            </div>
                                        )}

                                        <LoginButton type="submit" isLoading={isLoading}>
                                            Enviar Código de Recuperação
                                        </LoginButton>
                                    </form>
                                ) : (
                                    // STEP 2: RESET PASSWORD
                                    <form onSubmit={handleResetPassword} className="space-y-5">
                                        <LoginInput
                                            label="Código de Verificação (OTP)"
                                            placeholder="123456"
                                            type="text"
                                            icon={<Lock size={18} />}
                                            value={fpOtp}
                                            onChange={(e: any) => setFpOtp(e.target.value)}
                                        />

                                        <div className="space-y-1">
                                            <LoginInput
                                                label="Nova Senha"
                                                placeholder="••••••••"
                                                type="password"
                                                icon={<Lock size={18} />}
                                                value={fpNewPassword}
                                                onChange={(e: any) => setFpNewPassword(e.target.value)}
                                            />
                                            <p className="text-[10px] text-[#6B7280] text-right font-mono px-1">Mínimo de 6 caracteres</p>
                                        </div>

                                        {error && (
                                            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-3 text-rose-400 text-xs sm:text-sm animate-pulse">
                                                <AlertCircle size={18} className="shrink-0" />
                                                <span>{error}</span>
                                            </div>
                                        )}

                                        {successMsg && (
                                            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 text-emerald-400 text-xs sm:text-sm animate-in slide-in-from-top-2">
                                                <Check size={18} className="shrink-0" />
                                                <span>{successMsg}</span>
                                            </div>
                                        )}

                                        <LoginButton type="submit" isLoading={isLoading}>
                                            Redefinir Senha
                                        </LoginButton>

                                        <div className="text-center pt-1">
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                disabled={otpTimer > 0 || isLoading}
                                                className={`text-xs font-semibold transition-colors ${otpTimer > 0 ? 'text-[#6B7280] cursor-not-allowed' : 'text-emerald-400 hover:text-emerald-300'}`}
                                            >
                                                {otpTimer > 0 ? `Aguarde ${otpTimer}s para reenviar` : 'Não recebeu o código? Reenviar'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>

                    <p className="text-center text-xs text-[#6B7280] mt-8">
                        Protegido por reCAPTCHA e sujeito à Política de Privacidade e Termos de Uso do TOREX JOURNAL.
                    </p>
                </div>
            </div>
        </div>
    );
};
