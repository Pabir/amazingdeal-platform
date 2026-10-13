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

  // Allow query param override in development: ?store=threads
  const queryTenant = url.searchParams.get('store') || url.searchParams.get('tenant');

  let tenantSlug = 'footwear'; // Default fallback store

  if (queryTenant) {
    tenantSlug = queryTenant.toLowerCase();
  } else if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Check for subdomain e.g. footwear.platform.com or footwear.localhost
    const parts = hostname.split('.');
    if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'admin' && parts[0] !== 'api') {
      tenantSlug = parts[0];
    } else {
      // Custom domain mapping
      tenantSlug = hostname;
    }
  }

  // Rewrite internally to /sites/[tenantSlug]/...
  const path = url.pathname;
  const rewriteUrl = new URL(`/sites/${tenantSlug}${path === '/' ? '' : path}`, req.url);

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
  return response;
}
