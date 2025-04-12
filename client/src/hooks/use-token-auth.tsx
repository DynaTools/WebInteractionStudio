import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type TokenContextType = {
  token: string | null;
  isVerified: boolean;
  isLoading: boolean;
  setToken: (token: string) => void;
  verifyToken: () => Promise<boolean>;
  clearToken: () => void;
};

export const TOKEN_KEY = "app_access_token";

export const TokenContext = createContext<TokenContextType | null>(null);

export function TokenProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [token, setTokenState] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Tenta recuperar o token do localStorage na inicialização
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setTokenState(storedToken);
      verifyTokenInternal(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const setToken = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setTokenState(newToken);
    verifyTokenInternal(newToken);
  };

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
    setIsVerified(false);
  };

  const verifyTokenInternal = async (tokenToVerify: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: tokenToVerify }),
      });

      const data = await response.json();
      
      setIsVerified(data.isValid);
      setIsLoading(false);
      
      if (!data.isValid) {
        toast({
          title: "Token inválido",
          description: data.error || "O token fornecido não é válido",
          variant: "destructive",
        });
        clearToken();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      toast({
        title: "Erro de verificação",
        description: "Não foi possível verificar o token",
        variant: "destructive",
      });
      setIsVerified(false);
      setIsLoading(false);
      return false;
    }
  };

  const verifyToken = async () => {
    if (!token) return false;
    return verifyTokenInternal(token);
  };

  return (
    <TokenContext.Provider
      value={{
        token,
        isVerified,
        isLoading,
        setToken,
        verifyToken,
        clearToken,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}

export function useTokenAuth() {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokenAuth deve ser usado dentro de um TokenProvider");
  }
  return context;
}