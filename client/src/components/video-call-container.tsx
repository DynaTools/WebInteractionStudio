import React, { useState } from 'react';
import { ConversationContainer } from '@/components/conversation-container';
import { AudioVisualizer } from '@/components/ui/audio-visualizer';
import { TutorInfo } from '@/lib/types';

interface VideoCallContainerProps {
  tutor: TutorInfo;
}

export function VideoCallContainer({ tutor }: VideoCallContainerProps) {
  const [tutorSpeaking, setTutorSpeaking] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-180px)]">
      {/* Left Panel - Tutor Video/Avatar */}
      <div className="w-full md:w-2/5 bg-gray-900 flex flex-col">
        <div className="relative flex-1 flex items-center justify-center">
          {/* Tutor Avatar */}
          <div className="relative">
            <img 
              src={tutor.avatarUrl}
              alt={`${tutor.name}, Italian Tutor`}
              className="rounded-full h-48 w-48 md:h-64 md:w-64 object-cover border-4 border-primary-500"
            />
            <div className="absolute bottom-4 right-4 bg-green-500 h-5 w-5 rounded-full border-2 border-white"></div>
          </div>
          
          {/* Currently Speaking Indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 px-4 py-2 rounded-full text-white text-sm">
            <AudioVisualizer isActive={tutorSpeaking} className="text-white" />
          </div>
        </div>
        
        {/* Tutor Info */}
        <div className="bg-gray-800 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{tutor.name}</h2>
              <p className="text-gray-300 text-sm">{tutor.role}</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </button>
              <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Conversation */}
      <ConversationContainer tutor={tutor} />
    </div>
  );
}
