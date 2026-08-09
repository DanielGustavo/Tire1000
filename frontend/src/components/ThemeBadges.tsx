import { Bullet } from "./Bullet";
import { DEFAULT_THEME_COLOR } from "../services/themeService";
import type { ThemeWithTopic } from "../types/theme";

export function ThemeBadges({ theme, topic }: ThemeWithTopic) {
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
