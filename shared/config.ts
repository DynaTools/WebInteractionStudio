/**
 * Arquivo de configuração global para o sistema de tutoria de idiomas
 * 
 * Este arquivo contém configurações que podem ser ajustadas pelo desenvolvedor, 
 * mas não são expostas ao usuário final.
 */

export const CONFIG = {
  // Configurações do OpenAI
  openai: {
    // Modelo usado para geração de texto
    model: "gpt-4o", // o modelo mais recente da OpenAI é "gpt-4o"
    // Temperatura para geração de respostas (0 a 1)
    // Valores mais baixos = respostas mais previsíveis
    // Valores mais altos = respostas mais criativas
    temperature: 0.7,
    // Máximo de tokens para gerar na resposta
    maxTokens: 500,
    // Voz usada para text-to-speech
    voice: "alloy", // Opções: "alloy", "echo", "fable", "onyx", "nova", "shimmer"
  },

  // Configurações de Azure Speech Service (para uso futuro)
  azure: {
    // Nome da voz desejada (pode ser treinada com sua própria voz)
    voiceName: "pt-BR-FranciscaNeural",
    // Região do serviço
    region: "eastus",
    // Taxa de fala (0.5 a 2.0, sendo 1.0 a velocidade normal)
    rate: 1.0,
    // Tom da voz (-100 a 100, sendo 0 o tom normal)
    pitch: 0, 
    // Usar Azure em vez do OpenAI para TTS
    useForTTS: false,
  },

  // Configurações de interface do usuário
  ui: {
    // Tempo de atraso artificial antes de mostrar a resposta (em ms)
    // Útil para dar um aspecto mais natural à conversa
    minResponseDelay: 300,
    maxResponseDelay: 700,
    // Intervalo entre a transcrição e a resposta (em ms)
    transcriptionToResponseDelay: 300,
  },

  // Configurações da experiência de tutoria
  tutoring: {
    // Nível de correção (0 a 1)
    // 0 = ignorar pequenos erros, focar na comunicação
    // 1 = corrigir todos os erros gramaticais e de pronúncia
    correctionLevel: 0.5,
    // Método de aprendizado preferido
    learningMethod: "conversational", // Opções: "conversational", "grammar-focused", "vocabulary-focused"
    // Nível de dificuldade inicial
    initialDifficulty: "beginner", // Opções: "beginner", "intermediate", "advanced"
  }
};

// Não modifique abaixo desta linha
export type ConfigType = typeof CONFIG;