import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Rate limiting storage (en producción usar Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Bot detection patterns
const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /rogerbot/i,
  /linkedinbot/i,
  /embedly/i,
  /quora link preview/i,
  /showyoubot/i,
  /outbrain/i,
  /pinterest/i,
  /developers.google.com/i,
];

// Countries to redirect to specific pages
const COUNTRY_REDIRECTS: Record<string, string> = {
  // Ejemplo: redirigir usuarios de Brasil a página en portugués
  'BR': '/pt-br',
  'PT': '/pt-br',
  // 'US': '/en',
  // 'GB': '/en',
};

function isBot(userAgent: string): boolean {
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

function getRateLimitKey(ip: string, userAgent: string): string {
  return `${ip}-${userAgent.slice(0, 100)}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = 60; // 60 requests por minuto

  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (entry.count >= maxRequests) {
    return true;
  }

  entry.count++;
  rateLimitMap.set(key, entry);
  return false;
}

function getCountryFromHeaders(request: NextRequest): string | null {
  // Vercel
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  if (vercelCountry) return vercelCountry;

  // Cloudflare
  const cfCountry = request.headers.get('cf-ipcountry');
  if (cfCountry) return cfCountry;

  // Netlify
  const netlifyCountry = request.headers.get('x-country');
  if (netlifyCountry) return netlifyCountry;

  // Other providers
  const country = request.headers.get('x-forwarded-country') || 
                  request.headers.get('cloudfront-viewer-country');
  
  return country;
}

function shouldRedirect(pathname: string, country: string | null): string | null {
  // No redirigir si ya está en una ruta localizada
  if (pathname.startsWith('/en') || pathname.startsWith('/pt-br')) {
    return null;
  }

  // No redirigir páginas de API
  if (pathname.startsWith('/api')) {
    return null;
  }

  if (country && COUNTRY_REDIRECTS[country]) {
    return COUNTRY_REDIRECTS[country];
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Crear respuesta
  const response = NextResponse.next();

  // 1. SEGURIDAD - Rate Limiting (solo para humanos)
  if (!isBot(userAgent)) {
    const rateLimitKey = getRateLimitKey(ip, userAgent);
    if (isRateLimited(rateLimitKey)) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + 60)
        }
      });
    }
  }

  // 2. REDIRECTS BASADOS EN GEOLOCALIZACIÓN
  const country = getCountryFromHeaders(request);
  const redirectPath = shouldRedirect(pathname, country);
  
  if (redirectPath && !isBot(userAgent)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectPath;
    
    return NextResponse.redirect(redirectUrl, { status: 302 });
  }

  // 3. SEO - Redirects para URLs con trailing slash
  if (pathname.endsWith('/') && pathname.length > 1) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.slice(0, -1);
    
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  // 4. REDIRECTS ESPECÍFICOS
  const redirects: Record<string, string> = {
    '/home': '/',
    '/help': '/faq',
    '/support': '/faq',
    '/documentation': '/docs',
    '/guide': '/docs',
    '/download': '/',
    '/get': '/',
  };

  if (redirects[pathname]) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirects[pathname];
    
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  // 5. ANALYTICS Y HEADERS PERSONALIZADOS
  
  // Agregar headers de seguridad adicionales
  response.headers.set('X-Request-ID', crypto.randomUUID());
  response.headers.set('X-Timestamp', new Date().toISOString());
  
  // Headers específicos para bots
  if (isBot(userAgent)) {
    response.headers.set('X-Robot-Tag', 'index, follow');
    response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
  } else {
    // Headers para usuarios reales
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=1800');
  }

  // 6. ANALYTICS DATA (para uso en componentes)
  response.headers.set('X-User-Country', country || 'unknown');
  response.headers.set('X-User-Agent', userAgent.slice(0, 200));
  response.headers.set('X-Is-Bot', isBot(userAgent) ? 'true' : 'false');

  // 7. CONTENT TYPE OPTIMIZATION
  if (pathname.endsWith('.xml')) {
    response.headers.set('Content-Type', 'application/xml');
  } else if (pathname.endsWith('.json')) {
    response.headers.set('Content-Type', 'application/json');
  } else if (pathname.endsWith('.txt')) {
    response.headers.set('Content-Type', 'text/plain');
  }

  // 8. PRELOAD HINTS para páginas importantes
  const criticalPaths = ['/', '/docs', '/faq'];
  if (criticalPaths.includes(pathname)) {
    response.headers.set(
      'Link', 
      '</images/nurologo.png>; rel=preload; as=image, </api/subscribe>; rel=dns-prefetch'
    );
  }

  // 9. MODO MANTENIMIENTO
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') {
    // Permitir acceso a admins (por IP o token)
    const adminIPs = process.env.ADMIN_IPS?.split(',') || [];
    const adminToken = request.nextUrl.searchParams.get('admin');
    
    if (!adminIPs.includes(ip) && adminToken !== process.env.ADMIN_TOKEN) {
      return new NextResponse('Site under maintenance', { 
        status: 503,
        headers: {
          'Retry-After': '3600',
          'Content-Type': 'text/html',
        }
      });
    }
  }

  // 10. A/B TESTING (opcional)
  if (process.env.NEXT_PUBLIC_ENABLE_AB_TESTING === 'true') {
    const abTestVariant = Math.random() < 0.5 ? 'A' : 'B';
    response.headers.set('X-AB-Test-Variant', abTestVariant);
    response.cookies.set('ab_test_variant', abTestVariant, { 
      maxAge: 30 * 24 * 60 * 60, // 30 días
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production'
    });
  }

  return response;
}

// Configuración de qué rutas debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt
     * - sitemap.xml
     * - manifest.json
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|images).*)',
  ],
};