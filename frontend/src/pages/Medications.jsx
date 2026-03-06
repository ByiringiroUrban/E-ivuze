import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import SEO from '../components/SEO';

const placeholderImage =
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80';

const Medications = () => {
  const { backendUrl, token } = useContext(AppContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pharmacies, setPharmacies] = useState([]);
  const [pharmaciesLoading, setPharmaciesLoading] = useState(false);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', pharmacyId: '' });
  const [orderModal, setOrderModal] = useState({
    open: false,
    medication: null,
    qty: 1,
    paymentType: 'self',
    deliveryAddress: {
      line1: '',
      line2: '',
      city: '',
      country: 'Rwanda'
    },
    prescriptionFile: null,
    submitting: false
  });

  useEffect(() => {
    fetchPharmacies();
  }, [backendUrl]);

  useEffect(() => {
    fetchMedications();
  }, [filters]);

  const fetchPharmacies = async () => {
    try {
      setPharmaciesLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/pharmacy/public/approved`);
      if (data.success) {
        setPharmacies(data.pharmacies || []);
      } else {
        toast.error(
          data.message || t('pages.medications.errors.pharmaciesLoadFailed')
        );
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      toast.error(
        error.response?.data?.message ||
        t('pages.medications.errors.pharmaciesLoadFailed')
      );
    } finally {
      setPharmaciesLoading(false);
    }
  };

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.pharmacyId) params.append('pharmacyId', filters.pharmacyId);

      const { data } = await axios.get(
        `${backendUrl}/api/pharmacy/public/medications?${params.toString()}`
      );

      if (data.success) {
        setMedications(data.medications || []);
      } else {
        toast.error(
          data.message || t('pages.medications.errors.medicationsLoadFailed')
        );
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
      toast.error(
        error.response?.data?.message ||
        t('pages.medications.errors.medicationsLoadFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (medication) => {
    if (!token) {
      navigate('/login', { state: { redirectTo: '/medications' } });
      return;
    }

    setOrderModal({
      open: true,
      medication,
      qty: 1,
      paymentType: 'self',
      deliveryAddress: {
        line1: '',
        line2: '',
        city: '',
        country: 'Rwanda'
      },
      prescriptionFile: null,
      submitting: false
    });
  };

  const closeOrderModal = () => {
    setOrderModal((prev) => ({ ...prev, open: false }));
  };

  const handleDeliveryChange = (field, value) => {
    setOrderModal((prev) => ({
      ...prev,
      deliveryAddress: { ...prev.deliveryAddress, [field]: value }
    }));
  };

  const handlePrescriptionFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setOrderModal((prev) => ({ ...prev, prescriptionFile: file }));
  };

  const submitOrder = async () => {
    if (!orderModal.medication) return;
    const { medication, qty, paymentType, deliveryAddress, prescriptionFile } =
      orderModal;

    if (!deliveryAddress.line1 || !deliveryAddress.city) {
      toast.warn(t('pages.medications.errors.addressRequired'));
      return;
    }

    try {
      setOrderModal((prev) => ({ ...prev, submitting: true }));
      const formData = new FormData();
      formData.append('pharmacyId', medication.pharmacyId._id);
      formData.append('paymentType', paymentType);
      formData.append(
        'items',
        JSON.stringify([
          {
            medicationId: medication._id,
            name: medication.name,
            qty,
            price: medication.price
          }
        ])
      );
      formData.append('deliveryAddress', JSON.stringify(deliveryAddress));
      if (prescriptionFile) {
        formData.append('prescriptionImage', prescriptionFile);
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/pharmacy/order`,
        formData,
        {
          headers: { token }
        }
      );

      if (data.success) {
        toast.success(
          data.message || t('pages.medications.order.successMessage')
        );
        closeOrderModal();
      } else {
        toast.error(
          data.message || t('pages.medications.errors.orderFailed')
        );
      }
    } catch (error) {
      console.error('Error creating medication order:', error);
      toast.error(
        error.response?.data?.message ||
        t('pages.medications.errors.orderFailed')
      );
    } finally {
      setOrderModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const renderMedicationCard = (med) => {
    const pharmacy = med.pharmacyId || {};
    const imageSrc =
      (med.images && med.images.length > 0 && med.images[0]) ||
      placeholderImage;

    return (
      <div
        key={med._id}
        className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
      >
        <img
          src={imageSrc}
          alt={med.name}
          className="h-48 w-full object-cover"
        />
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {pharmacy.name || t('pages.medications.labels.unknownPharmacy')}
            </span>
            {med.stock !== undefined && (
              <span className="text-xs text-gray-500">
                {t('pages.medications.labels.stock', { count: med.stock })}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{med.name}</h3>
          {med.dosage && (
            <p className="text-sm text-gray-600 mt-1">{med.dosage}</p>
          )}
          {med.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {med.description}
            </p>
          )}
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            {pharmacy.address?.city && (
              <p>
                {t('pages.medications.labels.pharmacyLocation')}:{' '}
                <span className="text-gray-700 font-medium">
                  {pharmacy.address.city}
                </span>
              </p>
            )}
            {med.price !== undefined && (
              <p>
                {t('pages.medications.labels.price')}:{' '}
                <span className="text-gray-900 font-semibold">
                  {med.price?.toLocaleString()} RWF
                </span>
              </p>
            )}
          </div>
          <button
            onClick={() => handleOrderClick(med)}
            className="mt-5 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            {t('pages.medications.actions.orderButton')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      <SEO title={t('pages.medications.title')} description={t('pages.medications.description')} />

      {/* Premium Header - Matching History Aesthetic */}
      <div className="bg-[#006838] relative overflow-hidden pt-16 pb-24 px-6">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-400/10 skew-x-12 transform translate-x-20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-emerald-400 font-black text-[10px]   tracking-[0.3em] mb-2 px-1">Pharmaceutical Logistics</p>
              <h1 className="text-4xl font-extrabold text-white tracking-tight  ">{t('pages.medications.title')}</h1>
              <p className="text-emerald-200 mt-2 font-medium flex items-center gap-2">
                Find and order medications from verified pharmacies across Rwanda.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-none border border-white/20 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-none flex items-center justify-center text-emerald-300 text-2xl">
                💊
              </div>
              <div>
                <p className="text-[10px] font-black   text-emerald-200 leading-none tracking-widest">Inventory</p>
                <p className="text-2xl font-black text-white mt-1 leading-none">{medications.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10 space-y-8">
        {/* Filters */}
        <div className="bg-white shadow-2xl border border-slate-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
            <div>
              <p className="text-[10px] font-black   tracking-widest text-primary mb-3">Search Therapeutics</p>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="SEARCH BY MEDICATION NAME OR ACTIVE INGREDIENT..."
                className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-4 text-xs font-black   tracking-widest focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
              />
            </div>
            <div>
              <p className="text-[10px] font-black   tracking-widest text-primary mb-3">Pharmacy Selection</p>
              <select
                value={filters.pharmacyId}
                onChange={(e) => setFilters(prev => ({ ...prev, pharmacyId: e.target.value }))}
                className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-4 text-xs font-black   tracking-widest focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
              >
                <option value="">ALL PHARMACIES</option>
                {pharmaciesLoading ? (
                  <option disabled>LOADING PHARMACIES...</option>
                ) : (
                  pharmacies.map(pharmacy => (
                    <option key={pharmacy._id} value={pharmacy._id}>
                      {pharmacy.name?.toUpperCase()}{pharmacy.address?.city ? ` • ${pharmacy.address.city.toUpperCase()}` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="bg-white shadow-xl border border-slate-200 p-20 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent animate-spin"></div>
              <p className="text-xs font-black   tracking-widest text-[#006838]">Gathering Pharmaceutical Data...</p>
            </div>
          </div>
        ) : medications.length === 0 ? (
          <div className="bg-white shadow-xl border border-slate-200 p-20 text-center">
            <p className="text-xs font-black   tracking-widest text-slate-400">No therapeutic matches found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {medications.map(med => {
              const pharmacy = med.pharmacyId || {};
              const imageSrc = (med.images && med.images.length > 0 && med.images[0]) || placeholderImage;
              return (
                <div key={med._id} className="bg-white shadow-xl border border-slate-200 flex flex-col hover:translate-y-[-4px] transition-all group">
                  <div className="h-48 relative overflow-hidden">
                    <img src={imageSrc} alt={med.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-[#006838] text-white px-3 py-1 text-[10px] font-black   tracking-widest shadow-xl">
                      {med.price?.toLocaleString()} RWF
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-[10px] font-black   tracking-widest text-[#006838] mb-2 leading-none">{pharmacy.name || 'Verified Partner'}</p>
                    <h3 className="text-xl font-black text-slate-800   tracking-tight mb-2 leading-tight">{med.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 mb-4 flex-1 line-clamp-3 leading-relaxed">{med.description || 'Verified pharmaceutical therapeutic.'}</p>

                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black   text-slate-400 tracking-widest">Dosage</span>
                          <span className="text-[10px] font-black text-slate-700  ">{med.dosage || 'Standard'}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[8px] font-black   text-slate-400 tracking-widest">Availability</span>
                          <span className={`text-[10px] font-black   ${med.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {med.stock > 0 ? `In Stock (${med.stock})` : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOrderClick(med)}
                        className="w-full bg-[#006838] text-white py-4 text-[10px] font-black   tracking-widest shadow-lg hover:bg-[#88C250] transition"
                      >
                        Initialize Order
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {orderModal.open && orderModal.medication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center border-b-4 border-[#006838] pb-4">
                <h2 className="text-xl font-black text-slate-800   tracking-tight">
                  {t('pages.medications.order.modalTitle', {
                    name: orderModal.medication.name
                  })}
                </h2>
                <button
                  onClick={closeOrderModal}
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 transition"
                  disabled={orderModal.submitting}
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 p-6 bg-slate-50 border border-slate-200">
                <img
                  src={
                    (orderModal.medication.images &&
                      orderModal.medication.images[0]) ||
                    placeholderImage
                  }
                  alt={orderModal.medication.name}
                  className="w-full md:w-32 h-32 object-cover border-2 border-white shadow-sm"
                />
                <div className="flex-1 space-y-1">
                  <p className="text-[10px] font-black   text-[#006838] tracking-widest">
                    {orderModal.medication.pharmacyId?.name ||
                      t('pages.medications.labels.unknownPharmacy')}
                  </p>
                  <p className="text-xl font-black text-slate-800  ">
                    {orderModal.medication.name}
                  </p>
                  <p className="text-xs font-semibold text-slate-500   tracking-widest">
                    {orderModal.medication.dosage || 'Standard Dosage'}
                  </p>
                  <p className="text-sm font-black text-[#006838] pt-2">
                    {orderModal.medication.price?.toLocaleString()} RWF PER UNIT
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black   tracking-widest text-slate-400 mb-2">
                    Order Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={orderModal.qty}
                    onChange={(e) =>
                      setOrderModal((prev) => ({
                        ...prev,
                        qty: Number(e.target.value || 1)
                      }))
                    }
                    className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 text-xs font-black   tracking-widest focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black   tracking-widest text-slate-400 mb-2">
                    Payment Method
                  </label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-center gap-3 border-2 border-slate-100 px-4 py-3 cursor-pointer hover:bg-slate-50 transition">
                      <input
                        type="radio"
                        name="paymentType"
                        value="self"
                        checked={orderModal.paymentType === 'self'}
                        onChange={(e) =>
                          setOrderModal((prev) => ({
                            ...prev,
                            paymentType: e.target.value
                          }))
                        }
                        className="accent-primary"
                      />
                      <span className="text-[10px] font-black   tracking-widest">Self Pay</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center gap-2 border-2 border-slate-100 px-4 py-3 cursor-pointer hover:bg-slate-50 transition">
                      <input
                        type="radio"
                        name="paymentType"
                        value="insurance"
                        checked={orderModal.paymentType === 'insurance'}
                        onChange={(e) =>
                          setOrderModal((prev) => ({
                            ...prev,
                            paymentType: e.target.value
                          }))
                        }
                        className="accent-primary"
                      />
                      <span className="text-[10px] font-black   tracking-widest">Insurance</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black   tracking-widest text-slate-400">
                  Logistics & Delivery Address
                </label>
                <input
                  type="text"
                  placeholder="ADDRESS LINE 1 (E.G. HOUSE NO, STREET)..."
                  value={orderModal.deliveryAddress.line1}
                  onChange={(e) => handleDeliveryChange('line1', e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 text-xs font-black   tracking-widest focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                />
                <input
                  type="text"
                  placeholder="ADDRESS LINE 2 (OPTIONAL)..."
                  value={orderModal.deliveryAddress.line2}
                  onChange={(e) => handleDeliveryChange('line2', e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 text-xs font-black   tracking-widest focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="CITY / PROVINCE..."
                    value={orderModal.deliveryAddress.city}
                    onChange={(e) => handleDeliveryChange('city', e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 text-xs font-black   tracking-widest focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                  />
                  <input
                    type="text"
                    placeholder="COUNTRY..."
                    value={orderModal.deliveryAddress.country}
                    onChange={(e) =>
                      handleDeliveryChange('country', e.target.value)
                    }
                    className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 text-xs font-black   tracking-widest focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black   tracking-widest text-slate-400 mb-2">
                  Prescription Verification
                </label>
                <div className="border-2 border-dashed border-slate-200 p-6 text-center hover:border-primary transition cursor-pointer relative bg-slate-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePrescriptionFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <p className="text-[10px] font-black   tracking-widest text-slate-500">
                    {orderModal.prescriptionFile ? orderModal.prescriptionFile.name : 'Click to upload Rx documentation'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeOrderModal}
                  disabled={orderModal.submitting}
                  className="px-8 py-4 bg-slate-100 text-[10px] font-black   tracking-widest text-slate-500 hover:bg-slate-200 transition"
                >
                  {t('buttons.cancel')}
                </button>
                <button
                  type="button"
                  onClick={submitOrder}
                  disabled={orderModal.submitting}
                  className="px-10 py-4 bg-[#006838] text-white text-[10px] font-black   tracking-widest shadow-xl hover:bg-[#88C250] transition disabled:opacity-50"
                >
                  {orderModal.submitting
                    ? 'TRANSMITTING...'
                    : 'AUTHENTICATE & PLACE ORDER'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medications
