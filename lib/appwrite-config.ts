// lib/appwrite-server-config.ts

import { Client, Storage, Permission, Role, ID } from 'node-appwrite';

// Replace these with your real values
const appwriteEndpoint = 'https://cloud.appwrite.io/v1';
const appwriteProjectId = '6784703b0004f006b43f';
const appwriteAPIKey = 'standard_712ce1f72b6bb727fc58d1da217c269f2c910328778d30813700a66e759501f02c6edd7da87e6ad986b97886d4cda6cee15756cf50407adb1eafe16262297ff49a786e5448242c96d8b8ce0ee2b8476ba26ab8366daff49b40b7a71a9319c1624e653a7bfcdd6634e6df4291c246295b86f466a4b34eeefe936c8d17032f3e25';
const bucketId = '678491cc0018813ad930';

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