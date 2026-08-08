import { Link } from "react-router-dom";
import { Bullet } from "../../../components/Bullet";
import { Button } from "../../../components/Button";
import { TexturedCard } from "../../../components/TexturedCard";
import type { ThemeWithTopic } from "../../../services/theme-service";

const DEFAULT_THEME_COLOR = "#EDEDED";

export function ThemeCard({ theme, topic }: ThemeWithTopic) {
  return (
    <div className="flex h-[295px] w-[309px] shrink-0 flex-col items-start gap-2">
      <Bullet size="auto" color={topic?.color ?? DEFAULT_THEME_COLOR}>{theme.enemYear ? `ENEM ${theme.enemYear}` : `Tire 1000`}</Bullet>

      <TexturedCard color={topic?.color ?? DEFAULT_THEME_COLOR} className="flex-1 w-full" contentClassName="justify-between p-2.5">
        <p className="line-clamp-3 text-subtitle font-bold capitalize text-neutral-900">{theme.title}</p>
        <Link to={`/themes/${theme.id}`} className="self-end">
          <Button variant="dark">Ver tema</Button>
        </Link>
      </TexturedCard>
    </div>
  );
}
