export declare const config: {
    env: string;
    port: number;
    databaseUrl: string;
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    encryptionKey: string;
    corsOrigin: string;
    rateLimit: {
        windowMs: number;
        maxRequests: number;
        authMaxRequests: number;
    };
    sessionSecret: string;
    redisUrl: string | undefined;
    smtp: {
        host: string | undefined;
        port: number;
        user: string | undefined;
        pass: string | undefined;
        from: string;
    };
    upload: {
        maxFileSize: number;
        uploadDir: string;
    };
    logging: {
        level: string;
        format: string;
    };
    sentryDsn: string | undefined;
    frontendUrl: string;
    telegram: {
        botToken: string;
        chatId: string;
        messageThreadId: number | undefined;
    };
    features: {
        enable2FA: boolean;
        enableAgentMode: boolean;
    };
    qpay: {
        baseUrl: string;
        sandboxUrl: string;
        username: string;
        password: string;
        invoiceCode: string;
        callbackUrl: string;
        useSandbox: boolean;
    };
    isProduction: boolean;
    isDevelopment: boolean;
    isTest: boolean;
};
//# sourceMappingURL=index.d.ts.map