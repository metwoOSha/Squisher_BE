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
