import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export function middleware(req: NextRequest) {
  const logisticsToken = req.cookies.get('logisticsToken')?.value;

  const protectedPaths = ['/logistics/dashboard'];

  const pathname = req.nextUrl.pathname;

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtectedPath) {
    if (!logisticsToken) {
      return NextResponse.redirect(new URL('/logistics/login', req.url));
    }

    try {
      jwt.verify(logisticsToken, SECRET_KEY);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL('/logistics/login', req.url));
    }
  }

  return NextResponse.next();
}
