import { Order } from '../types';

export const exportOrdersToCSV = (orders: Order[], filename: string = 'manikandan_lathe_orders.csv') => {
  if (!orders || orders.length === 0) {
    alert('No order data available to export.');
    return;
  }

  const headers = [
    'Order No',
    'Customer Name',
    'Customer Phone',
    'Order Type',
    'Total Price (INR)',
    'Advance Paid (INR)',
    'Remaining Balance (INR)',
    'Status',
    'Order Date'
  ];

  const rows = orders.map((o) => [
    `"${o.orderNumber}"`,
    `"${o.customerName.replace(/"/g, '""')}"`,
    `"${o.customerPhone}"`,
    `"${o.isOfflineOrder ? 'Offline Walk-in' : 'Online App'}"`,
    o.finalPrice || 0,
    o.advancePaid || 0,
    o.remainingBalance || 0,
    `"${o.status}"`,
    `"${new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportPaymentsToCSV = (orders: Order[], filename: string = 'manikandan_lathe_payments.csv') => {
  const allPayments: any[] = [];

  orders.forEach((o) => {
    (o.paymentHistory || []).forEach((p) => {
      allPayments.push({
        receiptNumber: p.receiptNumber || 'N/A',
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        amount: p.amount,
        mode: p.mode,
        date: p.date,
        time: p.time,
        remainingAfter: p.remainingBalanceAfter
      });
    });
  });

  if (allPayments.length === 0) {
    alert('No payment receipts recorded yet.');
    return;
  }

  const headers = [
    'Receipt No',
    'Order No',
    'Customer Name',
    'Phone',
    'Amount Paid (INR)',
    'Payment Mode',
    'Date',
    'Time',
    'Balance Left (INR)'
  ];

  const rows = allPayments.map((p) => [
    `"${p.receiptNumber}"`,
    `"${p.orderNumber}"`,
    `"${p.customerName.replace(/"/g, '""')}"`,
    `"${p.customerPhone}"`,
    p.amount,
    `"${p.mode}"`,
    `"${p.date}"`,
    `"${p.time}"`,
    p.remainingAfter
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
