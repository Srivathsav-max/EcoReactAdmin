// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { serverStorage, bucketId, Permission, Role, ID, getFilePreviewUrl, getMaskedImageUrl } from '@/lib/appwrite-config';

export async function POST(req: Request) {
  try {
    // Parse incoming form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Create a unique file ID
    const fileId = ID.unique();

    // Upload file with public read permissions
    await serverStorage.createFile(
      bucketId,
      fileId,
      file,
      [Permission.read(Role.any())] // This ensures the file can be viewed by anyone
    );

    // Return masked URL instead of direct Appwrite URL
    const maskedUrl = getMaskedImageUrl(fileId);

    return NextResponse.json({
      success: true,
      url: maskedUrl,
      fileId: fileId, // Add fileId to response
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}