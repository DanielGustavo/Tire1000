import { Route, Routes } from "react-router-dom";
import { CreditsPage } from "./pages/credits";
import { HomePage } from "./pages/home";
import { LoginPage } from "./pages/login";
import { SignupPage } from "./pages/signup";
import { ThemesPage } from "./pages/themes";
import { ThemeDetailPage } from "./pages/theme-detail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/themes" element={<ThemesPage />} />
      <Route path="/themes/:themeId" element={<ThemeDetailPage />} />
      <Route path="/credits" element={<CreditsPage />} />
    </Routes>
  );
}

export default App;
