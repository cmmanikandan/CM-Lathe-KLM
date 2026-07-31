import React, { useState, useEffect } from 'react';
import { useOrders } from '../../context/OrderContext';
import { CustomerUser } from '../../types';
import {
  fetchAllCustomerProfiles,
  upsertCustomerProfile,
  deleteCustomerProfile,
} from '../../services/supabaseService';
import {
  Users,
  Search,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  IndianRupee,
  UserCheck,
  Edit3,
  Trash2,
  X,
  ExternalLink,
  Shield,
} from 'lucide-react';

import { GenericDeleteModal } from '../../components/common/GenericDeleteModal';

export const AdminCustomersPage: React.FC = () => {
  const { orders } = useOrders();
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'Online' | 'Offline Walk-in' | 'VIP'>('ALL');

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerUser | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<{ id: string; name: string } | null>(null);

  const [viewingCustomer, setViewingCustomer] = useState<CustomerUser | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formDistrict, setFormDistrict] = useState('Dindigul');
  const [formPincode, setFormPincode] = useState('624616');
  const [formType, setFormType] = useState<'Online' | 'Offline Walk-in' | 'VIP'>('Online');
  const [formNotes, setFormNotes] = useState('');

  // Fetch customers from Supabase + merge with order customers if missing
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const profiles = await fetchAllCustomerProfiles();
      
      // Extract unique customers from existing orders to ensure comprehensive tracking
      const orderCustomerMap = new Map<string, { name: string; phone: string; address: string; count: number; spent: number }>();
      
      orders.forEach((o) => {
        const normPhone = o.customerPhone.replace(/\D/g, '').slice(-10);
        if (!normPhone) return;
        
        const paid = o.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
        if (orderCustomerMap.has(normPhone)) {
          const existing = orderCustomerMap.get(normPhone)!;
          existing.count += 1;
          existing.spent += paid;
        } else {
          orderCustomerMap.set(normPhone, {
            name: o.customerName,
            phone: o.customerPhone,
            address: o.customerAddress,
            count: 1,
            spent: paid,
          });
        }
      });

      // Combine database profiles with derived metrics from orders
      const mergedCustomers: CustomerUser[] = [...profiles];

      // Add missing customers from orders who might not have a customer_profiles record yet
      orderCustomerMap.forEach((ordData, normPhone) => {
        const exists = mergedCustomers.some((p) => p.phone.replace(/\D/g, '').slice(-10) === normPhone);
        if (!exists) {
          mergedCustomers.push({
            id: `cust-ord-${normPhone}`,
            name: ordData.name,
            phone: ordData.phone,
            email: '',
            address: ordData.address,
            role: 'customer',
            customerType: 'Online',
            totalOrdersCount: ordData.count,
            totalSpent: ordData.spent,
            createdAt: new Date().toISOString(),
          });
        }
      });

      // Update metrics for profiles
      mergedCustomers.forEach((c) => {
        const normPhone = c.phone.replace(/\D/g, '').slice(-10);
        const custOrders = orders.filter((o) => o.customerPhone.replace(/\D/g, '').slice(-10) === normPhone);
        c.totalOrdersCount = custOrders.length;
        c.totalSpent = custOrders.reduce((sum, o) => sum + o.paymentHistory.reduce((s, p) => s + p.amount, 0), 0);
      });

      setCustomers(mergedCustomers);
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [orders]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('Kallimandhayam, Dindigul');
    setFormDistrict('Dindigul');
    setFormPincode('624616');
    setFormType('Online');
    setFormNotes('');
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cust: CustomerUser) => {
    setEditingCustomer(cust);
    setFormName(cust.name);
    setFormPhone(cust.phone);
    setFormEmail(cust.email || '');
    setFormAddress(cust.address || '');
    setFormDistrict(cust.district || 'Dindigul');
    setFormPincode(cust.pincode || '624616');
    setFormType(cust.customerType || 'Online');
    setFormNotes(cust.notes || '');
    setIsAddEditModalOpen(true);
  };

  // Save Customer Form
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) {
      alert('Please fill customer name and phone number.');
      return;
    }

    const saved = await upsertCustomerProfile({
      id: editingCustomer?.id,
      name: formName,
      phone: formPhone,
      email: formEmail,
      address: formAddress,
      district: formDistrict,
      pincode: formPincode,
      customerType: formType,
      notes: formNotes,
      role: 'customer',
    });

    if (saved) {
      alert('Customer details saved successfully!');
    }
    setIsAddEditModalOpen(false);
    loadCustomers();
  };

  // Delete Customer
  const handleDeleteCustomer = (id: string, name: string) => {
    setDeletingCustomer({ id, name });
  };

  // Filter logic
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.district && c.district.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedTypeFilter === 'ALL' || c.customerType === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  // Metrics
  const totalCustomersCount = customers.length;
  const onlineCustomersCount = customers.filter((c) => c.customerType === 'Online').length;
  const offlineCustomersCount = customers.filter((c) => c.customerType === 'Offline Walk-in').length;
  const vipCustomersCount = customers.filter((c) => c.customerType === 'VIP').length;
  const totalSpentAll = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24">
      {/* Admin Top Header */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-heading font-extrabold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Shield size={16} /> ADMIN MANAGEMENT PORTAL
            </span>
            <h1 className="font-heading font-black text-3xl text-white mt-1">
              CUSTOMER DIRECTORY & MANAGEMENT
            </h1>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <PlusCircle size={18} /> Add New Customer
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-[#111111]">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">Total Customers</span>
            <h3 className="font-heading font-black text-2xl text-[#111111] mt-2">
              {totalCustomersCount}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold">Registered directory</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-blue-500">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">🌐 Online App Buyers</span>
            <h3 className="font-heading font-black text-2xl text-blue-600 mt-2">
              {onlineCustomersCount}
            </h3>
            <span className="text-[10px] text-blue-500 font-bold">Mobile & Website users</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-emerald-500">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">🏪 Walk-in Counter</span>
            <h3 className="font-heading font-black text-2xl text-emerald-600 mt-2">
              {offlineCustomersCount}
            </h3>
            <span className="text-[10px] text-emerald-500 font-bold">Shop walk-in clients</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-purple-500">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">⭐ VIP Priority Buyers</span>
            <h3 className="font-heading font-black text-2xl text-purple-600 mt-2">
              {vipCustomersCount}
            </h3>
            <span className="text-[10px] text-purple-500 font-bold">Repeat & High volume</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-[#F97316] col-span-2 sm:col-span-1">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">Total Lifetime Revenue</span>
            <h3 className="font-heading font-black text-2xl text-[#F97316] mt-2">
              ₹{totalSpentAll.toLocaleString('en-IN')}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold">Customer payments received</span>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            
            {/* Type Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <button
                onClick={() => setSelectedTypeFilter('ALL')}
                className={`px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                  selectedTypeFilter === 'ALL'
                    ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
              >
                All Customers ({totalCustomersCount})
              </button>

              <button
                onClick={() => setSelectedTypeFilter('Online')}
                className={`px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                  selectedTypeFilter === 'Online'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
              >
                🌐 Online Buyers ({onlineCustomersCount})
              </button>

              <button
                onClick={() => setSelectedTypeFilter('Offline Walk-in')}
                className={`px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                  selectedTypeFilter === 'Offline Walk-in'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                🏪 Walk-in Shop ({offlineCustomersCount})
              </button>

              <button
                onClick={() => setSelectedTypeFilter('VIP')}
                className={`px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                  selectedTypeFilter === 'VIP'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                }`}
              >
                ⭐ VIP Clients ({vipCustomersCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, phone, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none text-xs font-bold focus:border-[#F97316] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Customer Directory Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 font-bold text-sm">
              Loading customer profiles...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Users size={36} className="mx-auto text-gray-300" />
              <p className="text-gray-500 font-bold text-sm">No customers found matching your filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="bg-[#111111] text-white font-heading font-extrabold uppercase text-[11px] tracking-wider border-b border-gray-800">
                    <th className="p-4">Customer Info</th>
                    <th className="p-4">Phone / Contact</th>
                    <th className="p-4">Location / Address</th>
                    <th className="p-4">Customer Category</th>
                    <th className="p-4 text-center">Orders Placed</th>
                    <th className="p-4 text-right">Total Spent</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium">
                  {filteredCustomers.map((cust) => {
                    const normPhone = cust.phone.replace(/\D/g, '').slice(-10);
                    return (
                      <tr key={cust.id} className="hover:bg-amber-50/50 transition-colors">
                        
                        {/* Name & Avatar */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#F97316] text-white flex items-center justify-center font-black font-heading text-sm shadow-xs">
                              {cust.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-heading font-black text-sm text-[#111111] block">
                                {cust.name}
                              </span>
                              {cust.email ? (
                                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                  <Mail size={12} /> {cust.email}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400 italic">No email provided</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact & WhatsApp */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <a
                              href={`tel:${cust.phone}`}
                              className="font-mono font-bold text-gray-800 hover:text-[#F97316] flex items-center gap-1.5"
                            >
                              <Phone size={13} className="text-[#F97316]" /> {cust.phone}
                            </a>

                            <a
                              href={`https://wa.me/91${normPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full hover:bg-emerald-200 transition-colors"
                            >
                              <MessageCircle size={12} /> Chat WhatsApp
                            </a>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="p-4">
                          <div className="max-w-xs text-gray-700 space-y-0.5">
                            <p className="line-clamp-2 text-xs font-semibold">{cust.address || 'Kallimandhayam'}</p>
                            {cust.district && (
                              <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                                <MapPin size={11} className="text-gray-400" /> {cust.district}, {cust.state || 'Tamil Nadu'}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="p-4">
                          {cust.customerType === 'Offline Walk-in' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[10px] border border-emerald-300">
                              🏪 Walk-in Shop
                            </span>
                          ) : cust.customerType === 'VIP' ? (
                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-full text-[10px] border border-purple-300">
                              ⭐ VIP Client
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full text-[10px] border border-blue-300">
                              🌐 Online App
                            </span>
                          )}
                        </td>

                        {/* Orders count */}
                        <td className="p-4 text-center">
                          <span className="bg-gray-100 text-gray-800 font-mono font-bold px-2.5 py-1 rounded-lg border border-gray-200">
                            {cust.totalOrdersCount || 0} orders
                          </span>
                        </td>

                        {/* Total Spent */}
                        <td className="p-4 text-right">
                          <strong className="font-heading font-black text-sm text-[#F97316]">
                            ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
                          </strong>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewingCustomer(cust)}
                              className="p-1.5 bg-gray-100 hover:bg-[#F97316] text-gray-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="View Customer Profile & Orders"
                            >
                              <ExternalLink size={16} />
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(cust)}
                              className="p-1.5 bg-gray-100 hover:bg-blue-600 text-gray-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Edit Customer Details"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                              className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Remove Customer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Customer Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#111111] text-white p-5 flex justify-between items-center border-b border-gray-800">
              <div className="flex items-center gap-2">
                <UserCheck size={20} className="text-[#F97316]" />
                <h3 className="font-heading font-black text-lg">
                  {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Senthil Kumar"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 text-xs focus:border-[#F97316] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98421 88412"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-mono font-medium text-gray-900 text-xs focus:border-[#F97316] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 text-xs focus:border-[#F97316] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Customer Type / Category</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-xs text-[#F97316] focus:border-[#F97316] transition-colors"
                  >
                    <option value="Online">🌐 Online App User</option>
                    <option value="Offline Walk-in">🏪 Offline Walk-in Buyer</option>
                    <option value="VIP">⭐ VIP Priority Customer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Street Address</label>
                <textarea
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Door No, Street Name, Area..."
                  className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 text-xs focus:border-[#F97316] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">District / City</label>
                  <input
                    type="text"
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    placeholder="Dindigul"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 text-xs focus:border-[#F97316] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formPincode}
                    onChange={(e) => setFormPincode(e.target.value)}
                    placeholder="624616"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-mono font-medium text-gray-900 text-xs focus:border-[#F97316] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Notes / Custom Remarks</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Regular tractor kalappai customer"
                  className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 text-xs focus:border-[#F97316] transition-colors"
                />
              </div>


              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black cursor-pointer shadow-md"
                >
                  {editingCustomer ? 'Update Profile' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Details Modal */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="bg-[#111111] text-white p-6 flex justify-between items-center border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F97316] text-white flex items-center justify-center font-black font-heading text-xl shadow-lg">
                  {viewingCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl text-white">
                    {viewingCustomer.name}
                  </h3>
                  <span className="text-gray-400 text-xs font-mono">
                    ID: {viewingCustomer.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setViewingCustomer(null)}
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto font-sans text-xs">
              
              {/* Quick Contact & Badges */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-wrap justify-between items-center gap-4">
                <div className="space-y-1">
                  <span className="font-mono font-bold text-sm text-[#111111] block flex items-center gap-1.5">
                    <Phone size={14} className="text-[#F97316]" /> {viewingCustomer.phone}
                  </span>
                  <p className="text-gray-500 font-semibold">{viewingCustomer.address}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/91${viewingCustomer.phone.replace(/\D/g, '').slice(-10)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm text-xs"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>

                  <a
                    href={`tel:${viewingCustomer.phone}`}
                    className="bg-[#111111] hover:bg-black text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm text-xs"
                  >
                    <Phone size={14} /> Call
                  </a>
                </div>
              </div>

              {/* Stats overview for this customer */}
              {(() => {
                const normPhone = viewingCustomer.phone.replace(/\D/g, '').slice(-10);
                const custOrders = orders.filter((o) => o.customerPhone.replace(/\D/g, '').slice(-10) === normPhone);
                const totalSpent = custOrders.reduce((sum, o) => sum + o.paymentHistory.reduce((s, p) => s + p.amount, 0), 0);
                const pendingBalance = custOrders.reduce((sum, o) => sum + o.remainingBalance, 0);

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <span className="text-[10px] text-amber-800 font-bold uppercase block">Total Orders</span>
                        <strong className="font-heading font-black text-lg text-amber-900">{custOrders.length}</strong>
                      </div>

                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <span className="text-[10px] text-emerald-800 font-bold uppercase block">Total Paid</span>
                        <strong className="font-heading font-black text-lg text-emerald-900">₹{totalSpent.toLocaleString('en-IN')}</strong>
                      </div>

                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                        <span className="text-[10px] text-red-800 font-bold uppercase block">Balance Due</span>
                        <strong className="font-heading font-black text-lg text-red-900">₹{pendingBalance.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>

                    {/* Order History Timeline */}
                    <div>
                      <h4 className="font-heading font-extrabold text-sm text-[#111111] uppercase tracking-wider mb-3">
                        Order History Timeline ({custOrders.length})
                      </h4>

                      {custOrders.length === 0 ? (
                        <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500 font-semibold">
                          No orders placed yet by this customer.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {custOrders.map((ord) => (
                            <div key={ord.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs text-[#111111]">{ord.orderNumber}</span>
                                  {ord.isOfflineOrder ? (
                                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                                      🏪 OFFLINE
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                      🌐 ONLINE
                                    </span>
                                  )}
                                  <span className="text-[9px] font-bold bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded uppercase">
                                    {ord.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-600 font-medium">
                                  {ord.items.map((i) => i.productName).join(', ') || 'Lathe job order'}
                                </p>
                              </div>

                              <div className="text-right">
                                <strong className="font-heading font-black text-xs text-[#F97316] block">
                                  ₹{ord.finalPrice.toLocaleString('en-IN')}
                                </strong>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      <GenericDeleteModal
        isOpen={!!deletingCustomer}
        title="Remove Customer Profile"
        itemTitle={deletingCustomer?.name}
        description={`Are you sure you want to remove customer "${deletingCustomer?.name}"?`}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={async () => {
          if (deletingCustomer) {
            await deleteCustomerProfile(deletingCustomer.id);
            loadCustomers();
          }
        }}
      />
    </div>
  );
};

export default AdminCustomersPage;
