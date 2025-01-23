import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from "@/lib/auth";
import Navbar from "./navbar";

const NavbarWrapper = async () => {
  const session = await getAdminSession();

  if (!session) {
    redirect('/signin');
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId: session.userId,
    },
  });

  return <Navbar stores={stores} />;
};

export default NavbarWrapper;
