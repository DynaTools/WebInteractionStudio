export interface Message {
  id: number;
  content: string;
  timestamp: Date;
  isTutor: boolean;
  audioUrl?: string;
}

export interface TutorInfo {
  id: number;
  name: string;
  role: string;
  avatarUrl: string;
  language: string;
  level: string;
  description: string;
}

export interface ProcessAudioResponse {
  transcription: string;
  response: string;
  audioUrl: string;
}

export interface AgoraTokenResponse {
  token: string;
  channelName: string;
  uid: number;
  appId: string;
}
