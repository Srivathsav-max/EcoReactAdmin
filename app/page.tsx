import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect('/signin');
  }

  if (!isAdmin(session)) {
    redirect('/signin');
  }

  const store = await prismadb.store.findFirst({
    where: {
      userId: session.userId
    }
  });

  if (!store) {
    redirect('/new');
    return null;
  }

  redirect(`/${store.id}`);
  return null;
}