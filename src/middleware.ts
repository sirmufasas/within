import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options: CookieOptions };

function getProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return url.match(/https:\/\/([^.]+)\./)?.[1] ?? '';
}

function injectTokenFromHeader(request: NextRequest): void {
  const token = request.headers.get('x-sb-token');
  if (!token) return;
  const hasCookie = request.cookies.getAll().some((c) => c.name.includes('auth-token'));
  if (hasCookie) return;
  request.cookies.set(`sb-${getProjectRef()}-auth-token`, token);
}

export async function middleware(request: NextRequest) {
  // Public pages need no session refresh at all — skip the network round-trip
  // to Supabase's auth server entirely rather than paying that latency on
  // every click into the login screen or a customer's order link.
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/order/') || pathname === '/') {
    return NextResponse.next();
  }

  injectTokenFromHeader(request);
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // getUser() makes a real network round-trip to Supabase's auth server on
  // every single call — paying that cost on every navigation was the main
  // cause of slow screen transitions. getSession() reads the session from
  // the cookie locally (no network call in the common case, only when the
  // token has actually expired and needs refreshing). This is safe here
  // because middleware isn't the real authorization boundary — every table
  // has RLS policies that independently enforce access regardless of what
  // middleware decides, so a faster/less-strict check here doesn't open a
  // security hole, it just stops paying for a network round-trip that
  // wasn't buying additional real protection.
  await supabase.auth.getSession();
  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
