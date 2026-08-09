import { Route, Routes } from "react-router-dom";
import { getAccessToken } from "./libs/auth";
import { AppLayout } from "./layouts/AppLayout";
import { CreditsPage } from "./pages/credits";
import { EssayResultPage } from "./pages/essay-result/essay-result";
import { HomePage } from "./pages/home/home";
import { LandingPage } from "./pages/landing/landing";
import { ThemesPage } from "./pages/themes/themes";
import { ThemeDetailPage } from "./pages/themes/theme-detail";

function RootRoute() {
  return getAccessToken() ? (
    <AppLayout>
      <HomePage />
    </AppLayout>
  ) : (
    <LandingPage />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route element={<AppLayout />}>
        <Route path="/themes" element={<ThemesPage />} />
        <Route path="/themes/:themeId" element={<ThemeDetailPage />} />
        <Route path="/essays/:essayId" element={<EssayResultPage />} />
        <Route path="/credits" element={<CreditsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
