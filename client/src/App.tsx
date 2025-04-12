import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import Settings from "@/pages/settings";
import { TokenAuthModal } from "@/components/token-auth-modal";
import { useTokenAuth } from "@/hooks/use-token-auth";
import { Loader2 } from "lucide-react";

// Importar o componente ProtectedAdminRoute
import { ProtectedAdminRoute } from "@/components/protected-admin-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <ProtectedAdminRoute path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isVerified, isLoading } = useTokenAuth();
  const [showTokenModal, setShowTokenModal] = useState(false);

  useEffect(() => {
    // Mostrar o modal de token se não estiver carregando e não estiver verificado
    if (!isLoading && !isVerified) {
      setShowTokenModal(true);
    }
  }, [isLoading, isVerified]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="ml-2 text-lg">Verificando acesso...</span>
      </div>
    );
  }

  return (
    <>
      {isVerified ? (
        <Router />
      ) : (
        <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
          <p className="mb-6 text-slate-600">
            É necessário um token válido para acessar esta aplicação.
          </p>
          <button
            onClick={() => setShowTokenModal(true)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Entrar com Token
          </button>
        </div>
      )}

      <TokenAuthModal 
        isOpen={showTokenModal} 
        onClose={() => setShowTokenModal(false)} 
      />
    </>
  );
}

export default App;
