import { Link } from "react-router-dom";
import { Bullet } from "../../../components/Bullet";
import { Button } from "../../../components/Button";
import { TexturedCard } from "../../../components/TexturedCard";
import { DEFAULT_THEME_COLOR } from "../../../services/theme-service";
import type { ThemeWithTopic } from "../../../types/theme";

export function ThemeCard({ theme, topic }: ThemeWithTopic) {
  return (
    <div className="flex w-[min(320px,calc(100%-32px))] shrink-0 flex-col items-start gap-2 lg:w-full">
      <Bullet size="auto" color={topic?.color ?? DEFAULT_THEME_COLOR}>{theme.enemYear ? `ENEM ${theme.enemYear}` : `Tire 1000`}</Bullet>

      <TexturedCard color={topic?.color ?? DEFAULT_THEME_COLOR} className="w-full h-[295px]" contentClassName="justify-between p-2.5">
        <Link to={`/themes/${theme.id}`} aria-label={`Ver tema: ${theme.title}`} className="absolute inset-0 z-10" />
        <p className="line-clamp-4 text-subtitle font-bold capitalize text-neutral-900">{theme.title}</p>
        <Button variant="dark" className="self-end" tabIndex={-1} aria-hidden>
          Ver tema
        </Button>
      </TexturedCard>
    </div>
  );
}
