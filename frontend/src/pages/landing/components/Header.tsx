import { Menu } from "lucide-react";
import { Button } from "../../../components/Button";
import logo from "../../../assets/landing/logo.png";

export function Header({ onSignIn, onSignUp }: { onSignIn: () => void; onSignUp: () => void }) {
  return (
    <header className="flex w-full items-center justify-between px-4 py-2 lg:h-[72px] lg:px-10 lg:py-4">
      <button
        type="button"
        aria-label="Menu"
        className="flex size-10 items-center justify-center text-neutral-900 lg:hidden"
      >
        <Menu size={24} />
      </button>
      <img src={logo} alt="Tire 1000" className="hidden h-10 w-[45px] object-contain lg:block" />
      <div className="flex items-center gap-2">
        <Button variant="neutral" size="small" onClick={onSignIn}>
          Entrar
        </Button>
        <Button variant="primary" size="small" onClick={onSignUp} className="hidden lg:inline-flex">
          Criar uma conta
        </Button>
      </div>
    </header>
  );
}
