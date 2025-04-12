import React, { useState, useRef, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { processAudio } from '@/lib/audio-processor';
import { useToast } from '@/hooks/use-toast';
import { Mic, X, MoreHorizontal, Save, Download, Copy, Trash2 } from 'lucide-react';
import { AudioVisualizer } from '@/components/ui/audio-visualizer';
import { Message, TutorInfo } from '@/lib/types';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface ConversationContainerProps {
  tutor: TutorInfo;
}

export function ConversationContainer({ tutor }: ConversationContainerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Ciao! Sono Sofia, la tua tutor di italiano. Come ti chiami? Come posso aiutarti oggi?",
      timestamp: new Date(),
      isTutor: true,
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [tutorSpeaking, setTutorSpeaking] = useState(false);
  const { toast } = useToast();
  const conversationRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  
  const { 
    isRecording, 
    startRecording, 
    stopRecording,
    error: recordingError
  } = useAudioRecorder();
  
  // Handle recording error
  useEffect(() => {
    if (recordingError) {
      toast({
        title: "Recording Error",
        description: recordingError,
        variant: "destructive",
      });
    }
  }, [recordingError, toast]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle start recording
  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      toast({
        title: "Failed to start recording",
        description: "Please check your microphone permissions",
        variant: "destructive",
      });
    }
  };
  
  // Handle stop recording
  const handleStopRecording = async () => {
    if (!isRecording) return;
    
    try {
      setIsProcessing(true);
      const audioBlob = await stopRecording();
      setTranscription('Processing your message...');
      
      // Process audio with backend
      const result = await processAudio(audioBlob);
      
      // Add user message
      setTranscription(result.transcription);
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: result.transcription,
        timestamp: new Date(),
        isTutor: false,
      }]);
      
      // Add tutor response after a brief delay
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          content: result.response,
          timestamp: new Date(),
          isTutor: true,
        }]);
        
        // Play audio response
        if (result.audioUrl) {
          audioRef.current.src = result.audioUrl;
          audioRef.current.onplay = () => setTutorSpeaking(true);
          audioRef.current.onended = () => setTutorSpeaking(false);
          audioRef.current.play().catch(err => {
            console.error("Error playing audio:", err);
          });
        }
        
        // Clear transcription after a delay
        setTimeout(() => {
          setTranscription('');
          setIsProcessing(false);
        }, 1000);
      }, 500);
      
    } catch (err) {
      console.error("Error processing recording:", err);
      setIsProcessing(false);
      setTranscription('');
      toast({
        title: "Processing Error",
        description: "Failed to process your message",
        variant: "destructive",
      });
    }
  };
  
  // Handle end call
  const handleEndCall = () => {
    window.location.reload();
  };

  return (
    <div className="w-full md:w-3/5 flex flex-col">
      {/* Conversation History */}
      <div 
        className="flex-1 overflow-y-auto p-4" 
        id="conversation-container"
        ref={conversationRef}
      >
        <div className="space-y-4">
          {messages.map((message) => (
            message.isTutor ? (
              // Tutor Message
              <div key={message.id} className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-800">IT</span>
                  </div>
                </div>
                <div className="chat-bubble-tutor bg-primary-50 p-3 rounded-lg max-w-[80%]">
                  <p className="font-serif">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTime(message.timestamp)}</p>
                </div>
              </div>
            ) : (
              // User Message
              <div key={message.id} className="flex items-start justify-end">
                <div className="chat-bubble-user bg-gray-100 p-3 rounded-lg max-w-[80%]">
                  <p>{message.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTime(message.timestamp)}</p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-800">YOU</span>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
      
      {/* Visual Divider */}
      <div className="border-t border-gray-200"></div>
      
      {/* Transcription Area */}
      <div className="p-3 bg-gray-50" id="transcription-area">
        <div className="p-2">
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm text-gray-700">Processing...</p>
            </div>
          ) : isRecording ? (
            <div className="flex items-center space-x-2">
              <span className="inline-flex h-3 w-3 rounded-full bg-red-500"></span>
              <p className="text-sm text-gray-700">Listening...</p>
            </div>
          ) : transcription ? (
            <p className="text-sm text-gray-700">{transcription}</p>
          ) : (
            <p className="text-sm text-gray-500 italic">Quando sto parlando, il testo appare qui...</p>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-gray-100 p-4 flex items-center justify-between">
        {/* Microphone Button */}
        <div className="flex-1 flex justify-center">
          <button 
            id="record-button" 
            className={`relative flex items-center justify-center h-16 w-16 rounded-full bg-white border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:bg-primary-50 ${
              isRecording ? 'border-red-500 bg-red-50 recording-pulse' : 'border-primary-500'
            }`}
            onMouseDown={handleStartRecording}
            onMouseUp={handleStopRecording}
            onMouseLeave={() => isRecording && handleStopRecording()}
            onTouchStart={(e) => {
              e.preventDefault();
              handleStartRecording();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleStopRecording();
            }}
            disabled={isProcessing}
          >
            <Mic className={`h-8 w-8 ${isRecording ? 'text-red-500' : 'text-primary-500'}`} />
            <span className="absolute -bottom-8 text-sm font-medium text-gray-600">
              {isProcessing ? 'Processing...' : 'Hold to speak'}
            </span>
          </button>
        </div>
        
        {/* Additional Controls */}
        <div className="flex space-x-3">
          <button className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <MoreHorizontal className="h-6 w-6 text-gray-700" />
          </button>
          <button 
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={handleEndCall}
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
