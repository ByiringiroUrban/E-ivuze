import agoraToken from 'agora-token';
import appointmentModel from '../models/appointmentModel.js';

const { RtcTokenBuilder, RtcRole } = agoraToken;

// API to generate Agora token for video call
const generateVideoToken = async (req, res) => {
  // Force immediate log output
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('=== VIDEO CALL TOKEN REQUEST RECEIVED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('='.repeat(80));

  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));

    const { appointmentId, role } = req.body; // role: 'patient' or 'doctor'
    // Get userId from middleware (authUser sets req.body.userId, authDoctor sets req.body.docId)
    const userId = req.body.userId || req.body.docId;

    console.log('Extracted data:', { appointmentId, role, userId });

    if (!appointmentId || !userId) {
      console.error('Missing required fields:', { appointmentId, userId });
      return res.json({ success: false, message: 'Missing required fields' });
    }

    // Get appointment details
    const appointment = await appointmentModel.findById(appointmentId);
    console.log('Appointment found:', appointment ? 'Yes' : 'No');
    if (appointment) {
      console.log('Appointment details:', {
        appointmentId: appointment._id,
        userId: appointment.userId,
        docId: appointment.docId,
        videoCallChannel: appointment.videoCallChannel,
        videoCallActive: appointment.videoCallActive
      });
    }

    if (!appointment) {
      console.error('Appointment not found for ID:', appointmentId);
      return res.json({ success: false, message: 'Appointment not found' });
    }

    // Verify user has access to this appointment
    if (appointment.userId !== userId && appointment.docId !== userId) {
      console.error('Unauthorized access attempt:', {
        appointmentUserId: appointment.userId,
        appointmentDocId: appointment.docId,
        requestUserId: userId
      });
      return res.json({ success: false, message: 'Unauthorized access' });
    }

    // Check if appointment is approved
    if (appointment.approvalStatus !== 'approved') {
      console.error('Appointment not approved:', {
        appointmentId,
        approvalStatus: appointment.approvalStatus
      });
      return res.json({
        success: false,
        message: appointment.approvalStatus === 'pending'
          ? 'Appointment is pending doctor approval. Please wait for approval before joining the meeting.'
          : 'Appointment has been rejected. Cannot join the meeting.'
      });
    }

    // Check payment status (only for patients)
    if (role === 'patient') {
      if (appointment.paymentStatus !== 'approved' && !appointment.payment) {
        console.error('Payment not approved for patient:', {
          appointmentId,
          paymentStatus: appointment.paymentStatus,
          payment: appointment.payment
        });
        return res.json({
          success: false,
          message: 'Payment is required before joining the meeting. Please complete payment first.',
          requiresPayment: true
        });
      }
    }

    // Get Agora credentials from environment variables
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    console.log('Agora credentials check:', {
      appId: appId ? `${appId.substring(0, 10)}...` : 'NOT SET',
      appCertificate: appCertificate ? `${appCertificate.substring(0, 10)}...` : 'NOT SET'
    });

    // Validate appId - must be a non-empty string with ASCII characters only
    if (!appId || typeof appId !== 'string' || appId.trim() === '') {
      console.error('Agora App ID missing or invalid');
      return res.json({
        success: false,
        message: 'Agora App ID not configured. Please set AGORA_APP_ID in .env file'
      });
    }

    // Validate appId contains only ASCII characters
    if (!/^[\x00-\x7F]+$/.test(appId)) {
      console.error('Agora App ID contains non-ASCII characters');
      return res.json({
        success: false,
        message: 'Agora App ID contains invalid characters. Only ASCII characters are allowed.'
      });
    }

    // Validate appId length (1-2047 characters as per Agora requirements)
    if (appId.length < 1 || appId.length > 2047) {
      console.error('Agora App ID length invalid:', appId.length);
      return res.json({
        success: false,
        message: 'Agora App ID length must be between 1 and 2047 characters.'
      });
    }

    if (!appCertificate || typeof appCertificate !== 'string' || appCertificate.trim() === '') {
      console.error('Agora App Certificate missing or invalid');
      return res.json({
        success: false,
        message: 'Agora App Certificate not configured. Please set AGORA_APP_CERTIFICATE in .env file'
      });
    }

    // 1. Get or create the unique channel name from the database
    let channelName = appointment.videoCallChannel;

    if (!channelName) {
      // Create a unique, permanent channel name for this appointment
      // Format: apt + 12 chars of ID = 15 chars (very safe for Agora's 64 byte limit)
      const appointmentIdHash = appointment._id.toString().replace(/[^a-zA-Z0-9]/g, '').slice(-12);
      channelName = `apt${appointmentIdHash}`;

      console.log(`🆕 Creating fresh channel name in DB: ${channelName}`);

      // Save it permanently so the other participant will definitely use the SAME one
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        videoCallChannel: channelName,
        videoCallActive: true // Keep call marked as active
      });
    } else {
      console.log(`✅ Using existing channel name from DB: ${channelName}`);
    }

    // Use fixed UIDs for 1-on-1 calls to prevent collisions
    // Doctor = 1, Patient = 2
    const uid = role === 'doctor' ? 1 : 2;

    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTimestamp + expirationTimeInSeconds;

    console.log(`🔑 Token Generation (Fixed UID): Room=${channelName}, UID=${uid}, Role=${role}`);

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpireTime
    );

    // Update appointment status - keep channelName in DB for consistency
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      videoCallActive: true,
      videoCallChannel: channelName
    });


    // Preparation of the response object
    const response = {
      success: true,
      token,
      channelName,
      appId,
      uid: uid
    };

    // Final check: Log all active users in this channel
    const finalCheck = await appointmentModel.find({
      videoCallChannel: channelName,
      videoCallActive: true
    });
    console.log('\n=== FINAL CHANNEL STATUS ===');
    console.log('Total active users in channel:', finalCheck.length);
    console.log('Channel name:', channelName);

    const allUids = [];
    finalCheck.forEach((apt, index) => {
      const aptUserId = apt.userId?.toString() || 'N/A';
      const aptDocId = apt.docId?.toString() || 'N/A';
      const aptUserUid = typeof aptUserId === 'string' ? parseInt(aptUserId.replace(/\D/g, '').slice(-9)) || Math.floor(Math.random() * 1000000) : aptUserId;
      const aptDocUid = typeof aptDocId === 'string' ? parseInt(aptDocId.replace(/\D/g, '').slice(-9)) || Math.floor(Math.random() * 1000000) : aptDocId;

      if (apt.userId) allUids.push({ type: 'patient', uid: aptUserUid, userId: aptUserId });
      if (apt.docId) allUids.push({ type: 'doctor', uid: aptDocUid, userId: aptDocId });

      console.log(`  User ${index + 1}:`, {
        appointmentId: apt._id,
        isPatient: apt.userId ? 'Yes' : 'No',
        isDoctor: apt.docId ? 'Yes' : 'No',
        patientUID: apt.userId ? aptUserUid : 'N/A',
        doctorUID: apt.docId ? aptDocUid : 'N/A',
        currentUserUID: apt.userId === userId ? aptUserUid : (apt.docId === userId ? aptDocUid : 'N/A')
      });
    });

    console.log('\n📊 ALL UIDs IN CHANNEL:');
    allUids.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.type.toUpperCase()}: UID ${u.uid} (userId: ${u.userId})`);
    });

    if (allUids.length === 2) {
      const patientUid = allUids.find(u => u.type === 'patient')?.uid;
      const doctorUid = allUids.find(u => u.type === 'doctor')?.uid;
      console.log('\n✅✅✅ BOTH USERS IN CHANNEL - BOTH VIDEOS SHOULD BE VISIBLE! ✅✅✅');
      console.log('   📹 Patient UID:', patientUid);
      console.log('   📹 Doctor UID:', doctorUid);
      console.log('   ✅ UIDs are different - both videos should display correctly!');
      console.log('   📊 Expected behavior:');
      console.log('      - Patient should see doctor\'s video');
      console.log('      - Doctor should see patient\'s video');
      console.log('      - Both should see their own video in preview');
    } else if (allUids.length === 1) {
      console.log('\n⚠️  ONLY ONE USER IN CHANNEL - Waiting for other participant...');
      console.log('   Current user:', allUids[0].type, 'UID:', allUids[0].uid);
      console.log('   ⚠️  Only one video will be visible until the other user joins');
    } else {
      console.log('\n⚠️  NO USERS IN CHANNEL - This should not happen!');
    }

    console.log('=== END FINAL CHANNEL STATUS ===\n');


    console.log('Sending response:', {
      success: response.success,
      channelName: response.channelName,
      appId: response.appId ? `${response.appId.substring(0, 10)}...` : 'MISSING',
      appIdLength: response.appId ? response.appId.length : 0,
      uid: response.uid,
      tokenLength: response.token.length,
      role: role,
      userId: userId
    });

    // Double-check appId is included in response
    if (!response.appId || response.appId.trim() === '') {
      console.error('ERROR: appId is missing or empty in response!');
      return res.json({
        success: false,
        message: 'Agora App ID is missing. Please set AGORA_APP_ID in backend/.env file and restart the server.'
      });
    }

    // Log warning if UID might conflict (exclude current user's UID from check)
    if (finalCheck.length > 0) {
      const allUidsInChannel = [];
      finalCheck.forEach(apt => {
        const aptUserId = apt.userId?.toString() || '';
        const aptDocId = apt.docId?.toString() || '';
        const aptUid = typeof aptUserId === 'string' ? parseInt(aptUserId.replace(/\D/g, '').slice(-9)) || Math.floor(Math.random() * 1000000) : aptUserId;
        const aptDocUid = typeof aptDocId === 'string' ? parseInt(aptDocId.replace(/\D/g, '').slice(-9)) || Math.floor(Math.random() * 1000000) : aptDocId;

        // Only add UIDs that are NOT the current user's UID
        if (aptUid && aptUid !== uid) {
          allUidsInChannel.push({ type: 'patient', uid: aptUid, userId: aptUserId });
        }
        if (aptDocUid && aptDocUid !== uid) {
          allUidsInChannel.push({ type: 'doctor', uid: aptDocUid, userId: aptDocId });
        }
      });

      const existingUids = allUidsInChannel.map(u => u.uid);

      if (existingUids.some(existingUid => existingUid === uid)) {
        console.warn('\n⚠️  WARNING: UID CONFLICT DETECTED!');
        console.warn('  New UID:', uid);
        console.warn('  Existing UIDs (excluding current user):', existingUids);
        console.warn('  ⚠️  This UID is already in use in the channel.');
        console.warn('  ⚠️  This may cause video display issues - only one video will show!');
        console.warn('  ⚠️  SOLUTION: Ensure each user has a unique UID.\n');
      } else {
        console.log('\n✓ UID CHECK PASSED:');
        console.log('  Current user UID:', uid);
        console.log('  Other users in channel:', existingUids.length);
        if (existingUids.length > 0) {
          console.log('  Other UIDs:', existingUids);
          console.log('  ✓ UID is unique - both videos should display correctly!');
        } else {
          console.log('  ✓ First user in channel - waiting for other participant...');
        }
        console.log('');
      }
    } else {
      console.log('\n✓ FIRST USER IN CHANNEL:');
      console.log('  UID:', uid);
      console.log('  Waiting for other participant to join...\n');
    }

    console.log('=== END VIDEO CALL TOKEN REQUEST ===\n');

    res.json(response);

  } catch (error) {
    console.error('=== ERROR GENERATING VIDEO TOKEN ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END ERROR ===\n');
    res.json({ success: false, message: error.message });
  }
};

// API to end video call
const endVideoCall = async (req, res) => {
  // Force immediate log output
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('=== END VIDEO CALL REQUEST RECEIVED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('='.repeat(80));

  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));

    const { appointmentId } = req.body;
    const userId = req.body.userId || req.body.docId;
    const role = req.body.role || (req.body.userId ? 'patient' : 'doctor');

    if (!appointmentId) {
      console.error('Missing appointmentId');
      return res.json({ success: false, message: 'Missing appointmentId' });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    console.log('Appointment found:', appointment ? 'Yes' : 'No');

    if (appointment) {
      console.log('Appointment details before update:', {
        appointmentId: appointment._id,
        videoCallChannel: appointment.videoCallChannel,
        videoCallActive: appointment.videoCallActive,
        userId: appointment.userId,
        docId: appointment.docId
      });

      // Check if other user is still in the call
      const otherAppointments = await appointmentModel.find({
        videoCallChannel: appointment.videoCallChannel,
        videoCallActive: true,
        _id: { $ne: appointmentId }
      });

      console.log('Other active users in same channel:', otherAppointments.length);
      if (otherAppointments.length > 0) {
        console.log('⚠️  WARNING: Other user(s) still in call:', {
          channel: appointment.videoCallChannel,
          remainingUsers: otherAppointments.map(apt => ({
            appointmentId: apt._id,
            userId: apt.userId,
            docId: apt.docId
          }))
        });
      }
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      videoCallActive: false
    });

    console.log('Video call ended for appointment:', {
      appointmentId,
      userId,
      role,
      channel: appointment?.videoCallChannel,
      timestamp: new Date().toISOString()
    });
    console.log('=== END VIDEO CALL REQUEST ===\n');

    res.json({ success: true, message: 'Video call ended' });

  } catch (error) {
    console.error('=== ERROR ENDING VIDEO CALL ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END ERROR ===\n');
    res.json({ success: false, message: error.message });
  }
};

// Serve video call HTML page
const serveVideoCallPage = async (req, res) => {
  try {
    const { appId, channel, token, uid, role } = req.query;

    console.log('📄 SERVING VIDEO CALL HTML PAGE');
    console.log('  App ID:', appId?.substring(0, 10) + '...');
    console.log('  Channel:', channel);
    console.log('  UID:', uid);
    console.log('  Role:', role);

    if (!appId || !channel || !uid) {
      return res.status(400).send('Missing required parameters: appId, channel, uid');
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Video Consultation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
        width: 100vw; height: 100vh; 
        overflow: hidden; 
        background: #0f172a; 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
    }
    #remote-video { 
        width: 100%; height: 100%; 
        background: #020617;
        object-fit: cover;
    }
    #remote-video video { object-fit: cover !important; }

    #local-video-container { 
        position: absolute; 
        top: 60px; right: 20px; 
        width: 110px; height: 160px; 
        border-radius: 16px; 
        border: 2px solid rgba(255,255,255,0.2); 
        overflow: hidden; 
        z-index: 100;
        background: #1e293b;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        transition: all 0.3s ease;
    }
    #local-video { width: 100%; height: 100%; }
    #local-video video { object-fit: cover !important; }

    #controls { 
        position: absolute; 
        bottom: 40px; left: 0; right: 0; 
        display: flex; justify-content: center; gap: 24px; 
        z-index: 100; 
    }
    .btn { 
        width: 60px; height: 60px; 
        border-radius: 30px; 
        border: none; 
        background: rgba(255,255,255,0.15); 
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: white; font-size: 24px; 
        cursor: pointer; 
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s active;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    }
    .btn:active { transform: scale(0.9); background: rgba(255,255,255,0.25); }
    .btn.off { background: #ef4444; }

    #status { 
        position: absolute; 
        top: env(safe-area-inset-top, 20px); 
        left: 50%; 
        transform: translateX(-50%);
        color: white; 
        z-index: 100; 
        font-size: 13px; 
        font-weight: 600;
        background: rgba(15, 23, 42, 0.6); 
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        padding: 6px 16px; 
        border-radius: 20px;
        letter-spacing: 0.5px;
        border: 1px solid rgba(255,255,255,0.1);
    }

    #waiting-overlay { 
        position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
        display: flex; flex-direction: column; align-items: center; justify-content: center; 
        color: white; background: #0f172a; z-index: 50;
    }
    .spinner { 
        border: 3px solid rgba(255,255,255,0.1); 
        border-top: 3px solid #3b82f6; 
        border-radius: 50%; width: 45px; height: 45px; 
        animation: spin 1s linear infinite; margin-bottom: 20px; 
    }
    #waiting-overlay p { font-size: 16px; font-weight: 500; color: #94a3b8; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
    <div id="status">CONNECTING...</div>
    <div id="waiting-overlay">
        <div class="spinner"></div>
        <p>Waiting for participant...</p>
    </div>
    <div id="remote-video"></div>
    <div id="local-video-container"><div id="local-video"></div></div>
    <div id="controls">
        <button class="btn" id="toggle-audio" onclick="toggleAudio()">🎤</button>
        <button class="btn" id="toggle-video" onclick="toggleVideo()">📹</button>
    </div>

    <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.24.0.js"></script>
    <script>
        const APP_ID = "${appId}";
        const CHANNEL = "${channel}";
        const TOKEN = "${token || ''}";
        const UID = ${uid};
        
        function log(msg) {
            console.log(msg);
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(String(msg));
            }
        }

        let client, localAudioTrack, localVideoTrack;
        let audioEnabled = true, videoEnabled = true;

        async function init() {
            log("🚀 Starting Video Call Init...");
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    log("❌ CRITICAL: Camera/Mic NOT available");
                    alert("Hardware Blocked: This mobile browser/WebView is blocking the camera. Please use HTTPS or a secure tunnel.");
                    return;
                }
                log("✅ Media devices available");

                client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

                client.on("user-published", async (user, mediaType) => {
                    log("👤 User published: " + user.uid + " - " + mediaType);
                    await client.subscribe(user, mediaType);
                    if (mediaType === "video") {
                        const joinedRole = user.uid === 1 ? 'Doctor' : 'Patient';
                        document.getElementById('status').innerText = joinedRole + " Joined";
                        document.getElementById('waiting-overlay').style.display = 'none';
                        user.videoTrack.play("remote-video");
                    }
                    if (mediaType === "audio") user.audioTrack.play();
                });

                client.on("user-unpublished", (user) => {
                    log("👤 User unpublished: " + user.uid);
                    document.getElementById('waiting-overlay').style.display = 'flex';
                });

                log("🔄 Joining channel: " + CHANNEL);
                await client.join(APP_ID, CHANNEL, TOKEN || null, UID);
                log("✅ Joined channel successfully");

                log("🎙️ Creating microphone and camera tracks...");
                [localAudioTrack, localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
                log("✅ Local tracks created");

                localVideoTrack.play("local-video");
                
                log("📤 Publishing local tracks...");
                await client.publish([localAudioTrack, localVideoTrack]);
                log("✅ Published local tracks");

                document.getElementById('status').innerText = "Connected";
            } catch (e) {
                log("❌ ERROR: " + e.message);
                console.error(e);
                document.getElementById('status').innerText = "Error: " + e.message;
            }
        }

        function toggleAudio() {
            if (localAudioTrack) {
                audioEnabled = !audioEnabled;
                localAudioTrack.setEnabled(audioEnabled);
                const btn = document.getElementById('toggle-audio');
                btn.innerText = audioEnabled ? '🎤' : '🔇';
                btn.classList.toggle('off', !audioEnabled);
                log("🎙️ Audio " + (audioEnabled ? "Enabled" : "Disabled"));
            }
        }

        function toggleVideo() {
            if (localVideoTrack) {
                videoEnabled = !videoEnabled;
                localVideoTrack.setEnabled(videoEnabled);
                const btn = document.getElementById('toggle-video');
                btn.innerText = videoEnabled ? '📹' : '📵';
                btn.classList.toggle('off', !videoEnabled);
                document.getElementById('local-video-container').style.opacity = videoEnabled ? "1" : "0.3";
                log("📹 Video " + (videoEnabled ? "Enabled" : "Disabled"));
            }
        }

        init();
    </script>
</body>
</html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error serving video call page:', error);
    res.status(500).send('Error loading video call page');
  }
};

export { generateVideoToken, endVideoCall, serveVideoCallPage };


