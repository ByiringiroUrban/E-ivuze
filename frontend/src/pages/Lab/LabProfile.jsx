import React, { useContext, useEffect, useState } from 'react';
import { LabContext } from '../../context/LabContext';
import { FaUser, FaPhone, FaMapMarkerAlt, FaEdit, FaSave } from 'react-icons/fa';
import DashboardHero from '../../components/DashboardHero';
import { LoadingComponents } from '../../components/LoadingComponents';

const LabProfile = () => {
    const { labProfile, getLabProfile, updateLabProfile } = useContext(LabContext);

    const [isEditing, setIsEditing] = useState(false);
    const [image, setImage] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        phone: '',
        address: { line1: '', line2: '', city: '' },
    });

    useEffect(() => {
        if (labProfile) {
            setUserData({
                name: labProfile.name || '',
                phone: labProfile.phone || '',
                address: labProfile.address || { line1: '', line2: '', city: '' },
            });
        }
    }, [labProfile]);

    const submitHandler = async () => {
        const formData = new FormData();
        formData.append('name', userData.name);
        formData.append('phone', userData.phone);
        formData.append('address', JSON.stringify(userData.address));

        if (image) formData.append('image', image);

        const success = await updateLabProfile(formData);
        if (success) {
            setIsEditing(false);
            setImage(false);
            getLabProfile();
        }
    };

    if (!labProfile) return <LoadingComponents.DashboardLoader text="Loading profile..." />;

    return (
        <div className="bg-white min-h-screen px-4 sm:px-8 py-8 space-y-8">
            <DashboardHero
                eyebrow="My Account"
                title="Lab Profile"
                description="Manage your diagnostic center details."
            />

            <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-4xl">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Image Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                            <img
                                src={image ? URL.createObjectURL(image) : (labProfile.image || '')}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                            {!image && !labProfile.image && (
                                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                                    <FaUser size={40} />
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <label className="cursor-pointer text-sm text-primary font-medium hover:underline">
                                Change Photo
                                <input type="file" hidden onChange={(e) => setImage(e.target.files[0])} />
                            </label>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
                            <button
                                onClick={() => isEditing ? submitHandler() : setIsEditing(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isEditing
                                        ? 'bg-primary text-white hover:bg-primary-dark'
                                        : 'border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {isEditing ? <><FaSave /> Save Changes</> : <><FaEdit /> Edit Profile</>}
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Lab Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={userData.name}
                                        onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">{userData.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Email
                                </label>
                                <p className="text-gray-900">{labProfile.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={userData.phone}
                                        onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                    />
                                ) : (
                                    <p className="text-gray-900">{userData.phone}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Address
                                </label>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Line 1"
                                            value={userData.address.line1}
                                            onChange={e => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                                            className="w-full border p-2 rounded"
                                        />
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={userData.address.city}
                                            onChange={e => setUserData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
                                            className="w-full border p-2 rounded"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-gray-900">
                                        {userData.address.line1}
                                        {userData.address.line2 && `, ${userData.address.line2}`}
                                        {userData.address.city && <br />}
                                        {userData.address.city}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabProfile;
