import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "../../../components/Button";

export function Header() {
  return (
    <header className="flex w-full items-center justify-between px-4 py-2">
      <button type="button" aria-label="Menu" className="flex size-10 items-center justify-center text-neutral-900">
        <Menu size={24} />
      </button>
      <Link to="/login">
        <Button variant="neutral" size="small">
          Entrar
        </Button>
      </Link>
    </header>
  );
}
