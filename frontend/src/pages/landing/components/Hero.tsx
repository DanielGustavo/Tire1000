import { Button } from "../../../components/Button";
import logo from "../../../assets/landing/logo.png";
import heroGridTexture from "../../../assets/landing/hero-grid-texture.png";

export function Hero({ onSignUp }: { onSignUp: () => void }) {
  return (
    <section className="relative flex w-full flex-col items-center gap-8 overflow-clip p-4">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-[length:200px_200px] bg-top-left opacity-10"
          style={{ backgroundImage: `url(${heroGridTexture})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-0/0 to-neutral-0" />
      </div>
      <img src={logo} alt="Tire 1000" className="relative h-[213px] w-[238px] object-contain" />
      <div className="relative flex w-full flex-col items-center gap-2 p-2 text-center">
        <h1 className="w-full text-hero font-extrabold uppercase text-neutral-900">
          Tire 1000 no
          <br />
          enem!
        </h1>
        <p className="w-full text-default text-neutral-600">
          Utilizamos agentes IA para corrigir suas redações em um instante.
        </p>
      </div>
      <Button variant="primary" className="relative" onClick={onSignUp}>
        Quero ter uma redação nota 1000
      </Button>
    </section>
  );
}
