import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { useTranslation } from 'react-i18next'
import { useSidebar } from '../hooks/useSidebar'
import {
  FaChartLine, FaBrain, FaCalendarCheck, FaUserMd,
  FaUserFriends, FaHistory, FaHospital, FaMicroscope,
  FaBullhorn, FaEnvelope, FaCog, FaSignOutAlt, FaPlus,
  FaFileMedical, FaUserCircle, FaPills, FaClipboardList
} from 'react-icons/fa'

const AdminSideBar = () => {
  const navigate = useNavigate()
  const { aToken, setAToken } = useContext(AdminContext)
  const { dToken, setDToken } = useContext(DoctorContext)
  const { t } = useTranslation()
  const { isOpen } = useSidebar()

  const handleLogout = () => {
    navigate('/')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
  }

  const adminMenu = [
    { to: '/admin-dashboard', icon: <FaChartLine />, label: t('admin.dashboard') },
    { to: '/admin-ai-knowledge', icon: <FaBrain />, label: 'AI Knowledge' },
    { to: '/all-appointments', icon: <FaCalendarCheck />, label: t('admin.allAppointments.title') || 'All Appointments' },
    { to: '/add-doctor', icon: <FaPlus />, label: t('admin.addDoctor') },
    { to: '/doctor-list', icon: <FaUserMd />, label: t('admin.doctorsList.title') || 'Doctors List' },
    { to: '/manage-users', icon: <FaUserFriends />, label: t('admin.manageUsers.title') || 'Manage Users' },
    { to: '/payment-approvals', icon: <FaHistory />, label: t('admin.paymentApprovals.title') || 'Payment Approvals' },
    { to: '/hospital-approvals', icon: <FaHospital />, label: t('admin.hospitalApprovals.title') || 'Hospital Approvals' },
    { to: '/doctor-approvals', icon: <FaCalendarCheck />, label: t('admin.doctorApprovals.title') || 'Doctor Approvals' },
    { to: '/hospital-trials', icon: <FaHospital />, label: t('admin.hospitalTrials.title') || 'Hospital Trials' },
    { to: '/hospital-register', icon: <FaPlus />, label: t('admin.registerHospital') || 'Register Hospital' },
    { to: '/pharmacy-management', icon: <FaPills />, label: t('admin.pharmacyManagement.title') || 'Pharmacy Management' },
    { to: '/lab-management', icon: <FaMicroscope />, label: t('admin.labManagement.title') || 'Lab Management' },
    { to: '/announcements', icon: <FaBullhorn />, label: t('admin.announcements.title') || 'Announcements' },
    { to: '/email-management', icon: <FaEnvelope />, label: 'Email Management' },
    { to: '/settings', icon: <FaCog />, label: t('nav.settings') },
  ]

  const doctorMenu = [
    { to: '/', icon: <FaChartLine />, label: t('doctor.dashboard') },
    { to: '/doctor-appointments', icon: <FaCalendarCheck />, label: t('doctor.appointments') },
    { to: '/doctor-calendar', icon: <FaCalendarCheck />, label: t('doctor.calendar') || 'Calendar' },
    { to: '/doctor-profile', icon: <FaUserCircle />, label: t('doctor.profile') },
    { to: '/prescriptions', icon: <FaPills />, label: t('doctor.prescriptions') },
    { to: '/records', icon: <FaFileMedical />, label: t('doctor.records') },
    { to: '/patients', icon: <FaUserFriends />, label: t('doctor.patients') },
    { to: '/lab-results', icon: <FaMicroscope />, label: 'Lab Results' },
    { to: '/doctor-reports', icon: <FaClipboardList />, label: 'Reports' },
  ]

  const activeMenu = aToken ? adminMenu : (dToken ? doctorMenu : [])

  return (
    <div
      className={`relative h-full bg-[#064e3b] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-[#ffffff10] z-[40] ${isOpen ? 'w-64' : 'w-20'
        }`}
    >
      {/* Sidebar Header / Logo Section */}
      <div className={`flex items-center h-16 px-4 border-b border-[#ffffff10] ${!isOpen && 'justify-center'}`}>
        {isOpen ? (
          <div className="flex items-center gap-3">
            <img src={assets.logo} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg tracking-tight uppercase whitespace-nowrap overflow-hidden">E-Ivuze</span>
          </div>
        ) : (
          <img src={assets.logo} alt="Logo" className="w-8 h-8 object-contain" />
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <ul className="space-y-1 px-3">
          {activeMenu.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                    ? 'bg-white text-[#064e3b] shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <div className={`text-xl flex-shrink-0 ${!isOpen && 'w-full flex justify-center'}`}>
                  {item.icon}
                </div>
                {isOpen && (
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-[#064e3b] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                    {item.label}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Actions / Logout */}
      <div className="p-3 border-t border-[#ffffff10]">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200 text-white/70 hover:bg-red-500/10 hover:text-red-400 group relative ${!isOpen && 'justify-center'}`}
        >
          <div className="text-xl flex-shrink-0">
            <FaSignOutAlt />
          </div>
          {isOpen && (
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
              {t('nav.logout')}
            </span>
          )}
          {!isOpen && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-red-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
              {t('nav.logout')}
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

export default AdminSideBar
