declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface RazorpayPaymentSuccessPayload {
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  paymentMethod?: string;
}

export interface RazorpayOptions {
  amount: number; // Amount in INR
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
  onSuccess: (payload: RazorpayPaymentSuccessPayload) => void;
  onFailure: (error: any) => void;
}

export const openRazorpayCheckout = async ({
  amount,
  orderNumber,
  customerName,
  customerPhone,
  customerEmail,
  description,
  onSuccess,
  onFailure,
}: RazorpayOptions) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    alert('Failed to load Razorpay Payment SDK. Please check your internet connection.');
    return;
  }

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_T547lttHOVL633';

  const options = {
    key: razorpayKey,
    amount: Math.round(amount * 100), // Amount in paise
    currency: 'INR',
    name: 'MANIKANDAN LATHE',
    description: description || `Payment for Order #${orderNumber}`,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80',
    handler: function (response: any) {
      if (response.razorpay_payment_id) {
        onSuccess({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
          paymentMethod: response.method || 'Razorpay',
        });
      } else {
        onFailure('No payment ID returned from Razorpay checkout.');
      }
    },
    prefill: {
      name: customerName,
      contact: customerPhone,
      email: customerEmail || `${customerPhone.replace(/\D/g, '')}@manikandanlathe.com`,
    },
    notes: {
      orderNumber: orderNumber,
      shop: 'MANIKANDAN LATHE - Kallimandhayam Workshop',
    },
    config: {
      display: {
        blocks: {
          banks: {
            name: 'Pay via UPI, Cards, NetBanking, EMI & Pay Later',
            instruments: [
              { method: 'upi' },
              { method: 'card' },
              { method: 'netbanking' },
              { method: 'wallet' },
              { method: 'emi' },
              { method: 'paylater' },
            ],
          },
        },
        sequence: ['block.banks'],
        preferences: {
          show_default_blocks: true,
        },
      },
    },
    theme: {
      color: '#111111',
      backdrop_color: 'rgba(17, 17, 17, 0.85)',
    },
  };

  try {
    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response: any) {
      onFailure(response.error || 'Payment failed');
    });
    paymentObject.open();
  } catch (err) {
    console.error('Razorpay initialization error:', err);
    onFailure(err);
  }
};

/**
 * Generate dynamic Razorpay QR payload data
 */
export interface RazorpayQRPayload {
  qrCodeUrl: string;
  upiUri: string;
  amount: number;
  orderNumber: string;
  customerName: string;
  expiresAt: string;
}

export const generateRazorpayQRData = (
  amount: number,
  orderNumber: string,
  customerName: string
): RazorpayQRPayload => {
  const vpa = 'manikandanlathe@icici'; // Workshop Razorpay UPI VPA
  const encodedName = encodeURIComponent('MANIKANDAN LATHE');
  const encodedNote = encodeURIComponent(`Order ${orderNumber} - ${customerName}`);
  const upiUri = `upi://pay?pa=${vpa}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodedNote}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    upiUri
  )}`;

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    qrCodeUrl,
    upiUri,
    amount,
    orderNumber,
    customerName,
    expiresAt,
  };
};

/**
 * Generate Razorpay Payment Link payload and share messages
 */
export interface RazorpayPaymentLinkPayload {
  paymentLinkUrl: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  whatsAppShareUrl: string;
  smsShareUrl: string;
  emailShareUrl: string;
}

export const createRazorpayPaymentLink = (
  orderNumber: string,
  amount: number,
  customerName: string,
  customerPhone: string
): RazorpayPaymentLinkPayload => {
  const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
  const paymentLinkUrl = `https://rzp.io/l/ml-${orderNumber.toLowerCase()}`;

  const messageText = `Hi ${customerName},

Your payment request for

Order #${orderNumber}

Amount
₹${amount.toLocaleString('en-IN')}

is ready.

Click below to pay securely using

UPI
Google Pay
PhonePe
Paytm
Cards
Net Banking

${paymentLinkUrl}

After successful payment your order will automatically update.

Thank you,
MANIKANDAN LATHE
Kallimandhayam`;


  const whatsAppShareUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(messageText)}`;
  const smsShareUrl = `sms:+91${cleanPhone}?body=${encodeURIComponent(messageText)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(
    `Payment Link for Order #${orderNumber}`
  )}&body=${encodeURIComponent(messageText)}`;


  return {
    paymentLinkUrl,
    orderNumber,
    amount,
    customerName,
    customerPhone,
    whatsAppShareUrl,
    smsShareUrl,
    emailShareUrl,
  };
};
