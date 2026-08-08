import { Navigate, Route, Routes } from "react-router-dom";
import { getAccessToken } from "./libs/auth";
import { AppLayout } from "./layouts/AppLayout";
import { CreditsPage } from "./pages/credits";
import { EssayResultPage } from "./pages/essay-result";
import { EssayUploadPage } from "./pages/essay-upload";
import { HomePage } from "./pages/home/home";
import { LandingPage } from "./pages/landing/landing";
import { ThemesPage } from "./pages/themes/themes";
import { ThemeDetailPage } from "./pages/theme-detail";

function RootRoute() {
  return getAccessToken() ? (
    <AppLayout>
      <HomePage />
    </AppLayout>
  ) : (
    <LandingPage />
  );
}

function PublicOnlyRoute({ authModal }: { authModal: "signin" | "signup" }) {
  return getAccessToken() ? <Navigate to="/" replace /> : <LandingPage authModal={authModal} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/signup" element={<PublicOnlyRoute authModal="signup" />} />
      <Route path="/login" element={<PublicOnlyRoute authModal="signin" />} />
      <Route element={<AppLayout />}>
        <Route path="/themes" element={<ThemesPage />} />
        <Route path="/themes/:themeId" element={<ThemeDetailPage />} />
        <Route path="/essays/new" element={<EssayUploadPage />} />
        <Route path="/essays/:essayId" element={<EssayResultPage />} />
        <Route path="/credits" element={<CreditsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
