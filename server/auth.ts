import { Express, Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { storage } from './storage';
import { InsertAccessToken, InsertUser } from '../shared/schema';
import { log } from './vite';

/**
 * Middleware para verificar se o token de acesso é válido
 */
export function requireToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // Verificar o token
  (async () => {
    try {
      const accessToken = await storage.getAccessToken(token);

      if (!accessToken) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      if (!accessToken.isActive) {
        return res.status(401).json({ error: 'Token desativado' });
      }

      if (accessToken.expiresAt && new Date() > accessToken.expiresAt) {
        return res.status(401).json({ error: 'Token expirado' });
      }

      if (accessToken.maxUsage !== null && accessToken.usageCount >= accessToken.maxUsage) {
        return res.status(401).json({ error: 'Limite de uso do token excedido' });
      }

      // Incrementar a contagem de uso
      await storage.updateAccessTokenUsage(accessToken.id);
      
      // Verificar se o token foi criado por um admin
      let isAdmin = false;
      
      // Estratégia 1: verificar se o usuário que criou o token é admin
      try {
        const createdBy = accessToken.createdBy;
        log(`Token criado pelo usuário ID: ${createdBy}`, 'info');
        
        const user = await storage.getUser(createdBy);
        
        if (user) {
          log(`Dados do usuário: ${JSON.stringify(user)}`, 'info');
          if (user.isAdmin) {
            isAdmin = true;
            log(`Usuário é administrador pela verificação normal`, 'info');
          }
        } else {
          log(`Usuário com ID ${createdBy} não encontrado.`, 'info');
        }
      } catch (error: any) {
        log(`Erro ao verificar permissões do usuário: ${error.message}`, 'error');
      }
      
      // Estratégia 2: se for o token inicial, considerar como admin
      if (!isAdmin && accessToken.description && accessToken.description.includes('inicial')) {
        isAdmin = true;
        log(`Concedendo privilégio admin para token inicial`, 'info');
      }
      
      // Estratégia 3: para desenvolvimento, considerar como admin se o token foi criado pelo usuário ID 1
      if (!isAdmin && accessToken.createdBy === 1) {
        isAdmin = true;
        log(`Concedendo privilégio admin para token criado pelo primeiro usuário (ID 1)`, 'info');
      }
      
      log(`Resultado final da verificação de admin: ${isAdmin}`, 'info');
      
      // Armazenar o usuário na requisição para uso posterior
      req.user = { 
        isAuthenticated: true, 
        isAdmin: isAdmin, // Garantir que seja um booleano 
        tokenId: accessToken.id,
        userId: accessToken.createdBy  // Usar userId em vez de createdBy para manter padrão
      };
      
      log(`Usuário na requisição: ${JSON.stringify(req.user)}`, 'info');
      next();
    } catch (error: any) {
      log(`Erro na verificação de token: ${error.message}`, 'error');
      return res.status(500).json({ error: 'Erro interno ao verificar token' });
    }
  })();
}

/**
 * Middleware para verificar se o usuário é administrador
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  log(`Verificando permissão de admin. User: ${JSON.stringify(req.user)}`, 'info');
  
  if (!req.user) {
    log('Requisição sem informações de usuário', 'error');
    return res.status(401).json({ error: 'Autenticação necessária' });
  }
  
  if (!req.user.isAdmin) {
    log(`Usuário não tem permissão de admin`, 'info');
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  
  log(`✅ Acesso de administrador confirmado!`, 'info');
  next();
}

/**
 * Gera um token aleatório para acesso
 */
export function generateRandomToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Configura as rotas de autenticação e token
 */
export function setupAuthRoutes(app: Express) {
  // Rota para login de administrador
  app.post('/api/admin/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) { // Em produção, use comparação segura de senha
        return res.status(401).json({ error: 'Usuário ou senha inválidos' });
      }
      
      if (!user.isAdmin) {
        return res.status(403).json({ error: 'Usuário não tem permissão de administrador' });
      }
      
      // Configurar o usuário na requisição
      req.user = { isAuthenticated: true, isAdmin: true, userId: user.id };
      
      res.status(200).json({ 
        message: 'Login bem-sucedido',
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin
        }
      });
    } catch (error: any) {
      log(`Erro no login de administrador: ${error.message}`, 'error');
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  });
  
  // Rota para criar um novo token de acesso (requer admin)
  app.post('/api/admin/tokens', requireToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { description, maxUsage, expiresAt } = req.body;
      
      if (!description) {
        return res.status(400).json({ error: 'Descrição é obrigatória' });
      }
      
      const newToken: InsertAccessToken = {
        token: generateRandomToken(),
        description,
        isActive: true,
        maxUsage: maxUsage || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: req.user!.userId as number,
      };
      
      const accessToken = await storage.createAccessToken(newToken);
      
      res.status(201).json({
        id: accessToken.id,
        token: accessToken.token,
        description: accessToken.description,
        maxUsage: accessToken.maxUsage,
        expiresAt: accessToken.expiresAt,
        createdAt: accessToken.createdAt,
      });
    } catch (error: any) {
      log(`Erro ao criar token: ${error.message}`, 'error');
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  });
  
  // Rota para listar todos os tokens (requer admin)
  app.get('/api/admin/tokens', requireAdmin, async (req: Request, res: Response) => {
    try {
      const tokens = await storage.listAccessTokens();
      
      res.status(200).json(tokens.map(token => ({
        id: token.id,
        token: token.token,
        description: token.description,
        isActive: token.isActive,
        usageCount: token.usageCount,
        maxUsage: token.maxUsage,
        expiresAt: token.expiresAt,
        createdAt: token.createdAt,
      })));
    } catch (error: any) {
      log(`Erro ao listar tokens: ${error.message}`, 'error');
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  });
  
  // Rota para desativar um token (requer admin)
  app.post('/api/admin/tokens/:id/deactivate', requireAdmin, async (req: Request, res: Response) => {
    try {
      const tokenId = parseInt(req.params.id);
      
      if (isNaN(tokenId)) {
        return res.status(400).json({ error: 'ID de token inválido' });
      }
      
      await storage.deactivateAccessToken(tokenId);
      
      res.status(200).json({ message: 'Token desativado com sucesso' });
    } catch (error: any) {
      log(`Erro ao desativar token: ${error.message}`, 'error');
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  });
  
  // Rota para verificar se um token é válido
  app.post('/api/verify-token', async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Token não fornecido' });
      }
      
      const accessToken = await storage.getAccessToken(token);
      
      if (!accessToken) {
        return res.status(401).json({ error: 'Token inválido', isValid: false });
      }
      
      if (!accessToken.isActive) {
        return res.status(401).json({ error: 'Token desativado', isValid: false });
      }
      
      if (accessToken.expiresAt && new Date() > accessToken.expiresAt) {
        return res.status(401).json({ error: 'Token expirado', isValid: false });
      }
      
      if (accessToken.maxUsage !== null && accessToken.usageCount >= accessToken.maxUsage) {
        return res.status(401).json({ error: 'Limite de uso do token excedido', isValid: false });
      }
      
      res.status(200).json({ isValid: true });
    } catch (error: any) {
      log(`Erro ao verificar token: ${error.message}`, 'error');
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  });

  // Rota para criar um usuário administrador inicial (apenas se não existir nenhum admin)
  app.post('/api/setup-admin', async (req: Request, res: Response) => {
    try {
      // Verificar se já existe algum usuário admin
      const tokens = await storage.listAccessTokens();
      const users = Array.from((storage as any).users.values());
      
      if (users.some(user => user.isAdmin)) {
        return res.status(400).json({ error: 'Já existe pelo menos um administrador no sistema' });
      }
      
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
      }
      
      // Criar o usuário admin
      const adminUser: InsertUser = {
        username,
        password, // Em produção, a senha deve ser hasheada
        isAdmin: true,
      };
      
      const user = await storage.createUser(adminUser);
      
      // Criar um token inicial para uso
      const initialToken: InsertAccessToken = {
        token: generateRandomToken(),
        description: 'Token inicial',
        isActive: true,
        maxUsage: null,
        expiresAt: null,
        createdBy: user.id,
      };
      
      const accessToken = await storage.createAccessToken(initialToken);
      
      res.status(201).json({
        message: 'Configuração inicial concluída',
        admin: {
          id: user.id,
          username: user.username,
        },
        token: {
          id: accessToken.id,
          token: accessToken.token,
          description: accessToken.description,
        },
      });
    } catch (error: any) {
      log(`Erro na configuração inicial: ${error.message}`, 'error');
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  });
}