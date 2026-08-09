import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Loading } from "./components/Loading";
import { Toaster } from "./components/Toaster";
import { AppLayout } from "./layouts/AppLayout/AppLayout";
import { EssayResultPage } from "./pages/essay-result/essay-result";
import { HomePage } from "./pages/home/home";
import { LandingPage } from "./pages/landing/landing";
import { ThemesPage } from "./pages/themes/themes";
import { ThemeDetailPage } from "./pages/themes/theme-detail";

function RootRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen text="Carregando..." />;
  }

  return isAuthenticated ? (
    <AppLayout>
      <HomePage />
    </AppLayout>
  ) : (
    <LandingPage />
  );
}

function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen text="Carregando..." />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/themes" element={<ThemesPage />} />
            <Route path="/themes/:themeId" element={<ThemeDetailPage />} />
            <Route path="/essays/:essayId" element={<EssayResultPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
