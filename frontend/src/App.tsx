import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/Toaster";
import AppRoutes from "./routes";

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
