import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PharmacyContext } from '../../context/PharmacyContext';
import { useTranslation } from 'react-i18next';
import { FaEye, FaCheckCircle, FaTimesCircle, FaTruck, FaBox } from 'react-icons/fa';
import DashboardHero from '../../components/DashboardHero';
import { LoadingComponents } from '../../components/LoadingComponents';

const PharmacyOrders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orders, getOrders, updateOrderStatus, addOrderMessage } = useContext(PharmacyContext);

  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
    // Poll for new messages if modal is open (optional, simplified for now)
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    const filters = {};
    if (statusFilter) filters.status = statusFilter;
    await getOrders(filters);
    setLoading(false);
  };

  // Added handleSendMessage
  const handleSendMessage = async (orderId, text) => {
    try {
      const result = await addOrderMessage(orderId, text);
      if (result.success) {
        // Refresh orders to see new message
        // Ideally update local state 'selectedOrder' immediately
        setSelectedOrder(prev => ({
          ...prev,
          messages: [...(prev.messages || []), {
            sender: 'pharmacy',
            text,
            createdAt: new Date().toISOString()
          }]
        }));
        // Also refresh global list
        loadOrders();
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleStatusChange = async (orderId, newStatus, courier = null) => {
    if (!window.confirm(t('pharmacy.orders.confirmStatusChange') || `Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }

    setLoading(true);
    try {
      await updateOrderStatus(orderId, newStatus, courier);
      await loadOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-primary-100 text-primary-800';
      case 'Shipped': return 'bg-primary-100 text-primary-800';
      case 'Verified': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white min-h-screen px-4 sm:px-8 py-8 space-y-8">
      <DashboardHero
        eyebrow={t('pharmacy.orders.eyebrow') || 'Orders'}
        title={t('pharmacy.orders.title') || 'Orders Management'}
        description={t('pharmacy.orders.subtitle') || 'Monitor verifications, shipping and delivery confirmations in real time.'}
      />

      {/* Filters */}
      <div className="border border-border bg-white p-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-80 px-4 py-3 border border-border   text-[11px] tracking-[0.3em]"
        >
          <option value="">{t('pharmacy.orders.allStatuses') || 'All Statuses'}</option>
          <option value="Pending">{t('pharmacy.orders.pending') || 'Pending'}</option>
          <option value="Verified">{t('pharmacy.orders.verified') || 'Verified'}</option>
          <option value="Rejected">{t('pharmacy.orders.rejected') || 'Rejected'}</option>
          <option value="Shipped">{t('pharmacy.orders.shipped') || 'Shipped'}</option>
          <option value="Delivered">{t('pharmacy.orders.delivered') || 'Delivered'}</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="border border-border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  ">
                  {t('pharmacy.orders.orderId') || 'Order ID'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  ">
                  {t('pharmacy.orders.patient') || 'Patient'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  ">
                  {t('pharmacy.orders.items') || 'Items'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  ">
                  {t('pharmacy.orders.total') || 'Total'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  ">
                  {t('pharmacy.orders.status') || 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  ">
                  {t('pharmacy.orders.date') || 'Date'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  ">
                  {t('pharmacy.orders.actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12">
                    <LoadingComponents.PharmacyLoader text="Loading orders..." />
                  </td>
                </tr>
              ) : orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.patientId?.name || t('pharmacy.orders.unknown') || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">{order.patientId?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items?.length || 0} {t('pharmacy.orders.items') || 'items'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.total?.toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium roun-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="text-primary hover:text-primary-dark mr-3"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {t('pharmacy.orders.noOrders') || 'No orders found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white roun-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('pharmacy.orders.orderDetails') || 'Order Details'} #{selectedOrder._id.slice(-6)}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Patient Info */}
              <div className="bg-gray-50 roun-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('pharmacy.orders.patientInfo') || 'Patient Information'}
                </h3>
                <p className="text-sm text-gray-700">
                  <strong>{t('pharmacy.orders.name') || 'Name'}:</strong> {selectedOrder.patientId?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>{t('pharmacy.orders.email') || 'Email'}:</strong> {selectedOrder.patientId?.email || 'N/A'}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>{t('pharmacy.orders.phone') || 'Phone'}:</strong> {selectedOrder.patientId?.phone || 'N/A'}
                </p>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('pharmacy.orders.orderItems') || 'Order Items'}
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 roun-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.medicationId?.name || 'Unknown Medication'}</p>
                        <p className="text-sm text-gray-500">
                          {t('pharmacy.orders.qty') || 'Qty'}: {item.qty} × {item.price?.toLocaleString()} RWF
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {(item.qty * item.price)?.toLocaleString()} RWF
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {t('pharmacy.orders.total') || 'Total'}: {selectedOrder.total?.toLocaleString()} RWF
                    </p>
                  </div>
                </div>
              </div>

              {/* Prescription File */}
              {selectedOrder.prescriptionImageUrl && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('pharmacy.orders.prescription') || 'Prescription File'}
                  </h3>
                  <div className="border border-gray-200 roun-lg p-4 bg-gray-50">
                    {selectedOrder.prescriptionImageUrl.includes('.pdf') || selectedOrder.prescriptionImageUrl.includes('pdf') ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📄</span>
                          <div>
                            <p className="font-medium text-gray-900">PDF Prescription</p>
                            <p className="text-sm text-gray-500">Click to view or download</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={selectedOrder.prescriptionImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center text-xs   tracking-[0.3em] border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-white transition"
                          >
                            View PDF
                          </a>
                          <a
                            href={selectedOrder.prescriptionImageUrl}
                            download
                            className="flex-1 text-center text-xs   tracking-[0.3em] bg-primary text-white px-4 py-2 hover:bg-primary-dark transition"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <img
                          src={selectedOrder.prescriptionImageUrl}
                          alt="Prescription"
                          className="max-w-full h-auto roun-lg border border-gray-200"
                        />
                        <div className="flex gap-2">
                          <a
                            href={selectedOrder.prescriptionImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center text-xs   tracking-[0.3em] border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-white transition"
                          >
                            View Full Size
                          </a>
                          <a
                            href={selectedOrder.prescriptionImageUrl}
                            download
                            className="flex-1 text-center text-xs   tracking-[0.3em] bg-primary text-white px-4 py-2 hover:bg-primary-dark transition"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chat Section */}
              <div className="mb-4 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('pharmacy.orders.messages') || 'Messages'}
                </h3>
                <div className="max-h-48 overflow-y-auto mb-3 space-y-2 border border-gray-200 p-2 rounded bg-white">
                  {selectedOrder.messages && selectedOrder.messages.length > 0 ? (
                    selectedOrder.messages.map((msg, index) => (
                      <div key={index} className={`flex flex-col ${msg.sender === 'pharmacy' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${msg.sender === 'pharmacy'
                          ? 'bg-blue-100 text-blue-900 rounded-tr-none'
                          : 'bg-gray-200 text-gray-900 rounded-tl-none'
                          }`}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">
                          {new Date(msg.createdAt).toLocaleString()} • {msg.sender}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">No messages yet.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message to patient..."
                    id={`msg-input-${selectedOrder._id}`}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const text = e.currentTarget.value;
                        if (!text.trim()) return;

                        // Optimistic update logic or just refresh
                        // For simplicity, let's call API then refresh
                        // We need 'addOrderMessage' from context usually, but it wasn't extracted.
                        // Let's assume we can add it or make a direct call if Context doesn't have it.
                        // Checking Context usage...
                        // defined: const { orders, getOrders, updateOrderStatus } = useContext(PharmacyContext);
                        // I need to update PharmacyContext to include addOrderMessage or import axios here.
                        // I will import axios directly for speed if context not ready, 
                        // BUT Context is cleaner. I'll stick to injecting it via Context in next step 
                        // OR use a local function if I can access token.
                        // Let's make this input strictly UI for now and handle logic below.
                      }
                    }}
                  />
                  <button
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition"
                    onClick={() => {
                      const input = document.getElementById(`msg-input-${selectedOrder._id}`);
                      if (input && input.value.trim()) {
                        handleSendMessage(selectedOrder._id, input.value.trim());
                        input.value = '';
                      }
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Status Actions */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('pharmacy.orders.updateStatus') || 'Update Status'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.orderStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedOrder._id, 'Verified')}
                        disabled={loading}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <FaCheckCircle />
                        {t('pharmacy.orders.verify') || 'Verify'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedOrder._id, 'Rejected')}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <FaTimesCircle />
                        {t('pharmacy.orders.reject') || 'Reject'}
                      </button>
                    </>
                  )}
                  {selectedOrder.orderStatus === 'Verified' && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder._id, 'Shipped')}
                      disabled={loading}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <FaTruck />
                      {t('pharmacy.orders.markShipped') || 'Mark as Shipped'}
                    </button>
                  )}
                  {selectedOrder.orderStatus === 'Shipped' && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder._id, 'Delivered')}
                      disabled={loading}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <FaBox />
                      {t('pharmacy.orders.markDelivered') || 'Mark as Delivered'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyOrders;

