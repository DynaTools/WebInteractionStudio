import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ILocalAudioTrack,
} from 'agora-rtc-sdk-ng';
import { useState, useRef, useCallback, useEffect } from 'react';

export function useAgoraClient() {
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);

  // Create Agora client
  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      
      // Listen for remote users joining
      clientRef.current.on("user-published", async (user, mediaType) => {
        await clientRef.current!.subscribe(user, mediaType);
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
        setRemoteUsers(prev => {
          if (prev.findIndex(u => u.uid === user.uid) === -1) {
            return [...prev, user];
          }
          return prev;
        });
      });

      // Listen for remote users leaving
      clientRef.current.on("user-unpublished", (user) => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      });
    }
  }, []);

  // Join channel
  const joinChannel = useCallback(async (
    appId: string,
    channel: string,
    token: string,
    uid: string | number
  ) => {
    if (!clientRef.current) return;
    
    try {
      console.log('Initializing Agora client with:', { appId, channel, token, uid });
      
      // Validate inputs
      if (!appId || !channel || !token) {
        throw new Error('Missing required Agora parameters');
      }
      
      // Join the channel
      await clientRef.current.join(appId, channel, token, uid);
      console.log('Successfully joined Agora channel:', channel);
      
      // Create local audio track
      console.log('Creating local audio track');
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      
      // Publish local audio track
      console.log('Publishing local audio track');
      await clientRef.current.publish([audioTrack]);
      
      setLocalAudioTrack(audioTrack);
      
      console.log('Agora setup complete');
      return true;
    } catch (error) {
      console.error("Error joining channel:", error);
      throw error;
    }
  }, []);

  // Leave channel
  const leaveChannel = useCallback(async () => {
    if (localAudioTrack) {
      localAudioTrack.close();
    }
    
    if (clientRef.current) {
      await clientRef.current.leave();
    }
    
    setLocalAudioTrack(null);
    setRemoteUsers([]);
  }, [localAudioTrack]);

  return {
    client: clientRef.current,
    localAudioTrack,
    remoteUsers,
    joinChannel,
    leaveChannel,
  };
}
