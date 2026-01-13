// WhatsApp Business API OTP Service

interface SendOTPResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface VerifyOTPResponse {
  success: boolean;
  error?: string;
}

// Store OTPs temporarily (in production, use server-side storage)
const otpStore: Map<string, { otp: string; expiresAt: number }> = new Map();

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Format phone number to WhatsApp format (remove spaces, add country code if needed)
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, assume Indian number and replace with 91
  if (cleaned.startsWith('0')) {
    cleaned = '91' + cleaned.substring(1);
  }

  // If no country code (10 digits), assume Indian (+91)
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }

  return cleaned;
}

// Send OTP via WhatsApp Business API
export async function sendWhatsAppOTP(phoneNumber: string): Promise<SendOTPResponse> {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const otp = generateOTP();

  // Store OTP with 5 minute expiry
  otpStore.set(formattedPhone, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  // Get credentials from environment
  const phoneNumberId = process.env.EXPO_PUBLIC_WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    // For development/demo, just simulate success
    console.log(`[DEV] OTP for ${formattedPhone}: ${otp}`);
    return { success: true, messageId: 'dev-' + Date.now() };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: 'otp_verification', // You need to create this template in WhatsApp Business
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: otp },
                ],
              },
              {
                type: 'button',
                sub_type: 'url',
                index: '0',
                parameters: [
                  { type: 'text', text: otp },
                ],
              },
            ],
          },
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, messageId: data.messages?.[0]?.id };
    } else {
      // If template fails, try sending as text message
      const textResponse = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'text',
            text: {
              body: `Your Lavanya Mart verification code is: ${otp}\n\nThis code expires in 5 minutes. Do not share this code with anyone.`,
            },
          }),
        }
      );

      const textData = await textResponse.json();

      if (textResponse.ok) {
        return { success: true, messageId: textData.messages?.[0]?.id };
      }

      return { success: false, error: textData.error?.message || 'Failed to send OTP' };
    }
  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Verify OTP
export function verifyOTP(phoneNumber: string, enteredOTP: string): VerifyOTPResponse {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const stored = otpStore.get(formattedPhone);

  if (!stored) {
    return { success: false, error: 'OTP expired or not found. Please request a new one.' };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(formattedPhone);
    return { success: false, error: 'OTP has expired. Please request a new one.' };
  }

  if (stored.otp !== enteredOTP) {
    return { success: false, error: 'Invalid OTP. Please try again.' };
  }

  // Clear OTP after successful verification
  otpStore.delete(formattedPhone);
  return { success: true };
}

// Clear expired OTPs (call periodically)
export function clearExpiredOTPs(): void {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phone);
    }
  }
}
