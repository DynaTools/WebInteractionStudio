import OpenAI from 'openai';
import { log } from './vite';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Italian tutor system prompt
const SYSTEM_PROMPT = `
Sei un tutor virtuale di lingua italiana. La tua funzione è conversare con l'utente somente in italiano, 
aiutandolo a praticare e imparare. Anche se l'utente parla in portoghese o altro idioma, rispondi sempre in italiano 
semplice e chiaro. Spiega termini in italiano se necessario, e incentiva l'utente a continuare praticando. 
Sii paziente, educativo e amichevole.
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
  } catch (error) {
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
    
    // Call GPT API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    
    const aiResponse = completion.choices[0].message.content || 'Mi dispiace, non ho capito.';
    log(`AI response generated: ${aiResponse}`);
    
    return aiResponse;
  } catch (error) {
    log(`AI response error: ${error.message}`, 'error');
    throw new Error(`AI response failed: ${error.message}`);
  }
}

/**
 * Generate speech from text using OpenAI TTS API
 * @param text The text to convert to speech
 * @returns The audio buffer
 */
export async function generateSpeech(text: string): Promise<Buffer> {
  try {
    log('Generating speech with TTS');
    
    // Call TTS API
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy', // Using alloy voice, can be changed to nova, echo, fable, etc.
      input: text,
    });
    
    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    log(`Speech generated successfully, size: ${buffer.length} bytes`);
    return buffer;
  } catch (error) {
    log(`TTS error: ${error.message}`, 'error');
    throw new Error(`Speech generation failed: ${error.message}`);
  }
}
