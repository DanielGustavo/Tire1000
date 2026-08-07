import { Navigate, Route, Routes } from "react-router-dom";
import { getAccessToken } from "./libs/auth";
import { CreditsPage } from "./pages/credits";
import { EssayHistoryPage } from "./pages/essay-history";
import { EssayResultPage } from "./pages/essay-result";
import { EssayUploadPage } from "./pages/essay-upload";
import { HomePage } from "./pages/home";
import { LandingPage } from "./pages/landing";
import { ThemesPage } from "./pages/themes";
import { ThemeDetailPage } from "./pages/theme-detail";

function RootRoute() {
  return getAccessToken() ? <HomePage /> : <LandingPage />;
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
      <Route path="/themes" element={<ThemesPage />} />
      <Route path="/themes/:themeId" element={<ThemeDetailPage />} />
      <Route path="/essays" element={<EssayHistoryPage />} />
      <Route path="/essays/new" element={<EssayUploadPage />} />
      <Route path="/essays/:essayId" element={<EssayResultPage />} />
      <Route path="/credits" element={<CreditsPage />} />
    </Routes>
  );
}

export default App;
