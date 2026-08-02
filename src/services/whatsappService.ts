import { Order, DeliveryDetails, CustomerEnquiry } from '../types';

export const SHOP_PHONE = '919659286268'; // MANIKANDAN LATHE official WhatsApp (Chellamuthu K)

export const createCustomerEnquiryWhatsAppMessage = (enquiry: CustomerEnquiry): string => {
  const formattedDate = new Date(enquiry.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const text = `*MANIKANDAN LATHE WORKS*
*NEW ORDER ENQUIRY SUBMITTED*
━━━━━━━━━━━━━━━━━━━━
*To Owner:* Chellamuthu K
*Enquiry No:* ${enquiry.enquiryNumber}
*Date:* ${formattedDate}

*CUSTOMER DETAILS:*
• *Name:* ${enquiry.customerName}
• *Mobile:* ${enquiry.customerPhone}
${enquiry.customerEmail ? `• *Email:* ${enquiry.customerEmail}\n` : ''}• *Delivery Address:* ${enquiry.customerAddress}

*ENQUIRY ORDER SPECIFICATIONS:*
• *Item Name:* ${enquiry.productName}
• *Variant / Model:* ${enquiry.variantName || 'Standard Unit'}
• *Quantity:* ${enquiry.quantity} unit(s)
${enquiry.measurements ? `• *Custom Dimensions:* ${enquiry.measurements}\n` : ''}• *Delivery Preference:* ${enquiry.deliveryType}
${enquiry.notes ? `• *Special Notes:* ${enquiry.notes}\n` : ''}
*FINANCIAL ESTIMATE & PAYMENT:*
• *Est. Total Price:* ₹${enquiry.estimatedPrice.toLocaleString('en-IN')}
• *Payment Choice:* ${enquiry.paymentOption}
${enquiry.advancePaid > 0 ? `• *Advance Paid Online:* ₹${enquiry.advancePaid.toLocaleString('en-IN')} (Razorpay Gateway)\n` : ''}
━━━━━━━━━━━━━━━━━━━━
*Status:* Order Enquiry Placed (Awaiting Review)

*Message to Owner:*
"Respected Chellamuthu Sir, I have placed an enquiry order for the above item(s). Please review my requirements and confirm the quotation/order details. Thank you!"`;

  return `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(text)}`;
};

export const createQuickEnquiryWhatsAppMessage = (data: {
  productName?: string;
  customerName: string;
  customerPhone: string;
  message?: string;
  quantity?: number;
  deliveryType?: string;
  customMeasurements?: string;
}): string => {
  const text = `*MANIKANDAN LATHE WORKS - ENQUIRY*
━━━━━━━━━━━━━━━━━━━━
*To Owner:* Chellamuthu K

*CUSTOMER INFORMATION:*
• *Name:* ${data.customerName}
• *Mobile:* ${data.customerPhone}
${data.productName ? `• *Product Interested:* ${data.productName}\n` : ''}${data.quantity ? `• *Quantity Needed:* ${data.quantity}\n` : ''}${data.customMeasurements ? `• *Measurements:* ${data.customMeasurements}\n` : ''}${data.deliveryType ? `• *Delivery:* ${data.deliveryType}\n` : ''}
*REQUIREMENT DETAILS:*
"${data.message || 'I would like to inquire about price estimation and custom fabrication for this item.'}"

━━━━━━━━━━━━━━━━━━━━
*Dear Chellamuthu Sir,* Please check my enquiry details above and reply with the quote or details. Thank you!`;

  return `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(text)}`;
};

export const createOrderWhatsAppMessage = (order: Order): string => {
  const itemsText = order.items
    .map((i) => `• ${i.productName} (Qty: ${i.quantity}) - ₹${i.totalPrice.toLocaleString('en-IN')}`)
    .join('\n');

  const text = `*MANIKANDAN LATHE - ORDER ENQUIRY*
━━━━━━━━━━━━━━━━━━━━
*To Owner:* Chellamuthu K
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

