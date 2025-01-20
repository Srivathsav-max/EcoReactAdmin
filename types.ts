import { Store } from "@prisma/client";

export interface StoreWithSettings extends Store {
  currency: string | null;
  locale: string | null;
}

// ...existing types...
