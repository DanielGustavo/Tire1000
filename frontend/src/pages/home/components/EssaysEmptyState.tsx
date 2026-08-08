import { Link } from "react-router-dom";
import { LibraryBig } from "lucide-react";
import { Button } from "../../../components/Button";

export function EssaysEmptyState() {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <LibraryBig size={64} className="text-neutral-200" />
        <p className="w-full text-center text-default text-neutral-200">Você ainda não enviou nenhuma redação</p>
      </div>
      <Link to="/themes">
        <Button variant="primary">Escolher um tema</Button>
      </Link>
    </div>
  );
}
