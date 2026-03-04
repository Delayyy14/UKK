import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string) {
  const mailOptions = {
    from: `"PinjamAlat" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Kode OTP Verifikasi Registrasi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #3b82f6; text-align: center;">Verifikasi Akun Anda</h2>
        <p>Terima kasih telah mendaftar di <strong>PinjamAlat</strong>. Gunakan kode OTP di bawah ini untuk memverifikasi alamat email Anda:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; margin: 20px 0; border-radius: 8px;">
          ${otp}
        </div>
        <p>Kode ini akan kadaluwarsa dalam 10 menit. Jika Anda tidak merasa melakukan pendaftaran ini, silakan abaikan email ini.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          &copy; ${new Date().getFullYear()} PinjamAlat. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
export async function sendReplyEmail(email: string, originalMessage: string, replyText: string) {
  const mailOptions = {
    from: `"PinjamAlat Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Balasan Pesan - PinjamAlat',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #3b82f6;">Halo,</h2>
        <p>Terima kasih telah menghubungi kami. Berikut adalah balasan untuk pesan Anda:</p>
        
        <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold; color: #1e40af;">Balasan Admin:</p>
          <p style="margin: 10px 0 0 0; color: #1e293b; line-height: 1.6;">${replyText.replace(/\n/g, '<br>')}</p>
        </div>

        <div style="background-color: #f8fafc; padding: 15px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 14px; color: #64748b;">
          <p style="margin: 0; font-style: italic;">Pesan Asli Anda:</p>
          <p style="margin: 5px 0 0 0;">"${originalMessage}"</p>
        </div>

        <p style="margin-top: 20px;">Jika ada pertanyaan lebih lanjut, jangan ragu untuk membalas email ini.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          &copy; ${new Date().getFullYear()} PinjamAlat. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending reply email:', error);
    return { success: false, error };
  }
}
export async function sendForgotPasswordEmail(email: string, otp: string) {
  const mailOptions = {
    from: `"PinjamAlat" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Kode OTP Reset Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #3b82f6; text-align: center;">Reset Password Anda</h2>
        <p>Anda telah meminta untuk mereset password akun Anda di <strong>PinjamAlat</strong>. Gunakan kode OTP di bawah ini untuk melanjutkan:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; margin: 20px 0; border-radius: 8px;">
          ${otp}
        </div>
        <p>Kode ini akan kadaluwarsa dalam 10 menit. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini dan pastikan akun Anda tetap aman.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          &copy; ${new Date().getFullYear()} PinjamAlat. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
