import { NextResponse } from 'next/server';
import { getFilePreviewUrl } from '@/lib/appwrite-config';

export async function GET(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const fileId = params.fileId;
    const appwriteUrl = getFilePreviewUrl(fileId);
    
    // Fetch the image from Appwrite
    const response = await fetch(appwriteUrl);
    const blob = await response.blob();
    
    // Return the image with appropriate headers
    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[IMAGE_PROXY]', error);
    return new NextResponse("Error loading image", { status: 500 });
  }
}
