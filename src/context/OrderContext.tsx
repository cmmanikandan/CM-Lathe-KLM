import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus, PaymentTransaction, DeliveryDetails, OrderItem } from '../types';
import { supabase } from '../services/supabase';
import {
  fetchAllOrders,
  fetchCustomerOrders,
  fetchOrderById,
  insertOrder,
  insertPayment,
  updateOrderStatus as dbUpdateStatus,
  upsertCustomerProfile,
} from '../services/supabaseService';
import {
  generateOnlineOrderNumber,
  generateFabricationOrderNumber,
  generatePosBillNumber,
  generatePaymentReceiptNumber,
} from '../services/idGeneratorService';


interface OrderContextType {
  orders: Order[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
  createOrder: (
    customerName: string,
    customerPhone: string,
    customerAddress: string,
    items: OrderItem[],
    notes?: string
  ) => Promise<Order>;
  createOfflineOrder: (
    customerName: string,
    customerPhone: string,
    customerAddress: string,
    items: OrderItem[],
    basePrice: number,
    reducedAmount: number,
    advanceAmount: number,
    paymentMode: PaymentTransaction['mode'],
    collectedBy: string,
    expectedDate?: string,
    extraCharges?: {
      labourCharge?: number;
      fabricationCharge?: number;
      installationCharge?: number;
      transportCharge?: number;
      gstAmount?: number;
      finalPrice?: number;
      deliveryDetails?: DeliveryDetails;
      notes?: string;
    }
  ) => Promise<Order>;
  adminAcceptOrder: (orderId: string, reducedAmount: number, advanceRequired: number, expectedDate?: string) => Promise<void>;
  adminRejectOrder: (orderId: string) => Promise<void>;
  addPaymentToOrder: (
    orderId: string,
    amount: number,
    mode: PaymentTransaction['mode'],
    collectedBy: string,
    referenceId?: string,
    extraPayload?: {
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      razorpaySignature?: string;
      bankName?: string;
      txnReference?: string;
      proofUrl?: string;
      paymentType?: 'Advance' | 'Partial' | 'Full' | 'Refund';
      notes?: string;
    }
  ) => Promise<PaymentTransaction>;

  updateOrderStatus: (orderId: string, status: OrderStatus, logMessage?: string) => Promise<void>;
  updateOrderPriority: (orderId: string, priority: Order['priority']) => Promise<void>;
  updateOrderProduction: (orderId: string, workerName: string, machineName: string, expectedFinish?: string, notes?: string) => Promise<void>;
  logOrderActivity: (orderId: string, action: string, performedBy: string, details?: string) => Promise<void>;
  assignDeliveryDetails: (orderId: string, details: DeliveryDetails) => Promise<void>;
  uploadCompletedImages: (orderId: string, images: string[]) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getCustomerOrders: (phone: string) => Order[];
  saveDraftOrder: (draft: any) => void;
  getDraftOrders: () => any[];
  deleteDraftOrder: (draftId: string) => void;
  createPaymentRequest: (req: any) => Promise<any>;
  payPaymentRequest: (requestId: string, razorpayPaymentId: string) => Promise<void>;
  cancelPaymentRequest: (requestId: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);


export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + Supabase realtime subscription
  useEffect(() => {
    refreshOrders();

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        refreshOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_transactions' }, () => {
        refreshOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refreshOrders]);

  // ─── Helpers ────────────────────────────────────────────────────────────

  const getOrderById = (orderId: string) => orders.find((o) => o.id === orderId);
  const getCustomerOrders = (phone: string) => {
    const last10 = phone.replace(/\D/g, '').slice(-10);
    return orders.filter((o) => o.customerPhone.replace(/\D/g, '').slice(-10) === last10);
  };

  // ─── Mutations ───────────────────────────────────────────────────────────

  const createOrder = async (
    customerName: string, customerPhone: string, customerAddress: string,
    items: OrderItem[], notes?: string
  ): Promise<Order> => {
    const basePrice = items.reduce((s, i) => s + i.totalPrice, 0);
    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: generateOnlineOrderNumber(),
      customerName, customerPhone, customerAddress, items, notes,
      basePrice, reducedAmount: 0, finalPrice: basePrice,
      advanceRequired: Math.min(5000, basePrice * 0.2),
      advancePaid: 0, remainingBalance: basePrice,
      status: 'PENDING', paymentHistory: [], completedImages: [],
      createdAt: new Date().toISOString(),
      isOfflineOrder: false,
    };
    await insertOrder(newOrder);
    try {
      await upsertCustomerProfile({
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        customerType: 'Online',
      });
    } catch (e) {
      console.error('Auto profile upsert error:', e);
    }
    await refreshOrders();
    return newOrder;
  };

  const createOfflineOrder = async (
    customerName: string, customerPhone: string, customerAddress: string,
    items: OrderItem[], basePrice: number, reducedAmount: number,
    advanceAmount: number, paymentMode: PaymentTransaction['mode'],
    collectedBy: string, expectedDate?: string,
    extraCharges?: {
      labourCharge?: number;
      fabricationCharge?: number;
      installationCharge?: number;
      transportCharge?: number;
      gstAmount?: number;
      finalPrice?: number;
      deliveryDetails?: DeliveryDetails;
      notes?: string;
    }
  ): Promise<Order> => {
    const finalPrice = extraCharges?.finalPrice ?? Math.max(0, basePrice + (extraCharges?.labourCharge || 0) + (extraCharges?.fabricationCharge || 0) + (extraCharges?.installationCharge || 0) + (extraCharges?.transportCharge || 0) + (extraCharges?.gstAmount || 0) - reducedAmount);
    
    const isPos = extraCharges?.notes?.toLowerCase().includes('pos') || extraCharges?.notes?.toLowerCase().includes('quick');
    const generatedOrderNum = isPos ? generatePosBillNumber() : generateFabricationOrderNumber();

    const firstPayment: PaymentTransaction = {
      id: 'pay-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      amount: advanceAmount,
      mode: paymentMode,
      collectedBy,
      remainingBalanceAfter: Math.max(0, finalPrice - advanceAmount),
      receiptNumber: generatePaymentReceiptNumber(),
    };

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: generatedOrderNum,
      customerName, customerPhone, customerAddress, items,
      basePrice,
      labourCharge: extraCharges?.labourCharge || 0,
      fabricationCharge: extraCharges?.fabricationCharge || 0,
      installationCharge: extraCharges?.installationCharge || 0,
      transportCharge: extraCharges?.transportCharge || 0,
      reducedAmount,
      gstAmount: extraCharges?.gstAmount || 0,
      finalPrice,
      advanceRequired: advanceAmount,
      advancePaid: advanceAmount,
      remainingBalance: Math.max(0, finalPrice - advanceAmount),
      status: 'ACCEPTED',
      paymentHistory: advanceAmount > 0 ? [firstPayment] : [],
      deliveryDetails: extraCharges?.deliveryDetails,
      notes: extraCharges?.notes,
      completedImages: [],
      createdAt: new Date().toISOString(),
      expectedDate,
      isOfflineOrder: true,
    };

    await insertOrder(newOrder);
    if (advanceAmount > 0) {
      await insertPayment(newOrder.id, firstPayment);
    }

    try {
      await upsertCustomerProfile({
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        customerType: 'Offline Walk-in',
      });
    } catch (e) {
      console.error('Auto profile upsert error:', e);
    }

    await refreshOrders();
    return newOrder;
  };



  const adminAcceptOrder = async (orderId: string, reducedAmount: number, advanceRequired: number, expectedDate?: string) => {
    const o = getOrderById(orderId);
    if (!o) return;
    const finalPrice = o.basePrice - reducedAmount;
    await supabase.from('orders').update({
      status: 'ACCEPTED', reduced_amount: reducedAmount,
      final_price: finalPrice, advance_required: advanceRequired,
      remaining_balance: finalPrice - o.advancePaid,
      expected_date: expectedDate,
    }).eq('id', orderId);
    await refreshOrders();
  };

  const adminRejectOrder = async (orderId: string) => {
    await dbUpdateStatus(orderId, 'REJECTED');
    await refreshOrders();
  };

  const addPaymentToOrder = async (
    orderId: string,
    amount: number,
    mode: PaymentTransaction['mode'],
    collectedBy: string,
    referenceId?: string,
    extraPayload?: {
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      razorpaySignature?: string;
      bankName?: string;
      txnReference?: string;
      proofUrl?: string;
      paymentType?: 'Advance' | 'Partial' | 'Full' | 'Refund';
      notes?: string;
    }
  ): Promise<PaymentTransaction> => {
    const o = getOrderById(orderId);
    if (!o) throw new Error('Order not found');

    const newRemaining = Math.max(0, o.remainingBalance - amount);
    const payment: PaymentTransaction = {
      id: 'pay-' + Date.now(),
      orderId: orderId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      amount,
      mode,
      paymentType: extraPayload?.paymentType || (newRemaining === 0 ? 'Full' : 'Partial'),
      paymentStatus: 'SUCCESS',
      collectedBy,
      remainingBalanceAfter: newRemaining,
      receiptNumber: `RCP-${Math.floor(8000 + Math.random() * 2000)}`,
      referenceId: referenceId || extraPayload?.razorpayPaymentId,
      razorpayPaymentId: extraPayload?.razorpayPaymentId,
      razorpayOrderId: extraPayload?.razorpayOrderId,
      razorpaySignature: extraPayload?.razorpaySignature,
      bankName: extraPayload?.bankName,
      txnReference: extraPayload?.txnReference,
      proofUrl: extraPayload?.proofUrl,
      notes: extraPayload?.notes,
    };

    await supabase
      .from('orders')
      .update({
        advance_paid: o.advancePaid + amount,
        remaining_balance: newRemaining,
      })
      .eq('id', orderId);

    await insertPayment(orderId, payment);
    await refreshOrders();
    return payment;
  };


  const logOrderActivity = async (orderId: string, action: string, performedBy: string, details?: string) => {
    const o = getOrderById(orderId);
    if (!o) return;
    const newEntry = {
      id: 'act-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
      action,
      performedBy,
      details,
    };
    const updatedLog = [newEntry, ...(o.activityLog || [])];
    await supabase.from('orders').update({ activity_log: updatedLog }).eq('id', orderId);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, logMessage?: string) => {
    await dbUpdateStatus(orderId, status);
    await logOrderActivity(orderId, `Status changed to ${status}`, 'Staff / Admin', logMessage);
    await refreshOrders();
  };

  const updateOrderPriority = async (orderId: string, priority: Order['priority']) => {
    await supabase.from('orders').update({ priority }).eq('id', orderId);
    await logOrderActivity(orderId, `Priority set to ${priority}`, 'Admin');
    await refreshOrders();
  };

  const updateOrderProduction = async (
    orderId: string,
    workerName: string,
    machineName: string,
    expectedFinish?: string,
    notes?: string
  ) => {
    const o = getOrderById(orderId);
    if (!o) return;

    const currentDelivery = o.deliveryDetails || {
      personName: workerName,
      mobileNumber: '+91 96592 86268',
      deliveryCharge: 0,
      expectedDate: expectedFinish || '',
      expectedTime: '05:00 PM',
      status: 'Assigned',
    };

    const updatedDelivery = {
      ...currentDelivery,
      personName: workerName,
    };

    await supabase
      .from('orders')
      .update({
        assigned_machine: machineName,
        delivery_details: updatedDelivery,
        expected_date: expectedFinish || o.expectedDate,
        notes: notes ? `${o.notes || ''} [Production Note: ${notes}]` : o.notes,
      })
      .eq('id', orderId);

    await logOrderActivity(
      orderId,
      `Assigned to Worker ${workerName} on ${machineName}`,
      'Workshop Foreman',
      notes
    );
    await refreshOrders();
  };

  const assignDeliveryDetails = async (orderId: string, details: DeliveryDetails) => {
    await supabase.from('orders').update({ delivery_details: details }).eq('id', orderId);
    await logOrderActivity(orderId, `Delivery assigned to ${details.personName}`, 'Dispatch Team');
    await refreshOrders();
  };

  const uploadCompletedImages = async (orderId: string, images: string[]) => {
    await supabase.from('orders').update({ completed_images: images, status: 'COMPLETED' }).eq('id', orderId);
    await logOrderActivity(orderId, 'Uploaded completed machine photos & marked Completed', 'Workshop Team');
    await refreshOrders();
  };

  const cancelOrder = async (orderId: string, reason?: string) => {
    const notesStr = reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer';
    await supabase.from('orders').update({ status: 'REJECTED', notes: notesStr }).eq('id', orderId);
    await logOrderActivity(orderId, 'Order Cancelled', 'Admin / Customer', reason);
    await refreshOrders();
  };

  // ─── DRAFT ORDERS MANAGEMENT (LOCALSTORAGE) ─────────────────────────────────
  const saveDraftOrder = (draft: any) => {
    try {
      const existing = getDraftOrders();
      const filtered = existing.filter((d: any) => d.id !== draft.id);
      const updated = [{ ...draft, updatedAt: new Date().toISOString() }, ...filtered];
      localStorage.setItem('ml_offline_order_drafts', JSON.stringify(updated));
    } catch (e) {
      console.error('saveDraftOrder error:', e);
    }
  };

  const getDraftOrders = (): any[] => {
    try {
      const raw = localStorage.getItem('ml_offline_order_drafts');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const deleteDraftOrder = (draftId: string) => {
    try {
      const existing = getDraftOrders();
      const filtered = existing.filter((d: any) => d.id !== draftId);
      localStorage.setItem('ml_offline_order_drafts', JSON.stringify(filtered));
    } catch (e) {
      console.error('deleteDraftOrder error:', e);
    }
  };


  const createPaymentRequest = async (req: any): Promise<any> => {
    try {
      const { insertPaymentRequest } = await import('../services/supabaseService');
      const result = await insertPaymentRequest(req);
      
      // Update local state order with payment request
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === req.orderId) {
            const reqs = o.paymentRequests || [];
            return { ...o, paymentRequests: [req, ...reqs] };
          }
          return o;
        })
      );
      return result || req;
    } catch (err) {
      console.error('createPaymentRequest error:', err);
      return req;
    }
  };

  const payPaymentRequest = async (requestId: string, razorpayPaymentId: string): Promise<void> => {
    try {
      const { markPaymentRequestPaid } = await import('../services/supabaseService');
      await markPaymentRequestPaid(requestId, razorpayPaymentId);

      setOrders((prev) =>
        prev.map((o) => {
          if (o.paymentRequests && o.paymentRequests.some((r) => r.id === requestId)) {
            const updatedReqs = o.paymentRequests.map((r) =>
              r.id === requestId ? { ...r, status: 'PAID' as const, razorpayPaymentId, paidAt: new Date().toISOString() } : r
            );
            return { ...o, paymentRequests: updatedReqs };
          }
          return o;
        })
      );
    } catch (err) {
      console.error('payPaymentRequest error:', err);
    }
  };

  const cancelPaymentRequest = async (requestId: string): Promise<void> => {
    try {
      const { cancelPaymentRequest: cancelDb } = await import('../services/supabaseService');
      await cancelDb(requestId);

      setOrders((prev) =>
        prev.map((o) => {
          if (o.paymentRequests && o.paymentRequests.some((r) => r.id === requestId)) {
            const updatedReqs = o.paymentRequests.map((r) =>
              r.id === requestId ? { ...r, status: 'CANCELLED' as const } : r
            );
            return { ...o, paymentRequests: updatedReqs };
          }
          return o;
        })
      );
    } catch (err) {
      console.error('cancelPaymentRequest error:', err);
    }
  };

  return (
    <OrderContext.Provider value={{
      orders, loading, refreshOrders,
      createOrder, createOfflineOrder,
      adminAcceptOrder, adminRejectOrder,
      addPaymentToOrder, updateOrderStatus,
      updateOrderPriority, updateOrderProduction,
      logOrderActivity, saveDraftOrder, getDraftOrders, deleteDraftOrder,
      createPaymentRequest, payPaymentRequest, cancelPaymentRequest,
      assignDeliveryDetails, uploadCompletedImages, cancelOrder,
      getOrderById, getCustomerOrders,
    }}>
      {children}
    </OrderContext.Provider>
  );

};


export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
};

// Customer-specific hook — filters logged-in user's orders from OrderContext
export const useCustomerOrders = (phone: string) => {
  const { orders, loading, refreshOrders } = useOrders();
  const normalised = phone.replace(/\D/g, '').slice(-10);

  const customerOrders = orders.filter((o) => {
    if (!normalised) return false;
    const orderPhone = o.customerPhone.replace(/\D/g, '').slice(-10);
    return orderPhone === normalised;
  });

  return { orders: customerOrders, loading, refresh: refreshOrders };
};

// Fetch a single order live from OrderContext
export const useOrderDetail = (orderId: string) => {
  const { orders, loading } = useOrders();
  const order = orders.find((o) => o.id === orderId) || null;
  return { order, loading };
};
