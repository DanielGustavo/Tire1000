import { useState } from "react";
import { Link } from "react-router-dom";
import { NotepadText } from "lucide-react";
import { IconButton } from "../../../components/IconButton";
import { PriceModal } from "../../../components/PriceModal";
import logo from "../../../assets/landing/logo.png";
import { UserMenu } from "./UserMenu";

export function Header({ credits }: { credits: number | undefined }) {
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-20">
      <div className="flex items-center justify-between p-4 lg:mx-auto lg:h-[72px] lg:max-w-[1280px] lg:px-10 lg:py-4">
        <Link to="/">
          <img src={logo} alt="Tire 1000" className="h-10 w-[45px] object-contain" />
        </Link>
        <div className="flex items-center gap-4">
          {/* Credits/PriceModal entry point, visible at all breakpoints. */}
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
      </div>
      {priceModalOpen && <PriceModal onClose={() => setPriceModalOpen(false)} />}
    </header>
  );
}
