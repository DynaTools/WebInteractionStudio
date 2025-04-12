/**
 * Este arquivo contém funções para inicialização da aplicação
 * como criar um admin e token inicial na primeira execução.
 */

import { Express } from "express";
import { storage } from "./storage";
import { InsertUser, InsertAccessToken } from "../shared/schema";
import { generateRandomToken } from "./auth";
import { log } from "./vite";

export async function initializeApplicationData() {
  try {
    // Verificar se já existe algum usuário administrador
    const users = Array.from((storage as any).users.values());
    
    if (users.length > 0) {
      log("Sistema já possui usuários, ignorando inicialização de dados.", "info");
      return;
    }
    
    log("Inicializando dados do sistema com admin e token padrão...", "info");
    
    // Criar usuário admin
    const adminUser: InsertUser = {
      username: "admin",
      password: "admin123", // Em produção, usar senha hasheada
      isAdmin: true,
    };
    
    const user = await storage.createUser(adminUser);
    
    // Criar token inicial
    const initialToken: InsertAccessToken = {
      token: generateRandomToken(),
      description: "Token inicial para acesso ao sistema",
      isActive: true,
      maxUsage: null, // uso ilimitado
      expiresAt: null, // não expira
      createdBy: user.id,
    };
    
    const token = await storage.createAccessToken(initialToken);
    
    log(`
--------------------------------------------------------
SISTEMA INICIALIZADO COM SUCESSO!

ADMIN CRIADO:
Usuário: admin
Senha: admin123

TOKEN DE ACESSO CRIADO:
${token.token}

IMPORTANTE: Guarde este token, ele será necessário para acessar o sistema!
--------------------------------------------------------`, "info");
    
  } catch (error) {
    log(`Erro ao inicializar dados do sistema: ${(error as Error).message}`, "error");
  }
}