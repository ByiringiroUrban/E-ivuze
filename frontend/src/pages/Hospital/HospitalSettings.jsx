import React, { useContext, useState, useEffect } from 'react';
import { HospitalContext } from '../../context/HospitalContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PaymentPopup from '../../components/PaymentPopup';
import TrialCountdown from '../../components/TrialCountdown';

const HospitalSettings = () => {
  const { hospital, hToken, backendUrl, createHospitalPayment, uploadHospitalPaymentProof, getHospitalPayments, getHospitalDetails } = useContext(HospitalContext);
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showTrialExpiredPopup, setShowTrialExpiredPopup] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calculate trial end date (3 months from approval or creation)
  const getTrialEndDate = () => {
    if (!hospital) return null;

    try {
      // First check if trialEndsAt is already set
      if (hospital.trialEndsAt) {
        const date = new Date(hospital.trialEndsAt);
        if (!isNaN(date.getTime()) && date.getTime() > 0) {
          return date;
        }
      }

      // If no trialEndsAt, calculate from approvedAt
      if (hospital.approvedAt) {
        // Handle both string and Date object
        const approvedDateStr = typeof hospital.approvedAt === 'string'
          ? hospital.approvedAt
          : hospital.approvedAt.toString();
        const approvedDate = new Date(approvedDateStr);

        if (!isNaN(approvedDate.getTime()) && approvedDate.getTime() > 0) {
          const endDate = new Date(approvedDate);
          endDate.setMonth(endDate.getMonth() + 3);
          return endDate;
        }
      }

      // Fallback to createdAt
      if (hospital.createdAt) {
        const createdDateStr = typeof hospital.createdAt === 'string'
          ? hospital.createdAt
          : hospital.createdAt.toString();
        const createdDate = new Date(createdDateStr);

        if (!isNaN(createdDate.getTime()) && createdDate.getTime() > 0) {
          const endDate = new Date(createdDate);
          endDate.setMonth(endDate.getMonth() + 3);
          return endDate;
        }
      }
    } catch (error) {
      console.error('Error calculating trial end date:', error);
    }

    return null;
  };

  // Check if trial expired
  const isTrialExpired = () => {
    const trialEndsAt = getTrialEndDate();
    if (!trialEndsAt) return false;
    return trialEndsAt < new Date();
  };

  // Check if has active subscription
  const hasActiveSubscription = () => {
    if (!hospital?.subscriptionExpiresAt) return false;
    return new Date(hospital.subscriptionExpiresAt) > new Date();
  };

  const PLAN_PRICES = {
    basic: { monthly: 50000, yearly: 500000 },
    premium: { monthly: 100000, yearly: 1000000 },
    enterprise: { monthly: 200000, yearly: 2000000 }
  };

  useEffect(() => {
    if (hospital) {
      fetchPayments();
      // Check if trial expired and no active subscription
      if (isTrialExpired() && !hasActiveSubscription()) {
        setShowTrialExpiredPopup(true);
      }

      // If hospital doesn't have trialEndsAt, fetch details to set it
      if (hospital.status === 'APPROVED' && !hospital.trialEndsAt) {
        getHospitalDetails();
      }
    }
  }, [hospital]);

  const handleTrialExpired = () => {
    setShowTrialExpiredPopup(true);
  };

  const fetchPayments = async () => {
    const result = await getHospitalPayments();
    if (result.success) {
      setPayments(result.payments);
      // Check for pending payment
      const pending = result.payments.find(p => p.status === 'pending');
      if (pending) {
        setCurrentPayment(pending);
      }
    }
  };

  const handleOpenPaymentPopup = (planType) => {
    if (!planType) {
      toast.error('Please select a plan first');
      return;
    }

    // Set selected plan and open popup immediately
    // Payment request will be created inside the popup
    setSelectedPlan(planType);
    setShowPaymentPopup(true);
  };

  const handlePaymentSuccess = async () => {
    await fetchPayments();
    await getHospitalDetails(); // Refresh hospital data
    setShowPaymentPopup(false);
    setShowTrialExpiredPopup(false);
  };

  const getCurrentPlan = () => {
    if (!hospital?.subscriptionPlan) return null;
    return {
      type: hospital.subscriptionPlan,
      expiresAt: hospital.subscriptionExpiresAt
    };
  };

  const currentPlan = getCurrentPlan();
  const amount = selectedPlan ? PLAN_PRICES[selectedPlan][billingPeriod] : 0;

  // Calculate trial end date for display
  const trialEndDate = getTrialEndDate();
  const isApproved = hospital?.status === 'APPROVED';
  const noSubscription = !hasActiveSubscription();

  // Debug: Force show if approved and no subscription (for testing)
  const shouldShowCountdown = isApproved && noSubscription;

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('hospital.settings.title')}</h2>

      <div className="space-y-6">
        {/* Trial Period Countdown - Always show if trial exists and no active subscription */}
        {shouldShowCountdown && trialEndDate ? (
          <TrialCountdown
            trialEndsAt={trialEndDate.toISOString()}
            onExpired={handleTrialExpired}
          />
        ) : shouldShowCountdown && !trialEndDate ? (
          // Show fallback if we can't calculate date
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-[#004d2a] mb-2">Trial Period Active</h3>
            <p className="text-sm text-[#006838]">
              Your 3-month trial period started on {hospital?.approvedAt ? new Date(hospital.approvedAt).toLocaleDateString() : 'your approval date'}.
              {hospital?.approvedAt && (
                <> Trial ends approximately on {(() => {
                  const end = new Date(hospital.approvedAt);
                  end.setMonth(end.getMonth() + 3);
                  return end.toLocaleDateString();
                })()}.</>
              )}
            </p>
          </div>
        ) : null}

        {/* Hospital Information */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">{t('hospital.settings.hospitalInformation')}</h3>
          {hospital && (
            <div className="space-y-2">
              <p><strong>{t('hospital.settings.name')}</strong> {hospital.name}</p>
              <p><strong>{t('hospital.settings.status')}</strong>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${hospital.status === 'APPROVED' ? 'bg-emerald-100 text-[#006838]' :
                    hospital.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                  }`}>
                  {hospital.status}
                </span>
              </p>
              {hospital.address && (
                <p><strong>{t('hospital.settings.address')}</strong> {hospital.address.line1}, {hospital.address.city}, {hospital.address.country}</p>
              )}
              {hospital.phone && <p><strong>{t('hospital.settings.phone')}</strong> {hospital.phone}</p>}
              {hospital.website && <p><strong>{t('hospital.settings.website')}</strong> <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-[#006838] hover:underline">{hospital.website}</a></p>}
              {hospital.approvedAt && <p><strong>{t('hospital.settings.approvedOn')}</strong> {new Date(hospital.approvedAt).toLocaleDateString()}</p>}
            </div>
          )}
        </div>

        {/* Current Subscription */}
        {currentPlan && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">{t('hospital.settings.currentPlan')}</h3>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="font-medium text-[#004d2a]">
                {currentPlan.type.charAt(0).toUpperCase() + currentPlan.type.slice(1)} Plan
              </p>
              {currentPlan.expiresAt && (
                <p className="text-sm text-[#006838] mt-1">
                  Expires: {new Date(currentPlan.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Billing Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">{t('hospital.settings.billing')}</h3>

          {/* Billing Period Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${billingPeriod === 'monthly'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {t('hospital.settings.monthly')}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${billingPeriod === 'yearly'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {t('hospital.settings.yearly')}
            </button>
          </div>

          {/* Plan Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Basic Plan */}
            <div className={`border-2 rounded-lg p-4 sm:p-6 transition-all ${selectedPlan === 'basic' ? 'border-[#006838] bg-emerald-50' : 'border-gray-200'
              }`}>
              <h4 className="text-lg font-semibold mb-2">{t('hospital.settings.planBasic')}</h4>
              <p className="text-2xl font-bold text-[#006838] mb-1">
                RWF {PLAN_PRICES.basic[billingPeriod].toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {billingPeriod === 'monthly' ? t('hospital.settings.perMonth') : t('hospital.settings.perYear')}
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li>✓ Up to 10 doctors</li>
                <li>✓ Basic patient management</li>
                <li>✓ Email support</li>
              </ul>
              <button
                onClick={() => handleOpenPaymentPopup('basic')}
                disabled={currentPlan?.type === 'basic'}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${currentPlan?.type === 'basic'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-[#006838] text-white hover:bg-[#004d2a]'
                  }`}
              >
                {currentPlan?.type === 'basic' ? 'Current Plan' : t('hospital.settings.subscribe')}
              </button>
            </div>

            {/* Premium Plan */}
            <div className={`border-2 rounded-lg p-4 sm:p-6 transition-all ${selectedPlan === 'premium' ? 'border-[#006838] bg-emerald-50' : 'border-gray-200'
              }`}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold">{t('hospital.settings.planPremium')}</h4>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Popular</span>
              </div>
              <p className="text-2xl font-bold text-[#006838] mb-1">
                RWF {PLAN_PRICES.premium[billingPeriod].toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {billingPeriod === 'monthly' ? t('hospital.settings.perMonth') : t('hospital.settings.perYear')}
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li>✓ Up to 50 doctors</li>
                <li>✓ Advanced patient management</li>
                <li>✓ Transfer management</li>
                <li>✓ Priority support</li>
              </ul>
              <button
                onClick={() => handleOpenPaymentPopup('premium')}
                disabled={currentPlan?.type === 'premium'}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${currentPlan?.type === 'premium'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-[#006838] text-white hover:bg-[#004d2a]'
                  }`}
              >
                {currentPlan?.type === 'premium' ? 'Current Plan' : t('hospital.settings.subscribe')}
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className={`border-2 rounded-lg p-4 sm:p-6 transition-all ${selectedPlan === 'enterprise' ? 'border-[#006838] bg-emerald-50' : 'border-gray-200'
              }`}>
              <h4 className="text-lg font-semibold mb-2">{t('hospital.settings.planEnterprise')}</h4>
              <p className="text-2xl font-bold text-[#006838] mb-1">
                RWF {PLAN_PRICES.enterprise[billingPeriod].toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {billingPeriod === 'monthly' ? t('hospital.settings.perMonth') : t('hospital.settings.perYear')}
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li>✓ Unlimited doctors</li>
                <li>✓ Full feature access</li>
                <li>✓ Custom integrations</li>
                <li>✓ 24/7 dedicated support</li>
              </ul>
              <button
                onClick={() => handleOpenPaymentPopup('enterprise')}
                disabled={currentPlan?.type === 'enterprise'}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${currentPlan?.type === 'enterprise'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-[#006838] text-white hover:bg-[#004d2a]'
                  }`}
              >
                {currentPlan?.type === 'enterprise' ? 'Current Plan' : t('hospital.settings.subscribe')}
              </button>
            </div>
          </div>

          {/* Payment Status */}
          {currentPayment && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>{t('hospital.settings.paymentPending')}:</strong> Your payment of RWF {currentPayment.amount?.toLocaleString()} is pending approval.
              </p>
            </div>
          )}
        </div>

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-4 py-3 text-sm">
                        {payment.planType?.charAt(0).toUpperCase() + payment.planType?.slice(1)} ({payment.billingPeriod})
                      </td>
                      <td className="px-4 py-3 text-sm">RWF {payment.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Payment Popup */}
      {showPaymentPopup && selectedPlan && (
        <PaymentPopup
          appointmentId={null}
          amount={PLAN_PRICES[selectedPlan][billingPeriod]}
          onClose={() => {
            setShowPaymentPopup(false);
            setSelectedPlan(null);
          }}
          onSuccess={handlePaymentSuccess}
          backendUrl={backendUrl}
          token={hToken}
          isHospitalPayment={true}
          planType={selectedPlan}
          billingPeriod={billingPeriod}
        />
      )}

      {/* Trial Expired Popup - Blocks access */}
      {showTrialExpiredPopup && !hasActiveSubscription() && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Trial Period Expired</h3>
              <p className="text-gray-600">Your 3-month trial period has ended. Please subscribe to continue using our services.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You will not be able to access any services until your payment is approved by admin.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTrialExpiredPopup(false);
                    handleOpenPaymentPopup('basic');
                  }}
                  className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalSettings;
