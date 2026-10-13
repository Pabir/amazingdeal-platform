import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const rawHost = req.headers.get('host') || 'localhost:3000';
  const hostname = rawHost.replace(/:\d+$/, '').toLowerCase();

  // Allow query param override in development or shared domains: ?store=threads
  const queryTenant = url.searchParams.get('store') || url.searchParams.get('tenant');
  const cookieTenant = req.cookies.get('amazingdeal_store')?.value;

  let tenantSlug = 'footwear'; // Default fallback store

  if (queryTenant) {
    tenantSlug = queryTenant.toLowerCase();
  } else if (hostname.endsWith('.vercel.app')) {
    // Vercel deployment:
    // e.g. "amazingdeal-platform.vercel.app" (3 parts) -> Check cookie or fallback 'footwear'
    // e.g. "threads.amazingdeal-platform.vercel.app" (4 parts) -> Subdomain tenant: 'threads'
    const parts = hostname.split('.');
    if (parts.length >= 4 && parts[0] !== 'www') {
      tenantSlug = parts[0];
    } else if (cookieTenant) {
      tenantSlug = cookieTenant.toLowerCase();
    } else {
      tenantSlug = 'footwear';
    }
  } else if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Custom domain routing:
    // e.g. "footwear.yourdomain.com" (3 parts) -> Subdomain tenant: 'footwear'
    // e.g. "yourdomain.com" or "www.yourdomain.com" -> Check cookie or fallback 'footwear'
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'admin' && parts[0] !== 'api') {
      tenantSlug = parts[0];
    } else if (cookieTenant) {
      tenantSlug = cookieTenant.toLowerCase();
    } else {
      tenantSlug = 'footwear';
    }
  } else if (cookieTenant) {
    // localhost / 127.0.0.1 without query parameter: check cookie
    tenantSlug = cookieTenant.toLowerCase();
  }

  // Rewrite internally to /sites/[tenantSlug]/...
  const path = url.pathname;
  const rewriteUrl = new URL(`/sites/${tenantSlug}${path === '/' ? '' : path}`, req.url);
  rewriteUrl.search = url.search;

  // Clone request headers and inject tenant identity for downstream Server Components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-tenant-slug', tenantSlug);
  requestHeaders.set('x-forwarded-host', rawHost);

  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('x-tenant-slug', tenantSlug);

  // Persist tenant in cookie for all navigations
  response.cookies.set('amazingdeal_store', tenantSlug, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
