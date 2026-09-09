import { Logger } from '@nestjs/common';
import * as WebSocket from 'ws';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export class DerivClient {
    private readonly logger = new Logger(DerivClient.name);
    private ws: WebSocket;
    private readonly appId: string;
    private url: string;
    private messageSubject = new Subject<any>();
    private connectionSubject = new Subject<boolean>();
    private isConnected = false;
    private isAuthorized = false;
    private isManuallyClosed = false;
    private reconnectInterval = 5000;
    private maxReconnectAttempts = 50;
    private reconnectAttempts = 0;
    private pingIntervalHandle: any;

    constructor(appId?: string) {
        this.appId = appId || process.env.DERIV_APP_ID || '1089';
        this.url = `wss://ws.binaryws.com/websockets/v3?app_id=${this.appId}`;
    }

    connect(targetUrl?: string): Promise<void> {
        this.isManuallyClosed = false;
        if (targetUrl) {
            this.url = targetUrl;
        } else if (!this.url) {
            this.url = `wss://ws.binaryws.com/websockets/v3?app_id=${this.appId}`;
        }

        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.url);

            this.ws.on('open', () => {
                const isOtp = this.url.includes('otp=');
                this.logger.log(`Connected to Deriv WebSocket (${isOtp ? 'OTP-authenticated gateway' : 'Standard gateway'})`);
                this.isConnected = true;
                if (isOtp) {
                    this.isAuthorized = true;
                }
                this.reconnectAttempts = 0;
                this.connectionSubject.next(true);
                this.startPing();
                resolve();
            });

            this.ws.on('message', (data: string) => {
                try {
                    const message = JSON.parse(data);
                    this.messageSubject.next(message);
                } catch (e) {
                    this.logger.error('Failed to parse message from Deriv', e.stack);
                }
            });

            this.ws.on('close', () => {
                this.logger.warn('Disconnected from Deriv WebSocket');
                this.isConnected = false;
                this.isAuthorized = false;
                this.stopPing();
                this.handleReconnect();
            });

            this.ws.on('error', (err) => {
                this.logger.error('Deriv WebSocket error', err.stack);
                if (!this.isConnected) reject(err);
            });
        });
    }

    private startPing() {
        this.stopPing();
        this.pingIntervalHandle = setInterval(() => {
            if (this.isConnected) {
                this.send({ ping: 1 });
            }
        }, 30000);
    }

    private stopPing() {
        if (this.pingIntervalHandle) {
            clearInterval(this.pingIntervalHandle);
            this.pingIntervalHandle = null;
        }
    }

    private handleReconnect() {
        if (this.isManuallyClosed) return;

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const interval = this.reconnectAttempts > 10 ? 15000 : this.reconnectInterval;
            this.logger.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${interval / 1000}s...`);
            setTimeout(() => {
                if (!this.isConnected && !this.isManuallyClosed) {
                    this.connect().catch(() => { });
                }
            }, interval);
        } else {
            this.logger.error('Max reconnection attempts reached for Deriv WebSocket. Manual intervention may be required.');
        }
    }

    send(data: any): void {
        if (this.isConnected) {
            this.ws.send(JSON.stringify(data));
        } else {
            this.logger.error('Cannot send message: Deriv WebSocket is not connected');
        }
    }

    onMessage<T>(msgType?: string): Observable<T> {
        return this.messageSubject.asObservable().pipe(
            filter(msg => !msgType || msg.msg_type === msgType),
            map(msg => msg as T)
        );
    }

    onConnectionChange(): Observable<boolean> {
        return this.connectionSubject.asObservable();
    }

    setAuthorized(val: boolean) {
        this.isAuthorized = val;
    }

    getIsAuthorized(): boolean {
        return this.isAuthorized;
    }

    request<T>(data: any, msgType: string, timeoutMs: number = 30000): Promise<T> {
        const requestId = Math.floor(Math.random() * 1000000);
        const requestData = { ...data, req_id: requestId };

        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                return reject(new Error(`Cannot send ${msgType}: Deriv WebSocket is not connected`));
            }

            if (msgType !== 'authorize' && !this.isAuthorized) {
                return reject(new Error(`Cannot send ${msgType}: Client not authorized`));
            }

            const subscription = this.onMessage<any>(msgType).pipe(
                filter(msg => msg.req_id === requestId)
            ).subscribe({
                next: (response) => {
                    clearTimeout(timeoutHandle);
                    connSub.unsubscribe();
                    subscription.unsubscribe();
                    if (response.error) {
                        reject(new Error(response.error.message || `Deriv API Error: ${msgType}`));
                    } else {
                        resolve(response);
                    }
                },
                error: (err) => {
                    clearTimeout(timeoutHandle);
                    connSub.unsubscribe();
                    subscription.unsubscribe();
                    reject(err);
                }
            });

            // Handle socket closure while request is pending
            const connSub = this.onConnectionChange().pipe(
                filter(connected => !connected)
            ).subscribe(() => {
                clearTimeout(timeoutHandle);
                subscription.unsubscribe();
                connSub.unsubscribe();
                reject(new Error(`Deriv connection lost while waiting for ${msgType}`));
            });

            this.send(requestData);

            const timeoutHandle = setTimeout(() => {
                subscription.unsubscribe();
                connSub.unsubscribe();
                reject(new Error(`Deriv request timeout: ${msgType} (${timeoutMs}ms)`));
            }, timeoutMs);
        });
    }

    disconnect() {
        this.isManuallyClosed = true;
        this.stopPing();
        if (this.ws) {
            this.ws.removeAllListeners();
            this.ws.close();
            this.isConnected = false;
            this.isAuthorized = false;
        }
    }
}
