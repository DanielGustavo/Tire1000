import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { clearTokens } from "../../../libs/auth";
import { useAuth } from "../../../contexts/AuthContext";
import { useOnClickOutside } from "../../../hooks/app/useOnClickOutside";
import { Button } from "../../../components/Button";
import { IconButton } from "../../../components/IconButton";

export function UserMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const { user, refetch } = useAuth();

  useOnClickOutside(rootRef, () => onOpenChange(false), open);

  function handleSignOut() {
    clearTokens();
    void refetch();
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
              Olá, <span className="font-bold">{user?.name ?? "..."}!</span>
            </p>
            <p className="text-small text-neutral-700">{user?.email}</p>
          </div>
          <Button type="button" variant="neutral" className="w-full" onClick={handleSignOut}>
            Sair
          </Button>
        </div>
      )}
    </div>
  );
}
