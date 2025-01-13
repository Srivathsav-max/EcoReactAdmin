import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get the current origin from the request
  const origin = req.headers.get('origin') || 'http://localhost:3000';
  
  const response = NextResponse.redirect(new URL('/sign-in', origin));
  
  // Clear the auth token
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
