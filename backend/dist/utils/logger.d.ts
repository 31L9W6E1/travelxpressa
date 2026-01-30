export declare const logger: {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void;
    http(req: {
        method: string;
        url: string;
        ip?: string;
    }, statusCode: number, responseTime: number): void;
    security(event: string, details: Record<string, unknown>): void;
    audit(action: string, userId: string, details: Record<string, unknown>): void;
};
//# sourceMappingURL=logger.d.ts.map