import { Link } from "react-router-dom";
import { Button } from "../../../components/Button";
import { TexturedCard } from "../../../components/TexturedCard";
import { ThemeBadges } from "../../../components/ThemeBadges";
import { DEFAULT_THEME_COLOR } from "../../../services/themeService";
import type { ThemeWithTopic } from "../../../types/theme";

export function ThemeListItem({ theme, topic }: ThemeWithTopic) {
  const color = topic?.color ?? DEFAULT_THEME_COLOR;

  return (
    <div className="flex w-full shrink-0 flex-col items-start gap-2 mt-auto">
      <ThemeBadges theme={theme} topic={topic} />

      <TexturedCard color={color} className="w-full h-[295px]" contentClassName="justify-between p-2.5" interactive>
        <Link to={`/themes/${theme.id}`} aria-label={`Ver tema: ${theme.title}`} className="absolute inset-0 z-10" />
        <p className="line-clamp-4 text-subtitle font-bold capitalize text-neutral-900">{theme.title}</p>
        <Button variant="dark" className="self-end" tabIndex={-1} aria-hidden>
          Ver tema
        </Button>
      </TexturedCard>
    </div>
  );
}
