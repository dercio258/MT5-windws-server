import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateData, Templates, TemplateSubjects, BASE_LAYOUT } from './email-templates';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);

    constructor(private configService: ConfigService) {
        this.transporter = this.createTransporter();
    }

    private createTransporter(): nodemailer.Transporter {
        const host = this.configService.get<string>('MAIL_HOST') || this.configService.get<string>('SMTP_HOST') || 'mail.ratixpay.co.mz';
        const port = this.configService.get<number>('MAIL_PORT') || this.configService.get<number>('SMTP_PORT') || 587;
        const secure = this.configService.get<boolean>('SMTP_SECURE') ?? false; // Port 587 usually requires secure: false (STARTTLS)
        const user = this.configService.get<string>('MAIL_USER') || this.configService.get<string>('Email_notification');
        const pass = this.configService.get<string>('MAIL_PASS') || this.configService.get<string>('Email_notification_pass');

        return nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    private initializeTransporter() {
        this.transporter = this.createTransporter();
    }

    async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
        const user = this.configService.get<string>('MAIL_USER') || this.configService.get<string>('Email_notification');
        const pass = this.configService.get<string>('MAIL_PASS') || this.configService.get<string>('Email_notification_pass');

        if (!user || !pass) {
            this.logger.warn('Mock Email Dispatch (SMTP not fully configured in .env):');
            this.logger.warn(`To: ${to} | Subject: ${subject}`);
            return true;
        }

        try {
            const from = this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('SMTP_FROM') || `"Torex Journal" <${user}>`;
            const info = await this.transporter.sendMail({
                from,
                to,
                subject,
                text,
                html: html || this.wrapProfessionalTemplate(subject, text),
            });
            this.logger.log(`Email sent: ${info.messageId}`);
            return true;
        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorCode = (error as any)?.code;
            
            this.logger.error(`Error sending email to ${to}:`, errorMessage);
            
            // Retry once if connection was dropped
            if (errorCode === 'ECONNECTION' || errorCode === 'ETIMEDOUT') {
                this.initializeTransporter();
                return this.sendEmail(to, subject, text, html);
            }
            return false;
        }
    }

    async sendTemplatedEmail(to: string, template: keyof typeof Templates, data: any): Promise<boolean> {
        const templateFn = Templates[template] as any;
        if (!templateFn) {
            this.logger.error(`Template ${template} not found`);
            return false;
        }

        const html = templateFn(data);
        const defaultSubjectFn = (TemplateSubjects as any)[template];
        const subject = data.subject || (defaultSubjectFn ? defaultSubjectFn(data) : data.title) || 'Torex Journal Notice';
        
        return this.sendEmail(to, subject, data.message || '', html);
    }

    private wrapProfessionalTemplate(title: string, content: string): string {
        const innerContent = `
            <div class="badge">NOTIFICAÇÃO INSTITUCIONAL</div>
            <h1 class="h1-title">${title}</h1>
            <div class="divider"></div>
            <div>
                ${content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
            </div>
        `;
        return BASE_LAYOUT(innerContent);
    }
}
