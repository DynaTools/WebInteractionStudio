import { useState, useRef, useCallback } from 'react';

interface AudioRecorderReturn {
  isRecording: boolean;
  audioBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob>;
  error: string | null;
}

export function useAudioRecorder(): AudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isRecording) {
        setIsRecording(false);
        reject(new Error('Not recording'));
        return;
      }

      mediaRecorderRef.current.addEventListener('stop', () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(audioBlob);
          setIsRecording(false);
          
          // Stop all tracks of the stream
          if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
          
          resolve(audioBlob);
        } catch (error) {
          reject(error);
        }
      }, { once: true });

      mediaRecorderRef.current.stop();
    });
  }, [isRecording]);

  return { isRecording, audioBlob, startRecording, stopRecording, error };
}
