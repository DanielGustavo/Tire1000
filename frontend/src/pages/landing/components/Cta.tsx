import { Button } from "../../../components/Button";

export function Cta({ onSignUp }: { onSignUp: () => void }) {
  return (
    <section className="mt-6 flex w-full flex-col items-center px-4 py-0.5">
      <div className="flex w-full flex-col items-center gap-6 border-2 border-solid border-neutral-900 bg-pink-300 px-6 py-4 shadow-hard lg:max-w-[372px]">
        <h2 className="w-full text-center text-title font-extrabold uppercase text-neutral-900">
          Quer uma
          <br />
          Redação
          <br />
          Nota 1000?
        </h2>
        <p className="w-full text-center text-default text-neutral-900">
          Corrija sua redação com a gente! Apontamos detalhadamente o que falta para sua redação ter a nota máxima no
          ENEM.
        </p>
        <Button variant="secondary" onClick={onSignUp}>
          Quero uma redação nota 1000!
        </Button>
      </div>
    </section>
  );
}
