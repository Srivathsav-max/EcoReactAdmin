import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = cookies();
  
  // Clear all auth-related cookies
  cookieStore.delete('token');
  // Add any other cookies that need to be cleared
  
  return NextResponse.json({ success: true }, { status: 200 });
}
