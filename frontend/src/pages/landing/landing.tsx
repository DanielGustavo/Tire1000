import { useState } from "react";
import { Cta } from "./components/Cta";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Illustration } from "./components/Illustration";
import { SignInModal } from "./components/SignInModal";
import { SignUpModal } from "./components/SignUpModal";
import { Steps } from "./components/Steps";

type AuthModalKind = "signin" | "signup";

export function LandingPage() {
  const [authModal, setAuthModal] = useState<AuthModalKind | null>(null);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-neutral-0 lg:mx-auto lg:max-w-[1280px]">
      <Header onSignIn={() => setAuthModal("signin")} onSignUp={() => setAuthModal("signup")} />
      <div className="flex w-full flex-1 flex-col items-center">
        <Hero onSignUp={() => setAuthModal("signup")} />
        <Steps />
        <Illustration />
        <Cta onSignUp={() => setAuthModal("signup")} />
      </div>
      <Footer />
      {authModal === "signin" && (
        <SignInModal onClose={() => setAuthModal(null)} onSwitchToSignUp={() => setAuthModal("signup")} />
      )}
      {authModal === "signup" && (
        <SignUpModal onClose={() => setAuthModal(null)} onSwitchToSignIn={() => setAuthModal("signin")} />
      )}
    </div>
  );
}
