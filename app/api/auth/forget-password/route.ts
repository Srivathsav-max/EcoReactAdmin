import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const isDevelopment = process.env.NODE_ENV === 'development';

async function sendOTPEmail(email: string, otp: string) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Password Reset OTP',
    html: `
      <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            background-color: #f5f7fa;
        }
        .card {
            background: white;
            border-radius: 8px;
            padding: 32px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            color: #1a1a1a;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 24px;
            text-align: center;
        }
        .otp {
            background: #f0f4f8;
            border-radius: 6px;
            color: #2d3748;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 4px;
            margin: 24px 0;
            padding: 16px;
            text-align: center;
        }
        .info {
            color: #4a5568;
            font-size: 16px;
            margin: 16px 0;
        }
        .warning {
            color: #718096;
            font-size: 14px;
            margin-top: 24px;
            text-align: center;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1 class="header">Password Reset Request</h1>
        <p class="info">We received a request to reset your password. Use the following code to continue:</p>
        <div class="otp">${otp}</div>
        <p class="info">This code will expire in <strong>10 minutes</strong>.</p>
        <p class="warning">If you didn't request this password reset, please ignore this email and ensure your account is secure.</p>
    </div>
</body>
</html>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (isDevelopment) {
      console.log('Development Mode - OTP:', { email, otp });
    }

    // In production or if email sending is enabled in development
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      if (!isDevelopment) {
        throw new Error('Failed to send OTP email');
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully',
      devMode: isDevelopment 
    });

  } catch (error) {
    console.error('Error in forget-password API:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    );
  }
}