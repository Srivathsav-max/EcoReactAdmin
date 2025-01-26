import { redirect } from 'next/navigation';
import { getAdminSession, isAdmin } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export default async function NewStorePage() {
  const session = await getAdminSession();

  if (!session || !isAdmin(session)) {
    redirect('/signin');
  }

  // Check if user already has a store
  const store = await prismadb.store.findFirst({
    where: {
      userId: session.userId
    }
  });

  // If they have a store, redirect to it
  if (store) {
    redirect(`/${store.id}`);
  }

  return (
    <div>
      <h1>Create a new store</h1>
    </div>
  );
}