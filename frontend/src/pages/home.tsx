import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold text-gray-900">Tire 1000</h1>
      <Link to="/themes" className="text-sm font-medium text-gray-900 underline">
        Temas
      </Link>
      <Link to="/essays/new" className="text-sm font-medium text-gray-900 underline">
        Enviar redação
      </Link>
      <Link to="/essays" className="text-sm font-medium text-gray-900 underline">
        Minhas redações
      </Link>
      <Link to="/credits" className="text-sm font-medium text-gray-900 underline">
        Meus créditos
      </Link>
    </main>
  );
}
