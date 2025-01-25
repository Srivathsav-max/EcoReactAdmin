export interface ExtendedStore {
  id: string;
  name: string;
  userId: string;
  currency?: string | null;
  locale?: string | null;
  domain?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  customCss?: string | null;
  themeSettings?: any | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}