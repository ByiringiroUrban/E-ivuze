import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const PaymentPopup = ({ appointmentId, amount, onClose, onSuccess, backendUrl, token, isHospitalPayment = false, paymentId: providedPaymentId, paymentCode: providedPaymentCode, planType, billingPeriod }) => {
  const { t } = useTranslation();
  // Fixed payment code - always use this code
  const FRONTEND_PAYMENT_CODE = '017654';
  const FRONTEND_PAYMENT_NAME = import.meta.env.VITE_PAYMENT_NAME || t('payment.paymentName') || 'One healthline connect';

  const [paymentCode, setPaymentCode] = useState(FRONTEND_PAYMENT_CODE);
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState(providedPaymentId || null);
  const [creatingPayment, setCreatingPayment] = useState(false);

  // Initialize payment code on mount - always use fixed code
  useEffect(() => {
    setPaymentCode(FRONTEND_PAYMENT_CODE); // Always use fixed code
    
    if (providedPaymentId) {
      setPaymentId(providedPaymentId);
    }

    // For hospital payments, create payment request when popup opens
    if (isHospitalPayment && !providedPaymentId && planType) {
      const createHospitalPaymentRequest = async () => {
        try {
          setCreatingPayment(true);
      const { data } = await axios.post(
        backendUrl + '/api/hospitals/payment/create',
        { planType, billingPeriod },
        { headers: { hToken: token } }
      );

          if (data.success && data.payment?._id) {
            setPaymentId(data.payment._id);
            setPaymentCode(FRONTEND_PAYMENT_CODE); // Always use fixed code
          } else {
            toast.error(data.message || 'Failed to create payment request');
            onClose(); // Close popup if creation fails
          }
        } catch (error) {
          console.error('Error creating hospital payment:', error);
          toast.error(error.response?.data?.message || 'Failed to create payment request');
          onClose(); // Close popup if creation fails
        } finally {
          setCreatingPayment(false);
        }
      };

      createHospitalPaymentRequest();
      return;
    }

    // For patient payments
    if (!providedPaymentId && !isHospitalPayment && appointmentId) {
      const initializePayment = async () => {
        try {
          // Always ensure a backend payment record exists to attach proof to,
          // but keep the code/name strictly from frontend.
          const { data } = await axios.post(
            backendUrl + '/api/user/payment/create',
            { appointmentId },
            { headers: { token } }
          );

          if (data.success && data.payment?._id) {
            setPaymentId(data.payment._id);
            setPaymentCode(FRONTEND_PAYMENT_CODE); // Always use fixed code
          } else {
            toast.error(data.message || 'Failed to create payment request');
          }
        } catch (error) {
          console.error('Error initializing payment:', error);
          toast.error(error.response?.data?.message || 'Failed to initialize payment');
        }
      };

      initializePayment();
    }
  }, [appointmentId, backendUrl, token, isHospitalPayment, providedPaymentId, planType, billingPeriod, onClose]);

  // Handle screenshot upload
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      setScreenshot(file);
    }
  };

  // Submit payment proof
  const handleSubmitProof = async () => {
    if (!screenshot) {
      toast.error('Please select a screenshot');
      return;
    }

    if (!paymentId) {
      toast.error('Payment not initialized. Please try again.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('paymentProof', screenshot);
      formData.append('paymentId', paymentId);

      const endpoint = isHospitalPayment 
        ? '/api/hospitals/payment/upload-proof'
        : '/api/user/payment/upload-proof';

      const headers = isHospitalPayment 
        ? { hToken: token, 'Content-Type': 'multipart/form-data' }
        : { token, 'Content-Type': 'multipart/form-data' };

      const { data } = await axios.post(
        backendUrl + endpoint,
        formData,
        { headers }
      );

      if (data.success) {
        toast.success('Payment proof submitted successfully. Waiting for admin approval.');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to submit payment proof');
      }
    } catch (error) {
      console.error('Error submitting proof:', error);
      toast.error(error.response?.data?.message || 'Failed to submit payment proof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary-light roun-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Payment</h2>
          <button
            onClick={onClose}
            disabled={creatingPayment}
            className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {creatingPayment ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Creating payment request...</p>
          </div>
        ) : (
          <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary/10 to-primary-light/10 p-4 roun-lg border border-primary/20">
            <p className="text-sm text-gray-600 mb-2">{t('payment.amountToPay')}</p>
            <p className="text-2xl font-bold text-primary-dark">RWF {amount}</p>
          </div>

          {paymentCode && (
            <div className="bg-gradient-to-br from-accent/10 to-accent-light/10 p-4 roun-lg border-2 border-accent/30 relative overflow-hidden">
              <p className="text-sm text-gray-600 mb-2">{t('payment.paymentCode')}</p>
              <p className="text-2xl font-bold text-primary-dark text-center font-mono">
                {paymentCode}
              </p>
              <p className="text-xs text-primary-dark mt-2 text-center font-medium">
                {FRONTEND_PAYMENT_NAME}
              </p>
            </div>
          )}

          <div className="bg-yellow-50 p-4 roun-lg">
            <p className="text-sm text-yellow-800 mb-2">⚠️ {t('payment.instructionsTitle')}</p>
            <ol className="list-decimal list-inside text-xs text-yellow-700 space-y-1">
              {t('payment.instructions', { returnObjects: true }).map((ins, idx) => (
                <li key={idx}>{ins}</li>
              ))}
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('payment.uploadProof')}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:roun-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary-dark hover:file:bg-primary/20"
            />
            {screenshot && (
              <div className="mt-2">
                <p className="text-xs text-gray-600">Selected: {screenshot.name}</p>
                <img
                  src={URL.createObjectURL(screenshot)}
                  alt="Payment proof preview"
                  className="mt-2 max-w-full h-32 object-contain border roun"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 roun-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              {t('payment.cancel')}
            </button>
            <button
              onClick={handleSubmitProof}
              disabled={loading || !screenshot || !paymentId}
              className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white roun-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
            >
              {loading ? t('buttons.processing') : t('payment.submitProof')}
            </button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPopup;

