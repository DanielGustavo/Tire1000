import { Cta } from "./components/Cta";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Illustration } from "./components/Illustration";
import { SignInModal } from "./components/SignInModal";
import { SignUpModal } from "./components/SignUpModal";
import { Steps } from "./components/Steps";

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
