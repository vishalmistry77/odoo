import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  url.pathname = '/';
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};
