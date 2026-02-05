import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'secret_ecom';

/**
 * ✅ Routes that NEVER require authentication
 */
const PUBLIC_ROUTES = [
  // Affiliate auth (API + pages)
  '/api/affiliate/auth/login',
  '/api/affiliate/auth/register',
  '/affiliate/auth/login',
  '/affiliate/auth/register',

  // Logistics auth (API + pages)
  '/api/logistics/login',
  '/api/logistics/register',
  '/logistics/login',
];

/**
 * ✅ Protected route prefixes
 */
const LOGISTICS_PROTECTED = ['/logistics/dashboard'];
const AFFILIATE_PROTECTED = ['/affiliate/dashboard', '/api/affiliate'];

/**
 * 🔐 Helper: verify JWT safely
 */
function verifyToken(token: string | undefined) {
  if (!token) return false;
  try {
    jwt.verify(token, SECRET_KEY);
    return true;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  /**
   * 1️⃣ Allow public routes immediately
   */
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  /**
   * 2️⃣ Read cookies
   */
  const logisticsToken = req.cookies.get('logisticsToken')?.value;
  const affiliateToken = req.cookies.get('affiliateToken')?.value;

  const logisticsValid = verifyToken(logisticsToken);
  const affiliateValid = verifyToken(affiliateToken);

  const isLogisticsPath = LOGISTICS_PROTECTED.some(path =>
    pathname.startsWith(path)
  );

  const isAffiliatePath = AFFILIATE_PROTECTED.some(path =>
    pathname.startsWith(path)
  );

  /**
   * 3️⃣ If already logged in, block access to login pages
   */
  if (pathname === '/logistics/login' && logisticsValid) {
    return NextResponse.redirect(
      new URL('/logistics/dashboard', req.url)
    );
  }

  if (pathname === '/affiliate/auth/login' && affiliateValid) {
    return NextResponse.redirect(
      new URL('/affiliate/dashboard', req.url)
    );
  }

  /**
   * 4️⃣ Logistics protection
   */
  if (isLogisticsPath) {
    if (!logisticsValid) {
      return NextResponse.redirect(
        new URL('/logistics/login', req.url)
      );
    }
    return NextResponse.next();
  }

  /**
   * 5️⃣ Affiliate protection
   */
  if (isAffiliatePath) {
    if (!affiliateValid) {
      // API routes return JSON, pages redirect
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(
        new URL('/affiliate/auth/login', req.url)
      );
    }
    return NextResponse.next();
  }

  /**
   * 6️⃣ Default allow
   */
  return NextResponse.next();
}

/**
 * ✅ Middleware matcher
 */
export const config = {
  matcher: [
    '/logistics/dashboard/:path*',
    '/affiliate/dashboard/:path*',
    '/affiliate/auth/login',
    '/logistics/login',
    '/api/affiliate/:path*',
  ],
};
