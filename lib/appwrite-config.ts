import { Client, Account, Storage, ID, Permission, Role } from 'appwrite';

// Environment variable validation
if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  throw new Error('Missing APPWRITE_PROJECT_ID');
}

if (!process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID) {
  throw new Error('Missing APPWRITE_BUCKET_ID');
}

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const storage = new Storage(client);
export const serverStorage = storage;
export const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
export { ID, Permission, Role };

// Image URL masking helper
export const getMaskedImageUrl = (fileId: string) => {
  return `/api/image-proxy/${fileId}`;
};

// File preview helpers
export const getFilePreview = (fileId: string) => {
  return storage.getFilePreview(bucketId, fileId);
};

export const getFilePreviewUrl = (fileId: string) => {
  return storage.getFilePreview(bucketId, fileId).toString();
};

// File management helpers
export const uploadFile = async (file: File) => {
  try {
    const result = await storage.createFile(bucketId, ID.unique(), file);
    return result.$id;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    await storage.deleteFile(bucketId, fileId);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};