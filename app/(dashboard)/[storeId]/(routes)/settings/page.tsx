import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
import prismadb from "@/lib/prismadb";
import { verifyAuth } from "@/lib/auth";
import { SettingsForm } from "./components/settings-form";

const SettingsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/sign-in');
  }

  const session = await verifyAuth(token);
  if (!session?.user) {
    redirect('/sign-in');
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId: session.user.id
    }
  });

  if (!store) {
    redirect('/');
  }

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialData={store} />
      </div>
    </div>
  );
}

export default SettingsPage;
