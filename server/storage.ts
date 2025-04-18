import {
  Session,
  InsertSession,
  Message,
  InsertMessage,
  User,
  InsertUser,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session methods
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: number): Promise<Session | undefined>;
  endSession(id: number): Promise<Session | undefined>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySession(sessionId: number): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private messages: Map<number, Message>;
  private userIdCounter: number;
  private sessionIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.messages = new Map();
    this.userIdCounter = 1;
    this.sessionIdCounter = 1;
    this.messageIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Session methods
  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.sessionIdCounter++;
    const session: Session = {
      id,
      startTime: new Date(),
      endTime: null,
      userId: insertSession.userId,
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async endSession(id: number): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (session) {
      session.endTime = new Date();
      this.sessions.set(id, session);
    }
    return session;
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = {
      id,
      sessionId: insertMessage.sessionId,
      content: insertMessage.content,
      timestamp: new Date(),
      isTutor: insertMessage.isTutor,
      audioUrl: insertMessage.audioUrl || null,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesBySession(sessionId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.sessionId === sessionId
    );
  }
}

export const storage = new MemStorage();
