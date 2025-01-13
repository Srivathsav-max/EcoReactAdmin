import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
import prismadb from "@/lib/prismadb";
import { verifyAuth } from "@/lib/auth";
import Navbar from "./navbar";

const NavbarWrapper = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/sign-in');
  }

  const session = await verifyAuth(token);
  if (!session?.user) {
    redirect('/sign-in');
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId: session.user.id,
    },
  });

  return <Navbar stores={stores} />;
};

export default NavbarWrapper;
