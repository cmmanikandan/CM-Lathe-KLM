import { Order, DeliveryDetails } from '../types';

const SHOP_PHONE = '919659286268'; // MANIKANDAN LATHE official WhatsApp (Chellamuthu K)

export const createOrderWhatsAppMessage = (order: Order): string => {
  const itemsText = order.items
    .map((i) => `• ${i.productName} (Qty: ${i.quantity}) - ₹${i.totalPrice.toLocaleString('en-IN')}`)
    .join('\n');

  const text = `*MANIKANDAN LATHE - ORDER ENQUIRY*
━━━━━━━━━━━━━━━━━━━━
*Owner:* Chellamuthu K
*Order No:* ${order.orderNumber}
*Customer:* ${order.customerName}
*Phone:* ${order.customerPhone}
*Address:* ${order.customerAddress}

*Items Ordered:*
${itemsText}

*Estimated Price:* ₹${order.finalPrice.toLocaleString('en-IN')}
*Status:* ${order.status}

Thank you for contacting MANIKANDAN LATHE!`;

  return `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(text)}`;
};

export const createDeliveryWhatsAppMessage = (order: Order, delivery: DeliveryDetails): string => {
  const customerPhoneClean = order.customerPhone.replace(/\D/g, '');
  const targetPhone = customerPhoneClean.startsWith('91') ? customerPhoneClean : `91${customerPhoneClean}`;

  const text = `*MANIKANDAN LATHE - DELIVERY UPDATE*
━━━━━━━━━━━━━━━━━━━━
Dear *${order.customerName}*, your order is out for delivery!

*Order No:* ${order.orderNumber}
*Delivery Executive:* ${delivery.personName} (${delivery.mobileNumber})
*Expected Date:* ${delivery.expectedDate}
*Expected Time:* ${delivery.expectedTime}
*Delivery Charge:* ₹${delivery.deliveryCharge}

*Remaining Balance:* ₹${order.remainingBalance.toLocaleString('en-IN')}

Location: K. Keeranur Road, Kallimandhayam - 624616
Phone: +91 96592 86268`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
};

export const createProductInquiryWhatsApp = (productName: string, category: string): string => {
  const text = `Hello MANIKANDAN LATHE (Chellamuthu K), I am interested in *${productName}* (${category}). Please share price quote and custom options.`;
  return `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(text)}`;
};
