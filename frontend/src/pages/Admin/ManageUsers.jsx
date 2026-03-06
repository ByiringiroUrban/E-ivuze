import React, { useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { AdminContext } from '../../context/AdminContext'
import EmptyState from '../../components/EmptyState'
import {
  FaPencilAlt,
  FaTrashAlt,
  FaPlus,
  FaSearch,
  FaHistory,
  FaFileExport,
  FaFileImport,
  FaUserFriends,
  FaUserMd,
  FaHospital,
  FaPills,
  FaMicroscope
} from 'react-icons/fa'

const ManageUsers = () => {
  const { t } = useTranslation()
  const { aToken, backendUrl } = useContext(AdminContext)

  const [targetType, setTargetType] = useState('user') // user, doctor, hospital, pharmacy, lab
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [loading, setLoading] = useState(false)

  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [hasGoogleFilter, setHasGoogleFilter] = useState('')
  const [mustChangePasswordFilter, setMustChangePasswordFilter] = useState('')

  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  const [selectedItem, setSelectedItem] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [importResult, setImportResult] = useState(null)

  const emptyForm = {
    // Shared
    name: '',
    email: '',
    phone: '',
    password: '',
    // User specific
    role: 'user',
    // Doctor specific
    speciality: '',
    degree: '',
    licenseNumber: '',
    experience: '1 Year',
    about: '',
    nid: '',
    department: '',
    subSpeciality: '',
    employmentType: 'Full-Time',
    fees: '',
    gender: 'Male',
    // Hospital / Pharm / Lab
    address: { line1: '', line2: '', city: 'Kigali', country: 'Rwanda' },
    website: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    managerName: '',
    managerPassword: '',
  }

  const [formData, setFormData] = useState(emptyForm)

  const totalPages = useMemo(() => {
    const pages = Math.ceil((Number(total) || 0) / (Number(limit) || 50))
    return Math.max(1, pages || 1)
  }, [total, limit])

  const fetchData = async ({ keepPage = true } = {}) => {
    if (!aToken) return
    try {
      setLoading(true)
      let endpoint = '/api/admin/users'
      let params = { page: keepPage ? page : 1, limit, q: q.trim() || undefined }

      if (targetType === 'doctor') {
        endpoint = '/api/admin/all-doctor'
        const { data } = await axios.post(`${backendUrl}${endpoint}`, {}, {
          headers: { aToken },
          timeout: 15000
        })
        if (data?.success) {
          const list = Array.isArray(data.doctors) ? data.doctors : []
          const filtered = q ? list.filter(d => (d.name || '').toLowerCase().includes(q.toLowerCase()) || (d.email || '').toLowerCase().includes(q.toLowerCase())) : list
          setItems(filtered)
          setTotal(filtered.length)
        }
      } else {
        if (targetType === 'user') {
          endpoint = '/api/admin/users'
          params = { ...params, role: roleFilter || undefined, hasGoogle: hasGoogleFilter || undefined, mustChangePassword: mustChangePasswordFilter || undefined }
        } else if (targetType === 'hospital') endpoint = '/api/admin/hospitals'
        else if (targetType === 'pharmacy') endpoint = '/api/admin/pharmacies'
        else if (targetType === 'lab') endpoint = '/api/admin/labs'

        const { data } = await axios.get(`${backendUrl}${endpoint}`, {
          headers: { aToken },
          params,
          timeout: 15000
        })

        if (data?.success) {
          if (targetType === 'user') {
            setItems(Array.isArray(data.users) ? data.users : [])
            setTotal(Number(data.total) || 0)
          } else if (targetType === 'hospital') {
            const list = Array.isArray(data.hospitals) ? data.hospitals : []
            const filtered = q ? list.filter(h => (h.name || '').toLowerCase().includes(q.toLowerCase())) : list
            setItems(filtered)
            setTotal(filtered.length)
          } else if (targetType === 'pharmacy') {
            const list = Array.isArray(data.pharmacies) ? data.pharmacies : []
            const filtered = q ? list.filter(p => (p.name || '').toLowerCase().includes(q.toLowerCase())) : list
            setItems(filtered)
            setTotal(filtered.length)
          } else if (targetType === 'lab') {
            const list = Array.isArray(data.labs) ? data.labs : []
            const filtered = q ? list.filter(l => (l.name || '').toLowerCase().includes(q.toLowerCase())) : list
            setItems(filtered)
            setTotal(filtered.length)
          }
        } else {
          toast.error(data?.message || 'Failed to fetch data')
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const importCsv = async (file) => {
    if (!file || !aToken) return
    try {
      setLoading(true)
      const fd = new FormData()
      fd.append('file', file)

      const { data } = await axios.post(`${backendUrl}/api/admin/users/import.csv`, fd, {
        headers: { aToken },
        timeout: 60000
      })

      if (data?.success) {
        setImportResult(data)
        setShowImportModal(true)
        await fetchData({ keepPage: true })
      } else {
        toast.error(data?.message || 'Failed to import CSV')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to import CSV')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!aToken) return
    fetchData({ keepPage: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken, backendUrl, page, limit, targetType, roleFilter, hasGoogleFilter, mustChangePasswordFilter])

  const onSearchSubmit = async (e) => {
    e.preventDefault()
    setPage(1)
    await fetchData({ keepPage: false })
  }

  const resetAll = async () => {
    setQ('')
    setRoleFilter('')
    setHasGoogleFilter('')
    setMustChangePasswordFilter('')
    setPage(1)
    await fetchData({ keepPage: false })
  }

  const openCreate = () => {
    setFormData(emptyForm)
    setShowCreateModal(true)
  }

  const openEdit = (item) => {
    setSelectedItem(item)
    setFormData({
      ...emptyForm,
      name: item?.name || '',
      email: item?.email || '',
      phone: item?.phone || '',
      role: item?.role || 'user',
      speciality: item?.speciality || '',
      degree: item?.degree || '',
      licenseNumber: item?.licenseNumber || '',
      experience: item?.experience || '1 Year',
      about: item?.about || '',
      address: item?.address || { line1: '', line2: '', city: 'Kigali', country: 'Rwanda' },
      website: item?.website || '',
      nid: item?.nid || '',
      department: item?.department || '',
      subSpeciality: item?.subSpeciality || '',
      employmentType: item?.employmentType || 'Full-Time',
      fees: item?.fees || '',
    })
    setShowEditModal(true)
  }

  const openDelete = (id) => {
    setDeletingId(id)
    setShowDeleteModal(true)
  }

  const closeModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setShowDeleteModal(false)
    setShowImportModal(false)
    setSelectedItem(null)
    setDeletingId(null)
    setImportResult(null)
    setFormData(emptyForm)
  }

  const handleCreate = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      let endpoint = '/api/admin/users'
      let payload = {}

      if (targetType === 'user') {
        if (!formData.name || !formData.email || !formData.password) throw new Error('Fill name, email and password')
        payload = { name: formData.name, email: formData.email, password: formData.password, role: formData.role, phone: formData.phone }
      } else if (targetType === 'doctor') {
        endpoint = '/api/admin/add-doctor'
        payload = { ...formData, address: JSON.stringify(formData.address) }
      } else if (targetType === 'hospital') {
        endpoint = '/api/admin/hospitals/register'
        payload = {
          name: formData.name,
          address: JSON.stringify(formData.address),
          phone: formData.phone,
          website: formData.website,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword
        }
      } else if (targetType === 'pharmacy') {
        endpoint = '/api/admin/pharmacies'
        payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: JSON.stringify(formData.address),
          licenseNumber: formData.licenseNumber,
          managerName: formData.managerName,
          managerPassword: formData.managerPassword
        }
      } else if (targetType === 'lab') {
        endpoint = '/api/admin/labs'
        payload = { name: formData.name, email: formData.email, password: formData.password, phone: formData.phone, address: JSON.stringify(formData.address) }
      }

      const { data } = await axios.post(`${backendUrl}${endpoint}`, payload, {
        headers: { aToken },
        timeout: 15000
      })

      if (data?.success) {
        toast.success(data.message || 'Item created')
        closeModals()
        setPage(1)
        await fetchData({ keepPage: false })
      } else {
        toast.error(data?.message || 'Failed')
      }
    } catch (error) {
      toast.error(error.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!selectedItem?._id) return

    try {
      setLoading(true)
      let endpoint = `/api/admin/users/${selectedItem._id}`
      let payload = { ...formData }

      if (targetType === 'doctor') endpoint = `/api/admin/doctors/${selectedItem._id}`
      else if (targetType === 'hospital') endpoint = `/api/admin/hospitals/${selectedItem._id}`
      else if (targetType === 'pharmacy') endpoint = `/api/admin/pharmacies/${selectedItem._id}`
      else if (targetType === 'lab') endpoint = `/api/admin/labs/${selectedItem._id}`

      if (typeof payload.address === 'object') payload.address = JSON.stringify(payload.address)

      const { data } = await axios.put(`${backendUrl}${endpoint}`, payload, {
        headers: { aToken },
        timeout: 15000
      })

      if (data?.success) {
        toast.success(data.message || 'Updated')
        closeModals()
        await fetchData({ keepPage: true })
      } else {
        toast.error(data?.message || 'Failed')
      }
    } catch (error) {
      toast.error(error.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingId) return

    try {
      setLoading(true)
      let endpoint = `/api/admin/users/${deletingId}`
      if (targetType === 'doctor') endpoint = `/api/admin/doctors/${deletingId}`
      else if (targetType === 'hospital') endpoint = `/api/admin/hospitals/${deletingId}`
      else if (targetType === 'pharmacy') endpoint = `/api/admin/pharmacies/${deletingId}`
      else if (targetType === 'lab') endpoint = `/api/admin/labs/${deletingId}`

      const { data } = await axios.delete(`${backendUrl}${endpoint}`, {
        headers: { aToken },
        timeout: 15000
      })

      if (data?.success) {
        toast.success(data.message || 'Deleted')
        closeModals()
        await fetchData({ keepPage: true })
      } else {
        toast.error(data?.message || 'Failed')
      }
    } catch (error) {
      toast.error(error.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = async () => {
    if (!aToken) return

    try {
      setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/admin/users/export.csv`, {
        headers: { aToken },
        params: {
          q: q.trim() || undefined,
          role: roleFilter || undefined,
          hasGoogle: hasGoogleFilter || undefined,
          mustChangePassword: mustChangePasswordFilter || undefined
        },
        responseType: 'blob',
        timeout: 20000
      })

      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'users.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to export CSV')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='bg-white min-h-screen'>
      <section className="bg-white border-b border-gray-100 px-4 sm:px-8 lg:px-12 py-8">
        <div className="max-w-5xl space-y-1">
          <p className="text-xs tracking-widest text-[#064e3b] font-semibold">Admin</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Entities</h1>
          <p className="text-sm text-gray-500 max-w-3xl pt-1">Unified command center for Patients, Doctors, Hospitals, Pharmacies, and Labs.</p>
        </div>
      </section>

      <section className='py-8'>
        <div className='w-full px-4 sm:px-8 lg:px-12 space-y-6'>
          {/* Category Selector */}
          <div className='flex flex-wrap items-center gap-2 border-b border-border'>
            {[
              { id: 'user', label: 'Patients', icon: FaUserFriends },
              { id: 'doctor', label: 'Doctors', icon: FaUserMd },
              { id: 'hospital', label: 'Hospitals', icon: FaHospital },
              { id: 'pharmacy', label: 'Pharmacies', icon: FaPills },
              { id: 'lab', label: 'Laboratories', icon: FaMicroscope }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => { setTargetType(cat.id); setPage(1); }}
                className={`flex items-center gap-2 px-6 py-4 text-xs tracking-[0.2em] uppercase font-bold transition-all border-b-2 ${targetType === cat.id ? 'border-[#006838] text-[#006838] bg-[#006838]/5' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <cat.icon className="text-sm" />
                {cat.label}
              </button>
            ))}
          </div>

          <div className='flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between'>
            <form onSubmit={onSearchSubmit} className='flex flex-col sm:flex-row gap-3 w-full lg:max-w-2xl'>
              <div className='flex-1 relative'>
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className='w-full border border-border pl-10 pr-4 py-3 text-sm outline-none focus:border-primary bg-gray-50/30'
                  placeholder={`Search ${targetType === 'user' ? 'name or email' : 'by name'}...`}
                />
              </div>
              <div className='flex gap-2'>
                <button
                  type='submit'
                  className='h-[46px] px-6 bg-[#006838] text-white text-xs tracking-[0.2em] uppercase font-bold flex items-center gap-2 border-none'
                  disabled={loading}
                >
                  <FaSearch />
                  Search
                </button>
                <button
                  type='button'
                  onClick={resetAll}
                  className='h-[46px] px-6 bg-white border border-border text-xs tracking-[0.2em] uppercase font-bold text-gray-500 rounded-none'
                  disabled={loading}
                >
                  Reset
                </button>
              </div>
            </form>

            <div className='flex items-center gap-2'>
              {targetType === 'user' && (
                <>
                  <label className='h-[46px] px-6 bg-white border border-border text-xs tracking-[0.2em] uppercase font-bold flex items-center gap-2 cursor-pointer text-gray-600'>
                    <FaFileImport />
                    Import
                    <input type='file' accept='.csv' className='hidden' onChange={(e) => importCsv(e.target.files?.[0])} />
                  </label>
                  <button onClick={exportCsv} className='h-[46px] px-6 bg-white border border-border text-xs tracking-[0.2em] uppercase font-bold flex items-center gap-2 text-gray-600'>
                    <FaFileExport />
                    Export
                  </button>
                </>
              )}
              <button
                onClick={openCreate}
                className='h-[46px] px-6 bg-[#006838] text-white text-xs tracking-[0.2em] uppercase font-bold flex items-center gap-2 border-none'
              >
                <FaPlus />
                Add {targetType}
              </button>
            </div>
          </div>

          {targetType === 'user' && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 border border-border rounded-lg'>
              <div className='space-y-1.5'>
                <label className='text-[10px] uppercase tracking-widest font-bold text-gray-400'>Role Filter</label>
                <select className='w-full border border-border px-3 py-2 text-sm rounded bg-white' value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  <option value=''>All Roles</option>
                  <option value='user'>Patients</option>
                  <option value='admin'>Admins</option>
                </select>
              </div>
              <div className='space-y-1.5'>
                <label className='text-[10px] uppercase tracking-widest font-bold text-gray-400'>Google Auth</label>
                <select className='w-full border border-border px-3 py-2 text-sm rounded bg-white' value={hasGoogleFilter} onChange={e => setHasGoogleFilter(e.target.value)}>
                  <option value=''>Any</option>
                  <option value='true'>Connected</option>
                  <option value='false'>Not Connected</option>
                </select>
              </div>
              <div className='space-y-1.5'>
                <label className='text-[10px] uppercase tracking-widest font-bold text-gray-400'>Security</label>
                <select className='w-full border border-border px-3 py-2 text-sm rounded bg-white' value={mustChangePasswordFilter} onChange={e => setMustChangePasswordFilter(e.target.value)}>
                  <option value=''>Any Status</option>
                  <option value='true'>Password Reset Required</option>
                </select>
              </div>
            </div>
          )}

          <div className='border border-border bg-white shadow-xl rounded-lg overflow-hidden'>
            <div className='px-6 py-5 border-b border-border bg-gray-50/30 flex justify-between items-center'>
              <p className='text-xs tracking-[0.3em] uppercase text-[#064e3b] font-bold'>{targetType} Records</p>
              <div className='flex items-center gap-2'>
                <span className='text-xs font-bold text-gray-400 uppercase'>Page {page}</span>
                {total > limit && (
                  <div className='flex gap-1'>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className='p-1 border rounded disabled:opacity-30 bg-white'>&larr;</button>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className='p-1 border rounded disabled:opacity-30 bg-white'>&rarr;</button>
                  </div>
                )}
              </div>
            </div>

            <table className='w-full text-sm'>
              <thead className='bg-gray-50/50 text-gray-500 uppercase text-[10px] tracking-widest font-bold border-b border-border'>
                <tr>
                  <th className='px-6 py-4 text-left'>Entity</th>
                  <th className='px-6 py-4 text-left'>Security / Type</th>
                  <th className='px-6 py-4 text-left'>Contact</th>
                  <th className='px-6 py-4 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {items.map(item => {
                  const getStatusInfo = () => {
                    if (targetType === 'user') {
                      const role = item.role?.toUpperCase() || 'USER'
                      if (role === 'ADMIN') return { label: 'Admin', color: 'bg-rose-500/10 text-rose-600 border-rose-200', icon: <FaUserFriends size={10} /> }
                      if (role === 'STAFF') return { label: 'Staff', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200', icon: <FaUserFriends size={10} /> }
                      return { label: 'Patient', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: <FaUserFriends size={10} /> }
                    }

                    if (targetType === 'lab') {
                      return item.available
                        ? { label: 'Active', color: 'bg-green-500/10 text-green-600 border-green-200', icon: <FaMicroscope size={10} /> }
                        : { label: 'Inactive', color: 'bg-slate-500/10 text-slate-600 border-slate-200', icon: <FaMicroscope size={10} /> }
                    }

                    // For Doctor, Hospital, Pharmacy
                    if (item.verified) return { label: 'Verified', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: <FaPlus size={10} /> }

                    const st = (item.status || 'PENDING').toUpperCase()
                    if (st === 'APPROVED') return { label: 'Approved', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: <FaPlus size={10} /> }
                    if (st === 'REJECTED') return { label: 'Rejected', color: 'bg-red-500/10 text-red-600 border-red-200', icon: <FaTrashAlt size={10} /> }
                    return { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: <FaHistory size={10} /> }
                  }

                  const statusInfo = getStatusInfo()

                  return (
                    <tr key={item._id} className='hover:bg-gray-50/50 transition-all border-b border-gray-50'>
                      <td className='px-6 py-5'>
                        <div className='flex items-center gap-3'>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${targetType === 'user' ? 'bg-emerald-50 text-emerald-700' :
                            targetType === 'doctor' ? 'bg-blue-50 text-blue-700' :
                              targetType === 'hospital' ? 'bg-indigo-50 text-indigo-700' :
                                targetType === 'pharmacy' ? 'bg-orange-50 text-orange-700' :
                                  'bg-purple-50 text-purple-700'
                            }`}>
                            {item.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className='flex flex-col'>
                            <span className='font-bold text-gray-900 text-sm tracking-tight'>{item.name}</span>
                            <span className='text-[10px] text-gray-400 font-bold tracking-widest uppercase'>ID: {item._id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-5'>
                        <div className='flex flex-col gap-1.5'>
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest w-fit ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </div>
                          {item.speciality && <span className='text-[11px] text-gray-500 font-bold italic opacity-70 ml-1'> {item.speciality}</span>}
                        </div>
                      </td>
                      <td className='px-6 py-5'>
                        <div className='flex flex-col gap-0.5'>
                          <span className='text-xs font-bold text-gray-700 flex items-center gap-1.5'>
                            <span className='w-1 h-1 bg-gray-300 rounded-full'></span>
                            {item.email || item.website || 'N/A'}
                          </span>
                          <span className='text-[11px] text-gray-400 font-medium ml-2.5'>{item.phone || 'No contact'}</span>
                        </div>
                      </td>
                      <td className='px-6 py-5 text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <button onClick={() => openEdit(item)} className='p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border-none bg-transparent'><FaPencilAlt size={14} /></button>
                          <button onClick={() => openDelete(item._id)} className='p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent'><FaTrashAlt size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={4} className='py-20'>
                      <EmptyState variant='users' title={`No ${targetType}s found`} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CREATE / EDIT MODAL */}
      {(showCreateModal || showEditModal) && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
          <div className='bg-white w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-200'>
            <div className='px-6 py-5 border-b border-border bg-gray-50 flex justify-between items-center'>
              <h2 className='text-xl font-bold text-gray-800 uppercase tracking-tight'>{showCreateModal ? 'New' : 'Edit'} {targetType}</h2>
              <button onClick={closeModals} className='text-gray-400 hover:text-gray-600 border-none bg-transparent text-2xl'>&times;</button>
            </div>

            <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className='p-6 space-y-5 max-h-[80vh] overflow-y-auto'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='sm:col-span-2'>
                  <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>Full Name / Entity Name</label>
                  <input className='w-full border border-border px-4 py-3 rounded text-sm focus:border-green-500 outline-none transition-all' value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
                </div>

                <div>
                  <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>Email Address</label>
                  <input type='email' className='w-full border border-border px-4 py-3 rounded text-sm focus:border-green-500 outline-none transition-all' value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required />
                </div>

                <div>
                  <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>Phone Number</label>
                  <input className='w-full border border-border px-4 py-3 rounded text-sm focus:border-green-500 outline-none transition-all' value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                </div>

                {targetType === 'user' && (
                  <div>
                    <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>System Role</label>
                    <select className='w-full border border-border px-4 py-3 rounded text-sm bg-white font-medium' value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>
                      <option value='user'>Patient</option>
                      <option value='staff'>Staff</option>
                      <option value='admin'>Administrator</option>
                    </select>
                  </div>
                )}

                {targetType === 'doctor' && (
                  <>
                    <div>
                      <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>Speciality</label>
                      <input className='w-full border border-border px-4 py-3 rounded text-sm' value={formData.speciality} onChange={e => setFormData(p => ({ ...p, speciality: e.target.value }))} required />
                    </div>
                    <div>
                      <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>Degree</label>
                      <input className='w-full border border-border px-4 py-3 rounded text-sm' value={formData.degree} onChange={e => setFormData(p => ({ ...p, degree: e.target.value }))} required />
                    </div>
                    <div>
                      <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>License Number</label>
                      <input className='w-full border border-border px-4 py-3 rounded text-sm' value={formData.licenseNumber} onChange={e => setFormData(p => ({ ...p, licenseNumber: e.target.value }))} required />
                    </div>
                    <div>
                      <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>Experience (Years)</label>
                      <input className='w-full border border-border px-4 py-3 rounded text-sm' value={formData.experience} onChange={e => setFormData(p => ({ ...p, experience: e.target.value }))} required />
                    </div>
                    <div>
                      <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>NID</label>
                      <input className='w-full border border-border px-4 py-3 rounded text-sm' value={formData.nid} onChange={e => setFormData(p => ({ ...p, nid: e.target.value }))} />
                    </div>
                    <div>
                      <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>Employment</label>
                      <select className='w-full border border-border px-4 py-3 rounded text-sm' value={formData.employmentType} onChange={e => setFormData(p => ({ ...p, employmentType: e.target.value }))}>
                        <option value='Full-Time'>Full-Time</option>
                        <option value='Part-Time'>Part-Time</option>
                        <option value='Visiting'>Visiting</option>
                      </select>
                    </div>
                    <div className='sm:col-span-2'>
                      <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>About Doctor</label>
                      <textarea className='w-full border border-border px-4 py-3 rounded text-sm h-24' value={formData.about} onChange={e => setFormData(p => ({ ...p, about: e.target.value }))}></textarea>
                    </div>
                  </>
                )}

                {(targetType === 'pharmacy' || targetType === 'lab' || targetType === 'hospital') && (
                  <>
                    <div className='sm:col-span-2 grid grid-cols-2 gap-4 border-l-2 border-[#006838] pl-4 my-2'>
                      <div className='col-span-2 text-[10px] font-black uppercase text-[#006838] tracking-widest'>Physical Address</div>
                      <input placeholder='Address Line 1' className='w-full border border-border px-4 py-3 rounded text-sm' value={formData.address.line1} onChange={e => setFormData(p => ({ ...p, address: { ...p.address, line1: e.target.value } }))} required />
                      <input placeholder='City' className='w-full border border-border px-4 py-3 rounded text-sm' value={formData.address.city} onChange={e => setFormData(p => ({ ...p, address: { ...p.address, city: e.target.value } }))} required />
                    </div>
                    {targetType === 'hospital' && (
                      <div>
                        <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>Website</label>
                        <input className='w-full border border-border px-4 py-3 rounded text-sm' value={formData.website} onChange={e => setFormData(p => ({ ...p, website: e.target.value }))} />
                      </div>
                    )}
                  </>
                )}

                {(showCreateModal || (targetType === 'user' || targetType === 'lab')) && (
                  <div className='sm:col-span-2'>
                    <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>{showCreateModal ? 'Set Secure Password' : 'Update Password (optional)'}</label>
                    <input type='password' placeholder='Minimum 8 characters' className='w-full border border-border px-4 py-3 rounded text-sm' value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} required={showCreateModal && !['hospital', 'pharmacy'].includes(targetType)} />
                  </div>
                )}

                {targetType === 'hospital' && showCreateModal && (
                  <div className='sm:col-span-2 p-4 bg-[#006838]/5 rounded border border-[#006838]/20 space-y-4 shadow-inner'>
                    <p className='text-xs font-bold text-[#006838] uppercase tracking-widest flex items-center gap-2'>
                      <span className='w-2 h-2 bg-[#006838] rounded-full animate-pulse'></span>
                      Administrator Credentials
                    </p>
                    <div className='grid grid-cols-2 gap-4'>
                      <input placeholder='Admin Full Name' className='w-full border border-border px-4 py-3 rounded text-sm bg-white' value={formData.adminName} onChange={e => setFormData(p => ({ ...p, adminName: e.target.value }))} required />
                      <input placeholder='Admin Email' className='w-full border border-border px-4 py-3 rounded text-sm bg-white' value={formData.adminEmail} onChange={e => setFormData(p => ({ ...p, adminEmail: e.target.value }))} required />
                      <input placeholder='Admin Login Password' type='password' className='w-full border border-border px-4 py-3 rounded text-sm col-span-2 bg-white' value={formData.adminPassword} onChange={e => setFormData(p => ({ ...p, adminPassword: e.target.value }))} required />
                    </div>
                  </div>
                )}

                {targetType === 'pharmacy' && showCreateModal && (
                  <>
                    <div>
                      <label className='block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>License Number</label>
                      <input className='w-full border border-border px-4 py-3 rounded text-sm' value={formData.licenseNumber} onChange={e => setFormData(p => ({ ...p, licenseNumber: e.target.value }))} required />
                    </div>
                    <div className='sm:col-span-2 p-4 bg-orange-50 rounded border border-orange-100 space-y-4'>
                      <p className='text-xs font-bold text-orange-600 uppercase tracking-widest'>Pharmacy Manager</p>
                      <div className='grid grid-cols-2 gap-4'>
                        <input placeholder='Manager Name' className='w-full border border-border px-4 py-3 rounded text-sm bg-white' value={formData.managerName} onChange={e => setFormData(p => ({ ...p, managerName: e.target.value }))} required />
                        <input placeholder='Manager Password' type='password' className='w-full border border-border px-4 py-3 rounded text-sm bg-white' value={formData.managerPassword} onChange={e => setFormData(p => ({ ...p, managerPassword: e.target.value }))} required />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className='flex items-center justify-end gap-3 pt-6 border-t border-border'>
                <button type='button' onClick={closeModals} className='px-6 py-2.5 text-sm font-bold text-gray-400 border-none bg-transparent hover:text-gray-600' disabled={loading}>Cancel</button>
                <button type='submit' className='px-10 py-2.5 bg-[#006838] text-white text-sm font-bold rounded-lg shadow-lg hover:bg-opacity-90 transition-all border-none' disabled={loading}>
                  {loading ? 'Processing...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteModal && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
          <div className='bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl space-y-6 text-center animate-in zoom-in duration-200'>
            <div className='w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto'>
              <FaTrashAlt size={32} />
            </div>
            <div>
              <h3 className='text-2xl font-black text-gray-800'>Delete {targetType}?</h3>
              <p className='text-gray-500 mt-2 text-sm font-medium'>This operation is final and will delete all associated data for this record.</p>
            </div>
            <div className='flex gap-3'>
              <button onClick={closeModals} className='flex-1 py-3.5 border border-border rounded-xl font-bold text-gray-500 bg-white hover:bg-gray-50'>Cancel</button>
              <button onClick={confirmDelete} className='flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors border-none' disabled={loading}>
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT RESULT */}
      {showImportModal && importResult && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
          <div className='bg-white w-full max-w-xl p-8 rounded-2xl shadow-2xl space-y-6 animate-in zoom-in duration-200'>
            <div className='flex justify-between items-center'>
              <h3 className='text-2xl font-black text-gray-800'>Import Summary</h3>
              <button onClick={closeModals} className='text-3xl border-none bg-transparent text-gray-400'>&times;</button>
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div className='p-5 bg-green-50 rounded-xl border border-green-100 text-center'>
                <p className='text-[10px] uppercase font-bold text-green-600 tracking-widest'>Created</p>
                <p className='text-3xl font-black text-green-900 mt-1'>{importResult.created}</p>
              </div>
              <div className='p-5 bg-blue-50 rounded-xl border border-blue-100 text-center'>
                <p className='text-[10px] uppercase font-bold text-blue-600 tracking-widest'>Updated</p>
                <p className='text-3xl font-black text-blue-900 mt-1'>{importResult.updated}</p>
              </div>
              <div className='p-5 bg-gray-50 rounded-xl border border-gray-100 text-center'>
                <p className='text-[10px] uppercase font-bold text-gray-600 tracking-widest'>Errors</p>
                <p className='text-3xl font-black text-gray-900 mt-1'>{importResult.errors?.length || 0}</p>
              </div>
            </div>
            <button onClick={closeModals} className='w-full py-4 bg-gray-900 text-white font-bold rounded-xl border-none hover:bg-gray-800 transition-colors'>Close Overview</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageUsers
