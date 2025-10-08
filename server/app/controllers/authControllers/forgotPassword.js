const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require('../../models/user.model');
const { GenerateToken } = require('../../utils/tokenGenerate');

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: 0, message: 'EMAIL_REQUIRED' });
    }

    const checkUser = await User.findOne({ email: email.toLowerCase() });

    if (!checkUser) {
      return res.status(404).json({ status: 0, message: 'USER_NOT_FOUND' });
    }

    // Generate unique token Id for reset token
    const passwordId = crypto.randomUUID();
    
    // Generate JWT with user ID + token Id
    const accessToken = GenerateToken(
      { id: String(checkUser._id), passwordId: passwordId, issuedAt: new Date().toISOString() },
      { expiresIn: process.env.CHANGE_PASSWORD_TOKEN_EXPIREIN, issuer: process.env.APP_NAME }
    );

    await User.findByIdAndUpdate(String(checkUser._id), { 
      passwordId: passwordId 
    })

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const resetLink = `${process.env.CLIENT_WEB_URL}?reset=${accessToken}`;
    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request - " + process.env.APP_NAME,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                        🔐 Password Reset
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                        Hi <strong>${checkUser.name}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                        We received a request to reset your password for your <strong>${process.env.APP_NAME}</strong> account.
                      </p>
                      
                      <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #333333;">
                        Click the button below to create a new password:
                      </p>
                      
                      <!-- Reset Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="padding: 0 0 30px 0;">
                            <a href="${resetLink}" 
                               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                              Reset My Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Alternative Link -->
                      <div style="padding: 20px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 20px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                          Or copy and paste this link in your browser:
                        </p>
                        <p style="margin: 0; font-size: 13px; word-break: break-all; color: #667eea;">
                          ${resetLink}
                        </p>
                      </div>
                      
                      <!-- Warning Box -->
                      <div style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 14px; color: #856404;">
                          <strong>⚠️ Important:</strong> This link will expire in <strong>${process.env.CHANGE_PASSWORD_TOKEN_EXPIREIN}</strong>.
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 21px; color: #666666;">
                        If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                      </p>
                      
                      <p style="margin: 0; font-size: 14px; line-height: 21px; color: #666666;">
                        For security reasons, this link can only be used once.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                        Best regards,<br>
                        <strong>${process.env.APP_NAME} Team</strong>
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #999999;">
                        This is an automated email, please do not reply.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Footer Note -->
                <table role="presentation" style="width: 600px; border-collapse: collapse; margin-top: 20px;">
                  <tr>
                    <td style="text-align: center; padding: 0 40px;">
                      <p style="margin: 0; font-size: 12px; line-height: 18px; color: #999999;">
                        © ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Hi ${checkUser.name},\n\nWe received a request to reset your password for your ${process.env.APP_NAME} account.\n\nClick the link below to reset your password:\n${resetLink}\n\n⚠️ Important: This link will expire in ${process.env.CHANGE_PASSWORD_TOKEN_EXPIREIN}.\n\nIf you didn't request this password reset, please ignore this email.\n\nBest regards,\n${process.env.APP_NAME} Team`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      status: 1,
      message: 'FORGOT_PASSWORD_EMAIL_SENT',
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({
      status: 0,
      message: 'SERVER_ERROR',
      error: err.message,
    });
  }
};

module.exports = forgotPassword;