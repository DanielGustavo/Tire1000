import { Bullet } from "./Bullet";
import { DEFAULT_THEME_COLOR } from "../services/themeService";

interface ThemeBadgesProps {
  theme: { enemYear: number | null };
  topic: { title: string; color: string } | null;
}

export function ThemeBadges({ theme, topic }: ThemeBadgesProps) {
  const color = topic?.color ?? DEFAULT_THEME_COLOR;

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <Bullet size="auto" color={color}>
        {theme.enemYear ? `ENEM ${theme.enemYear}` : "Tire 1000"}
      </Bullet>
      {topic && (
        <Bullet size="auto" color={color}>
          {topic.title}
        </Bullet>
      )}
    </div>
  );
}
