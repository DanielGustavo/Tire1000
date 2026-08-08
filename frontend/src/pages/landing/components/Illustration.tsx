import { Bullet } from "../../../components/Bullet";
import correctionIllustration from "../../../assets/landing/correction-illustration.png";

const COMPETENCIES = [
  {
    code: "C1",
    variant: "default",
    title: "Norma-Padrão",
    description:
      "Empregar gramática, ortografia e pontuação corretas reforça a formalidade e credibilidade do texto dissertativo-argumentativo.",
  },
  {
    code: "C2",
    variant: "alert",
    title: "Compreensão do Tema",
    description:
      "É crucial manter o foco no tema central para garantir clareza e evitar dispersões que comprometam o argumento principal.",
  },
  {
    code: "C3",
    variant: "error",
    title: "Defesa do Ponto de Vista",
    description: "Argumentar com base em fatos e opiniões sólidas fortalece a tese e facilita a persuasão do leitor.",
  },
  {
    code: "C4",
    variant: "info",
    title: "Coesão e Coerência",
    description:
      "O uso adequado de conectivos promove a fluidez textual, evitando repetições e garantindo a ligação lógica entre as ideias.",
  },
  {
    code: "C5",
    variant: "pink",
    title: "Proposta de Intervenção",
    description:
      "A proposta deve conter agentes, ações, meios e efeitos claros, assegurando respeito aos direitos humanos e viabilidade prática.",
  },
] as const;

export function Illustration() {
  return (
    <section className="mt-6 flex w-full flex-col items-center gap-8 px-8 py-4">
      <h2 className="w-full text-hero font-extrabold uppercase text-neutral-900">
        Avaliamos
        <br />
        cada
        <br />
        Competência
      </h2>
      <img
        src={correctionIllustration}
        alt="Cada trecho da redação recebe um comentário por competência"
        className="h-auto w-full max-w-[338px] object-contain"
      />
      <div className="flex w-full flex-col gap-6">
        {COMPETENCIES.map(({ code, variant, title, description }) => (
          <div key={code} className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full items-center gap-4">
              <Bullet variant={variant} rotate="left">
                {code}
              </Bullet>
              <p className="min-w-0 flex-1 text-subtitle font-bold capitalize text-neutral-900">{title}</p>
            </div>
            <p className="w-full text-default lowercase text-neutral-900">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
