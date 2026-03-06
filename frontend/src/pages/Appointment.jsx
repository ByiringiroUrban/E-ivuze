import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import SEO from "../components/SEO";
import { getDoctorImageSrc } from "../utils/doctorImage";
import PageHeader from "../components/PageHeader";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData, consultationFee } = useContext(AppContext);
  const { t } = useTranslation();
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [booking, setBooking] = useState(false);

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo || null);
  };

  const getAvailableSlots = async () => {
    if (!docInfo) return;
    setDocSlots([]);

    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = `${day}_${month}_${year}`;
        const slotTimeValue = formattedTime;

        const isSlotAvailable = !(docInfo.slots_booked?.[slotDate]?.includes(slotTimeValue));

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots(prev => ([...prev, timeSlots]));
    }
  };


  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment');
      return navigate('/login');
    }

    if (!slotTime) {
      toast.warn('Please select a time slot');
      return;
    }

    if (booking) return;

    try {
      setBooking(true);

      const date = docSlots[slotIndex]?.[0]?.datetime;

      if (!date) {
        toast.error('Please select a date');
        setBooking(false);
        return;
      }

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = `${day}_${month}_${year}`;

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { docId, slotDate, slotTime },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message || 'Appointment booked successfully');
        getDoctorsData();
        navigate('/my-appointments');
      } else {
        toast.error(data.message || 'Failed to book appointment');
        setBooking(false);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to book appointment');
      setBooking(false);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  if (!docInfo) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-muted-foreground px-4">
        Loading doctor profile…
      </div>
    );
  }

  const selectedSlots = docSlots[slotIndex] || [];

  return (
    <div className="bg-[#fcfdfd] min-h-screen pb-24">
      <SEO
        title={`Book ${docInfo.name} - E-ivuzeConnect`}
        description={`Schedule an appointment with ${docInfo.name}, ${docInfo.speciality} on E-ivuzeConnect.`}
      />

      <PageHeader
        title={docInfo.name}
        breadcrumbs={[
          { label: "Doctors", path: "/doctors" },
          { label: docInfo.speciality, path: `/doctors?speciality=${docInfo.speciality}` },
          { label: "Booking" }
        ]}
        bgImage="/doctors-innovative-bg.png"
      />

      <section className="py-24 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50/50 rounded-full blur-3xl -z-10 -mr-48 -mt-24" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50/30 rounded-full blur-3xl -z-10 -ml-48 -mb-24" />

        {/* Background Watermark */}
        <div className="absolute top-10 right-0 left-0 flex justify-center pointer-events-none z-0 overflow-hidden">
          <span className="text-[120px] md:text-[180px] font-bold uppercase text-gray-100/40 whitespace-nowrap select-none font-merriweather">
            BOOKING
          </span>
        </div>

        <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10">
          {/* Top Section: Doctor Profile */}
          <div className="flex flex-wrap -mx-4 items-start mb-20 bg-white/90 backdrop-blur-sm shadow-[0_15px_60px_-15px_rgba(0,104,56,0.08)] p-8 lg:p-12 rounded-sm border border-emerald-50/50">
            {/* Left: Doctor Photo */}
            <div className="w-full lg:w-1/3 px-4 mb-10 lg:mb-0">
              <div className="relative group">
                <div className="aspect-[4/5] overflow-hidden rounded-sm border-2 border-[#006838]/10 bg-gray-50 shadow-inner">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={getDoctorImageSrc(docInfo)}
                    alt={docInfo.name}
                  />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#006838]/5 rounded-full -z-10 animate-pulse"></div>
              </div>
            </div>

            {/* Right: Doctor Info */}
            <div className="w-full lg:w-2/3 px-4">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#006838] text-white px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-sm">
                      {docInfo.speciality}
                    </span>
                    <img className="w-5 h-5" src={assets.verified_icon} alt="Verified" />
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-[#006838] font-merriweather mb-6">
                    {docInfo.name}
                  </h1>

                  {/* Green Underline Design */}
                  <div className="w-20 h-1.5 bg-[#88C250] mb-8 rounded-full"></div>

                  <p className="text-lg text-[#006838]/60 font-medium">
                    {docInfo.degree} • {docInfo.experience} Experience
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-gray-100">
                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#006838]">Biography</p>
                    <p className="text-[#006838]/70 leading-relaxed text-sm lg:text-base">
                      {docInfo.about}
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#006838] mb-4">Consultation Fee</p>
                      <div className="bg-[#006838] p-6 rounded-sm text-white shadow-lg shadow-emerald-900/20">
                        <p className="text-sm opacity-70 mb-1">Fee for single session</p>
                        <p className="text-3xl font-bold font-merriweather">
                          {currencySymbol} {consultationFee?.toLocaleString() || '3,000'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-10">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#006838] mb-3">License & Credential</p>
                    <p className="text-[#006838]/80 font-medium text-sm">
                      {docInfo.licenseNumber || 'Verified Rwanda Medical Practitioner'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#006838] mb-3">Email Address</p>
                    <p className="text-[#006838]/80 font-medium text-sm">{docInfo.email || 'team@E-ivuze.com'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Booking & Location */}
          <div className="flex flex-wrap -mx-4">
            {/* Slot Selection */}
            <div className="w-full lg:w-2/3 px-4 mb-10 lg:mb-0">
              <div className="bg-[#f8faf9] border-2 border-[#006838]/10 p-8 lg:p-12 h-full rounded-sm shadow-sm relative overflow-hidden">
                {/* Texture background */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23006838' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 30V20h8V12h8V4h10v8h8v8h8v10H42v8h-8v8H22v-8h-8v-8H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

                <div className="mb-10 relative z-10">
                  <h3 className="text-2xl lg:text-3xl font-bold text-[#006838] font-merriweather mb-2">
                    {t('pages.appointment.bookingSlots')}
                  </h3>
                  <p className="text-[#006838]/50 text-sm">Select your preferred date and available time slot.</p>
                </div>

                {/* Date Selection */}
                <div className="flex gap-4 overflow-x-auto pb-6 mb-10 no-scrollbar relative z-10">
                  {docSlots.map((slotGroup, index) => {
                    const labelDate = slotGroup[0]?.datetime;
                    if (!labelDate) return null;
                    return (
                      <button
                        key={index}
                        onClick={() => { setSlotIndex(index); setSlotTime(''); }}
                        className={`min-w-[100px] py-6 px-4 flex flex-col items-center justify-center transition-all duration-300 border-2 rounded-sm ${slotIndex === index
                          ? 'bg-[#006838] border-[#006838] text-white scale-105 shadow-lg shadow-emerald-900/20'
                          : 'bg-white border-emerald-100/50 text-[#006838]/60 hover:border-[#006838]/30 shadow-sm'
                          }`}
                      >
                        <span className="text-[10px] uppercase tracking-widest font-bold mb-1">
                          {daysOfWeek[labelDate.getDay()]}
                        </span>
                        <span className="text-2xl font-bold font-merriweather">
                          {labelDate.getDate()}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Time Selection */}
                <div className="space-y-6 relative z-10">
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#006838]/40">
                    Available Time Segments
                  </p>
                  {selectedSlots.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-emerald-100 text-center text-[#006838]/40 uppercase text-[10px] tracking-[0.3em] bg-white/50 rounded-sm">
                      No more slots available for today
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {selectedSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSlotTime(slot.time)}
                          className={`py-3 text-[10px] uppercase tracking-widest font-bold border-2 transition-all duration-300 rounded-sm ${slotTime === slot.time
                            ? 'bg-[#88C250] border-[#88C250] text-white shadow-md'
                            : 'bg-white border-emerald-100/50 text-[#006838]/70 hover:border-[#88C250]/40 shadow-sm'
                            }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-12 relative z-10">
                  <button
                    disabled={booking}
                    onClick={bookAppointment}
                    className={`w-full bg-[#006838] text-white py-6 font-bold text-base uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-emerald-900/20 rounded-sm ${booking ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#005a30]'
                      }`}
                  >
                    {booking ? t('buttons.booking') : t('buttons.bookAppointment')}
                  </button>
                  <p className="text-center text-[10px] text-[#006838]/40 mt-6 uppercase tracking-widest">
                    Secured by E-ivuzeAppointment Protocol
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="w-full lg:w-1/3 px-4">
              <div className="space-y-6">
                <div className="bg-[#88C250]/5 border border-[#88C250]/10 p-8 rounded-sm shadow-sm">
                  <h4 className="text-xl font-bold text-[#006838] font-merriweather mb-6">Facility Details</h4>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 text-[#006838] shadow-sm">
                        <i className="lni lni-apartment"></i>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[#006838]/50 mb-1">Hospital</p>
                        <p className="text-[#006838] font-bold">{docInfo.hospital || 'Partner Medical Center'}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 text-[#006838] shadow-sm">
                        <i className="lni lni-map-marker"></i>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[#006838]/50 mb-1">Exact Location</p>
                        <p className="text-[#006838] font-bold">{docInfo.address?.line1 || 'KN 67 St, Kigali'}</p>
                        <p className="text-sm text-[#006838]/60">{docInfo.address?.line2 || 'Nyarugenge District'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#006838]/[0.02] border-2 border-emerald-50/50 p-8 rounded-sm shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#006838]/50 mb-4">Support & Help</p>
                  <p className="text-sm text-[#006838]/70 leading-relaxed mb-6">
                    Facing issues with booking? Our technical support is available 24/7.
                  </p>
                  <div className="space-y-2">
                    <p className="text-[#006838] font-bold text-sm">+250 788 777 888</p>
                    <p className="text-[#006838] font-bold text-sm">support@E-ivuze.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Doctors */}
      <section className="py-24 bg-[#f8faf9] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#88C250]/5 rounded-full -mr-32 -mt-32"></div>
        <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10 text-center">
          <div className="mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#006838] font-merriweather mb-4 text-center">
              Related Specialists
            </h2>
            <div className="w-24 h-1 bg-[#88C250] mx-auto"></div>
          </div>
          <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
        </div>
      </section>
    </div>
  );
};

export default Appointment;
