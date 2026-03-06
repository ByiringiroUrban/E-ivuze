import React, { useState, useEffect, useRef, useContext } from 'react';
import { createPortal } from 'react-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ChatContext } from '../context/ChatContext';

const MeetingPage = ({ appointmentId, patientId, backendUrl, token, role = 'patient', onEndCall, userName, otherUserName, onShowNotes, onShowRefer, onShowRx, onShowLab, onShowVaccine }) => {
  // Check for existing meeting in localStorage
  const getStoredMeeting = () => {
    try {
      const stored = localStorage.getItem(`meeting_${appointmentId}`);
      if (stored) {
        const meetingData = JSON.parse(stored);
        // Check if meeting data is still valid (not expired)
        if (meetingData.expiresAt && new Date(meetingData.expiresAt) > new Date()) {
          return meetingData;
        } else {
          // Clear expired meeting
          localStorage.removeItem(`meeting_${appointmentId}`);
        }
      }
    } catch (error) {
      console.error('Error reading stored meeting:', error);
    }
    return null;
  };

  // Store meeting data
  const storeMeeting = (data) => {
    try {
      const meetingData = {
        ...data,
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
        storedAt: new Date().toISOString()
      };
      localStorage.setItem(`meeting_${appointmentId}`, JSON.stringify(meetingData));
      console.log('Meeting data stored');
    } catch (error) {
      console.error('Error storing meeting:', error);
    }
  };

  // Clear stored meeting
  const clearStoredMeeting = () => {
    try {
      localStorage.removeItem(`meeting_${appointmentId}`);
      console.log('Meeting data cleared');
    } catch (error) {
      console.error('Error clearing stored meeting:', error);
    }
  };

  const storedMeeting = getStoredMeeting();
  const [showJoinScreen, setShowJoinScreen] = useState(!storedMeeting);
  const [joinWithVideo, setJoinWithVideo] = useState(true);
  const [inCall, setInCall] = useState(!!storedMeeting);
  const [channelName, setChannelName] = useState(storedMeeting?.channelName || '');
  const [appId, setAppId] = useState(storedMeeting?.appId || '');
  const [agoraToken, setAgoraToken] = useState(storedMeeting?.token && storedMeeting.token.trim() !== '' ? storedMeeting.token : null);
  const [uid, setUid] = useState(storedMeeting?.uid || null);
  const [loading, setLoading] = useState(false);

  // Media states
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [screenTrack, setScreenTrack] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [wasVideoEnabledBeforeScreenShare, setWasVideoEnabledBeforeScreenShare] = useState(false);

  // Remote users
  const [remoteUsers, setRemoteUsers] = useState([]);

  // Clinical Feed states
  const { socket } = useContext(ChatContext);
  const [clinicalUpdates, setClinicalUpdates] = useState([]);
  const [showClinicalFeed, setShowClinicalFeed] = useState(role === 'patient');
  const [hasNewUpdate, setHasNewUpdate] = useState(false);

  // Refs
  const clientRef = useRef(null);
  const localVideoContainerRef = useRef(null);
  const localVideoContainerSmallRef = useRef(null);
  const remoteVideoContainerRef = useRef(null);

  // Get video call token
  const getToken = async () => {
    try {
      const endpoint = role === 'doctor'
        ? '/api/doctor/video-call/token'
        : '/api/user/video-call/token';
      const headers = role === 'doctor'
        ? { dToken: token }
        : { token };

      console.log('Requesting video call token:', {
        endpoint: backendUrl + endpoint,
        appointmentId,
        role,
        hasToken: !!token
      });

      const { data } = await axios.post(
        backendUrl + endpoint,
        { appointmentId, role },
        { headers }
      );

      console.log('Token response received:', {
        success: data.success,
        hasToken: !!data.token,
        channelName: data.channelName,
        appId: data.appId,
        uid: data.uid,
        message: data.message
      });

      if (data.success) {
        // Validate appId from response
        if (!data.appId || typeof data.appId !== 'string' || data.appId.trim() === '') {
          console.error('Invalid App ID received from server:', data.appId);
          return { success: false, error: 'It may not work first time, please rejoin again' };
        }

        // Skip channel name validation - backend handles it
        setChannelName(data.channelName);
        setAppId(data.appId);
        // Set token to null if empty or undefined, otherwise use the token
        setAgoraToken(data.token && data.token.trim() !== '' ? data.token : null);
        setUid(data.uid);
        console.log('Token set successfully');
        return { success: true, data };
      } else {
        console.error('Token generation failed:', data.message);
        const errorMsg = data.message || 'Failed to get video call token';
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Error getting token:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to get video call token';
      return { success: false, error: errorMsg };
    }
  };

  // Join meeting
  const joinMeeting = async () => {
    try {
      setLoading(true);

      // Get token first
      const tokenResult = await getToken();
      if (!tokenResult.success) {
        console.error('Token request failed:', tokenResult.error);
        toast.error(tokenResult.error || 'Failed to get video call token');
        if (tokenResult.error?.includes('Agora credentials')) {
          toast.info('Please add AGORA_APP_ID and AGORA_APP_CERTIFICATE to backend/.env file');
        }
        setLoading(false);
        return;
      }

      // Small delay to ensure state is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create Agora client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Create local tracks based on join option
      let audioTrack = null;
      let videoTrack = null;

      if (joinWithVideo) {
        try {
          console.log('Creating video and audio tracks...');
          [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
            { microphoneId: undefined },
            { cameraId: undefined }
          );
          console.log('Tracks created successfully:', {
            hasAudio: !!audioTrack,
            hasVideo: !!videoTrack
          });
          setLocalAudioTrack(audioTrack);
          setLocalVideoTrack(videoTrack);
          setIsVideoEnabled(true);
          setIsAudioEnabled(true);

          // Ensure audio is enabled
          if (audioTrack) {
            audioTrack.setEnabled(true);
            console.log('Audio track enabled');
          }
          // Ensure video is enabled
          if (videoTrack) {
            videoTrack.setEnabled(true);
            console.log('Video track enabled');
          }
        } catch (error) {
          console.error('Error creating tracks:', error);
          // Try audio only if video fails
          try {
            audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            setLocalAudioTrack(audioTrack);
            setIsVideoEnabled(false);
            setIsAudioEnabled(true);
            if (audioTrack) {
              audioTrack.setEnabled(true);
            }
            toast.warn('Camera access denied. Joining with audio only.');
          } catch (audioError) {
            console.error('Error creating audio track:', audioError);
            toast.error('Failed to access microphone');
            setLoading(false);
            return;
          }
        }
      } else {
        // Audio only
        console.log('Creating audio-only track...');
        try {
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          setLocalAudioTrack(audioTrack);
          setIsVideoEnabled(false);
          setIsAudioEnabled(true);
          if (audioTrack) {
            audioTrack.setEnabled(true);
            console.log('Audio track created and enabled');
          }
        } catch (error) {
          console.error('Error creating audio track:', error);
          toast.error('Failed to access microphone');
          setLoading(false);
          return;
        }
      }

      // Play local video if available - will be handled by useEffect
      if (videoTrack) {
        console.log('📹 Local video track created, will display in container');
        console.log('  Local video track ID:', videoTrack.getTrackId());
        // Force a re-render to ensure container is ready
        setTimeout(() => {
          playLocalVideo(videoTrack);
        }, 100);
      } else {
        console.log('⚠️ No local video track to display');
      }

      // Add event listeners for debugging
      client.on('connection-state-change', (curState, revState) => {
        console.log('🔌 CONNECTION STATE CHANGED:', {
          previous: revState,
          current: curState,
          timestamp: new Date().toISOString()
        });
      });

      client.on('user-joined', (user) => {
        console.log('👤 USER JOINED CHANNEL:', {
          uid: user.uid,
          timestamp: new Date().toISOString()
        });
      });

      client.on('user-left', (user) => {
        console.log('👤 USER LEFT CHANNEL:', {
          uid: user.uid,
          timestamp: new Date().toISOString()
        });
        setRemoteUsers((prev) => {
          const newUsers = prev.filter((u) => u.uid !== user.uid);
          console.log('📊 Users remaining in channel:', newUsers.length);
          return newUsers;
        });
      });

      // Handle remote user published
      client.on('user-published', async (user, mediaType) => {
        console.log('📹 USER PUBLISHED EVENT:', {
          uid: user.uid,
          mediaType,
          hasVideoTrack: !!user.videoTrack,
          hasAudioTrack: !!user.audioTrack,
          timestamp: new Date().toISOString()
        });
        try {
          await client.subscribe(user, mediaType);
          console.log('✓ Subscribed to user:', { uid: user.uid, mediaType });

          if (mediaType === 'video') {
            console.log('📹 Adding remote video user to state:', user.uid);
            setRemoteUsers((prev) => {
              const newUsers = !prev.find((u) => u.uid === user.uid)
                ? [...prev, user]
                : prev;
              console.log('📊 Remote users count:', newUsers.length);
              console.log('📊 Remote users UIDs:', newUsers.map(u => u.uid));
              return newUsers;
            });
          }

          if (mediaType === 'audio') {
            console.log('🔊 Playing remote audio for user:', user.uid);
            if (user.audioTrack) {
              user.audioTrack.play();
              console.log('✓ Remote audio playing');
            }
          }
        } catch (error) {
          console.error('❌ Error subscribing to user:', error);
        }
      });

      // Handle remote user unpublished
      client.on('user-unpublished', (user, mediaType) => {
        console.log('📹 USER UNPUBLISHED EVENT:', {
          uid: user.uid,
          mediaType,
          timestamp: new Date().toISOString()
        });
        if (mediaType === 'video') {
          console.log('⚠️ Removing remote video user from state:', user.uid);
          setRemoteUsers((prev) => {
            const newUsers = prev.filter((u) => u.uid !== user.uid);
            console.log('📊 Remote users count after removal:', newUsers.length);
            console.log('📊 Remaining remote users UIDs:', newUsers.map(u => u.uid));
            return newUsers;
          });
        }
      });

      // Skip channel name validation - backend handles it, let Agora validate
      // Join channel
      console.log('\n🚪 JOINING CHANNEL:');
      console.log('  App ID:', appId);
      console.log('  Channel:', channelName);
      console.log('  UID:', uid);
      console.log('  Role:', role);
      console.log('  Timestamp:', new Date().toISOString());

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
      let tokenToUse = agoraToken && agoraToken.trim() !== '' ? agoraToken : null;
      let currentChannelName = channelName;
      let currentToken = agoraToken;
      let currentUid = uid;

      // Try to join with error handling for invalid channel name
      try {
        await client.join(appId, currentChannelName, tokenToUse, currentUid);
        console.log('✓ Successfully joined channel');
      } catch (joinError) {
        // Catch INVALID_PARAMS error and automatically fix it
        if (joinError?.message?.includes('INVALID_PARAMS') || joinError?.message?.includes('64 bytes') || joinError?.message?.includes('supported characters')) {
          console.warn('Channel name validation error detected, requesting new token with fixed channel name...');

          // Clear stored meeting to force new token request
          clearStoredMeeting();

          // Request a new token (backend will generate a valid channel name)
          const retryTokenResult = await getToken();
          if (retryTokenResult.success) {
            // Retry join with new channel name
            currentChannelName = retryTokenResult.data?.channelName || currentChannelName;
            currentToken = retryTokenResult.data?.token && retryTokenResult.data.token.trim() !== '' ? retryTokenResult.data.token : null;
            currentUid = retryTokenResult.data?.uid || currentUid;
            tokenToUse = currentToken && currentToken.trim() !== '' ? currentToken : null;

            console.log('Retrying join with fixed channel name:', currentChannelName);
            await client.join(appId, currentChannelName, tokenToUse, currentUid);
            console.log('✓ Successfully joined channel with fixed channel name');

            // Update state with new values
            setChannelName(currentChannelName);
            setAgoraToken(currentToken);
            setUid(currentUid);
          } else {
            throw joinError; // Re-throw if token request fails
          }
        } else {
          throw joinError; // Re-throw other errors
        }
      }
      console.log('📊 Current connection state:', client.connectionState);

      // Publish tracks
      const tracksToPublish = [];
      if (audioTrack) {
        tracksToPublish.push(audioTrack);
        console.log('Added audio track to publish');
      }
      if (videoTrack) {
        tracksToPublish.push(videoTrack);
        console.log('Added video track to publish');
      }

      if (tracksToPublish.length > 0) {
        console.log('📤 Publishing tracks:', {
          count: tracksToPublish.length,
          hasAudio: !!audioTrack,
          hasVideo: !!videoTrack,
          timestamp: new Date().toISOString()
        });
        await client.publish(tracksToPublish);
        console.log('✓ Successfully published tracks');
        console.log('📊 Current local tracks:', {
          audioEnabled: isAudioEnabled,
          videoEnabled: isVideoEnabled,
          audioTrackId: audioTrack?.getTrackId(),
          videoTrackId: videoTrack?.getTrackId()
        });
      } else {
        console.warn('⚠️ No tracks to publish!');
      }

      // Store meeting data
      storeMeeting({
        channelName: currentChannelName,
        appId,
        token: currentToken && currentToken.trim() !== '' ? currentToken : null,
        uid: currentUid,
        hasVideo: !!videoTrack,
        hasAudio: !!audioTrack
      });

      setShowJoinScreen(false);
      setInCall(true);
      setLoading(false);

      // Log summary of video display status
      setTimeout(() => {
        console.log('\n📊 VIDEO DISPLAY STATUS SUMMARY:');
        console.log('  Local video:', {
          hasVideo: !!localVideoTrack,
          isEnabled: isVideoEnabled,
          isDisplayed: !!localVideoContainerRef.current && !!localVideoTrack
        });
        console.log('  Remote video:', {
          remoteUsersCount: remoteUsers.length,
          hasRemoteVideo: remoteUsers.length > 0 && !!remoteUsers[0]?.videoTrack,
          remoteUIDs: remoteUsers.map(u => u.uid)
        });
        console.log('  Channel:', channelName);
        console.log('  Your UID:', uid);
        console.log('  Timestamp:', new Date().toISOString());

        // Check if both videos should be visible
        if (localVideoTrack && remoteUsers.length > 0 && remoteUsers[0]?.videoTrack) {
          console.log('\n✅✅✅ BOTH VIDEOS ARE ACTIVE! ✅✅✅');
          console.log('  ✅ Your video: DISPLAYED');
          console.log('  ✅ Remote video: DISPLAYED');
          console.log('  ✅ Both participants should see each other!');
        } else if (localVideoTrack && remoteUsers.length === 0) {
          console.log('\n⚠️  ONLY YOUR VIDEO IS ACTIVE');
          console.log('  ✅ Your video: DISPLAYED');
          console.log('  ⚠️  Remote video: WAITING FOR PARTICIPANT');
        } else if (!localVideoTrack && remoteUsers.length > 0 && remoteUsers[0]?.videoTrack) {
          console.log('\n⚠️  ONLY REMOTE VIDEO IS ACTIVE');
          console.log('  ⚠️  Your video: OFF');
          console.log('  ✅ Remote video: DISPLAYED');
        } else {
          console.log('\n⚠️  NO VIDEOS ACTIVE');
          console.log('  ⚠️  Your video: OFF');
          console.log('  ⚠️  Remote video: NOT AVAILABLE');
        }

        console.log('📊 END STATUS SUMMARY\n');
      }, 2000);

      // Set up periodic status check (stored in window for cleanup)
      if (window.videoStatusInterval) {
        clearInterval(window.videoStatusInterval);
      }
      window.videoStatusInterval = setInterval(() => {
        // Removed excessive logging to prevent console spam
        // Only log critical issues, not every status check

        if (localVideoTrack && remoteUsers.length > 0 && remoteUsers[0]?.videoTrack) {
          console.log('  ✅ BOTH VIDEOS ACTIVE - All good!');
        } else {
          console.log('  ⚠️  Video status issue detected');
        }
        console.log('📊 END PERIODIC CHECK\n');
      }, 5000);
    } catch (error) {
      // Silently handle INVALID_PARAMS errors - they're already handled in the join try-catch
      if (error?.message?.includes('INVALID_PARAMS') || error?.message?.includes('64 bytes') || error?.message?.includes('supported characters')) {
        console.log('INVALID_PARAMS error handled automatically, user should be able to join now');
        return; // Don't show error, just return silently
      }

      console.error('Error joining meeting:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      // Provide more specific error messages
      let errorMessage = 'Failed to join meeting';
      let isInfoMessage = false;

      if (error.message?.includes('Invalid App ID') || error.message?.includes('App ID is missing or empty')) {
        errorMessage = 'It may not work first time, please rejoin again';
        isInfoMessage = true;
      } else if (error.message?.includes('permission')) {
        errorMessage = 'Camera or microphone permission denied. Please allow access and try again.';
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Connection timeout. Please try again.';
      } else {
        errorMessage = error.message || 'Failed to join meeting. Please try again.';
      }

      if (isInfoMessage) {
        toast.info(errorMessage);
      } else {
        toast.error(errorMessage);
      }
      setLoading(false);

      // Reset state on error so user can try again
      setShowJoinScreen(true);
      setInCall(false);
    }
  };

  // Helper function to play local video in the correct container
  const playLocalVideo = (track) => {
    if (!track) return;

    // Determine which container to use based on whether remote user exists
    const container = remoteUsers.length > 0
      ? localVideoContainerSmallRef.current
      : localVideoContainerRef.current;

    if (container) {
      try {
        track.play(container);
        console.log('📹 LOCAL VIDEO DISPLAYED in container:', remoteUsers.length > 0 ? 'small' : 'main');
        console.log('  Local video track ID:', track.getTrackId());
        console.log('  Container element:', container);
      } catch (error) {
        console.error('❌ Error playing local video:', error);
        // Retry after a short delay
        setTimeout(() => {
          if (container && track) {
            try {
              track.play(container);
              console.log('📹 LOCAL VIDEO DISPLAYED (retry)');
            } catch (retryError) {
              console.error('❌ Error playing local video (retry):', retryError);
            }
          }
        }, 500);
      }
    } else {
      console.warn('⚠️ Local video container not available yet');
      // Retry after a short delay
      setTimeout(() => playLocalVideo(track), 500);
    }
  };

  // Toggle video
  const toggleVideo = async () => {
    console.log('\n📹 TOGGLE VIDEO REQUEST:');
    console.log('  Current state:', { hasVideoTrack: !!localVideoTrack, isVideoEnabled });
    console.log('  Timestamp:', new Date().toISOString());

    if (localVideoTrack) {
      // Disable video
      console.log('  Action: DISABLING video');
      try {
        if (clientRef.current) {
          await clientRef.current.unpublish([localVideoTrack]);
          console.log('  ✓ Video track unpublished from channel');
        }
        localVideoTrack.stop();
        localVideoTrack.close();
        setLocalVideoTrack(null);
        setIsVideoEnabled(false);
        console.log('  ✓ Video track stopped and closed');
        console.log('  ⚠️ NOTE: Video disabled - user is still in call, just camera is off');
        toast.success('Camera turned off');
      } catch (error) {
        console.error('  ❌ Error disabling video:', error);
        toast.error('Failed to disable video');
      }
    } else {
      // Enable video
      console.log('  Action: ENABLING video');
      try {
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        setLocalVideoTrack(videoTrack);
        setIsVideoEnabled(true);
        console.log('  ✓ Video track created');

        // Play in the correct container
        setTimeout(() => {
          playLocalVideo(videoTrack);
        }, 100);

        if (clientRef.current) {
          await clientRef.current.publish([videoTrack]);
          console.log('  ✓ Video track published to channel');
        }
        console.log('  📹 VIDEO ENABLED: Camera is now on');
        toast.success('Camera turned on');
      } catch (error) {
        console.error('  ❌ Error enabling video:', error);
        toast.error('Failed to enable video. Please check camera permissions.');
      }
    }
    console.log('📹 END TOGGLE VIDEO REQUEST\n');
  };

  // Socket meeting room and clinical updates
  useEffect(() => {
    if (socket && appointmentId && inCall) {
      // Join meeting room for clinical updates
      socket.emit('joinMeeting', appointmentId);

      const handleClinicalUpdate = (update) => {
        console.log('🚀 LIVE CLINICAL UPDATE RECEIVED:', update);
        setClinicalUpdates(prev => [update, ...prev]);
        setHasNewUpdate(true);

        // Show a brief toast
        const typeLabels = {
          'NOTE': 'Consultation Note Added',
          'VITAL': 'Vital Signs Recorded',
          'VACCINE': 'Vaccination Recorded',
          'REFERRAL': 'Referral Created',
          'LAB': 'Lab Test Ordered',
          'PRESCRIPTION': 'Prescription Issued'
        };
        toast.info(typeLabels[update.type] || 'New Clinical Update', { position: "top-right", autoClose: 3000 });
      };

      socket.on('clinical_update', handleClinicalUpdate);

      return () => {
        socket.off('clinical_update', handleClinicalUpdate);
      };
    }
  }, [socket, appointmentId, inCall]);

  // Toggle audio
  const toggleAudio = async () => {
    if (localAudioTrack) {
      if (isAudioEnabled) {
        // Mute
        localAudioTrack.setEnabled(false);
        setIsAudioEnabled(false);
      } else {
        // Unmute
        localAudioTrack.setEnabled(true);
        setIsAudioEnabled(true);
      }
    }
  };

  // Share screen
  const shareScreen = async () => {
    try {
      if (isScreenSharing) {
        // Stop sharing
        if (screenTrack) {
          await clientRef.current?.unpublish([screenTrack]);
          screenTrack.close();
          setScreenTrack(null);
          setIsScreenSharing(false);

          // Resume camera if video was enabled before screen share
          if (wasVideoEnabledBeforeScreenShare) {
            try {
              const videoTrack = await AgoraRTC.createCameraVideoTrack();
              setLocalVideoTrack(videoTrack);
              setIsVideoEnabled(true);
              setTimeout(() => {
                playLocalVideo(videoTrack);
              }, 100);
              await clientRef.current?.publish([videoTrack]);
            } catch (error) {
              console.error('Error resuming video:', error);
            }
          }
          setWasVideoEnabledBeforeScreenShare(false);
        }
      } else {
        // Start sharing
        const screenVideoTrack = await AgoraRTC.createScreenVideoTrack({}, 'auto');
        setScreenTrack(screenVideoTrack);
        setIsScreenSharing(true);

        // Unpublish camera if enabled
        if (localVideoTrack) {
          setWasVideoEnabledBeforeScreenShare(true);
          await clientRef.current?.unpublish([localVideoTrack]);
          localVideoTrack.stop();
          localVideoTrack.close();
          setLocalVideoTrack(null);
        } else {
          setWasVideoEnabledBeforeScreenShare(false);
        }

        // Publish screen
        await clientRef.current?.publish([screenVideoTrack]);

        // Play screen in local container
        if (localVideoContainerRef.current) {
          screenVideoTrack.play(localVideoContainerRef.current);
        }

        // Handle screen track ended
        screenVideoTrack.on('track-ended', () => {
          shareScreen(); // Stop sharing when user stops
        });
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast.error('Failed to share screen');
    }
  };

  // Display local video when track or remote users change
  useEffect(() => {
    if (localVideoTrack) {
      playLocalVideo(localVideoTrack);
    }
  }, [localVideoTrack, remoteUsers.length]);

  // Display remote video
  useEffect(() => {
    const remoteContainer = remoteVideoContainerRef.current;
    if (!remoteContainer) {
      console.warn('⚠️ Remote video container not available');
      return;
    }

    console.log('\n📹 REMOTE VIDEO DISPLAY UPDATE:');
    console.log('  Remote users count:', remoteUsers.length);
    console.log('  Timestamp:', new Date().toISOString());

    if (remoteUsers.length > 0) {
      const remoteUser = remoteUsers[0];
      console.log('  Remote user UID:', remoteUser.uid);
      console.log('  Has video track:', !!remoteUser.videoTrack);
      console.log('  Has audio track:', !!remoteUser.audioTrack);
      console.log('  Video track enabled:', remoteUser.videoTrack?.isPlaying || false);

      // Clear container
      remoteContainer.innerHTML = '';

      if (remoteUser.videoTrack) {
        try {
          remoteUser.videoTrack.play(remoteContainer);
          console.log('  ✓ Remote video track is now playing');
          console.log('  📺 VIDEO DISPLAYED: Remote user video is visible');
        } catch (error) {
          console.error('  ❌ Error playing remote video:', error);
        }
      } else {
        console.log('  ⚠️ Remote user has no video track - showing avatar');
        // Show avatar if no video
        remoteContainer.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-white">
            <div class="w-24 h-24 roun-full bg-gray-700 flex items-center justify-center mb-4">
              <span class="text-3xl">${otherUserName ? otherUserName.charAt(0).toUpperCase() : '?'}</span>
            </div>
            <p class="text-lg">${otherUserName || 'Participant'}</p>
            <p class="text-sm text-gray-400">Camera off</p>
          </div>
        `;
      }
    } else {
      console.log('  ⚠️ No remote users - waiting for participant');
      // No remote users
      remoteContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-white">
          <div class="w-24 h-24 roun-full bg-gray-700 flex items-center justify-center mb-4">
            <span class="text-3xl">${otherUserName ? otherUserName.charAt(0).toUpperCase() : '?'}</span>
          </div>
          <p class="text-lg">${otherUserName || 'Waiting for participant...'}</p>
        </div>
      `;
    }
    console.log('📹 END REMOTE VIDEO DISPLAY UPDATE\n');
  }, [remoteUsers, otherUserName]);

  // Restore meeting connection
  const restoreMeeting = async () => {
    if (!storedMeeting) return;

    try {
      setLoading(true);
      console.log('Restoring meeting connection...');

      // Create Agora client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Recreate local tracks based on stored state
      let audioTrack = null;
      let videoTrack = null;

      // Try to restore video if it was enabled
      if (storedMeeting.hasVideo) {
        try {
          [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
            { microphoneId: undefined },
            { cameraId: undefined }
          );
          setLocalAudioTrack(audioTrack);
          setLocalVideoTrack(videoTrack);
          setIsVideoEnabled(true);
          setIsAudioEnabled(true);

          if (audioTrack) audioTrack.setEnabled(true);
          if (videoTrack) videoTrack.setEnabled(true);

          console.log('Video and audio tracks restored');
        } catch (error) {
          console.error('Error restoring video tracks:', error);
          // Fallback to audio only
          try {
            audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            setLocalAudioTrack(audioTrack);
            setIsVideoEnabled(false);
            setIsAudioEnabled(true);
            if (audioTrack) audioTrack.setEnabled(true);
            console.log('Audio track restored (video failed)');
          } catch (audioError) {
            console.error('Error restoring audio track:', audioError);
          }
        }
      } else {
        // Audio only
        try {
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          setLocalAudioTrack(audioTrack);
          setIsVideoEnabled(false);
          setIsAudioEnabled(true);
          if (audioTrack) audioTrack.setEnabled(true);
          console.log('Audio track restored');
        } catch (error) {
          console.error('Error restoring audio track:', error);
        }
      }

      // Play local video if available - will be handled by useEffect
      if (videoTrack) {
        console.log('Local video track restored, will display in container');
        setTimeout(() => {
          playLocalVideo(videoTrack);
        }, 100);
      }

      // Add event listeners
      client.on('connection-state-change', (curState, revState) => {
        console.log('Connection state changed:', { curState, revState });
      });

      client.on('user-joined', (user) => {
        console.log('User joined:', user.uid);
      });

      client.on('user-left', (user) => {
        console.log('User left:', user.uid);
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      client.on('user-published', async (user, mediaType) => {
        console.log('📹 USER PUBLISHED EVENT (RESTORE):', {
          uid: user.uid,
          mediaType,
          hasVideoTrack: !!user.videoTrack,
          hasAudioTrack: !!user.audioTrack,
          timestamp: new Date().toISOString()
        });
        try {
          await client.subscribe(user, mediaType);
          console.log('✓ Subscribed to user (RESTORE):', { uid: user.uid, mediaType });

          if (mediaType === 'video') {
            console.log('📹 Adding remote video user to state (RESTORE):', user.uid);
            setRemoteUsers((prev) => {
              const newUsers = !prev.find((u) => u.uid === user.uid)
                ? [...prev, user]
                : prev;
              console.log('📊 Remote users count (RESTORE):', newUsers.length);
              console.log('📊 Remote users UIDs (RESTORE):', newUsers.map(u => u.uid));
              return newUsers;
            });
          }

          if (mediaType === 'audio') {
            console.log('🔊 Playing remote audio for user (RESTORE):', user.uid);
            if (user.audioTrack) {
              user.audioTrack.play();
              console.log('✓ Remote audio playing (RESTORE)');
            }
          }
        } catch (error) {
          console.error('❌ Error subscribing to user (RESTORE):', error);
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        console.log('📹 USER UNPUBLISHED EVENT (RESTORE):', {
          uid: user.uid,
          mediaType,
          timestamp: new Date().toISOString()
        });
        if (mediaType === 'video') {
          console.log('⚠️ Removing remote video user from state (RESTORE):', user.uid);
          setRemoteUsers((prev) => {
            const newUsers = prev.filter((u) => u.uid !== user.uid);
            console.log('📊 Remote users count after removal (RESTORE):', newUsers.length);
            console.log('📊 Remaining remote users UIDs (RESTORE):', newUsers.map(u => u.uid));
            return newUsers;
          });
        }
      });

      // Skip channel name validation - backend handles it, let Agora validate
      // Rejoin channel
      console.log('Rejoining channel:', { appId: storedMeeting.appId, channelName: storedMeeting.channelName, uid: storedMeeting.uid });

      // Validate appId before rejoining
      if (!storedMeeting.appId || typeof storedMeeting.appId !== 'string' || storedMeeting.appId.trim() === '') {
        throw new Error('Invalid App ID: App ID is missing or empty');
      }

      // Validate appId contains only ASCII characters
      if (!/^[\x00-\x7F]+$/.test(storedMeeting.appId)) {
        throw new Error('Invalid App ID: App ID contains non-ASCII characters');
      }

      // Validate appId length
      if (storedMeeting.appId.length < 1 || storedMeeting.appId.length > 2047) {
        throw new Error('Invalid App ID: App ID length must be between 1 and 2047 characters');
      }

      // Use null if token is empty or undefined
      let tokenToUse = storedMeeting.token && storedMeeting.token.trim() !== '' ? storedMeeting.token : null;
      let currentChannelName = storedMeeting.channelName;
      let currentToken = storedMeeting.token;
      let currentUid = storedMeeting.uid;

      // Try to rejoin with error handling for invalid channel name
      try {
        await client.join(storedMeeting.appId, currentChannelName, tokenToUse, currentUid);
        console.log('Successfully rejoined channel');
      } catch (joinError) {
        // Catch INVALID_PARAMS error and automatically fix it
        if (joinError?.message?.includes('INVALID_PARAMS') || joinError?.message?.includes('64 bytes') || joinError?.message?.includes('supported characters')) {
          console.warn('Stored channel name validation error detected, requesting new token with fixed channel name...');

          // Clear stored meeting to force new token request
          clearStoredMeeting();

          // Request a new token (backend will generate a valid channel name)
          const retryTokenResult = await getToken();
          if (retryTokenResult.success) {
            // Retry join with new channel name
            currentChannelName = retryTokenResult.data?.channelName || currentChannelName;
            currentToken = retryTokenResult.data?.token && retryTokenResult.data.token.trim() !== '' ? retryTokenResult.data.token : null;
            currentUid = retryTokenResult.data?.uid || currentUid;
            tokenToUse = currentToken && currentToken.trim() !== '' ? currentToken : null;

            console.log('Retrying rejoin with fixed channel name:', currentChannelName);
            await client.join(storedMeeting.appId, currentChannelName, tokenToUse, currentUid);
            console.log('✓ Successfully rejoined channel with fixed channel name');

            // Update state with new values
            setChannelName(currentChannelName);
            setAgoraToken(currentToken);
            setUid(currentUid);
          } else {
            throw joinError; // Re-throw if token request fails
          }
        } else {
          throw joinError; // Re-throw other errors
        }
      }

      // Publish tracks
      const tracksToPublish = [];
      if (audioTrack) tracksToPublish.push(audioTrack);
      if (videoTrack) tracksToPublish.push(videoTrack);

      if (tracksToPublish.length > 0) {
        console.log('Republishing tracks:', tracksToPublish.length);
        await client.publish(tracksToPublish);
        console.log('Successfully republished tracks');
      }

      setInCall(true);
      setLoading(false);
      console.log('Meeting restored successfully');
    } catch (error) {
      console.error('Error restoring meeting:', error);

      // Check if it's an App ID error and show info message instead
      if (error.message?.includes('Invalid App ID') || error.message?.includes('App ID is missing or empty')) {
        toast.info('It may not work first time, please rejoin again');
      } else {
        toast.error('Failed to restore meeting. Please rejoin.');
      }

      setLoading(false);
      setShowJoinScreen(true);
      setInCall(false);
      clearStoredMeeting();
    }
  };

  // Restore meeting on mount if stored
  useEffect(() => {
    if (storedMeeting && !showJoinScreen) {
      console.log('Restoring meeting from storage:', storedMeeting);
      // Restore meeting connection
      restoreMeeting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup - only on unmount, not on every render
  useEffect(() => {
    return () => {
      // Only cleanup if explicitly leaving (not on page reload)
      // The cleanup will happen in leaveMeeting function
    };
  }, []);

  // Leave meeting
  const leaveMeeting = async () => {
    try {
      console.log('Leaving meeting...');

      // Clear stored meeting data
      clearStoredMeeting();

      // Stop all tracks
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
      if (screenTrack) {
        screenTrack.stop();
        screenTrack.close();
        setScreenTrack(null);
      }

      // Leave channel
      if (clientRef.current) {
        try {
          await clientRef.current.leave();
          clientRef.current.removeAllListeners();
          clientRef.current = null;
          console.log('Left Agora channel');
        } catch (error) {
          console.error('Error leaving channel:', error);
        }
      }

      // Notify backend
      if (appointmentId) {
        try {
          const endpoint = role === 'doctor'
            ? '/api/doctor/video-call/end'
            : '/api/user/video-call/end';
          const headers = role === 'doctor'
            ? { dToken: token }
            : { token };

          await axios.post(
            backendUrl + endpoint,
            { appointmentId },
            { headers }
          );
          console.log('Backend notified of call end');
        } catch (error) {
          console.error('Error notifying backend:', error);
        }
      }

      // Reset state
      setInCall(false);
      setShowJoinScreen(true);
      setChannelName('');
      setAppId('');
      setAgoraToken('');
      setUid(null);
      setRemoteUsers([]);
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
      setIsScreenSharing(false);

      console.log('Meeting left successfully');

      if (onEndCall) {
        onEndCall();
      }
    } catch (error) {
      console.error('Error leaving meeting:', error);
    }
  };

  // Join screen
  if (showJoinScreen) {
    return createPortal(
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-[9999] m-0 p-0">
        <div className="bg-primary-light roun-lg p-8 max-w-md w-full mx-4 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
            Ready to join?
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-4 border roun-lg cursor-pointer hover:bg-gray-50"
              onClick={() => setJoinWithVideo(true)}>
              <div className={`w-5 h-5 roun-full border-2 flex items-center justify-center ${joinWithVideo ? 'border-[#006838] bg-[#006838]' : 'border-gray-300'
                }`}>
                {joinWithVideo && <div className="w-2 h-2 roun-full bg-white"></div>}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Join with video</p>
                <p className="text-sm text-gray-500">Camera and microphone will be on</p>
              </div>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="flex items-center gap-3 p-4 border roun-lg cursor-pointer hover:bg-gray-50"
              onClick={() => setJoinWithVideo(false)}>
              <div className={`w-5 h-5 roun-full border-2 flex items-center justify-center ${!joinWithVideo ? 'border-[#006838] bg-[#006838]' : 'border-gray-300'
                }`}>
                {!joinWithVideo && <div className="w-2 h-2 roun-full bg-white"></div>}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Join with audio only</p>
                <p className="text-sm text-gray-500">Only microphone will be on</p>
              </div>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (onEndCall) onEndCall();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 roun-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={joinMeeting}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#006838] hover:bg-[#004d2a] text-white roun-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join now'}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Meeting interface
  return createPortal(
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-[9999] m-0 p-0">
      <div className="flex-1 flex overflow-hidden">
        {/* Main video area */}
        <div className="flex-1 relative flex items-center justify-center p-4">
          {/* Split view when both users are present, otherwise show local video prominently */}
          {remoteUsers.length > 0 ? (
            <>
              {/* Remote video (main) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  ref={remoteVideoContainerRef}
                  id="remote-player-container"
                  className="w-full h-full bg-gray-800 roun-lg"
                ></div>
              </div>

              {/* Local video (small, top-right) */}
              {localVideoTrack && (
                <div className="absolute top-4 right-4 w-64 h-48 bg-gray-900 roun-lg overflow-hidden shadow-lg border-2 border-white z-10">
                  <div
                    ref={localVideoContainerSmallRef}
                    id="local-player-small"
                    className="w-full h-full object-cover bg-black"
                  ></div>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 roun text-xs">
                    You
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Show local video prominently when no remote user */}
              {localVideoTrack ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative w-full max-w-4xl h-full max-h-[80vh] bg-gray-800 roun-lg overflow-hidden shadow-xl">
                    <div
                      ref={localVideoContainerRef}
                      id="local-player"
                      className="w-full h-full object-cover"
                    ></div>
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 roun text-sm font-medium">
                      You (Waiting for participant...)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    ref={remoteVideoContainerRef}
                    id="remote-player-container"
                    className="w-full h-full bg-gray-800 roun-lg"
                  ></div>
                </div>
              )}
            </>
          )}

          {/* Screen share indicator */}
          {isScreenSharing && (
            <div className="absolute top-4 left-4 bg-[#006838] text-white px-3 py-1 roun-full text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              You're presenting
            </div>
          )}

          {/* Clinical Feed Panel Overlay (for mobile/small screens) or Side Panel */}
          {showClinicalFeed && (
            <div className="absolute top-4 left-4 bottom-4 w-72 bg-white/95 backdrop-blur shadow-2xl roun-xl z-20 flex flex-col overflow-hidden border border-gray-200">
              <div className="p-3 bg-[#006838] text-white flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                  Live Consultation
                </h3>
                <button onClick={() => setShowClinicalFeed(false)} className="text-white/70 hover:text-white">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {clinicalUpdates.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-4">
                    <p className="text-sm text-gray-500">Live updates from your doctor will appear here during the meeting.</p>
                  </div>
                ) : (
                  clinicalUpdates.map((update, idx) => (
                    <div key={idx} className="bg-gray-50 roun-lg p-3 border-l-4 border-[#006838] shadow-sm animate-fade-in">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-black text-[#006838] uppercase tracking-tighter">
                          {update.type}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700 font-medium">
                        {update.type === 'PRESCRIPTION' && (
                          <div>
                            <p className="font-bold text-purple-700">New Prescription Issued</p>
                            <ul className="mt-1 list-disc list-inside opacity-80">
                              {update.data.medications.map((m, i) => <li key={i}>{m.name}</li>)}
                            </ul>
                          </div>
                        )}
                        {update.type === 'LAB' && (
                          <div>
                            <p className="font-bold text-blue-700">Lab Test Ordered</p>
                            <p className="mt-1">{update.data.testName}</p>
                          </div>
                        )}
                        {update.type === 'NOTE' && (
                          <div>
                            <p className="font-bold text-green-700">Clinical Note Saved</p>
                            <p className="mt-1 line-clamp-2 italic">"{update.data.diagnosis[0]?.description}"</p>
                          </div>
                        )}
                        {update.type === 'VITAL' && (
                          <div>
                            <p className="font-bold text-orange-700">Vital Recorded</p>
                            <p className="mt-1">{update.data.type}: {update.data.value} {update.data.unit}</p>
                          </div>
                        )}
                        {update.type === 'REFERRAL' && (
                          <div>
                            <p className="font-bold text-blue-500">Facility Referral Created</p>
                            <p className="mt-1">Hospital: {update.data.toHospital}</p>
                          </div>
                        )}
                        {update.type === 'VACCINE' && (
                          <div>
                            <p className="font-bold text-orange-600">Vaccination Recorded</p>
                            <p className="mt-1">{update.data.vaccineName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-[#081828] py-4 px-6">
        <div className="flex items-center justify-center gap-4">
          {/* Microphone toggle */}
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 roun-full flex items-center justify-center transition-all ${isAudioEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>

          {/* Camera toggle */}
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 roun-full flex items-center justify-center transition-all ${isVideoEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            )}
          </button>

          {/* Screen share */}
          <button
            onClick={shareScreen}
            className={`w-12 h-12 roun-full flex items-center justify-center transition-all ${isScreenSharing
              ? 'bg-[#006838] hover:bg-[#004d2a] text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-12 h-12 roun-full flex items-center justify-center transition-all ${showSettings
              ? 'bg-[#006838] hover:bg-[#004d2a] text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            title="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Clinical Feed Toggle */}
          <button
            onClick={() => {
              setShowClinicalFeed(!showClinicalFeed);
              setHasNewUpdate(false);
            }}
            className={`w-12 h-12 roun-full flex items-center justify-center transition-all relative ${showClinicalFeed
              ? 'bg-[#006838] hover:bg-[#004d2a] text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            title="Clinical History"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            {hasNewUpdate && !showClinicalFeed && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] items-center justify-center text-white">!</span>
              </span>
            )}
          </button>

          {/* Leave call */}
          <button
            onClick={leaveMeeting}
            className="w-12 h-12 roun-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all"
            title="Leave call"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Clinical Tools (Doctor Only) */}
          {role === 'doctor' && (
            <div className="flex items-center gap-2 border-l border-gray-600 pl-4 ml-2">
              <button
                onClick={onShowNotes}
                className="w-10 h-10 roun-lg bg-green-600 hover:bg-green-700 text-white flex flex-col items-center justify-center transition-all"
                title="Clinical Notes"
              >
                <div className="text-[10px] font-bold uppercase leading-none mb-0.5">Note</div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </button>
              <button
                onClick={onShowRx}
                className="w-10 h-10 roun-lg bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center justify-center transition-all"
                title="Prescription (Rx)"
              >
                <div className="text-[10px] font-bold uppercase leading-none mb-0.5">Rx</div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.96l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-.547-1.022z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.828 11.172a4 4 0 10-5.656 0 4 4 0 005.656 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.828 11.172l4.243 4.243m-4.243-4.243l-4.243-4.243" /></svg>
              </button>
              <button
                onClick={onShowLab}
                className="w-10 h-10 roun-lg bg-[#006838] hover:bg-[#004d2a] text-white flex flex-col items-center justify-center transition-all"
                title="Lab Order"
              >
                <div className="text-[10px] font-bold uppercase leading-none mb-0.5">Lab</div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.96l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-.547-1.022z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.828 11.172a4 4 0 10-5.656 0 4 4 0 005.656 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.828 11.172l4.243 4.243m-4.243-4.243l-4.243-4.243" /></svg>
              </button>
              <button
                onClick={onShowRefer}
                className="w-10 h-10 roun-lg bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center transition-all"
                title="Referral"
              >
                <div className="text-[10px] font-bold uppercase leading-none mb-0.5">Ref</div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </button>
              <button
                onClick={onShowVaccine}
                className="w-10 h-10 roun-lg bg-orange-600 hover:bg-orange-700 text-white flex flex-col items-center justify-center transition-all"
                title="Vaccine"
              >
                <div className="text-[10px] font-bold uppercase leading-none mb-0.5">Vac</div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white roun-lg shadow-2xl p-4 min-w-[300px]">
          <h3 className="font-semibold mb-3 text-gray-800">Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Camera</span>
              <select className="border roun px-2 py-1 text-sm">
                <option>Default Camera</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Microphone</span>
              <select className="border roun px-2 py-1 text-sm">
                <option>Default Microphone</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Speaker</span>
              <select className="border roun px-2 py-1 text-sm">
                <option>Default Speaker</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default MeetingPage;

