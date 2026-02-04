import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';


const SECRET_KEY = process.env.JWT_SECRET || 'secret_ecom';

// ✅ Public affiliate routes (NO AUTH REQUIRED)
const PUBLIC_ROUTES = [
  // Affiliate
  '/api/affiliate/auth/login',
  '/api/affiliate/auth/register',
  '/affiliate/auth/login',
  '/affiliate/auth/register',

  // Logistics
  '/api/logistics/login',
  '/api/logistics/register',
  '/logistics/login',
];


export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
  return NextResponse.next();
}

  // Token sources
  const logisticsToken = req.cookies.get('logisticsToken')?.value;
  const affiliateToken = req.cookies.get('affiliateToken')?.value;

  // Protected paths
  const logisticsProtected = ['/logistics/dashboard'];
  const affiliateProtected = ['/affiliate/dashboard', '/api/affiliate/'];

  const isLogisticsPath = logisticsProtected.some(path =>
    pathname.startsWith(path)
  );
  const isAffiliatePath = affiliateProtected.some(path =>
    pathname.startsWith(path)
  );

if (
  pathname === '/affiliate/auth/login' &&
  affiliateToken
) {
  try {
    jwt.verify(affiliateToken, SECRET_KEY);
    return NextResponse.redirect(new URL('/affiliate/dashboard', req.url));
  } catch {}
}

if (pathname === '/logistics/login' && logisticsToken) {
  try {
    jwt.verify(logisticsToken, SECRET_KEY);
    return NextResponse.redirect(new URL('/logistics/dashboard', req.url));
  } catch {}
}


  // 🚚 Logistics protection
  if (isLogisticsPath) {
    if (!logisticsToken) {
      return NextResponse.redirect(new URL('/logistics/login', req.url));
    }

    try {
      jwt.verify(logisticsToken, SECRET_KEY);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/logistics/login', req.url));
    }
  }

  // 🤝 Affiliate protection
  if (isAffiliatePath) {
    if (!affiliateToken) {
      if (pathname.startsWith('/affiliate/dashboard')) {
        return NextResponse.redirect(new URL('/affiliate/auth/login', req.url));
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(affiliateToken, SECRET_KEY);
      return NextResponse.next();
    } catch {
      if (pathname.startsWith('/affiliate/dashboard')) {
        return NextResponse.redirect(new URL('/affiliate/auth/login', req.url));
      }
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/logistics/dashboard/:path*',
    '/affiliate/dashboard/:path*',
    '/api/affiliate/:path*',
  ],
};
