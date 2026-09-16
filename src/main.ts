async function bootstrap() {
    console.info('[bootstrap] Loading application modules');
    const [
        { NestFactory },
        { AppModule },
        { ValidationPipe },
        { default: cookieParser },
        { swaggerConfig },
        { SwaggerModule },
    ] = await Promise.all([
        import('@nestjs/core'),
        import('./app.module.js'),
        import('@nestjs/common'),
        import('cookie-parser'),
        import('./config/swagger.config.js'),
        import('@nestjs/swagger'),
    ]);

    console.info('[bootstrap] Creating Nest application');
    const app = await NestFactory.create(AppModule, { abortOnError: false });
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());

    const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    const allowedOrigins =
        configuredOrigins.length || process.env.NODE_ENV === 'production' ? configuredOrigins : ['http://localhost:5173'];

    if (allowedOrigins.length) {
        app.enableCors({ origin: allowedOrigins, credentials: true });
        console.info('[bootstrap] CORS enabled for', allowedOrigins.join(', '));
    } else {
        console.info('[bootstrap] CORS_ORIGINS not set — browser requests from the frontend will be blocked');
    }

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document);
    await app.listen(process.env.PORT ?? 3000);
    console.info('[bootstrap] Application is listening');
}

void bootstrap().catch((error: unknown) => {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    console.error('[bootstrap] Startup failed:', message.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[DATABASE_URL redacted]'));
    process.exitCode = 1;
});
