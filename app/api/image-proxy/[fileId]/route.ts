import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getFilePreviewUrl } from '@/lib/appwrite-config';

export async function GET(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const fileId = params.fileId;
    const appwriteUrl = getFilePreviewUrl(fileId);
    
    const response = await fetch(appwriteUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('[IMAGE_PROXY]', error);
    return new NextResponse("Error loading image", { status: 500 });
  }
}
