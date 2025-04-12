import { useState, useEffect } from "react";
import { Redirect, Route } from "wouter";
import { useTokenAuth } from "@/hooks/use-token-auth";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface ProtectedAdminRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedAdminRoute({ 
  path, 
  component: Component 
}: ProtectedAdminRouteProps) {
  const { isVerified, token } = useTokenAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!isVerified || !token) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/admin/config", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Erro ao verificar status de admin:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [isVerified, token]);

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Verificando permissões de administrador...</span>
        </div>
      ) : isAdmin ? (
        <Component />
      ) : (
        <Redirect to="/" />
      )}
    </Route>
  );
}