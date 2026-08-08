import { Bullet } from "../../../components/Bullet";

const STEPS = [
  "Escolha um tema para escrever sobre",
  "Escreva sua redação nota 1000",
  "Envie-nos sua redação, ela será corrigida em minutos!",
  "Prepare um lanche enquanto aguarda nossa correção",
];

export function Steps() {
  return (
    <section className="mt-6 flex w-full flex-col items-center px-4 py-0.5">
      <div className="flex w-full flex-col items-center gap-8 border-2 border-solid border-neutral-900 bg-alert-100 px-6 py-4 shadow-hard">
        <h2 className="w-full text-center text-title font-extrabold uppercase text-neutral-900">
          Correção em
          <br />
          poucas etapas
        </h2>
        <ol className="flex w-full flex-col gap-4">
          {STEPS.map((description, index) => (
            <li key={description} className="flex w-full items-center gap-4">
              <Bullet variant="dark" rotate={index % 2 === 0 ? "left" : "right"}>
                {index + 1}
              </Bullet>
              <p className="min-w-0 flex-1 text-default font-bold text-neutral-900">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
