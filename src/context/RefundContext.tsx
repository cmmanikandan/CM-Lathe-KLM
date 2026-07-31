import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Refund, RefundStatus, RefundTimelineEvent, RefundLedgerEntry } from '../types';
import { supabase } from '../services/supabase';
import {
  fetchAllRefundsFromDb,
  fetchCustomerRefundsFromDb,
  insertRefundInDb,
  updateRefundStatusInDb,
} from '../services/supabaseService';
import { generateRefundNumber } from '../services/idGeneratorService';

interface RefundContextType {
  refunds: Refund[];
  loading: boolean;
  refreshRefunds: () => Promise<void>;
  createRefund: (
    data: Omit<Refund, 'id' | 'refundNumber' | 'status' | 'createdAt' | 'timeline' | 'ledgerEntries'>
  ) => Promise<Refund>;
  approveRefund: (refundId: string, approvedBy: string) => Promise<void>;
  rejectRefund: (refundId: string, reason: string) => Promise<void>;
  processRefund: (
    refundId: string,
    details: {
      refundMethod: Refund['refundMethod'];
      razorpayRefundId?: string;
      cashVoucherNo?: string;
      staffName?: string;
      staffSignature?: string;
      notes?: string;
    }
  ) => Promise<void>;
  retryRefund: (refundId: string) => Promise<void>;
  deleteRefund: (refundId: string) => Promise<void>;
  getCustomerRefunds: (phone: string) => Refund[];
  getRefundById: (id: string) => Refund | undefined;
}

const RefundContext = createContext<RefundContextType | undefined>(undefined);

export const RefundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllRefundsFromDb();
      setRefunds(data);
    } catch (err) {
      console.error('Failed to fetch refunds:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRefunds();
  }, [refreshRefunds]);

  const createRefund = async (
    data: Omit<Refund, 'id' | 'refundNumber' | 'status' | 'createdAt' | 'timeline' | 'ledgerEntries'>
  ): Promise<Refund> => {
    const id = `rfd-${Date.now()}`;
    const refundNumber = await generateRefundNumber();
    const now = new Date().toISOString();
    const expectedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const initialTimeline: RefundTimelineEvent[] = [
      {
        id: `tl-${Date.now()}`,
        timestamp: now,
        action: 'Refund Requested',
        performedBy: data.createdBy || 'System',
        details: `Refund of ₹${data.refundAmount.toLocaleString('en-IN')} requested for ${data.customerName}. Reason: ${data.reason}`,
      },
    ];

    const initialLedger: RefundLedgerEntry[] = [
      {
        id: `ldg-1-${Date.now()}`,
        timestamp: now,
        account: 'Customer Ledger',
        debitCredit: 'CREDIT',
        amount: data.refundAmount,
        notes: `Customer Refund Accounted (${refundNumber})`,
      },
      {
        id: `ldg-2-${Date.now()}`,
        timestamp: now,
        account: 'Sales Ledger',
        debitCredit: 'DEBIT',
        amount: data.refundAmount,
        notes: `Sales Adjustment for Refund (${refundNumber})`,
      },
      {
        id: `ldg-3-${Date.now()}`,
        timestamp: now,
        account: 'Payment Ledger',
        debitCredit: 'DEBIT',
        amount: data.refundAmount,
        notes: `Outbound Refund Pending (${refundNumber})`,
      },
      {
        id: `ldg-4-${Date.now()}`,
        timestamp: now,
        account: 'GST Reports',
        debitCredit: 'CREDIT',
        amount: Math.round(data.refundAmount * 0.18),
        notes: `GST Output Adjustment on Refund (${refundNumber})`,
      },
    ];

    const newRefund: Refund = {
      ...data,
      id,
      refundNumber,
      status: 'Requested',
      createdAt: now,
      expectedCompletionDate: expectedDate,
      timeline: initialTimeline,
      ledgerEntries: initialLedger,
    };

    const saved = await insertRefundInDb(newRefund);
    const finalRefund = saved || newRefund;
    setRefunds((prev) => [finalRefund, ...prev]);
    return finalRefund;
  };

  const approveRefund = async (refundId: string, approvedBy: string) => {
    const rfd = refunds.find((r) => r.id === refundId);
    if (!rfd) return;

    const now = new Date().toISOString();
    const event: RefundTimelineEvent = {
      id: `tl-${Date.now()}`,
      timestamp: now,
      action: 'Refund Approved',
      performedBy: approvedBy,
      details: `Refund approved by ${approvedBy}. Proceeding to payout processing.`,
    };

    const updatedTimeline = [...rfd.timeline, event];

    await updateRefundStatusInDb(refundId, 'Approved', {
      approved_by: approvedBy,
      timeline: updatedTimeline,
    });

    setRefunds((prev) =>
      prev.map((r) =>
        r.id === refundId
          ? { ...r, status: 'Approved', approvedBy, timeline: updatedTimeline }
          : r
      )
    );
  };

  const rejectRefund = async (refundId: string, reason: string) => {
    const rfd = refunds.find((r) => r.id === refundId);
    if (!rfd) return;

    const now = new Date().toISOString();
    const event: RefundTimelineEvent = {
      id: `tl-${Date.now()}`,
      timestamp: now,
      action: 'Refund Rejected',
      performedBy: 'Owner Admin',
      details: `Rejection Reason: ${reason}`,
    };

    const updatedTimeline = [...rfd.timeline, event];

    await updateRefundStatusInDb(refundId, 'Cancelled', {
      rejection_reason: reason,
      timeline: updatedTimeline,
    });

    setRefunds((prev) =>
      prev.map((r) =>
        r.id === refundId
          ? { ...r, status: 'Cancelled', rejectionReason: reason, timeline: updatedTimeline }
          : r
      )
    );
  };

  const processRefund = async (
    refundId: string,
    details: {
      refundMethod: Refund['refundMethod'];
      razorpayRefundId?: string;
      cashVoucherNo?: string;
      staffName?: string;
      staffSignature?: string;
      notes?: string;
    }
  ) => {
    const rfd = refunds.find((r) => r.id === refundId);
    if (!rfd) return;

    const now = new Date().toISOString();
    const event: RefundTimelineEvent = {
      id: `tl-${Date.now()}`,
      timestamp: now,
      action: 'Refund Completed',
      performedBy: 'Owner Admin / System',
      details: `Payment refunded via ${details.refundMethod}. ${
        details.razorpayRefundId ? `Razorpay Refund ID: ${details.razorpayRefundId}. ` : ''
      }${details.cashVoucherNo ? `Cash Voucher: ${details.cashVoucherNo}. Staff: ${details.staffName}. ` : ''}${
        details.notes || ''
      }`,
    };

    const updatedTimeline = [...rfd.timeline, event];

    await updateRefundStatusInDb(refundId, 'Completed', {
      refund_method: details.refundMethod,
      razorpay_refund_id: details.razorpayRefundId || null,
      cash_voucher_no: details.cashVoucherNo || null,
      staff_name: details.staffName || null,
      staff_signature: details.staffSignature || null,
      completed_at: now,
      timeline: updatedTimeline,
    });

    setRefunds((prev) =>
      prev.map((r) =>
        r.id === refundId
          ? {
              ...r,
              status: 'Completed',
              refundMethod: details.refundMethod,
              razorpayRefundId: details.razorpayRefundId,
              cashVoucherNo: details.cashVoucherNo,
              staffName: details.staffName,
              staffSignature: details.staffSignature,
              completedAt: now,
              timeline: updatedTimeline,
            }
          : r
      )
    );
  };

  const retryRefund = async (refundId: string) => {
    const rfd = refunds.find((r) => r.id === refundId);
    if (!rfd) return;

    const now = new Date().toISOString();
    const event: RefundTimelineEvent = {
      id: `tl-${Date.now()}`,
      timestamp: now,
      action: 'Refund Retried',
      performedBy: 'Owner Admin',
      details: 'Refund retried by admin after failure.',
    };

    const updatedTimeline = [...rfd.timeline, event];

    await updateRefundStatusInDb(refundId, 'Processing', {
      timeline: updatedTimeline,
    });

    setRefunds((prev) =>
      prev.map((r) =>
        r.id === refundId
          ? { ...r, status: 'Processing', timeline: updatedTimeline }
          : r
      )
    );
  };

  const getCustomerRefunds = (phone: string): Refund[] => {
    if (!phone) return [];
    const last10 = phone.replace(/\D/g, '').slice(-10);
    return refunds.filter((r) => r.customerPhone.replace(/\D/g, '').slice(-10) === last10);
  };

  const deleteRefund = async (refundId: string) => {
    setRefunds((prev) => prev.filter((r) => r.id !== refundId));
    try {
      await supabase.from('refunds').delete().eq('id', refundId);
    } catch (err) {
      console.error('Delete refund error:', err);
    }
  };

  const getRefundById = (id: string) => refunds.find((r) => r.id === id);

  return (
    <RefundContext.Provider
      value={{
        refunds,
        loading,
        refreshRefunds,
        createRefund,
        approveRefund,
        rejectRefund,
        processRefund,
        retryRefund,
        deleteRefund,
        getCustomerRefunds,
        getRefundById,
      }}
    >
      {children}
    </RefundContext.Provider>
  );
};

export const useRefunds = () => {
  const context = useContext(RefundContext);
  if (!context) {
    throw new Error('useRefunds must be used within a RefundProvider');
  }
  return context;
};
