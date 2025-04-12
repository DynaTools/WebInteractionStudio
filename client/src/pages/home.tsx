import React, { useState, useEffect } from 'react';
import { VideoCallContainer } from '@/components/video-call-container';
import { useAgoraClient } from '@/lib/agora-client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { TutorInfo, AgoraTokenResponse } from '@/lib/types';
import { tutors } from '@/assets/tutors';

export default function Home() {
  const [selectedTutor, setSelectedTutor] = useState<TutorInfo>(tutors[0]);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  
  // Get Agora token from backend
  const { data: agoraData, isLoading, error } = useQuery<AgoraTokenResponse>({
    queryKey: ['/api/agora-token'],
    retry: 3,
  });
  
  // Initialize Agora client
  const { client, localAudioTrack, remoteUsers, joinChannel, leaveChannel } = useAgoraClient();
  
  // Handle session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isConnected) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);
  
  // Format session time
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };
  
  // Join channel when data is loaded
  useEffect(() => {
    if (agoraData && !isConnected) {
      const init = async () => {
        try {
          console.log('Joining Agora channel with data:', {
            appId: agoraData.appId,
            channelName: agoraData.channelName,
            uid: agoraData.uid
          });
          
          await joinChannel(agoraData.appId, agoraData.channelName, agoraData.token, agoraData.uid);
          console.log('Successfully joined Agora channel');
          setIsConnected(true);
        } catch (err) {
          console.error('Failed to join channel:', err);
          // Show error toast or notification here
          // Try to reconnect after a delay
          setTimeout(() => {
            setIsConnected(false); // Reset connection state to trigger a retry
          }, 5000);
        }
      };
      
      init();
    }
    
    return () => {
      if (isConnected) {
        leaveChannel();
      }
    };
  }, [agoraData, isConnected, joinChannel, leaveChannel]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-medium">Connecting to tutor...</h2>
          <p className="text-gray-500 mt-2">Please wait while we set up your session</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="bg-red-100 text-red-600 p-3 rounded-full inline-block mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium">Connection Error</h2>
          <p className="text-gray-500 mt-2">Unable to connect to the video service. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027c.33-.287.612-.653.612-1.158 0-.841-.457-1.33-1.208-1.33-.795 0-1.276.62-1.276 1.388 0 .683.33 1.129.743 1.424v.069c-.743.32-1.052.8-1.052 1.388 0 .937.58 1.548 1.504 1.548.892 0 1.504-.65 1.504-1.466 0-.56-.275-1.06-.793-1.318v-.069zm2.625-4.47c-.1 0-.179.066-.251.142l-4.193 8.095a.256.256 0 00.021.268c.039.047.103.074.175.074.095 0 .177-.065.248-.142l4.194-8.095a.256.256 0 00-.021-.268c-.04-.047-.105-.074-.173-.074zm1.454 5.858c-.33.287-.612.653-.612 1.158 0 .841.457 1.33 1.207 1.33.796 0 1.276-.62 1.276-1.388 0-.683-.329-1.13-.743-1.424v-.069c.743-.32 1.052-.8 1.052-1.389 0-.937-.58-1.547-1.504-1.547-.892 0-1.504.65-1.504 1.466 0 .56.275 1.06.793 1.318v.069z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-semibold text-gray-800">Parla Italiano</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} mr-1.5`}></span>
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
            <button 
              type="button" 
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto bg-white shadow-sm rounded-lg my-6 overflow-hidden">
        {isConnected && (
          <VideoCallContainer tutor={selectedTutor} />
        )}
      </main>
      
      {/* Status Bar */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <span>Audio: {isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <span>Video: {isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
          </div>
          <div>
            <span>Session time: {formatTime(sessionTime)}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
