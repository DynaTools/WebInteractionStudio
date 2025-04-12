import OpenAI from 'openai';
import { log } from './vite';
import { CONFIG } from '@shared/config';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Italian tutor system prompt with correction level based on config
const SYSTEM_PROMPT = `
Sei un tutor virtuale di lingua italiana. La tua funzione è conversare con l'utente somente in italiano, 
aiutandolo a praticare e imparare. Anche se l'utente parla in portoghese o altro idioma, rispondi sempre in italiano 
semplice e chiaro. Spiega termini in italiano se necessario, e incentiva l'utente a continuare praticando. 
Sii paziente, educativo e amichevole.

Livello di correzione: ${CONFIG.tutoring.correctionLevel}
- Se il livello è basso (vicino a 0), focalizzati sulla comunicazione e ignora piccoli errori grammaticali.
- Se il livello è alto (vicino a 1), correggi tutti gli errori e offri spiegazioni dettagliate.

Metodo di apprendimento: ${CONFIG.tutoring.learningMethod}
- Se "conversational", mantieni una conversazione naturale e fluida.
- Se "grammar-focused", enfatizza le regole grammaticali e la struttura della frase.
- Se "vocabulary-focused", introduci nuovo vocabolario rilevante al contesto.

Livello di difficoltà: ${CONFIG.tutoring.initialDifficulty}
- Adatta il tuo linguaggio al livello dell'utente.
`;

/**
 * Transcribe audio using OpenAI Whisper API
 * @param audioBuffer The audio buffer to transcribe
 * @returns The transcribed text
 */
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    log('Starting transcription with Whisper');
    
    // Create File object from buffer
    const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });
    
    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });
    
    log(`Transcription successful: ${transcription.text}`);
    return transcription.text;
  } catch (error: any) {
    log(`Transcription error: ${error.message}`, 'error');
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

/**
 * Generate AI response using OpenAI GPT API
 * @param userMessage The user's message to respond to
 * @returns The AI generated response
 */
export async function generateAIResponse(userMessage: string): Promise<string> {
  try {
    log('Generating AI response with GPT');
    
    // Adiciona um atraso artificial mínimo para tornar a resposta mais natural
    if (CONFIG.ui.minResponseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, Math.floor(
        Math.random() * (CONFIG.ui.maxResponseDelay - CONFIG.ui.minResponseDelay) + CONFIG.ui.minResponseDelay
      )));
    }
    
    // Call GPT API
    const completion = await openai.chat.completions.create({
      model: CONFIG.openai.model, // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: CONFIG.openai.temperature,
      max_tokens: CONFIG.openai.maxTokens,
    });
    
    const aiResponse = completion.choices[0].message.content || 'Mi dispiace, non ho capito.';
    log(`AI response generated: ${aiResponse}`);
    
    return aiResponse;
  } catch (error: any) {
    log(`AI response error: ${error.message}`, 'error');
    throw new Error(`AI response failed: ${error.message}`);
  }
}

/**
 * Generate speech from text using OpenAI TTS API
 * @param text The text to convert to speech
 * @returns The audio buffer
 */
// Import da função do Azure TTS (para uso futuro)
import { generateAzureSpeech } from './azure-tts';

export async function generateSpeech(text: string): Promise<Buffer> {
  try {
    // Verificação para uso do Azure TTS se configurado
    if (CONFIG.azure.useForTTS) {
      try {
        // Tenta usar o Azure Speech Service
        return await generateAzureSpeech(text);
      } catch (azureError: any) {
        // Se falhar, registra o erro e continua com OpenAI
        log(`Azure TTS falhou, usando OpenAI como fallback: ${azureError.message}`, 'warn');
      }
    }
    
    log('Generating speech with OpenAI TTS');
    
    // Usar configurações definidas pelo desenvolvedor
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: CONFIG.openai.voice,
      input: text,
    });
    
    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    log(`Speech generated successfully, size: ${buffer.length} bytes`);
    return buffer;
  } catch (error: any) {
    log(`TTS error: ${error.message}`, 'error');
    throw new Error(`Speech generation failed: ${error.message}`);
  }
}
