import axios from 'axios';

/**
 * Process audio by sending it to the backend for transcription, AI response, and TTS
 * @param audioBlob The recorded audio blob to process
 * @returns The processing result including transcription, AI response, and audio URL
 */
export async function processAudio(audioBlob: Blob) {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    // Send to backend for processing
    const response = await axios.post('/api/process-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error processing audio:', error);
    throw new Error('Failed to process audio');
  }
}

/**
 * Send transcribed text to get an AI response
 * @param text The transcribed text to send to the AI
 * @returns The AI response text
 */
export async function getAIResponse(text: string) {
  try {
    const response = await axios.post('/api/chat', {
      userMessage: text,
    });
    
    return response.data.response;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw new Error('Failed to get AI response');
  }
}

/**
 * Convert text to speech
 * @param text The text to convert to speech
 * @returns Audio blob URL
 */
export async function textToSpeech(text: string) {
  try {
    const response = await axios.post('/api/tts', {
      text,
    }, {
      responseType: 'blob',
    });
    
    // Create blob URL for audio playback
    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return audioUrl;
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw new Error('Failed to convert text to speech');
  }
}
