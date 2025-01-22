import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { StoreModal } from "@/components/modals/store-modal";
import NewStoreClient from "./components/new-store-client";

export default async function NewStorePage() {
  const session = await getSession();

  if (!session) {
    redirect('/signin');
  }

  if (!isAdmin(session)) {
    redirect('/signin');
  }

  // Check if user already has a store
  const store = await prismadb.store.findFirst({
    where: {
      userId: session.userId
    }
  });

  if (store) {
    redirect(`/${store.id}`);
  }

  return <NewStoreClient />;
}