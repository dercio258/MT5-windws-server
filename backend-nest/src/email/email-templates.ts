/**
 * Professional Email Templates for Torex Journal
 * Design System: Institutional Light Mode (High-End FinTech)
 */

export interface EmailTemplateData {
    title: string;
    subtitle?: string;
    message: string;
    buttonLabel?: string;
    buttonUrl?: string;
    userName?: string;
    footerText?: string;
    subject?: string;
}

export const TOREX_LOGO_URL = 'https://res.cloudinary.com/dndlqdylc/image/upload/v1769335429/Touro_design_1_beuv9b.png';

/**
 * Default subject line generator for each email template type
 */
export const TemplateSubjects = {
    OTP_CODE: (data: { otp?: string }) => 
        `[Torex Journal] Seu código de verificação: ${data?.otp || ''}`,

    WELCOME_EMAIL: (data: { userName?: string }) => 
        `Bem-vindo ao Torex Journal — Domine seus dados e impulsione seu trading`,

    LOGIN_ALERT: (data: { ip?: string; device?: string }) => 
        `[Segurança] Novo acesso detectado na sua conta Torex Journal`,

    GENERAL_NOTIFICATION: (data: EmailTemplateData) => 
        data.subject || data.title || 'Notificação do Sistema • Torex Journal',

    TRIAL_WELCOME: (data: { days?: number }) => 
        `🎁 Presente Exclusivo: Seus ${data.days || 14} dias de Plano Premium estão ativos!`,

    PAYMENT_INITIATED: (data: { amount?: string; reference?: string }) => 
        `Confirmação de Pagamento Pendente (${data.amount ? `${data.amount} MT` : ''}) • Torex Journal`,

    PAYMENT_SUCCESS: (data: { plan?: string }) => 
        `Pagamento Aprovado: Sua assinatura ${data.plan || 'Torex Journal'} está ativa!`,

    PAYMENT_FAILED: (data: { reference?: string }) => 
        `Atenção: Falha no processamento do seu pagamento • Torex Journal`,

    MT5_STATUS: (data: { status?: 'CONNECTED' | 'DISCONNECTED'; mt5Id?: string }) => 
        data.status === 'CONNECTED' 
            ? `🟢 Terminal MT5 Conectado com Sucesso (${data.mt5Id || ''}) • Torex Journal` 
            : `🔴 Atenção: Terminal MT5 Desconectado (${data.mt5Id || ''}) • Torex Journal`,

    TRADE_IMPORTED: (data: { count?: number }) => 
        `📊 Sincronização Concluída: ${data.count || 0} operações registradas • Torex Journal`,

    SYSTEM_ALERT: (data: { title?: string; type?: string; subject?: string }) => 
        data.subject || data.title || 'Alerta Operacional • Torex Journal',

    WEEKLY_SUMMARY: (data: { period?: { start: string; end: string } }) => 
        `📈 Seu Relatório Semanal de Performance • Torex Journal`
};

export const BASE_LAYOUT = (content: string, footerExtra: string = '') => `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Torex Journal</title>
    <!--[if mso]>
    <style type="text/css">
        table {border-collapse:collapse;border-spacing:0;margin:0;}
        div, td {padding:0;}
        div {margin:0 !important;}
    </style>
    <![endif]-->
    <style>
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #F8FAFC !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            color: #1E293B;
        }
        table {
            border-spacing: 0;
            border-collapse: collapse;
        }
        img {
            border: 0;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        a {
            color: #10B981;
            text-decoration: none;
        }
        .body-table {
            width: 100% !important;
            background-color: #F8FAFC;
            margin: 0;
            padding: 40px 16px;
        }
        .main-card {
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 16px;
            border: 1px solid #E2E8F0;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        }
        .header-cell {
            padding: 32px 40px;
            text-align: center;
            background-color: #FFFFFF;
            border-bottom: 1px solid #F1F5F9;
        }
        .content-cell {
            padding: 40px;
            color: #475569;
            font-size: 15px;
            line-height: 1.65;
        }
        .badge {
            display: inline-block;
            padding: 4px 14px;
            background-color: #ECFDF5;
            border: 1px solid #A7F3D0;
            border-radius: 9999px;
            color: #065F46;
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            margin-bottom: 16px;
        }
        .h1-title {
            margin: 0 0 16px 0;
            color: #0F172A;
            font-size: 25px;
            font-weight: 800;
            line-height: 1.25;
            letter-spacing: -0.4px;
        }
        .divider {
            height: 1px;
            background-color: #F1F5F9;
            margin: 28px 0;
        }
        p {
            margin: 0 0 16px 0;
            color: #475569;
            font-size: 15px;
            line-height: 1.65;
        }
        p b, p strong {
            color: #0F172A;
        }
        .card-box {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 22px 24px;
            margin: 24px 0;
        }
        .cta-container {
            text-align: center;
            margin: 36px 0 16px 0;
        }
        .button {
            display: inline-block;
            padding: 14px 34px;
            background-color: #10B981;
            color: #FFFFFF !important;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 700;
            font-size: 15px;
            letter-spacing: 0.2px;
            box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
        }
        .button-danger {
            background-color: #E11D48 !important;
            color: #FFFFFF !important;
            box-shadow: 0 4px 14px rgba(225, 29, 72, 0.25) !important;
        }
        .footer-cell {
            background-color: #F8FAFC;
            padding: 32px 40px;
            text-align: center;
            font-size: 13px;
            color: #64748B;
            border-top: 1px solid #E2E8F0;
        }
        .footer-links {
            margin-bottom: 18px;
        }
        .footer-links a {
            color: #475569;
            text-decoration: none;
            margin: 0 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .footer-links a:hover {
            color: #10B981;
        }
        @media screen and (max-width: 600px) {
            .content-cell {
                padding: 28px 20px !important;
            }
            .header-cell {
                padding: 24px 20px !important;
            }
            .footer-cell {
                padding: 24px 20px !important;
            }
            .h1-title {
                font-size: 21px !important;
            }
        }
    </style>
</head>
<body>
    <table class="body-table" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <table class="main-card" width="600" cellpadding="0" cellspacing="0">
                    <!-- HEADER -->
                    <tr>
                        <td class="header-cell">
                            <table align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="vertical-align: middle; padding-right: 12px;">
                                        <img src="${TOREX_LOGO_URL}" alt="Torex Logo" width="42" height="42" style="display: block; width: 42px; height: 42px; object-fit: contain;">
                                    </td>
                                    <td style="vertical-align: middle; text-align: left;">
                                        <span style="font-size: 20px; font-weight: 900; letter-spacing: 0.8px; color: #0F172A;">
                                            TOREX <span style="color: #10B981;">JOURNAL</span>
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- CONTENT -->
                    <tr>
                        <td class="content-cell">
                            ${content}
                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td class="footer-cell">
                            <div class="footer-links">
                                <a href="${process.env.FRONTEND_URL || 'https://torexjournal.com'}/dashboard">Painel</a>
                                <span style="color: #CBD5E1;">•</span>
                                <a href="${process.env.FRONTEND_URL || 'https://torexjournal.com'}/terms">Termos de Uso</a>
                                <span style="color: #CBD5E1;">•</span>
                                <a href="mailto:suporte@torexjournal.com">Suporte Técnico</a>
                            </div>
                            <div style="color: #475569; font-size: 13px; font-weight: 700; margin-bottom: 6px;">
                                Torex Journal • Plataforma Institucional de Performance
                            </div>
                            <div style="font-size: 12px; color: #64748B; line-height: 1.5;">
                                Elevando o seu trading através de dados, consistência e disciplina comportamental.
                            </div>
                            ${footerExtra ? `<div style="margin-top: 14px; font-size: 12px; color: #64748B;">${footerExtra}</div>` : ''}
                            <div style="margin-top: 22px; font-size: 11px; color: #94A3B8;">
                                Este é um e-mail transacional automatizado enviado pelo Torex Journal.<br>
                                &copy; ${new Date().getFullYear()} Torex Journal. Todos os direitos reservados.
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const Templates = {
    GENERAL_NOTIFICATION: (data: EmailTemplateData) => {
        const content = `
            <div class="badge">${data.subtitle || 'NOTIFICAÇÃO DO SISTEMA'}</div>
            <h1 class="h1-title">${data.title}</h1>
            <div class="divider"></div>
            <p>Olá${data.userName ? ` <b>${data.userName}</b>` : ''},</p>
            ${data.message.split('\n').map(p => p ? `<p>${p}</p>` : '').join('')}
            ${data.buttonUrl ? `
                <div class="cta-container">
                    <a href="${data.buttonUrl}" class="button">${data.buttonLabel || 'Acessar Painel'}</a>
                </div>
            ` : ''}
        `;
        return BASE_LAYOUT(content, data.footerText);
    },

    PAYMENT_INITIATED: (data: { userName?: string; amount: string; method: string; reference: string }) => {
        const content = `
            <div class="badge">PAGAMENTO EM PROCESSAMENTO</div>
            <h1 class="h1-title">Confirmação de Pagamento</h1>
            <div class="divider"></div>
            <p>Olá${data.userName ? ` <b>${data.userName}</b>` : ''},</p>
            <p>Recebemos a sua solicitação de assinatura para a sua conta no <b>Torex Journal</b>.</p>
            
            <div class="card-box" style="border-left: 4px solid #10B981;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 6px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Valor</td>
                        <td style="padding: 6px 0; text-align: right; color: #047857; font-weight: 900; font-size: 17px; font-family: monospace;">${data.amount} MT</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Método</td>
                        <td style="padding: 6px 0; text-align: right; color: #0F172A; font-weight: 700;">${data.method.toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Referência</td>
                        <td style="padding: 6px 0; text-align: right;">
                            <span style="background-color: #F1F5F9; color: #0F172A; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 700; border: 1px solid #CBD5E1;">
                                ${data.reference}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>

            <p>Por favor, confirme a transação no seu telemóvel para ativar sua assinatura automaticamente em instantes.</p>
            
            <div class="cta-container">
                <a href="${process.env.FRONTEND_URL || 'https://torexjournal.com'}/dashboard" class="button">Verificar Status</a>
            </div>
        `;
        return BASE_LAYOUT(content);
    },

    PAYMENT_SUCCESS: (data: { userName?: string; plan: string; expiryDate: string }) => {
        const content = `
            <div class="badge" style="background-color: #ECFDF5; color: #065F46; border-color: #A7F3D0;">
                ASSINATURA ATIVA ✓
            </div>
            <h1 class="h1-title">Pagamento Confirmado com Sucesso!</h1>
            <div class="divider"></div>
            <p>Olá${data.userName ? ` <b>${data.userName}</b>` : ''},</p>
            <p>O seu pagamento foi confirmado e a sua conta já conta com acesso completo a todos os recursos do seu plano.</p>
            
            <div class="card-box" style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-left: 4px solid #10B981;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 6px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Plano Contratado</td>
                        <td style="padding: 6px 0; text-align: right; color: #047857; font-weight: 800; font-size: 16px;">${data.plan}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Data de Expiração</td>
                        <td style="padding: 6px 0; text-align: right; color: #0F172A; font-weight: 600;">${data.expiryDate}</td>
                    </tr>
                </table>
            </div>

            <p>Agora você tem acesso irrestrito às ferramentas quantitativas, diário automatizado, relatórios e métricas de consistência.</p>
            
            <div class="cta-container">
                <a href="${process.env.FRONTEND_URL || 'https://torexjournal.com'}/dashboard" class="button">Acessar Meu Painel</a>
            </div>
        `;
        return BASE_LAYOUT(content);
    },

    TRIAL_WELCOME: (data: { userName?: string; days: number; expiryDate: string; dashboardUrl?: string }) => {
        const content = `
            <div class="badge" style="background-color: #ECFDF5; color: #065F46; border-color: #A7F3D0;">
                🎁 PRESENTE EXCLUSIVO • TOREX JOURNAL
            </div>
            <h1 class="h1-title">Seus ${data.days} Dias de Plano Premium Estão Ativos!</h1>
            <div class="divider"></div>
            <p>Olá${data.userName ? ` <b>${data.userName}</b>` : ''},</p>
            <p>Liberamos <b>${data.days} dias de acesso gratuito e irrestrito</b> a todos os recursos profissionais do Torex Journal na sua conta!</p>
            
            <div class="card-box" style="border-left: 4px solid #10B981;">
                <p style="margin: 0 0 14px 0; font-weight: 800; color: #0F172A; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ⚡ Recursos Desbloqueados para Você:
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 6px 0; color: #10B981; width: 24px; vertical-align: top; font-weight: bold;">✓</td>
                        <td style="padding: 6px 0; color: #334155; font-size: 14px;"><b>Diário & Análise Quantitativa:</b> Métricas de Win Rate, Profit Factor e Drawdown em tempo real.</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #10B981; width: 24px; vertical-align: top; font-weight: bold;">✓</td>
                        <td style="padding: 6px 0; color: #334155; font-size: 14px;"><b>Sincronização em Tempo Real:</b> Importação contínua de contas MT5 e Deriv sem atrasos.</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #10B981; width: 24px; vertical-align: top; font-weight: bold;">✓</td>
                        <td style="padding: 6px 0; color: #334155; font-size: 14px;"><b>Psicologia & Disciplina:</b> Rastreamento emocional e playbook de regras operacionais.</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #10B981; width: 24px; vertical-align: top; font-weight: bold;">✓</td>
                        <td style="padding: 6px 0; color: #334155; font-size: 14px;"><b>Período Gratuito Válido até:</b> <strong style="color: #047857;">${data.expiryDate}</strong></td>
                    </tr>
                </table>
            </div>

            <p>Aproveite ao máximo esse período para auditar suas estratégias operacionais e acelerar sua consistência.</p>
            
            <div class="cta-container">
                <a href="${data.dashboardUrl || process.env.FRONTEND_URL || 'https://torexjournal.com'}/dashboard" class="button">Acessar Painel Premium</a>
            </div>
        `;
        return BASE_LAYOUT(content);
    },

    PAYMENT_FAILED: (data: { userName?: string; reference: string; reason?: string }) => {
        const content = `
            <div class="badge" style="background-color: #FFF1F2; color: #9F1239; border-color: #FECDD3;">
                FALHA NO PROCESSAMENTO
            </div>
            <h1 class="h1-title">Não Conseguimos Confirmar o Seu Pagamento</h1>
            <div class="divider"></div>
            <p>Olá${data.userName ? ` <b>${data.userName}</b>` : ''},</p>
            <p>Ocorreu uma falha ao tentar processar o pagamento referente à sua assinatura no Torex Journal.</p>
            
            <div class="card-box" style="background-color: #FFF1F2; border: 1px solid #FECDD3; border-left: 4px solid #E11D48;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 6px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Referência</td>
                        <td style="padding: 6px 0; text-align: right; color: #0F172A; font-family: monospace; font-weight: 700;">${data.reference}</td>
                    </tr>
                    ${data.reason ? `
                    <tr>
                        <td style="padding: 6px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Motivo</td>
                        <td style="padding: 6px 0; text-align: right; color: #BE123C; font-weight: 600;">${data.reason}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>

            <p>Você pode tentar novamente com o mesmo método ou escolher uma forma de pagamento alternativa.</p>
            
            <div class="cta-container">
                <a href="${process.env.FRONTEND_URL || 'https://torexjournal.com'}/subscription" class="button">Tentar Novamente</a>
            </div>
        `;
        return BASE_LAYOUT(content);
    },

    LOGIN_ALERT: (data: { userName?: string; ip: string; device: string; time: string }) => {
        const content = `
            <div class="badge" style="background-color: #FFF1F2; color: #9F1239; border-color: #FECDD3;">
                ALERTA DE SEGURANÇA ⚠️
            </div>
            <h1 class="h1-title">Novo Login Detectado</h1>
            <div class="divider"></div>
            <p>Olá${data.userName ? ` <b>${data.userName}</b>` : ''},</p>
            <p>Detectamos um novo acesso à sua conta Torex Journal através dos seguintes dados:</p>
            
            <div class="card-box" style="border-left: 4px solid #E11D48;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 6px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">🕒 Data / Hora</td>
                        <td style="padding: 6px 0; text-align: right; color: #0F172A; font-weight: 600;">${data.time}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">💻 Dispositivo</td>
                        <td style="padding: 6px 0; text-align: right; color: #0F172A; font-weight: 600;">${data.device}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">🌐 Endereço IP</td>
                        <td style="padding: 6px 0; text-align: right; color: #047857; font-family: monospace; font-weight: 700;">${data.ip}</td>
                    </tr>
                </table>
            </div>

            <p style="color: #BE123C; font-weight: 600;">Se não foi você quem realizou este acesso, recomendamos alterar sua senha imediatamente para proteger sua conta e suas conexões de trading.</p>
            
            <div class="cta-container">
                <a href="${process.env.FRONTEND_URL || 'https://torexjournal.com'}/settings" class="button button-danger">Proteger Minha Conta</a>
            </div>
        `;
        return BASE_LAYOUT(content);
    },

    OTP_CODE: (data: { otp: string }) => {
        const content = `
            <div class="badge">CÓDIGO DE VERIFICAÇÃO</div>
            <h1 class="h1-title">Confirme Sua Identidade</h1>
            <div class="divider"></div>
            <p>Use o código de segurança abaixo para confirmar a sua ação no Torex Journal:</p>
            
            <div style="text-align: center; margin: 30px 0; background-color: #F0FDF4; padding: 28px 20px; border-radius: 14px; border: 2px dashed #10B981;">
                <div style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #047857; font-family: -apple-system, BlinkMacSystemFont, 'SF Mono', Monaco, Consolas, monospace;">
                    ${data.otp}
                </div>
            </div>

            <div class="card-box" style="padding: 16px 20px; margin: 20px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="color: #D97706; width: 22px; vertical-align: top; font-size: 16px;">⏱</td>
                        <td style="color: #475569; font-size: 13px; line-height: 1.5;">
                            Este código é estritamente confidencial e <b>expira em 10 minutos</b>. Jamais compartilhe este código com ninguém, inclusive membros da equipe Torex.
                        </td>
                    </tr>
                </table>
            </div>

            <p style="font-size: 13px; color: #64748B; text-align: center; margin-top: 20px;">
                Se você não solicitou este código de acesso, por favor ignore este e-mail com segurança.
            </p>
        `;
        return BASE_LAYOUT(content);
    },

    WELCOME_EMAIL: (data: { userName: string }) => {
        const content = `
            <div class="badge">BEM-VINDO AO TOREX JOURNAL</div>
            <h1 class="h1-title">Olá, ${data.userName}! 👋</h1>
            <div class="divider"></div>
            <p>Estamos muito felizes em ter você conosco na comunidade oficial de traders profissionais do <b>Torex Journal</b>.</p>
            <p>O Torex Journal foi construído com rigor estatístico para ajudar você a dominar seus dados, identificar padrões vencedores e manter disciplina inabalável no mercado financeiro.</p>
            
            <div class="card-box" style="border-left: 4px solid #10B981;">
                <p style="margin: 0 0 14px 0; font-weight: 800; color: #0F172A; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                    🚀 3 Passos Essenciais para Começar:
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 8px 0; color: #10B981; font-weight: 800; width: 28px; vertical-align: top;">01.</td>
                        <td style="padding: 8px 0; color: #475569; font-size: 14px;"><b>Conecte suas contas:</b> Sincronize seu terminal MT5 ou Deriv para importação automática de trades.</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #10B981; font-weight: 800; width: 28px; vertical-align: top;">02.</td>
                        <td style="padding: 8px 0; color: #475569; font-size: 14px;"><b>Registre o Diário:</b> Adicione notas emocionais e regras de execução logo após cada operação.</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #10B981; font-weight: 800; width: 28px; vertical-align: top;">03.</td>
                        <td style="padding: 8px 0; color: #475569; font-size: 14px;"><b>Audite seu Desempenho:</b> Acompanhe seus gráficos de consistência e suba de patamar no Leaderboard.</td>
                    </tr>
                </table>
            </div>

            <div class="cta-container">
                <a href="${process.env.FRONTEND_URL || 'https://torexjournal.com'}/dashboard" class="button">Acessar Meu Painel</a>
            </div>
        `;
        return BASE_LAYOUT(content);
    },

    MT5_STATUS: (data: { userName?: string; mt5Id: string; status: 'CONNECTED' | 'DISCONNECTED' }) => {
        const isConnected = data.status === 'CONNECTED';
        const color = isConnected ? '#047857' : '#BE123C';
        const badgeBg = isConnected ? '#ECFDF5' : '#FFF1F2';
        const borderColor = isConnected ? '#A7F3D0' : '#FECDD3';
        const accentBorder = isConnected ? '#10B981' : '#E11D48';

        const content = `
            <div class="badge" style="background-color: ${badgeBg}; color: ${color}; border-color: ${borderColor};">
                STATUS DO TERMINAL MT5
            </div>
            <h1 class="h1-title">MT5 ${isConnected ? 'Conectado com Sucesso' : 'Desconectado'}</h1>
            <div class="divider"></div>
            <p>Olá${data.userName ? ` <b>${data.userName}</b>` : ''},</p>
            <p>O status de conexão da sua conta MT5 (Login: <b>${data.mt5Id}</b>) foi alterado:</p>
            
            <div class="card-box" style="border-left: 4px solid ${accentBorder};">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 6px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Conta MT5</td>
                        <td style="padding: 6px 0; text-align: right; color: #0F172A; font-family: monospace; font-weight: 700;">${data.mt5Id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Estado de Conexão</td>
                        <td style="padding: 6px 0; text-align: right; color: ${color}; font-weight: 800;">
                            ${isConnected ? 'ONLINE 🟢' : 'OFFLINE 🔴'}
                        </td>
                    </tr>
                </table>
            </div>

            ${isConnected ? 
                '<p>Seus trades e histórico estão sendo transmitidos e catalogados em tempo real na sua dashboard.</p>' : 
                '<p>Para retomar a sincronização automática, certifique-se de que o seu terminal MetaTrader 5 está aberto e com o Expert Advisor (EA) do Torex Journal ativo.</p>'
            }
            
            <div class="cta-container">
                <a href="${process.env.FRONTEND_URL || 'https://torexjournal.com'}/settings" class="button">Gerenciar Conexões</a>
            </div>
        `;
        return BASE_LAYOUT(content);
    },

    TRADE_IMPORTED: (data: { userName?: string; count: number; method: string; profit?: number; wins?: number; losses?: number }) => {
        const now = new Date();
        const hasStats = data.profit !== undefined;
        const profitColor = (data.profit || 0) >= 0 ? '#047857' : '#BE123C';
        
        const content = `
            <div class="badge">SINCRONIZAÇÃO CONCLUÍDA</div>
            <h1 class="h1-title">Resumo da Importação de Trades</h1>
            <div class="divider"></div>
            <p>Olá${data.userName ? ` <b>${data.userName}</b>` : ''},</p>
            <p>A sincronização com o seu terminal foi finalizada. Seus dados operacionais foram auditados e inseridos no seu histórico:</p>
            
            <div class="card-box" style="border-left: 4px solid #10B981;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 8px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Operações Importadas</td>
                        <td style="padding: 8px 0; text-align: right; color: #0F172A; font-weight: 800; font-size: 15px;">${data.count} Trades</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Método de Envio</td>
                        <td style="padding: 8px 0; text-align: right; color: #475569; font-weight: 600;">${data.method}</td>
                    </tr>
                    ${hasStats ? `
                    <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Resultado Estimado</td>
                        <td style="padding: 8px 0; border-top: 1px solid #E2E8F0; text-align: right; color: ${profitColor}; font-weight: 900; font-size: 16px; font-family: monospace;">
                            ${(data.profit || 0) >= 0 ? '+' : ''}${data.profit?.toFixed(2)} MT
                        </td>
                    </tr>
                    ` : ''}
                </table>
            </div>

            <p style="text-align: center; color: #64748B; font-size: 12px; margin-top: 15px;">
                Processado em ${now.toLocaleDateString()} às ${now.toLocaleTimeString()}
            </p>
            
            <div class="cta-container">
                <a href="${process.env.FRONTEND_URL || 'https://torexjournal.com'}/dashboard" class="button">Analisar no Dashboard</a>
            </div>
        `;
        return BASE_LAYOUT(content);
    },

    SYSTEM_ALERT: (data: { title: string; message: string; type: string; userName?: string }) => {
        let accentColor = '#10B981';
        let badgeBg = '#ECFDF5';
        let badgeColor = '#065F46';
        let badgeBorder = '#A7F3D0';
        let subtitle = 'NOTIFICAÇÃO DO SISTEMA';

        if (data.type.includes('risk')) {
            accentColor = '#E11D48';
            badgeBg = '#FFF1F2';
            badgeColor = '#9F1239';
            badgeBorder = '#FECDD3';
            subtitle = 'ALERTA DE RISCO ⚠️';
        } else if (data.type.includes('success')) {
            accentColor = '#10B981';
            badgeBg = '#ECFDF5';
            badgeColor = '#065F46';
            badgeBorder = '#A7F3D0';
            subtitle = 'CONQUISTA OPERACIONAL 🏆';
        } else if (data.type.includes('insight') || data.type.includes('mental') || data.type.includes('psychology')) {
            accentColor = '#2563EB';
            badgeBg = '#EFF6FF';
            badgeColor = '#1E40AF';
            badgeBorder = '#BFDBFE';
            subtitle = 'INSIGHT PSICOLÓGICO 🧠';
        } else if (data.type.includes('discipline') || data.type.includes('rule')) {
            accentColor = '#D97706';
            badgeBg = '#FFFBEB';
            badgeColor = '#92400E';
            badgeBorder = '#FDE68A';
            subtitle = 'ESTADO DE DISCIPLINA ⚖️';
        } else if (data.type.includes('coaching') || data.type.includes('performance')) {
            accentColor = '#7C3AED';
            badgeBg = '#F5F3FF';
            badgeColor = '#5B21B6';
            badgeBorder = '#DDD6FE';
            subtitle = 'FEEDBACK DE PERFORMANCE 📈';
        }

        const content = `
            <div class="badge" style="background-color: ${badgeBg}; color: ${badgeColor}; border-color: ${badgeBorder};">
                ${subtitle}
            </div>
            <h1 class="h1-title">${data.title}</h1>
            <div class="divider"></div>
            
            <div class="card-box" style="border-left: 4px solid ${accentColor};">
                <p style="margin: 0; color: #1E293B; font-size: 15px; line-height: 1.6;">
                    ${data.message}
                </p>
            </div>
            
            <p>Olá${data.userName ? ` <b>${data.userName}</b>` : ''},</p>
            <p>Esta é uma atualização baseada no seu comportamento recente e nos parâmetros configurados na sua conta.</p>
            
            <div class="cta-container">
                <a href="${process.env.FRONTEND_URL || 'https://torexjournal.com'}/dashboard" class="button" style="background-color: ${accentColor};">Ver Detalhes</a>
            </div>
        `;
        return BASE_LAYOUT(content);
    },

    WEEKLY_SUMMARY: (data: { userName: string; totalPnL: number; winRate: number; totalTrades: number; topLessons: any[]; period: { start: string; end: string } }) => {
        const profitColor = data.totalPnL >= 0 ? '#047857' : '#BE123C';
        const content = `
            <div class="badge">RELATÓRIO SEMANAL DE PERFORMANCE</div>
            <h1 class="h1-title">Resumo da Sua Semana de Trading</h1>
            <div class="divider"></div>
            <p>Olá <b>${data.userName}</b>,</p>
            <p>Aqui está o resumo do seu desempenho quantitativo de <b>${new Date(data.period.start).toLocaleDateString()}</b> a <b>${new Date(data.period.end).toLocaleDateString()}</b>:</p>
            
            <div class="card-box" style="border-left: 4px solid #10B981;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 8px 0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Resultado Líquido</td>
                        <td style="padding: 8px 0; text-align: right; color: ${profitColor}; font-weight: 900; font-size: 19px; font-family: monospace;">
                            ${data.totalPnL >= 0 ? '+' : ''}${data.totalPnL.toFixed(2)} MT
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Taxa de Acerto (Win Rate)</td>
                        <td style="padding: 8px 0; border-top: 1px solid #E2E8F0; text-align: right; color: #0F172A; font-weight: 800; font-size: 15px;">
                            ${data.winRate.toFixed(1)}%
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase;">Total de Operações</td>
                        <td style="padding: 8px 0; border-top: 1px solid #E2E8F0; text-align: right; color: #0F172A; font-weight: 800; font-size: 15px;">
                            ${data.totalTrades}
                        </td>
                    </tr>
                </table>
            </div>

            ${data.topLessons && data.topLessons.length > 0 ? `
                <div class="card-box" style="margin-top: 20px;">
                    <p style="margin: 0 0 12px 0; font-weight: 800; color: #0F172A; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                        🧠 Principais Lições Aprendidas:
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                        ${data.topLessons.map(l => `
                            <tr>
                                <td style="padding: 6px 0; color: #047857; font-weight: 800; width: 36px; vertical-align: top; font-size: 13px;">${l.count}x</td>
                                <td style="padding: 6px 0; color: #475569; font-size: 14px;">${l.lesson}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            ` : ''}

            <p style="margin-top: 24px;">Lembre-se: consistência no mercado financeiro é uma maratona construída trade a trade, mantendo a gestão de risco rigorosa.</p>
            
            <div class="cta-container">
                <a href="${process.env.FRONTEND_URL || 'https://torexjournal.com'}/journal" class="button">Ver Diário Completo</a>
            </div>
        `;
        return BASE_LAYOUT(content);
    }
};
