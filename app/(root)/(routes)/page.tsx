import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function SetupPage() {
  try {
    const store = await prismadb.store.findFirst();
    
    if (store) {
      return redirect(`/${store.id}`);
    }

    return redirect('/sign-in');
  } catch (error) {
    console.error('[SETUP_PAGE_ERROR]', error);
    return redirect('/sign-in');
  }
}
