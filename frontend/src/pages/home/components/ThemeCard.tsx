import { Link } from "react-router-dom";
import { Bullet } from "../../../components/Bullet";
import { Button } from "../../../components/Button";
import { TexturedCard } from "../../../components/TexturedCard";
import { DEFAULT_THEME_COLOR, type ThemeWithTopic } from "../../../services/theme-service";

export function ThemeCard({ theme, topic }: ThemeWithTopic) {
  return (
    <div className="flex w-[min(320px,calc(100%-32px))] shrink-0 flex-col items-start gap-2">
      <Bullet size="auto" color={topic?.color ?? DEFAULT_THEME_COLOR}>{theme.enemYear ? `ENEM ${theme.enemYear}` : `Tire 1000`}</Bullet>

      <TexturedCard color={topic?.color ?? DEFAULT_THEME_COLOR} className="w-full h-[295px]" contentClassName="justify-between p-2.5">
        <p className="line-clamp-4 text-subtitle font-bold capitalize text-neutral-900">{theme.title}</p>
        <Link to={`/themes/${theme.id}`} className="self-end">
          <Button variant="dark">Ver tema</Button>
        </Link>
      </TexturedCard>
    </div>
  );
}
