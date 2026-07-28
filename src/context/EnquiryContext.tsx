import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CustomerEnquiry, EnquiryStatus, EnquiryTimelineEvent } from '../types';
import {
  fetchAllEnquiries,
  fetchCustomerEnquiries,
  insertEnquiry,
  updateEnquiryStatusInDb,
  appendEnquiryTimelineInDb,
} from '../services/supabaseService';
import { useOrders } from './OrderContext';
import { useRefunds } from './RefundContext';
import { generateEnquiryNumber } from '../services/idGeneratorService';

interface EnquiryContextType {
  enquiries: CustomerEnquiry[];
  loading: boolean;
  refreshEnquiries: () => Promise<void>;
  submitEnquiry: (data: Omit<CustomerEnquiry, 'id' | 'enquiryNumber' | 'status' | 'createdAt' | 'timeline'>) => Promise<CustomerEnquiry>;
  adminApproveEnquiry: (enquiryId: string, adjustedPrice?: number) => Promise<string | undefined>;
  adminRejectEnquiry: (enquiryId: string, reason: string) => Promise<void>;
  requestMoreInfo: (enquiryId: string, message: string) => Promise<void>;
  adjustEnquiryPrice: (enquiryId: string, newPrice: number) => Promise<void>;
  getCustomerEnquiries: (phone: string) => CustomerEnquiry[];
  getEnquiryById: (id: string) => CustomerEnquiry | undefined;
}

const EnquiryContext = createContext<EnquiryContextType | undefined>(undefined);

export const EnquiryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { createOfflineOrder } = useOrders();
  const refundContext = useRefunds();

  const refreshEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllEnquiries();
      setEnquiries(data);
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshEnquiries();
  }, [refreshEnquiries]);

  const submitEnquiry = async (
    data: Omit<CustomerEnquiry, 'id' | 'enquiryNumber' | 'status' | 'createdAt' | 'timeline'>
  ): Promise<CustomerEnquiry> => {
    const id = `enq-${Date.now()}`;
    const enquiryNumber = generateEnquiryNumber();
    const now = new Date().toISOString();

    const initialTimeline: EnquiryTimelineEvent[] = [
      {
        id: `tl-${Date.now()}`,
        timestamp: now,
        action: 'Enquiry Submitted',
        performedBy: data.customerName,
        details: `Customer submitted enquiry for ${data.productName} (${data.quantity} qty). Payment choice: ${data.paymentOption}`,
      },
    ];

    const newEnquiry: CustomerEnquiry = {
      ...data,
      id,
      enquiryNumber,
      status: 'ENQUIRY_RECEIVED',
      createdAt: now,
      updatedAt: now,
      timeline: initialTimeline,
    };

    const saved = await insertEnquiry(newEnquiry);
    const finalEnquiry = saved || newEnquiry;
    setEnquiries((prev) => [finalEnquiry, ...prev]);
    return finalEnquiry;
  };

  const adminApproveEnquiry = async (enquiryId: string, adjustedPrice?: number): Promise<string | undefined> => {
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) return;

    const now = new Date().toISOString();
    const finalPrice = adjustedPrice ?? enq.adjustedPrice ?? enq.estimatedPrice;

    // 1. Create real order
    const createdOrder = await createOfflineOrder(
      enq.customerName,
      enq.customerPhone,
      enq.customerAddress,
      [
        {
          productId: enq.productId,
          productName: enq.productName,
          image: enq.productImage,
          variant: { size: enq.variantName || 'Standard' },
          customMeasurements: enq.measurements,
          referenceNotes: enq.notes,
          quantity: enq.quantity,
          unitPrice: Math.round(finalPrice / enq.quantity),
          totalPrice: finalPrice,
        },
      ],
      finalPrice,
      0, // discount
      enq.advancePaid,
      enq.advancePaymentDetails?.mode || 'Razorpay',
      'Owner Admin (Approved Enquiry)',
      undefined,
      {
        notes: `Converted from Enquiry ${enq.enquiryNumber}. Notes: ${enq.notes || 'None'}`,
      }
    );

    // 2. Add audit log events to enquiry
    const approveTimelineEvent: EnquiryTimelineEvent = {
      id: `tl-${Date.now()}`,
      timestamp: now,
      action: 'Order Accepted',
      performedBy: 'Owner Admin',
      details: `Enquiry approved & converted to Order #${createdOrder.orderNumber}. Inventory reserved. Production queue updated.`,
    };

    const updatedTimeline = [...enq.timeline, approveTimelineEvent];

    await updateEnquiryStatusInDb(enquiryId, 'ORDER_ACCEPTED', {
      order_id: createdOrder.id,
      adjusted_price: finalPrice,
      timeline: updatedTimeline,
    });

    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === enquiryId
          ? {
              ...e,
              status: 'ORDER_ACCEPTED',
              orderId: createdOrder.id,
              adjustedPrice: finalPrice,
              updatedAt: now,
              timeline: updatedTimeline,
            }
          : e
      )
    );

    return createdOrder.id;
  };

  const adminRejectEnquiry = async (enquiryId: string, reason: string) => {
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) return;

    const now = new Date().toISOString();
    const rejectTimelineEvent: EnquiryTimelineEvent = {
      id: `tl-${Date.now()}`,
      timestamp: now,
      action: 'Enquiry Rejected',
      performedBy: 'Owner Admin',
      details: `Reason: ${reason}`,
    };

    const updatedTimeline = [...enq.timeline, rejectTimelineEvent];

    await updateEnquiryStatusInDb(enquiryId, 'REJECTED', {
      rejection_reason: reason,
      timeline: updatedTimeline,
    });

    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === enquiryId
          ? {
              ...e,
              status: 'REJECTED',
              rejectionReason: reason,
              updatedAt: now,
              timeline: updatedTimeline,
            }
          : e
      )
    );

    // If customer paid advance, create a Refund automatically!
    if (enq.advancePaid > 0 && refundContext) {
      await refundContext.createRefund({
        enquiryId: enq.id,
        orderNumber: enq.enquiryNumber,
        customerName: enq.customerName,
        customerPhone: enq.customerPhone,
        originalPaymentAmount: enq.advancePaid,
        originalPaymentMode: enq.advancePaymentDetails?.mode || 'Razorpay',
        originalPaymentTxnId: enq.advancePaymentDetails?.razorpayPaymentId || enq.advancePaymentDetails?.referenceId,
        refundAmount: enq.advancePaid,
        refundType: 'Full Refund',
        reason: 'Order Rejected',
        customReason: `Enquiry rejected by admin. Reason: ${reason}`,
        refundMethod: enq.advancePaymentDetails?.mode === 'Cash' ? 'Cash' : 'Razorpay',
        razorpayPaymentId: enq.advancePaymentDetails?.razorpayPaymentId,
        createdBy: 'Admin (System Rejection)',
      });
    }
  };

  const requestMoreInfo = async (enquiryId: string, message: string) => {
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) return;

    const now = new Date().toISOString();
    const event: EnquiryTimelineEvent = {
      id: `tl-${Date.now()}`,
      timestamp: now,
      action: 'Requested More Information',
      performedBy: 'Owner Admin',
      details: message,
    };

    const updatedTimeline = [...enq.timeline, event];

    await updateEnquiryStatusInDb(enquiryId, 'INFO_REQUESTED', {
      info_requested_message: message,
      timeline: updatedTimeline,
    });

    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === enquiryId
          ? { ...e, status: 'INFO_REQUESTED', infoRequestedMessage: message, updatedAt: now, timeline: updatedTimeline }
          : e
      )
    );
  };

  const adjustEnquiryPrice = async (enquiryId: string, newPrice: number) => {
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) return;

    const now = new Date().toISOString();
    const event: EnquiryTimelineEvent = {
      id: `tl-${Date.now()}`,
      timestamp: now,
      action: 'Price Adjusted',
      performedBy: 'Owner Admin',
      details: `Estimated Price updated from ₹${enq.estimatedPrice.toLocaleString('en-IN')} to ₹${newPrice.toLocaleString('en-IN')}`,
    };

    const updatedTimeline = [...enq.timeline, event];

    await updateEnquiryStatusInDb(enquiryId, enq.status, {
      adjusted_price: newPrice,
      timeline: updatedTimeline,
    });

    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === enquiryId
          ? { ...e, adjustedPrice: newPrice, updatedAt: now, timeline: updatedTimeline }
          : e
      )
    );
  };

  const getCustomerEnquiries = (phone: string): CustomerEnquiry[] => {
    if (!phone) return [];
    const last10 = phone.replace(/\D/g, '').slice(-10);
    return enquiries.filter((e) => e.customerPhone.replace(/\D/g, '').slice(-10) === last10);
  };

  const getEnquiryById = (id: string) => enquiries.find((e) => e.id === id);

  return (
    <EnquiryContext.Provider
      value={{
        enquiries,
        loading,
        refreshEnquiries,
        submitEnquiry,
        adminApproveEnquiry,
        adminRejectEnquiry,
        requestMoreInfo,
        adjustEnquiryPrice,
        getCustomerEnquiries,
        getEnquiryById,
      }}
    >
      {children}
    </EnquiryContext.Provider>
  );
};

export const useEnquiries = () => {
  const context = useContext(EnquiryContext);
  if (!context) {
    throw new Error('useEnquiries must be used within an EnquiryProvider');
  }
  return context;
};
