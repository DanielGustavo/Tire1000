import { useEffect, useRef, useState, type ReactNode } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { NotepadText, User } from "lucide-react";
import { clearTokens } from "../libs/auth";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { PriceModal } from "../components/PriceModal";
import { userService } from "../services/user-service";
import logo from "../assets/landing/logo.png";

function Header({ credits }: { credits: number | undefined }) {
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="flex w-full items-center justify-between bg-neutral-20 p-4">
      <img src={logo} alt="Tire 1000" className="h-10 w-[45px] object-contain" />
      <div className="flex items-center gap-4">
        <IconButton
          variant="gray"
          rotate="left"
          aria-label="Comprar créditos"
          onClick={() => setPriceModalOpen(true)}
          icon={
            <span className="flex items-center gap-0.5 text-default font-bold text-neutral-0">
              {credits ?? "…"}
              <NotepadText size={20} />
            </span>
          }
        />
        <UserMenu open={userMenuOpen} onOpenChange={setUserMenuOpen} />
      </div>
      {priceModalOpen && <PriceModal onClose={() => setPriceModalOpen(false)} />}
    </header>
  );
}

function UserMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const userQuery = useQuery({ queryKey: ["currentUser"], queryFn: () => userService.getCurrentUser() });

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) onOpenChange(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  function handleSignOut() {
    clearTokens();
    navigate("/");
  }

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        variant="gray"
        rotate="left"
        aria-label="Menu do usuário"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        icon={<User size={24} className="text-neutral-0" />}
      />
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-3 flex w-[240px] flex-col items-start gap-6 border-2 border-solid border-neutral-900 bg-neutral-0 p-4 shadow-hard"
        >
          <div className="flex flex-col items-start">
            <p className="text-default text-neutral-900">
              Olá, <span className="font-bold">{userQuery.data?.name ?? "..."}</span>!
            </p>
            <p className="text-small text-neutral-700">{userQuery.data?.email}</p>
          </div>
          <Button type="button" variant="neutral" className="w-full" onClick={handleSignOut}>
            Sair
          </Button>
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="flex h-[100px] w-full items-center justify-center gap-4 bg-neutral-900 p-2">
      <p className="text-small text-neutral-0">Todos os direitos reservados à</p>
      <img src={logo} alt="Tire 1000" className="h-[35px] w-[39px] object-contain" />
    </footer>
  );
}

export function AppLayout({ children }: { children?: ReactNode }) {
  const userQuery = useQuery({ queryKey: ["currentUser"], queryFn: () => userService.getCurrentUser() });

  return (
    <div className="flex w-full flex-col items-center gap-6 bg-neutral-0">
      <Header credits={userQuery.data?.credits} />
      {children ?? <Outlet />}
      <Footer />
    </div>
  );
}
