import nodemailer from 'nodemailer';

const getEmailConfig = () => {
  // Default/fallback configuration
  const defaultConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    from: '',
    timeout: 12000,
    retries: 1,
    debug: false
  };

  // Override with environment variables if available
  const host = process.env.EMAIL_HOST || process.env.MAIL_HOST || defaultConfig.host;
  const port = process.env.EMAIL_PORT || process.env.MAIL_PORT || defaultConfig.port;
  const secure = (process.env.EMAIL_SECURE === 'true') || (process.env.MAIL_SECURE === 'true') || defaultConfig.secure;
  const user = process.env.EMAIL_USER || process.env.MAIL_USER || defaultConfig.user;
  const pass = process.env.EMAIL_PASS || process.env.MAIL_PASS || defaultConfig.pass;
  const from = process.env.EMAIL_FROM || process.env.MAIL_FROM || defaultConfig.from;

  const config = {
    host,
    port: port ? parseInt(port, 10) : undefined,
    secure,
    user,
    pass,
    from,
    timeout: process.env.EMAIL_TIMEOUT_MS ? parseInt(process.env.EMAIL_TIMEOUT_MS) : defaultConfig.timeout,
    retries: process.env.EMAIL_RETRIES ? parseInt(process.env.EMAIL_RETRIES) : defaultConfig.retries,
    debug: (process.env.EMAIL_DEBUG === 'true') || defaultConfig.debug
  };

  const isEnvConfigured = Boolean(
    process.env.EMAIL_HOST || process.env.MAIL_HOST ||
    process.env.EMAIL_PORT || process.env.MAIL_PORT ||
    process.env.EMAIL_USER || process.env.MAIL_USER ||
    process.env.EMAIL_PASS || process.env.MAIL_PASS ||
    process.env.EMAIL_FROM || process.env.MAIL_FROM
  );

  console.log('🔧 [EMAIL CONFIG] Loaded configuration:', {
    hasHost: !!config.host,
    hasUser: !!config.user,
    hasPass: !!config.pass,
    hasFrom: !!config.from,
    host: config.host,
    port: config.port,
    user: config.user ? config.user.substring(0, 10) + '...' : 'NOT SET',
    from: config.from,
    secure: config.secure,
    timeout: config.timeout,
    retries: config.retries,
    debug: config.debug,
    source: isEnvConfigured ? 'environment' : 'defaults'
  });

  return config;
};

// Create transporter
const createTransporter = () => {
  const config = getEmailConfig();

  if (!config.host || !config.user || !config.pass) {
    throw new Error('Email service is not configured (missing SMTP host/user/pass). Set MAIL_HOST + MAIL_USER + MAIL_PASS (or EMAIL_HOST + EMAIL_USER + EMAIL_PASS).');
  }

  console.log('📧 [EMAIL TRANSPORTER] Creating transporter with config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.user.substring(0, 10) + '...',
    hasPassword: !!config.pass,
    timeout: config.timeout
  });

  return nodemailer.createTransport({
    host: config.host,
    port: config.port || 587,
    secure: !!config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    },
    // Enhanced timeout and performance configurations
    connectionTimeout: config.timeout || 12000, // Use config timeout (12 seconds default)
    greetingTimeout: 5000,    // 5 seconds
    socketTimeout: 30000,     // 30 seconds
    // Connection pooling for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Debug logging if enabled
    debug: config.debug || false,
    logger: config.debug ? console : false
  });
};

// --- PROFESSIONAL BANNER TEMPLATE ---
// Colors: E-ivuzeBlue (#4A8FBF)
// Header Banner + Clean Content + Footer with Socials
export const getCommonEmailTemplate = (title, message, buttonText = null, buttonLink = null, secondaryMessage = null) => {
  const bannerUrl = "https://i.pinimg.com/originals/ee/84/e6/ee84e6c4f71311cac5b0624e31ea9b51.gif"; // User Provided Banner

  // Social Media Links
  const socials = {
    x: "https://x.com/E-ivuzeC",
    youtube: "https://www.youtube.com/@E-ivuzeconnect",
    linkedin: "https://www.linkedin.com/company/E-ivuze-connect",
    instagram: "https://www.instagram.com/E-ivuzeconnect",
    website: "https://www.E-ivuze.com/"
  };

  // Social Icons (Public CDN)
  const icons = {
    x: "https://cdn-icons-png.flaticon.com/512/5969/5969020.png",
    youtube: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
    linkedin: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
    instagram: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F0F4F8; color: #333333; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #F0F4F8; padding-bottom: 40px; 
          background-image: radial-gradient(#4A8FBF15 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .webkit { max-width: 600px; margin: 0 auto; }
        .outer-table { margin: 0 auto; width: 100%; max-width: 600px; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        
        /* Banner */
        .banner-cell { padding: 0; background-color: #4A8FBF; text-align: center; }
        .banner-img { width: 100%; max-width: 600px; height: auto; display: block; }

        /* Content */
        .content-cell { padding: 40px; }
        .headline { font-size: 22px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .message { font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 30px; }
        
        .btn-container { text-align: center; margin: 35px 0; }
        .btn { background-color: #4A8FBF; color: #FFFFFF; padding: 14px 36px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(74, 143, 191, 0.2); }
        .btn:hover { background-color: #3876A0; transform: translateY(-1px); }

        /* Footer */
        .footer { text-align: center; padding: 30px; background-color: #F8FAFC; color: #888; font-size: 14px; border-top: 1px solid #EEEEEE; }
        .footer a { color: #4A8FBF; text-decoration: none; font-weight: 500; }
        .address { margin: 20px 0; line-height: 1.5; color: #999; }
        .social-icons { margin-top: 15px; }
        .social-icon { width: 24px; height: 24px; margin: 0 10px; vertical-align: middle; opacity: 0.6; transition: opacity 0.2s; }
        .social-icon:hover { opacity: 1; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="webkit">
          <table class="outer-table" role="presentation" border="0" cellpadding="0" cellspacing="0">
            <!-- Banner Image -->
            <tr>
              <td class="banner-cell">
                <img src="${bannerUrl}" alt="E-ivuze" class="banner-img">
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td class="content-cell">
                <div class="headline">${title}</div>
                <div class="message">
                  ${message}
                </div>
                
                ${buttonText && buttonLink ? `
                <div class="btn-container">
                  <a href="${buttonLink}" class="btn">${buttonText}</a>
                </div>
                ` : ''}

                ${secondaryMessage ? `<p style="font-size: 14px; color: #777; margin-top: 25px; border-top: 1px solid #eee; padding-top: 20px;">${secondaryMessage}</p>` : ''}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="footer">
                <p style="margin-bottom: 10px;">Have questions? <a href="${socials.website}">Visit Help Center</a></p>
                
                <div class="address">
                  E-ivuzeConnect<br>
                  Kigali, Rwanda
                </div>

                <div class="social-icons">
                  <a href="${socials.x}"><img src="${icons.x}" alt="X" class="social-icon"></a>
                  <a href="${socials.linkedin}"><img src="${icons.linkedin}" alt="LinkedIn" class="social-icon"></a>
                  <a href="${socials.instagram}"><img src="${icons.instagram}" alt="Instagram" class="social-icon"></a>
                  <a href="${socials.youtube}"><img src="${icons.youtube}" alt="YouTube" class="social-icon"></a>
                </div>
                
                <p style="margin-top: 20px; font-size: 12px; color: #AAA;">
                  © ${new Date().getFullYear()} E-ivuzeConnect.
                </p>
              </td>
            </tr>
          </table>
          
          <div style="text-align: center; padding-top: 20px; color: #999; font-size: 12px;">
            <a href="${socials.website}" style="color: #999; text-decoration: none;">www.E-ivuze.com</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send email function with better error handling and logging
export const sendEmail = async ({ to, subject, html, text }) => {
  console.log('📧 [EMAIL SERVICE] Starting email send process...');
  console.log('📧 [EMAIL SERVICE] To:', to);
  console.log('📧 [EMAIL SERVICE] Subject:', subject);

  const config = getEmailConfig();
  console.log('📧 [EMAIL SERVICE] Email config:', {
    host: config.host,
    port: config.port,
    user: config.user ? config.user.substring(0, 10) + '...' : 'NOT SET',
    from: config.from,
    hasPassword: !!config.pass
  });

  try {
    console.log('📧 [EMAIL SERVICE] Creating transporter...');
    const transporter = createTransporter();
    console.log('📧 [EMAIL SERVICE] Transporter created successfully');

    console.log('📧 [EMAIL SERVICE] Processing HTML content...');

    // Check if html provided is already the full template or just content
    let finalHtml = html;
    if (!html.includes('<!DOCTYPE html>')) {
      console.log('📧 [EMAIL SERVICE] Applying email template...');
      const frontendUrl = process.env.VITE_FRONTEND_URL || process.env.FRONTEND_URL || "https://E-ivuze.com";
      const getStartedUrl = `${frontendUrl}/`;
      finalHtml = getCommonEmailTemplate(subject, html, "Get Started", getStartedUrl);
      console.log('📧 [EMAIL SERVICE] Template applied successfully');
    }

    // Format from address with display name
    const fromEmail = config.from || config.user;
    let fromDisplayName;
    if (fromEmail.includes('<') && fromEmail.includes('>')) {
      // Already in "Display Name <email>" format
      fromDisplayName = fromEmail;
    } else {
      // Add display name
      fromDisplayName = `E-ivuzeConnect <${fromEmail}>`;
    }

    console.log('📧 [EMAIL SERVICE] From address:', fromDisplayName);

    const mailOptions = {
      from: fromDisplayName,
      to,
      subject,
      html: finalHtml,
      text: text || "Please enable HTML to view this email."
    };

    console.log('📧 [EMAIL SERVICE] Mail options prepared:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHtml: !!mailOptions.html,
      hasText: !!mailOptions.text
    });

    // Removed production verification to prevent email delays
    // Errors will still be caught during actual sending

    console.log('📧 [EMAIL SERVICE] Sending email via transporter...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [EMAIL SERVICE] Email dispatched successfully!');
    console.log('✅ [EMAIL SERVICE] Message ID:', info.messageId);
    console.log('✅ [EMAIL SERVICE] Response:', info);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [EMAIL SERVICE] EMAIL DELIVERY FAILED!');
    console.error('❌ [EMAIL SERVICE] Error message:', error.message);
    console.error('❌ [EMAIL SERVICE] Error code:', error.code);
    console.error('❌ [EMAIL SERVICE] Error command:', error.command);
    console.error('❌ [EMAIL SERVICE] Error response:', error.response);
    console.error('❌ [EMAIL SERVICE] Full error object:', error);
    console.error('❌ [EMAIL SERVICE] Stack trace:', error.stack);

    // Config debugging
    console.error('❌ [EMAIL SERVICE] Config check:', {
      hasHost: !!config.host,
      hasUser: !!config.user,
      hasPass: !!config.pass,
      hasFrom: !!config.from,
      host: config.host,
      port: config.port,
      user: config.user ? config.user.substring(0, 10) + '...' : 'NOT SET',
      from: config.from
    });

    // Provide actionable feedback for common deployment issues
    if (error.code === 'EENVELOPE') {
      console.error('💡 TIP: Check if the recipient email address is valid.');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('💡 TIP: Your hosting provider might be blocking SMTP ports (587/465). Use an API-based service or port 443 if supported.');
    } else if (error.code === 'EAUTH') {
      console.error('💡 TIP: Check your email credentials (EMAIL_USER/EMAIL_PASS). For Gmail, use an App Password.');
    } else if (error.code === 'ESOCKET') {
      console.error('💡 TIP: Network connectivity issue. Check firewall and SMTP server status.');
    }

    return {
      success: false,
      message: error.message,
      code: error.code
    };
  }
};

// Specialized Helpers
export const getPharmacyInvitationEmailEN = (name, link, pass) =>
  getCommonEmailTemplate("Welcome to E-ivuze", `You have been invited to join <strong>${name}</strong>.<br><br><strong>Password:</strong> ${pass}<br><br>Please verify your account.`, "Complete Registration", link);

export const getPharmacyInvitationEmailRW = (name, link, pass) =>
  getCommonEmailTemplate("Murakaza neza kuri E-ivuze", `Batumiwe kwinjira muri <strong>${name}</strong>.<br><br><strong>Ijambo ry'ibanga:</strong> ${pass}`, "Emeza Kwiyandikisha", link);


