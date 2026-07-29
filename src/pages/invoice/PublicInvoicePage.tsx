import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Order } from '../../types';
import { fetchOrderById } from '../../services/supabaseService';
import { useOrders } from '../../context/OrderContext';
import { InvoiceA4 } from '../../components/invoice/InvoiceA4';
import { InvoiceToolbar } from '../../components/invoice/InvoiceToolbar';
import { useInvoicePdf } from '../../components/invoice/useInvoicePdf';
import { printInvoiceElement } from '../../utils/printHelper';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import '../../components/invoice/print.css';

export const PublicInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState<'a4' | 'thermal'>('a4');

  const invoiceRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGeneratingPdf } = useInvoicePdf();

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      // First try local context
      const local = getOrderById(id);
      if (local) {
        setOrder(local);
        setLoading(false);
        return;
      }
      // Fetch live from Supabase
      try {
        const fetched = await fetchOrderById(id);
        setOrder(fetched);
      } catch (err) {
        console.error('Failed fetching invoice order:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, getOrderById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center font-sans p-6 text-center">
        <Loader2 size={36} className="text-[#FF6A00] animate-spin mb-3" />
        <h2 className="font-heading font-black text-lg text-[#111111]">Loading Official Tax Invoice...</h2>
        <p className="text-xs text-gray-500 font-mono">MANIKANDAN LATHE Database Lookup</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center font-sans p-6">
        <div className="bg-white p-8 rounded-[24px] max-w-md w-full text-center space-y-4 shadow-xl border border-gray-200">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="font-heading font-black text-lg text-[#111111]">Invoice Record Not Found</h2>
          <p className="text-xs text-gray-500">The invoice reference or order ID does not exist in our workshop system.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#111111] hover:bg-[#FF6A00] text-white font-bold text-xs py-3 rounded-xl transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-16">
      {/* Top Navigation Bar */}
      <InvoiceToolbar
        order={order}
        activeTemplate={activeTemplate}
        setActiveTemplate={(tpl) => {
          if (tpl === 'thermal') {
            navigate(`/r/${order.id}`);
          } else {
            setActiveTemplate('a4');
          }
        }}
        onPrint={() => printInvoiceElement(invoiceRef.current, activeTemplate === 'thermal')}
        onDownloadPdf={() => downloadPdf(invoiceRef.current, order)}
        onClose={() => navigate(-1)}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* Main Invoice Container */}
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <InvoiceA4 order={order} containerRef={invoiceRef} />
      </div>
    </div>
  );
};
