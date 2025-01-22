import { Store } from "@prisma/client";

export interface ExtendedStore extends Store {
  domain?: string | null;
  customCss?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  themeSettings?: any | null;
}