// lib/appwrite-server-config.ts

import { Client, Storage, Permission, Role, ID } from 'node-appwrite';

const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const appwriteAPIKey = process.env.APPWRITE_API_KEY!;
const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

// Create server-side client
const serverClient = new Client()
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId)
  .setKey(appwriteAPIKey);

const serverStorage = new Storage(serverClient);

// Update the getFilePreviewUrl function
const getFilePreviewUrl = (fileId: string) => {
  return `${appwriteEndpoint}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${appwriteProjectId}`;
};

// Add this new function to extract fileId from URL
const getFileIdFromUrl = (url: string) => {
  const matches = url.match(/\/files\/([^\/]+)\/(?:preview|view)/);
  return matches ? matches[1] : null;
};

// Add this function to generate masked URLs
const getMaskedImageUrl = (fileId: string) => {
  return `/api/image-proxy/${fileId}`;
};

export { 
  serverStorage, 
  bucketId, 
  Permission, 
  Role, 
  ID,
  appwriteEndpoint,
  getFilePreviewUrl,  // Add this export
  getFileIdFromUrl,
  getMaskedImageUrl
};