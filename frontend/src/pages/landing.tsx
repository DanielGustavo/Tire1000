import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "../components/Button";
import { Bullet } from "../components/Bullet";
import logo from "../assets/landing/logo.png";
import heroGridTexture from "../assets/landing/hero-grid-texture.png";
import correctionIllustration from "../assets/landing/correction-illustration.png";
import { SignInModal, SignUpModal } from "./landing-auth-modals";

const STEPS = [
  "Escolha um tema para escrever sobre",
  "Escreva sua redação nota 1000",
  "Envie-nos sua redação, ela será corrigida em minutos!",
  "Prepare um lanche enquanto aguarda nossa correção",
];

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

type AuthModalKind = "signin" | "signup";

type LandingPageProps = {
  authModal?: AuthModalKind;
};

export function LandingPage({ authModal }: LandingPageProps) {
  return (
    <div className="flex w-full flex-col items-center bg-neutral-0">
      <Header />
      <Hero />
      <Steps />
      <Illustration />
      <Cta />
      <Footer />
      {authModal === "signin" && <SignInModal />}
      {authModal === "signup" && <SignUpModal />}
    </div>
  );
}

function Header() {
  return (
    <header className="flex w-full items-center justify-between px-4 py-2">
      <button type="button" aria-label="Menu" className="flex size-10 items-center justify-center text-neutral-900">
        <Menu size={24} />
      </button>
      <Link to="/login">
        <Button variant="neutral" size="small">
          Entrar
        </Button>
      </Link>
    </header>
  );
}

function Hero() {
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
      <Link to="/signup" className="relative">
        <Button variant="primary">Quero ter uma redação nota 1000</Button>
      </Link>
    </section>
  );
}

function Steps() {
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
              <div className={index % 2 === 0 ? "-rotate-5" : "rotate-5"}>
                <Bullet variant="dark">{index + 1}</Bullet>
              </div>
              <p className="min-w-0 flex-1 text-default font-bold text-neutral-900">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Illustration() {
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
        {COMPETENCIES.map(({ code, variant, title, description }, index) => (
          <div key={code} className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full items-center gap-4">
              <div className={index === 0 ? undefined : "-rotate-5"}>
                <Bullet variant={variant}>{code}</Bullet>
              </div>
              <p className="min-w-0 flex-1 text-subtitle font-bold capitalize text-neutral-900">{title}</p>
            </div>
            <p className="w-full text-default lowercase text-neutral-900">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="mt-6 flex w-full flex-col items-center px-4 py-0.5">
      <div className="flex w-full flex-col items-center gap-6 border-2 border-solid border-neutral-900 bg-pink-300 px-6 py-4 shadow-hard">
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
        <Link to="/signup">
          <Button variant="secondary">Quero uma redação nota 1000!</Button>
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-6 flex h-[100px] w-full items-center justify-center gap-4 bg-neutral-900 p-2">
      <p className="text-small text-neutral-0">Todos os direitos reservados à</p>
      <img src={logo} alt="Tire 1000" className="h-[35px] w-[39px] object-contain" />
    </footer>
  );
}

