import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTokenAuth } from "@/hooks/use-token-auth";

interface TokenAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TokenAuthModal({ isOpen, onClose }: TokenAuthModalProps) {
  const { setToken } = useTokenAuth();
  const [tokenInput, setTokenInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsLoading(true);
    try {
      // Validar o token
      setToken(tokenInput.trim());
      onClose();
    } catch (error) {
      console.error("Erro ao configurar token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Digite seu token de acesso</DialogTitle>
          <DialogDescription>
            É necessário um token de acesso válido para utilizar a aplicação.
            Se você não possui um token, entre em contato com o administrador.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="token">Token de acesso</Label>
              <Input
                id="token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Cole seu token aqui"
                className="w-full"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading || !tokenInput.trim()}>
              {isLoading ? "Verificando..." : "Continuar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}