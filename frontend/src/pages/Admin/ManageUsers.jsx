import React, { useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { AdminContext } from '../../context/AdminContext'
import EmptyState from '../../components/EmptyState'

const ManageUsers = () => {
  const { t } = useTranslation()
  const { aToken, backendUrl } = useContext(AdminContext)

  const [users, setUsers] = useState([])
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [hasGoogleFilter, setHasGoogleFilter] = useState('')
  const [mustChangePasswordFilter, setMustChangePasswordFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  const [selectedUser, setSelectedUser] = useState(null)
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [importResult, setImportResult] = useState(null)

  const emptyForm = {
    name: '',
    email: '',
    phone: '',
    role: 'user',
    password: ''
  }

  const [formData, setFormData] = useState(emptyForm)

  const totalPages = useMemo(() => {
    const pages = Math.ceil((Number(total) || 0) / (Number(limit) || 50))
    return Math.max(1, pages || 1)
  }, [total, limit])

  const fetchUsers = async ({ keepPage = true } = {}) => {
    if (!aToken) return
    try {
      setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/admin/users`, {
        headers: { aToken },
        params: {
          q: q.trim() || undefined,
          role: roleFilter || undefined,
          hasGoogle: hasGoogleFilter || undefined,
          mustChangePassword: mustChangePasswordFilter || undefined,
          page: keepPage ? page : 1,
          limit
        },
        timeout: 15000
      })

      if (data?.success) {
        setUsers(Array.isArray(data.users) ? data.users : [])
        setTotal(Number(data.total) || 0)
        setPage(Number(data.page) || (keepPage ? page : 1))
        setLimit(Number(data.limit) || limit)
      } else {
        toast.error(data?.message || 'Failed to fetch users')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch users')
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
        await fetchUsers({ keepPage: true })
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
    fetchUsers({ keepPage: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken, backendUrl, page, limit, roleFilter, hasGoogleFilter, mustChangePasswordFilter])

  const onSearchSubmit = async (e) => {
    e.preventDefault()
    setPage(1)
    await fetchUsers({ keepPage: false })
  }

  const resetAll = async () => {
    setQ('')
    setRoleFilter('')
    setHasGoogleFilter('')
    setMustChangePasswordFilter('')
    setPage(1)
    await fetchUsers({ keepPage: false })
  }

  const openCreate = () => {
    setFormData(emptyForm)
    setShowCreateModal(true)
  }

  const openEdit = (u) => {
    setSelectedUser(u)
    setFormData({
      name: u?.name || '',
      email: u?.email || '',
      phone: u?.phone || '',
      role: u?.role || 'user',
      password: ''
    })
    setShowEditModal(true)
  }

  const openDelete = (userId) => {
    setDeletingUserId(userId)
    setShowDeleteModal(true)
  }

  const closeModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setShowDeleteModal(false)
    setShowImportModal(false)
    setSelectedUser(null)
    setDeletingUserId(null)
    setImportResult(null)
    setFormData(emptyForm)
  }

  const handleCreate = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill name, email, and password')
      return
    }

    try {
      setLoading(true)
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.phone ? { phone: formData.phone } : {})
      }

      const { data } = await axios.post(`${backendUrl}/api/admin/users`, payload, {
        headers: { aToken },
        timeout: 15000
      })

      if (data?.success) {
        toast.success(data.message || 'User created')
        closeModals()
        setPage(1)
        await fetchUsers({ keepPage: false })
      } else {
        toast.error(data?.message || 'Failed to create user')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!selectedUser?._id) return

    if (!formData.name || !formData.email) {
      toast.error('Please fill name and email')
      return
    }

    try {
      setLoading(true)
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone
      }

      if (String(formData.password || '').trim()) {
        payload.password = formData.password
      }

      const { data } = await axios.put(`${backendUrl}/api/admin/users/${selectedUser._id}`, payload, {
        headers: { aToken },
        timeout: 15000
      })

      if (data?.success) {
        toast.success(data.message || 'User updated')
        closeModals()
        await fetchUsers({ keepPage: true })
      } else {
        toast.error(data?.message || 'Failed to update user')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingUserId) return

    try {
      setLoading(true)
      const { data } = await axios.delete(`${backendUrl}/api/admin/users/${deletingUserId}`, {
        headers: { aToken },
        timeout: 15000
      })

      if (data?.success) {
        toast.success(data.message || 'User deleted')
        closeModals()

        const remaining = users.length - 1
        if (remaining <= 0 && page > 1) {
          setPage(page - 1)
        } else {
          await fetchUsers({ keepPage: true })
        }
      } else {
        toast.error(data?.message || 'Failed to delete user')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete user')
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
      <section className='bg-[#14324f] text-white px-4 sm:px-8 lg:px-12 py-10 sm:py-14'>
        <div className='max-w-5xl space-y-3'>
          <p className='text-xs uppercase tracking-widest text-white/70'>Admin</p>
          <h1 className='text-3xl sm:text-4xl font-semibold'>Manage Users</h1>
          <p className='text-sm sm:text-base text-white/80 max-w-3xl'>Create, edit, delete users, change roles, and export to CSV.</p>
        </div>
      </section>

      <section className='py-10 sm:py-12'>
        <div className='w-full px-4 sm:px-8 lg:px-12 space-y-6'>
          <div className='flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between'>
            <form onSubmit={onSearchSubmit} className='flex flex-col sm:flex-row gap-3 w-full lg:max-w-2xl'>
              <div className='flex-1'>
                <label className='block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2'>Search</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className='w-full border border-border px-4 py-3 text-sm outline-none focus:border-primary'
                  placeholder='Search name or email'
                />
              </div>
              <div className='flex gap-2'>
                <button
                  type='submit'
                  className='h-[46px] mt-[26px] sm:mt-[28px] px-5 border border-border bg-[#14324f] text-white text-xs uppercase tracking-[0.35em] hover:opacity-90'
                  disabled={loading}
                >
                  {loading ? t('buttons.loading') : t('buttons.search')}
                </button>
                <button
                  type='button'
                  className='h-[46px] mt-[26px] sm:mt-[28px] px-5 border border-border bg-white text-xs uppercase tracking-[0.35em] hover:bg-light-bg'
                  onClick={resetAll}
                  disabled={loading}
                >
                  {t('buttons.reset')}
                </button>
              </div>
            </form>

            <div className='flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end'>
              <label className='px-5 py-3 border border-border bg-white text-xs uppercase tracking-[0.35em] hover:bg-light-bg cursor-pointer'>
                {t('admin.manageUsers.importCsv')}
                <input
                  type='file'
                  accept='.csv,text/csv'
                  className='hidden'
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    e.target.value = ''
                    importCsv(f)
                  }}
                  disabled={loading}
                />
              </label>
              <button
                type='button'
                onClick={exportCsv}
                className='px-5 py-3 border border-border bg-white text-xs uppercase tracking-[0.35em] hover:bg-light-bg'
                disabled={loading}
              >
                Export CSV
              </button>
              <button
                type='button'
                onClick={openCreate}
                className='px-5 py-3 border border-border bg-[#14324f] text-white text-xs uppercase tracking-[0.35em] hover:opacity-90'
                disabled={loading}
              >
                Add User
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
            <div className='border border-border bg-white px-4 py-3'>
              <label className='block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2'>Role</label>
              <select
                className='w-full border border-border px-4 py-3 text-sm'
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value=''>All</option>
                <option value='user'>user</option>
                <option value='staff'>staff</option>
                <option value='admin'>admin</option>
              </select>
            </div>
            <div className='border border-border bg-white px-4 py-3'>
              <label className='block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2'>Google Account</label>
              <select
                className='w-full border border-border px-4 py-3 text-sm'
                value={hasGoogleFilter}
                onChange={(e) => {
                  setHasGoogleFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value=''>All</option>
                <option value='true'>Has Google</option>
                <option value='false'>No Google</option>
              </select>
            </div>
            <div className='border border-border bg-white px-4 py-3'>
              <label className='block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2'>Must Change Password</label>
              <select
                className='w-full border border-border px-4 py-3 text-sm'
                value={mustChangePasswordFilter}
                onChange={(e) => {
                  setMustChangePasswordFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value=''>All</option>
                <option value='true'>Yes</option>
                <option value='false'>No</option>
              </select>
            </div>
          </div>

          <div className='border border-border bg-white shadow-sm overflow-x-auto'>
            <div className='px-5 py-4 border-b border-border flex items-center justify-between'>
              <div>
                <p className='text-xs uppercase tracking-[0.35em] text-primary-dark'>Users</p>
                <p className='text-sm text-muted-foreground'>Total: {total}</p>
              </div>

              <div className='flex items-center gap-2'>
                <label className='text-xs uppercase tracking-[0.25em] text-muted-foreground'>Per page</label>
                <select
                  className='border border-border px-3 py-2 text-sm'
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value) || 50)
                    setPage(1)
                  }}
                >
                  {[25, 50, 100, 200].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <table className='min-w-full text-sm'>
              <thead className='text-xs uppercase tracking-[0.25em] text-muted-foreground border-b border-border'>
                <tr>
                  <th className='text-left px-5 py-3'>Name</th>
                  <th className='text-left px-5 py-3'>Email</th>
                  <th className='text-left px-5 py-3'>Role</th>
                  <th className='text-left px-5 py-3'>Phone</th>
                  <th className='text-left px-5 py-3'>NID</th>
                  <th className='text-left px-5 py-3'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className='border-b border-border last:border-0'>
                    <td className='px-5 py-3 font-medium text-accent'>{u.name || '—'}</td>
                    <td className='px-5 py-3 text-muted-foreground'>{u.email || '—'}</td>
                    <td className='px-5 py-3 text-muted-foreground'>{u.role || 'user'}</td>
                    <td className='px-5 py-3 text-muted-foreground'>{u.phone || '—'}</td>
                    <td className='px-5 py-3 text-muted-foreground'>{u.nid || '—'}</td>
                    <td className='px-5 py-3'>
                      <div className='flex items-center gap-2'>
                        <button
                          className='text-xs uppercase tracking-[0.35em] text-primary hover:underline'
                          onClick={() => openEdit(u)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          className='text-xs uppercase tracking-[0.35em] text-red-600 hover:underline'
                          onClick={() => openDelete(u._id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className='px-5 py-8'>
                      <EmptyState variant="users" title="No users found" message="Try adjusting filters" iconSize="w-12 h-12" className="py-8" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className='px-5 py-4 border-t border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
              <p className='text-sm text-muted-foreground'>
                Page {page} of {totalPages}
              </p>
              <div className='flex items-center gap-2'>
                <button
                  className='px-4 py-2 border border-border text-xs uppercase tracking-[0.35em] hover:bg-light-bg disabled:opacity-50'
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={loading || page <= 1}
                >
                  Prev
                </button>
                <button
                  className='px-4 py-2 border border-border text-xs uppercase tracking-[0.35em] hover:bg-light-bg disabled:opacity-50'
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={loading || page >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(showCreateModal || showEditModal) && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'>
          <div className='w-full max-w-xl bg-white border border-border shadow-lg'>
            <div className='px-5 py-4 border-b border-border flex items-center justify-between'>
              <div>
                <p className='text-xs uppercase tracking-[0.35em] text-muted-foreground'>Admin</p>
                <h2 className='text-lg font-semibold'>{showCreateModal ? 'Create user' : 'Edit user'}</h2>
              </div>
              <button
                className='text-sm text-muted-foreground hover:text-primary'
                onClick={closeModals}
                disabled={loading}
              >
                Close
              </button>
            </div>

            <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className='p-5 space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2'>Name</label>
                  <input
                    className='w-full border border-border px-4 py-3 text-sm'
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className='block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2'>Email</label>
                  <input
                    type='email'
                    className='w-full border border-border px-4 py-3 text-sm'
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className='block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2'>Phone</label>
                  <input
                    className='w-full border border-border px-4 py-3 text-sm'
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className='block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2'>Role</label>
                  <select
                    className='w-full border border-border px-4 py-3 text-sm'
                    value={formData.role}
                    onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                  >
                    <option value='user'>user</option>
                    <option value='staff'>staff</option>
                    <option value='admin'>admin</option>
                  </select>
                </div>
                <div className='sm:col-span-2'>
                  <label className='block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2'>Password</label>
                  <input
                    type='password'
                    className='w-full border border-border px-4 py-3 text-sm'
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                    placeholder={showCreateModal ? 'Required (min 8 chars)' : 'Leave empty to keep current password'}
                    required={showCreateModal}
                  />
                </div>
              </div>

              <div className='flex items-center justify-end gap-2 pt-2'>
                <button
                  type='button'
                  className='px-5 py-3 border border-border bg-white text-xs uppercase tracking-[0.35em] hover:bg-light-bg'
                  onClick={closeModals}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-5 py-3 border border-border bg-[#14324f] text-white text-xs uppercase tracking-[0.35em] hover:opacity-90'
                  disabled={loading}
                >
                  {loading ? t('buttons.saving') : t('buttons.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'>
          <div className='w-full max-w-lg bg-white border border-border shadow-lg'>
            <div className='px-5 py-4 border-b border-border flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>{t('admin.manageUsers.deleteUser')}</h2>
              <button className='text-sm text-muted-foreground hover:text-primary' onClick={closeModals} disabled={loading}>
                {t('buttons.close')}
              </button>
            </div>
            <div className='p-5 space-y-4'>
              <p className='text-sm text-muted-foreground'>This action cannot be undone.</p>
              <div className='flex items-center justify-end gap-2'>
                <button
                  type='button'
                  className='px-5 py-3 border border-border bg-white text-xs uppercase tracking-[0.35em] hover:bg-light-bg'
                  onClick={closeModals}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type='button'
                  className='px-5 py-3 border border-red-200 bg-red-600 text-white text-xs uppercase tracking-[0.35em] hover:opacity-90'
                  onClick={confirmDelete}
                  disabled={loading}
                >
                  {loading ? 'Deleting' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImportModal && importResult && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'>
          <div className='w-full max-w-2xl bg-white border border-border shadow-lg'>
            <div className='px-5 py-4 border-b border-border flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>Import results</h2>
              <button className='text-sm text-muted-foreground hover:text-primary' onClick={closeModals}>
                Close
              </button>
            </div>
            <div className='p-5 space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <div className='border border-border p-4'>
                  <p className='text-xs uppercase tracking-[0.25em] text-muted-foreground'>Created</p>
                  <p className='text-2xl font-semibold text-[#14324f]'>{importResult.created ?? 0}</p>
                </div>
                <div className='border border-border p-4'>
                  <p className='text-xs uppercase tracking-[0.25em] text-muted-foreground'>Updated</p>
                  <p className='text-2xl font-semibold text-[#14324f]'>{importResult.updated ?? 0}</p>
                </div>
                <div className='border border-border p-4'>
                  <p className='text-xs uppercase tracking-[0.25em] text-muted-foreground'>Skipped</p>
                  <p className='text-2xl font-semibold text-[#14324f]'>{importResult.skipped ?? 0}</p>
                </div>
              </div>

              {Array.isArray(importResult.errors) && importResult.errors.length > 0 ? (
                <div className='border border-border p-4'>
                  <p className='text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3'>Errors (first 20)</p>
                  <div className='max-h-64 overflow-auto'>
                    <table className='min-w-full text-sm'>
                      <thead className='text-xs uppercase tracking-[0.25em] text-muted-foreground border-b border-border'>
                        <tr>
                          <th className='text-left py-2 pr-4'>Row</th>
                          <th className='text-left py-2 pr-4'>Email</th>
                          <th className='text-left py-2'>Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.errors.slice(0, 20).map((e, idx) => (
                          <tr key={`${e.row}-${idx}`} className='border-b border-border last:border-0'>
                            <td className='py-2 pr-4 text-muted-foreground'>{e.row}</td>
                            <td className='py-2 pr-4 text-muted-foreground'>{e.email || '—'}</td>
                            <td className='py-2 text-muted-foreground'>{e.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageUsers
