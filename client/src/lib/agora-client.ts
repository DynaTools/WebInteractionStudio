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
      // Join the channel
      await clientRef.current.join(appId, channel, token, uid);
      
      // Create local audio track
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      
      // Publish local audio track
      await clientRef.current.publish([audioTrack]);
      
      setLocalAudioTrack(audioTrack);
      
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
