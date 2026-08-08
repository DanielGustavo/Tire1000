import { Link } from "react-router-dom";
import { Button } from "../../../components/Button";
import { TexturedCard } from "../../../components/TexturedCard";
import { ThemeBadges } from "../../../components/ThemeBadges";
import { DEFAULT_THEME_COLOR, type ThemeWithTopic } from "../../../services/theme-service";

export function ThemeListItem({ theme, topic }: ThemeWithTopic) {
  const color = topic?.color ?? DEFAULT_THEME_COLOR;

  return (
    <div className="flex w-full shrink-0 flex-col items-start gap-2">
      <ThemeBadges theme={theme} topic={topic} />

      <TexturedCard color={color} className="w-full h-[295px]" contentClassName="justify-between p-2.5">
        <p className="line-clamp-4 text-subtitle font-bold capitalize text-neutral-900">{theme.title}</p>
        <Link to={`/themes/${theme.id}`} className="self-end">
          <Button variant="dark">Ver tema</Button>
        </Link>
      </TexturedCard>
    </div>
  );
}
