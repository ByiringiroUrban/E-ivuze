import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { HospitalContext } from '../context/HospitalContext';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import EmptyState from '../components/EmptyState';
import { getDoctorImageSrc } from '../utils/doctorImage';
import PageHeader from '../components/PageHeader';
import { motion } from 'framer-motion';

const defaultSpecialityList = [
  'General practitioner', 'Gynecologist', 'Dermatologist', 'Pediatricians',
  'Neurologist', 'Internist', 'Dental', 'Orthopedic surgeons',
  'Plastic surgeons', 'ENT surgeons', 'Emergency physicians',
  'Nephrologists', 'Endocrinologists', 'Cardiologists', 'Ophthalmologist',
  'Urologist', 'Sexual Health Physician (GUM)', 'Primary Care Physician'
];

const Doctors = () => {
  const { speciality } = useParams();
  const [searchParams] = useSearchParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [doctorType, setDoctorType] = useState('all');
  const [selectedDoctorName, setSelectedDoctorName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { doctors, consultationFee, currency } = useContext(AppContext);
  const { approvedHospitals, getApprovedHospitals } = useContext(HospitalContext);

  const specialityFromQuery = searchParams.get('speciality');
  const doctorFromQuery = searchParams.get('doctor');
  const practiceFromQuery = searchParams.get('practice');
  const appliedSpeciality = specialityFromQuery || speciality || '';

  const specialityList = t('pages.doctors.specialityList', { returnObjects: true })?.filter(Boolean) || defaultSpecialityList;

  const applyFilter = () => {
    let filtered = doctors || [];
    filtered = filtered.filter(doc => doc.available !== false);
    if (appliedSpeciality) {
      filtered = filtered.filter(doc =>
        doc.speciality && doc.speciality.toLowerCase().trim() === appliedSpeciality.toLowerCase().trim()
      );
    }
    if (selectedDoctorName) {
      filtered = filtered.filter(doc => doc.name === selectedDoctorName);
    }
    if (doctorType === 'private') {
      filtered = filtered.filter(doc => !doc.hospitalId);
    } else if (doctorType === 'hospital') {
      filtered = filtered.filter(doc => !!doc.hospitalId);
    }
    setFilterDoc(filtered);
  };

  useEffect(() => {
    applyFilter();
    setCurrentPage(1);
  }, [doctors, appliedSpeciality, doctorType, selectedDoctorName]);

  useEffect(() => {
    if (!approvedHospitals || approvedHospitals.length === 0) {
      getApprovedHospitals();
    }
  }, []);

  const handleClearFilters = () => {
    setSelectedDoctorName('');
    setDoctorType('all');
    setCurrentPage(1);
    navigate('/doctors');
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDoctors = filterDoc.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filterDoc.length / itemsPerPage);

  return (
    <div className="bg-[#f9f9f9]">
      <SEO
        title={appliedSpeciality ? `${appliedSpeciality} Doctors` : "Our Expert Doctors"}
        description="Find and book appointments with top-tier Rwandan medical specialists."
      />

      <PageHeader
        title={appliedSpeciality || "Our Expert Doctors"}
        breadcrumbs={[{ label: "Doctors", path: "/doctors" }, ...(appliedSpeciality ? [{ label: appliedSpeciality }] : [])]}
        bgImage="/doctors-innovative-bg.png"
      />

      <section className="py-24">
        <div className="max-w-[90rem] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Sidebar Filter */}
            <aside className="w-full lg:w-80 shrink-0">
              <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-sm sticky top-24">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                  <h3 className="text-lg font-bold text-[#081828] font-merriweather">Specialities</h3>
                  <button
                    className="lg:hidden text-primary text-sm font-bold"
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    {showFilter ? 'Close' : 'Filter'}
                  </button>
                </div>

                <div className={`${showFilter ? 'block' : 'hidden lg:block'} space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar`}>
                  {specialityList.map((item) => {
                    const isSelected = appliedSpeciality.toLowerCase() === item.toLowerCase();
                    return (
                      <button
                        key={item}
                        onClick={() => isSelected ? navigate('/doctors') : navigate(`/doctors/${item}`)}
                        className={`w-full text-left px-4 py-3 text-sm font-semibold transition-all border rounded-sm ${isSelected
                          ? 'bg-[#006838] text-white border-[#006838] shadow-md'
                          : 'bg-white text-gray-600 border-gray-100 hover:border-[#88C250] hover:text-[#88C250]'
                          }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50">
                  <h4 className="text-sm font-bold text-[#081828] mb-4 uppercase tracking-wider">Practice Type</h4>
                  <div className="space-y-3">
                    {['all', 'private', 'hospital'].map(type => (
                      <label key={type} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="doctorType"
                          checked={doctorType === type}
                          onChange={() => setDoctorType(type)}
                          className="w-4 h-4 text-[#006838] border-gray-300 focus:ring-[#006838]"
                        />
                        <span className={`text-sm font-medium transition-colors ${doctorType === type ? 'text-[#006838]' : 'text-gray-500 group-hover:text-[#88C250]'}`}>
                          {type.charAt(0).toUpperCase() + type.slice(1)} Practice
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {appliedSpeciality && (
                  <button
                    onClick={handleClearFilters}
                    className="w-full mt-10 py-4 text-xs font-bold uppercase tracking-widest text-red-500 border border-red-500/20 hover:bg-red-50 transition-all rounded-sm"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            </aside>

            {/* Doctors Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-10">
                <p className="text-gray-500 font-medium">
                  Showing <span className="text-[#081828] font-bold">{filterDoc.length}</span> results
                </p>
                <div className="hidden sm:flex items-center space-x-4 text-sm font-bold text-[#081828]">
                  <span>Sort by:</span>
                  <select className="bg-transparent border-none focus:ring-0 cursor-pointer">
                    <option>Recommended</option>
                    <option>Experience</option>
                    <option>Price: Low to High</option>
                  </select>
                </div>
              </div>

              {currentDoctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {currentDoctors.map((doc, idx) => (
                    <motion.div
                      key={doc._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (idx % 3) * 0.1 }}
                      onClick={() => navigate(`/appointment/${doc._id}`)}
                      className="group bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                    >
                      <div className="relative overflow-hidden aspect-[4/5]">
                        <img
                          src={getDoctorImageSrc(doc)}
                          alt={doc.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Status Label */}
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest ${doc.available ? 'bg-[#88C250] text-white' : 'bg-gray-400 text-white'
                          }`}>
                          {doc.available ? 'Available' : 'Busy'}
                        </div>

                        {/* Hover Overlay with Brief View */}
                        <div className="absolute inset-0 bg-[#006838]/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 p-6 text-center">
                          <p className="text-white/80 text-xs mb-4 italic">"Dedicated to professional healthcare excellence in Rwanda."</p>
                          <span className="bg-white text-[#006838] px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg">
                            Book Appointment
                          </span>
                        </div>
                      </div>

                      <div className="p-6 text-center border-t border-gray-50">
                        <h4 className="text-[#081828] font-bold text-lg mb-1 font-merriweather">{doc.name}</h4>
                        <p className="text-[#88C250] text-sm font-bold mb-3 uppercase tracking-wider">{doc.speciality}</p>
                        <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs border-t border-gray-50 pt-4">
                          <span className="font-bold text-[#006838] text-sm">{currency} {consultationFee?.toLocaleString()}</span>
                          <span className="opacity-50">/ consultation</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState variant="data" title="No doctors found" message="Try adjusting your filters or search criteria." />
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center space-x-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentPage(i + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-12 h-12 font-bold text-sm transition-all rounded-sm ${currentPage === i + 1
                        ? 'bg-[#006838] text-white shadow-lg'
                        : 'bg-white text-gray-400 hover:text-[#006838] hover:border-[#006838] border border-gray-100'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Doctors;
