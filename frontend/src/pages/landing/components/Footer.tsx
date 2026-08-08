import logo from "../../../assets/landing/logo.png";

export function Footer() {
  return (
    <footer className="mt-6 flex h-[100px] w-full items-center justify-center gap-4 bg-neutral-900 p-2">
      <p className="text-small text-neutral-0">Todos os direitos reservados à</p>
      <img src={logo} alt="Tire 1000" className="h-[35px] w-[39px] object-contain" />
    </footer>
  );
}
