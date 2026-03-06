import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";
import { motion } from "framer-motion";
import { FaUserCircle, FaEdit, FaSave, FaTimes, FaMapMarkerAlt, FaShieldAlt, FaPhoneAlt, FaEnvelope, FaFingerprint, FaHeartbeat, FaExclamationTriangle } from "react-icons/fa";

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext);
  const { t } = useTranslation();
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      formData.append("nid", userData.nid || "");
      formData.append("bloodGroup", userData.bloodGroup || "");
      formData.append("maritalStatus", userData.maritalStatus || "");
      formData.append("occupation", userData.occupation || "");
      formData.append("insurance", JSON.stringify(userData.insurance || {}));
      formData.append("emergencyContact", JSON.stringify(userData.emergencyContact || {}));
      formData.append("allergies", JSON.stringify(userData.allergies || []));

      if (image) formData.append("image", image);

      const { data } = await axios.post(`${backendUrl}/api/user/update-profile`, formData, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const updateAddress = (field, value) => {
    setUserData(prev => ({
      ...prev,
      address: { ...(prev.address || {}), [field]: value }
    }));
  };

  const updateNestedState = (parentKey, field, value) => {
    setUserData(prev => ({
      ...prev,
      [parentKey]: { ...(prev[parentKey] || {}), [field]: value }
    }));
  };

  return (
    <div className="bg-white min-h-screen pb-20 font-outfit text-[#006838]">
      <SEO title={`${t('pages.myProfile.title')} | E-ivuze`} />

      {/* Top Header Bar */}
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 flex items-center justify-center border-2 border-gray-100">
              <FaUserCircle className="text-[#006838]/40 text-xl" />
            </div>
            <div>
              <nav className="flex text-[10px] font-bold text-[#006838]/40 gap-2">
                <span>Account</span>
                <span>/</span>
                <span className="text-[#006838]">Settings</span>
              </nav>
            </div>
          </div>
          <div className="flex gap-4">
            {!isEdit ? (
              <button
                onClick={() => setIsEdit(true)}
                className="bg-[#006838] hover:bg-[#88C250] text-white hover:text-[#006838] px-8 py-3 text-xs font-bold transition-all border-2 border-[#006838]"
              >
                <FaEdit className="inline mr-2" /> {t('pages.myProfile.editProfile')}
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={updateUserProfileData}
                  className="bg-[#006838] hover:bg-[#88C250] text-white hover:text-[#006838] px-8 py-3 text-xs font-bold transition-all border-2 border-[#006838]"
                >
                  <FaSave className="inline mr-2" /> {t('pages.myProfile.saveProfile')}
                </button>
                <button
                  onClick={() => setIsEdit(false)}
                  className="bg-white border-2 border-gray-100 text-[#006838]/60 px-6 py-3 text-xs font-bold transition-all hover:bg-gray-50"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 items-start">

          {/* Account Management (Left Side) */}
          <div className="space-y-8 sticky top-28">
            <div className="bg-white border-2 border-gray-100 p-8">
              <div className="space-y-8">
                <h3 className="text-xs font-bold text-[#006838]/40">Profile Photo</h3>

                <div className="space-y-6">
                  <div className="relative group">
                    <div className="aspect-[4/5] bg-gray-50 overflow-hidden border-2 border-gray-100 relative">
                      <img
                        className="w-full h-full object-cover"
                        src={image ? URL.createObjectURL(image) : (userData.image || assets.profile_pic)}
                        alt={userData.name}
                      />
                      {isEdit && (
                        <label htmlFor="profile-image" className="absolute inset-0 bg-[#006838]/60 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-white font-bold">Update Photo</span>
                          <input id="profile-image" type="file" hidden onChange={(e) => setImage(e.target.files[0])} />
                        </label>
                      )}
                    </div>
                  </div>

                  {!isEdit ? (
                    <div className="text-center pt-2">
                      <h4 className="text-2xl font-bold text-[#006838] font-merriweather leading-tight">{userData.name}</h4>
                      <p className="text-[#006838]/40 text-sm mt-1">{userData.email}</p>
                      <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-[#88C250]/10 text-[#006838] border-b-2 border-[#88C250]">
                        <FaShieldAlt className="text-[10px]" />
                        <span className="text-[10px] font-bold">Official Profile</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-[#006838]/40 mb-2 block">Full Legal Name</label>
                        <input
                          className="w-full bg-gray-50 border-2 border-gray-100 px-5 py-4 text-sm font-bold text-[#006838] focus:bg-white focus:border-[#88C250] transition-all outline-none"
                          value={userData.name}
                          onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-100 p-8">
              <h3 className="text-xs font-bold text-[#006838]/40 mb-6">Identity Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b-2 border-gray-50">
                  <span className="text-xs text-[#006838]/60 font-bold">NID Registration</span>
                  <span className="text-[10px] font-bold text-[#006838] bg-[#88C250]/20 px-3 py-1 border-b border-[#88C250]">Verified</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b-2 border-gray-50">
                  <span className="text-xs text-[#006838]/60 font-bold">Phone Connection</span>
                  <span className="text-[10px] font-bold text-[#006838]/40 uppercase tracking-widest">Active</span>
                </div>
              </div>
              <button className="w-full mt-8 py-4 border-2 border-gray-100 text-xs font-bold text-[#006838]/60 hover:bg-gray-50 transition-colors">
                Reset Password
              </button>
            </div>
          </div>

          <div className="space-y-8">

            {/* Identity & Basic Detail */}
            <div className="bg-white border-2 border-gray-100 p-10">
              <h3 className="text-2xl font-bold text-[#006838] font-merriweather mb-10">Profile Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                  { label: "Phone Number", value: userData.phone, key: 'phone' },
                  { label: "National ID", value: userData.nid, key: 'nid' },
                  { label: "Gender", value: userData.gender, key: 'gender', type: 'select', options: ['Male', 'Female', 'Other'] },
                  { label: "Date of Birth", value: userData.dob, key: 'dob', type: 'date' },
                  { label: "Blood Type", value: userData.bloodGroup, key: 'bloodGroup', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
                ].map((field) => (
                  <div key={field.key} className="space-y-3">
                    <label className="text-xs font-bold text-[#006838]/40 pl-1">{field.label}</label>
                    {isEdit ? (
                      field.type === 'select' ? (
                        <select
                          className="w-full bg-gray-50 border-2 border-gray-100 px-5 py-4 text-sm font-bold text-[#006838] focus:bg-white transition-all outline-none appearance-none"
                          value={userData[field.key] || ""}
                          onChange={(e) => setUserData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        >
                          <option value="">Select</option>
                          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type || 'text'}
                          className="w-full bg-gray-50 border-2 border-gray-100 px-5 py-4 text-sm font-bold text-[#006838] focus:bg-white transition-all outline-none"
                          value={userData[field.key] || ""}
                          onChange={(e) => setUserData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        />
                      )
                    ) : (
                      <div className="border-b-2 border-gray-50 px-1 py-3 text-sm font-bold text-[#006838]">
                        {userData[field.key] || 'Not specified'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Residency Records */}
            <div className="bg-white border-2 border-gray-100 p-10">
              <h3 className="text-2xl font-bold text-[#006838] font-merriweather mb-10">Residency Records</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                {['province', 'district', 'sector', 'cell'].map((loc) => (
                  <div key={loc} className="space-y-3">
                    <label className="text-xs font-bold text-[#006838]/40 pl-1 capitalize">{loc}</label>
                    {isEdit ? (
                      <input
                        className="w-full bg-gray-50 border-2 border-gray-100 px-5 py-4 text-sm font-bold text-[#006838] focus:bg-white transition-all outline-none capitalize"
                        value={userData.address?.[loc] || ""}
                        onChange={(e) => updateAddress(loc, e.target.value)}
                      />
                    ) : (
                      <div className="border-b-2 border-gray-50 px-1 py-3 text-sm font-bold text-[#006838] capitalize">
                        {userData.address?.[loc] || '—'}
                      </div>
                    )}
                  </div>
                ))}
                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-bold text-[#006838]/40 pl-1">Street Address</label>
                  {isEdit ? (
                    <input
                      className="w-full bg-gray-50 border-2 border-gray-100 px-5 py-4 text-sm font-bold text-[#006838] focus:bg-white transition-all outline-none"
                      value={userData.address?.line1 || ""}
                      onChange={(e) => updateAddress("line1", e.target.value)}
                    />
                  ) : (
                    <div className="border-b-2 border-gray-50 px-1 py-3 text-sm font-bold text-[#006838]">
                      {userData.address?.line1 || 'No street details on record.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Insurance & Emergency Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white border-2 border-gray-100 p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#006838]/5 rotate-45 translate-x-12 -translate-y-12"></div>
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-1.5 h-6 bg-[#006838] rounded-full"></div>
                  <h3 className="text-xl font-bold text-[#006838] font-merriweather tracking-tight">Insurance</h3>
                </div>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#006838]/40">Provider</label>
                    {isEdit ? (
                      <select
                        className="w-full text-sm font-bold border-b-2 border-gray-100 py-3 bg-transparent focus:border-[#88C250] outline-none"
                        value={userData.insurance?.provider || "None"}
                        onChange={(e) => updateNestedState("insurance", "provider", e.target.value)}
                      >
                        {['None', 'Mutuelle', 'RAMA', 'MMI', 'Private'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-[#006838] bg-[#88C250]/10 px-4 py-2 border-b-2 border-[#88C250] inline-block">{userData.insurance?.provider || 'NONE'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#006838]/40">Policy Number</label>
                    {isEdit ? (
                      <input
                        className="w-full text-sm font-bold border-b-2 border-gray-100 py-3 focus:border-[#88C250] outline-none"
                        value={userData.insurance?.policyNumber || ""}
                        onChange={(e) => updateNestedState("insurance", "policyNumber", e.target.value)}
                      />
                    ) : (
                      <p className="text-[13px] font-mono font-bold text-[#006838]">{userData.insurance?.policyNumber || '--'}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-100 p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#006838]/5 rotate-45 translate-x-12 -translate-y-12"></div>
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-1.5 h-6 bg-[#88C250] rounded-full"></div>
                  <h3 className="text-xl font-bold text-[#006838] font-merriweather tracking-tight">Emergency Contact</h3>
                </div>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#006838]/40">Contact Name</label>
                    {isEdit ? (
                      <input
                        className="w-full text-sm font-bold border-b-2 border-gray-100 py-3 focus:border-[#88C250] outline-none"
                        value={userData.emergencyContact?.name || ""}
                        onChange={(e) => updateNestedState("emergencyContact", "name", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm font-bold text-[#006838]">{userData.emergencyContact?.name || '--'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#006838]/40">Contact Phone</label>
                    {isEdit ? (
                      <input
                        className="w-full text-sm font-bold border-b-2 border-gray-100 py-3 focus:border-[#88C250] outline-none"
                        value={userData.emergencyContact?.phone || ""}
                        onChange={(e) => updateNestedState("emergencyContact", "phone", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm font-bold text-[#006838]">{userData.emergencyContact?.phone || '--'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Observations */}
            <div className="bg-white border-2 border-gray-100 p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#006838]"></div>
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <p className="text-[#88C250] font-bold text-[10px] uppercase tracking-[0.2em]">Verified History</p>
                  <h3 className="text-2xl font-bold text-[#006838] font-merriweather tracking-tight">Active Clinical Observations</h3>
                </div>
                <FaExclamationTriangle className="text-[#006838]/10 text-4xl" />
              </div>

              {userData.allergies && userData.allergies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userData.allergies.map((alg, index) => (
                    <div key={index} className="flex justify-between items-center border-2 border-gray-50 p-6 hover:border-[#88C250] transition-colors">
                      <span className="text-sm font-bold text-[#006838]">{alg.allergen}</span>
                      <span className={`text-[9px] font-bold px-3 py-1 border-b-2 uppercase tracking-widest ${alg.severity === 'High' ? 'bg-red-50 text-red-600 border-red-500' : 'bg-amber-50 text-amber-600 border-amber-500'
                        }`}>
                        {alg.severity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 border-2 border-dashed border-gray-100 text-center">
                  <p className="text-sm text-[#006838]/40 font-bold italic">No active clinical risks on file.</p>
                </div>
              )}

              <div className="mt-12 pt-6 border-t-2 border-gray-50 text-center">
                <p className="text-[9px] text-[#006838]/20 font-bold uppercase tracking-[0.4em]">
                  Secure Medical Data Repository
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
