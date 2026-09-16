import type { CookieOptions } from 'express';

export const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
export const ANON_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

function baseCookieOptions(): CookieOptions {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
    };
}

export function authCookieOptions(): CookieOptions {
    return { ...baseCookieOptions(), maxAge: AUTH_COOKIE_MAX_AGE };
}

export function anonCookieOptions(): CookieOptions {
    return { ...baseCookieOptions(), maxAge: ANON_COOKIE_MAX_AGE };
}

export function clearCookieOptions(): CookieOptions {
    return baseCookieOptions();
}
