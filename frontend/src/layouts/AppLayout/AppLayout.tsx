import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

export function AppLayout({ children }: { children?: ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-6 bg-neutral-0">
      <Header credits={user?.credits} />
      <div className="flex w-full flex-1 gap-6 flex-col items-center">{children ?? <Outlet />}</div>
      <Footer />
    </div>
  );
}
