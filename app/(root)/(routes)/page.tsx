import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

export default async function SetupPage() {
  const store = await prismadb.store.findFirst();

  if (store) {
    redirect(`/${store.id}`);
  }

  return redirect('/sign-in');
}
