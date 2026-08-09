import { EssaysSection } from "./components/EssaysSection";
import { ThemesSection } from "./components/ThemesSection";

export function HomePage() {
  return (
    // row-reverse keeps DOM order (Temas first, matching mobile's stacked order) while putting
    // "Suas redações" on the left / "Temas" on the right at lg:, matching the Figma desktop frame.
    // Capped here (not in the shared AppLayout, which also renders Header/Footer full-bleed for
    // every other page) so only this page's own two-column row stops stretching on ultra-wide
    // screens — other AppLayout pages get their own cap when their desktop tickets land.
    <div className="flex w-full flex-col gap-6 lg:mx-auto lg:max-w-[1280px] lg:flex-row-reverse lg:items-start lg:gap-0">
      <ThemesSection />
      <EssaysSection />
    </div>
  );
}
