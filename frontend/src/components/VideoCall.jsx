import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import { toast } from 'react-toastify';

const VideoCall = ({ appointmentId, backendUrl, token, role = 'patient', onEndCall }) => {
  const [inCall, setInCall] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [appId, setAppId] = useState('');
  const [agoraToken, setAgoraToken] = useState('');
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);

  const clientRef = useRef(null);
  const localVideoContainerRef = useRef(null);

  const startCall = async () => {
    try {
      setLoading(true);

      // Get video call token from backend
      const { data } = await axios.post(
        backendUrl + '/api/user/video-call/token',
        { appointmentId, role },
        { headers: { token } }
      );

      if (data.success) {
        // Validate appId from response
        if (!data.appId || typeof data.appId !== 'string' || data.appId.trim() === '') {
          console.error('Invalid App ID received from server:', data.appId);
          toast.info('It may not work first time, please rejoin again');
          setLoading(false);
          return;
        }

        setChannelName(data.channelName);
        setAppId(data.appId);
        // Set token to null if empty or undefined, otherwise use the token
        setAgoraToken(data.token && data.token.trim() !== '' ? data.token : null);
        setUid(data.uid);
        setInCall(true);
      } else {
        const errorMsg = data.message || 'Failed to start video call';
        toast.error(errorMsg);
        if (errorMsg.includes('Agora credentials')) {
          toast.info('Please add AGORA_APP_ID and AGORA_APP_CERTIFICATE to backend/.env file');
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error starting call:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to start video call';
      toast.error(errorMsg);
      if (errorMsg.includes('Agora credentials') || errorMsg.includes('AGORA')) {
        toast.info('Please add AGORA_APP_ID and AGORA_APP_CERTIFICATE to backend/.env file');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inCall && appId && channelName && agoraToken !== undefined && uid !== null) {
      const init = async () => {
        try {
          // Create Agora client
          const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
          clientRef.current = client;

          // Create local tracks
          const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
          setLocalAudioTrack(audioTrack);
          setLocalVideoTrack(videoTrack);

          // Play local video
          if (localVideoContainerRef.current) {
            videoTrack.play(localVideoContainerRef.current);
          }

          // Handle user published
          client.on('user-published', async (user, mediaType) => {
            await client.subscribe(user, mediaType);

            if (mediaType === 'video') {
              setRemoteUsers((prev) => {
                if (!prev.find((u) => u.uid === user.uid)) {
                  return [...prev, user];
                }
                return prev;
              });
            }

            if (mediaType === 'audio') {
              user.audioTrack?.play();
            }
          });

          // Handle user unpublished
          client.on('user-unpublished', (user, mediaType) => {
            if (mediaType === 'video') {
              setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
            }
          });

          // Join channel
          // Validate appId before joining
          if (!appId || typeof appId !== 'string' || appId.trim() === '') {
            throw new Error('Invalid App ID: App ID is missing or empty');
          }

          // Validate appId contains only ASCII characters
          if (!/^[\x00-\x7F]+$/.test(appId)) {
            throw new Error('Invalid App ID: App ID contains non-ASCII characters');
          }

          // Validate appId length
          if (appId.length < 1 || appId.length > 2047) {
            throw new Error('Invalid App ID: App ID length must be between 1 and 2047 characters');
          }

          // Use null if token is empty or undefined
          const tokenToUse = agoraToken && agoraToken.trim() !== '' ? agoraToken : null;
          await client.join(appId, channelName, tokenToUse, uid);

          // Publish local tracks
          await client.publish([audioTrack, videoTrack]);

          setLoading(false);
        } catch (error) {
          console.error('Error joining channel:', error);

          // Check if it's an App ID error and show info message instead
          if (error.message?.includes('Invalid App ID') || error.message?.includes('App ID is missing or empty')) {
            toast.info('It may not work first time, please rejoin again');
          } else {
            toast.error('Failed to join video call');
          }

          setLoading(false);
          setInCall(false);
        }
      };

      init();
    }

    // Cleanup
    return () => {
      if (clientRef.current) {
        clientRef.current.leave();
        clientRef.current.removeAllListeners();
      }
      if (localVideoTrack) {
        localVideoTrack.close();
      }
      if (localAudioTrack) {
        localAudioTrack.close();
      }
    };
  }, [inCall, channelName, appId, agoraToken, uid]);

  // Handle remote video display
  useEffect(() => {
    const remoteContainer = document.getElementById('remote-player-container');
    if (remoteContainer && remoteUsers.length > 0) {
      remoteContainer.innerHTML = '';
      const remoteUser = remoteUsers[0];
      const remoteRole = remoteUser.uid === 1 ? 'Doctor' : 'Patient';

      if (remoteUser.videoTrack) {
        remoteUser.videoTrack.play(remoteContainer);
        // Add a label for the remote user
        const label = document.createElement('p');
        label.innerText = remoteRole;
        label.className = 'absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm z-10';
        remoteContainer.style.position = 'relative';
        remoteContainer.appendChild(label);
      }
    } else if (remoteContainer && remoteUsers.length === 0) {
      remoteContainer.innerHTML = '<p class="text-white">Waiting for other participant...</p>';
    }
  }, [remoteUsers]);

  const leaveCall = async () => {
    try {
      // Stop and close local tracks
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }

      // Leave channel
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current.removeAllListeners();
        clientRef.current = null;
      }

      // Notify backend that call ended
      if (appointmentId) {
        await axios.post(
          backendUrl + '/api/user/video-call/end',
          { appointmentId },
          { headers: { token } }
        );
      }

      setInCall(false);
      setChannelName('');
      setAppId('');
      setAgoraToken('');
      setUid(null);
      setRemoteUsers([]);

      if (onEndCall) {
        onEndCall();
      }
    } catch (error) {
      console.error('Error leaving call:', error);
    }
  };

  return (
    <div className="video-call-container">
      {!inCall ? (
        <div className="flex flex-col items-center gap-4 p-6">
          <button
            onClick={startCall}
            disabled={loading}
            className="bg-accent hover:bg-accent-dark text-white px-6 py-3 roun-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Starting Call...' : 'Start Video Call'}
          </button>
        </div>
      ) : (
        <div className="video-call-active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Local Video */}
            <div className="relative">
              <div
                ref={localVideoContainerRef}
                id="local-player"
                className="w-full h-64 bg-gray-900 roun-lg"
              ></div>
              <p className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm z-10">
                You ({role === 'doctor' ? 'Doctor' : 'Patient'})
              </p>
            </div>

            {/* Remote Video */}
            <div className="relative">
              <div
                id="remote-player-container"
                className="w-full h-64 bg-gray-800 roun-lg flex items-center justify-center"
              >
                <p className="text-white">Waiting for other participant...</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={leaveCall}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 roun-lg font-medium"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
