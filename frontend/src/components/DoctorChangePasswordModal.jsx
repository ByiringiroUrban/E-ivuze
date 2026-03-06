import React, { useState, useContext, useEffect } from 'react';
import { DoctorContext } from '../context/DoctorContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

const DoctorChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { dToken, backendUrl } = useContext(DoctorContext);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear specific error when the user edits that field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword || formData.currentPassword.trim() === '') {
      newErrors.currentPassword = t('doctor.passwordModal.currentRequired') || 'Current password is required';
    }

    if (!formData.newPassword || formData.newPassword.trim() === '') {
      newErrors.newPassword = t('doctor.passwordModal.newRequired') || 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = t('doctor.passwordModal.newMinLength') || 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword || formData.confirmPassword.trim() === '') {
      newErrors.confirmPassword = t('doctor.passwordModal.confirmRequired') || 'Please confirm the new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('doctor.passwordModal.passwordMatch') || 'Passwords do not match';
    }

    if (
      formData.currentPassword &&
      formData.newPassword &&
      formData.currentPassword === formData.newPassword
    ) {
      newErrors.newPassword = t('doctor.passwordModal.samePassword') || 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    if (onClose) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };

      const { data } = await axios.post(
        `${backendUrl}/api/doctor/change-password`,
        payload,
        {
          headers: {
            dToken
          }
        }
      );

      if (data?.success) {
        toast.success(data.message || t('doctor.passwordModal.success') || 'Password changed successfully');
        resetForm();
        if (onSuccess) onSuccess();
        handleClose();
      } else {
        // If API responded but indicated failure
        toast.error(data?.message || t('doctor.passwordModal.error') || 'Failed to change password');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || t('doctor.passwordModal.error') || 'Failed to change password';
      toast.error(errorMessage);
      // Optional: set field-specific errors if API returns them
      if (error?.response?.data?.errors && typeof error.response.data.errors === 'object') {
        setErrors(prev => ({ ...prev, ...error.response.data.errors }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form every time the modal is closed
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
    >
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 id="change-password-title" className="text-xl font-bold text-gray-900">
            {t('doctor.passwordModal.title') || 'Change Password'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('doctor.passwordModal.close') || 'Close'}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('doctor.passwordModal.currentPassword') || 'Current Password'} *
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#205c90] ${
                errors.currentPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('doctor.passwordModal.currentPlaceholder') || 'Enter current password'}
              autoComplete="current-password"
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('doctor.passwordModal.newPassword') || 'New Password'} *
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#205c90] ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('doctor.passwordModal.newPlaceholder') || 'Enter new password (min 6 characters)'}
              autoComplete="new-password"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('doctor.passwordModal.confirmPassword') || 'Confirm New Password'} *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#205c90] ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('doctor.passwordModal.confirmPlaceholder') || 'Confirm new password'}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#205c90] text-white py-2 rounded-lg hover:bg-[#1a4a73] transition-colors disabled:opacity-50 font-medium"
            >
              {loading
                ? (t('doctor.passwordModal.changing') || 'Changing...')
                : (t('doctor.passwordModal.change') || 'Change Password')}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t('doctor.passwordModal.cancel') || 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorChangePasswordModal;
