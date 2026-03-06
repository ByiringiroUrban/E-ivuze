import { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { AppContext } from '../context/AppContext'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { HospitalContext } from '../context/HospitalContext'
import { PharmacyContext } from '../context/PharmacyContext'
import { LabContext } from '../context/LabContext'
import { assets } from '../assets/assets'
import EmptyState from '../components/EmptyState'
import NotificationBell from '../components/NotificationBell'
import DoctorNotificationBell from '../components/DoctorNotificationBell'
import LanguageSwitch from '../components/LanguageSwitch'
import AppBarSearch from '../components/AppBarSearch'
import * as mailApi from '../services/mailApi'
import {
  FaInbox,
  FaPaperPlane,
  FaFileAlt,
  FaStar,
  FaTrash,
  FaExclamationCircle,
  FaPencilAlt,
  FaSearch,
  FaChevronDown,
  FaArchive,
  FaEnvelopeOpen,
  FaReply,
  FaPaperclip,
  FaTimes,
  FaArrowLeft,
  FaUserCircle,
} from 'react-icons/fa'

const ROLES = [
  { value: 'patient', label: 'Patient' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'lab', label: 'Lab' },
  { value: 'admin', label: 'Admin / Support' },
]

function useMailAuth() {
  const { token } = useContext(AppContext)
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  const { hToken } = useContext(HospitalContext)
  const { pToken } = useContext(PharmacyContext)
  const { lToken } = useContext(LabContext)
  const role = aToken ? 'admin' : dToken ? 'doctor' : hToken ? 'hospital' : pToken ? 'pharmacy' : lToken ? 'lab' : token ? 'patient' : null
  const tokens = { token, aToken, dToken, hToken, pToken, lToken }
  const getHeaders = useMemo(() => mailApi.getMailAuthHeaders(tokens, role), [tokens, role])
  return { getHeaders, role }
}

function formatDate(d) {
  const date = new Date(d)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString()
  if (isYesterday) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function InternalMail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getHeaders, role } = useMailAuth()
  const { userData, token } = useContext(AppContext)
  const { profileData, dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const { hospitalUser } = useContext(HospitalContext)
  const { pharmacyUser } = useContext(PharmacyContext)
  const { labProfile } = useContext(LabContext)
  const myName = userData?.name || profileData?.name || hospitalUser?.name || pharmacyUser?.name || labProfile?.name || 'Me'
  const showDoctorBell = !!(dToken || aToken)
  const showPatientBell = !!token && !showDoctorBell

  const [folder, setFolder] = useState('inbox')
  const [counts, setCounts] = useState({ inbox: 0, sent: 0, drafts: 0, trash: 0, starred: 0, important: 0, unread: 0 })
  const [messages, setMessages] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [thread, setThread] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeDraft, setComposeDraft] = useState(null)
  const [forwardMessage, setForwardMessage] = useState(null)
  const [replyToId, setReplyToId] = useState(null)
  const [replyBody, setReplyBody] = useState('')

  const loadCounts = async () => {
    try {
      const res = await mailApi.getFolderCounts(getHeaders)
      if (res.success) setCounts(res.counts || {})
    } catch (e) {
      console.error(e)
    }
  }

  const loadMessages = async (f, p = 1) => {
    setLoading(true)
    try {
      const res = await mailApi.getFolderMessages(f, p, getHeaders)
      if (res.success) {
        setMessages(res.messages || [])
        setTotal(res.total || 0)
        setPage(p)
      }
    } catch (e) {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!role) return
    loadCounts()
  }, [role])

  useEffect(() => {
    if (!role) return
    if (searchResults !== null) return
    loadMessages(folder)
  }, [folder, role])

  const openMessage = async (msg) => {
    if (msg.isDraft) {
      setComposeDraft(msg)
      setComposeOpen(true)
      setSelectedId(msg._id)
      return
    }
    setSelectedId(msg._id)
    try {
      const res = await mailApi.getThread(msg._id, getHeaders)
      if (res.success) setThread(res.thread || [])
      loadCounts()
      if (folder !== 'drafts') loadMessages(folder, page)
    } catch (e) {
      toast.error('Failed to load message')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      loadMessages(folder)
      return
    }
    setLoading(true)
    try {
      const res = await mailApi.searchMail({ q: searchQuery, page: 1 }, getHeaders)
      if (res.success) {
        setSearchResults(res.messages || [])
        setTotal(res.total || 0)
      }
    } catch (e) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleBulk = async (action) => {
    if (!selectedIds.size) return
    try {
      await mailApi.bulkAction([...selectedIds], action, getHeaders)
      toast.success('Done')
      setSelectedIds(new Set())
      loadCounts()
      loadMessages(folder, page)
      if (action === 'trash') setSelectedId(null)
    } catch (e) {
      toast.error('Action failed')
    }
  }

  const toggleStar = async (messageId) => {
    const msg = messages.find(m => m._id === messageId)
    const meta = msg?._recipientMeta
    if (!meta) return
    try {
      await mailApi.updateMessageMeta(messageId, { starred: !meta.starred }, getHeaders)
      loadCounts()
      loadMessages(folder, page)
    } catch (e) {
      toast.error('Failed to update')
    }
  }

  const sendCompose = async (payload, formData) => {
    try {
      await mailApi.sendMessage(payload, formData, getHeaders)
      toast.success('Sent')
      setComposeOpen(false)
      setComposeDraft(null)
      loadCounts()
      loadMessages('sent', 1)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Send failed')
      throw e
    }
  }

  const saveComposeDraft = async (payload, formData) => {
    try {
      const res = await mailApi.saveDraft(payload, formData, getHeaders)
      toast.success('Draft saved')
      setComposeDraft(res.message)
      loadCounts()
      loadMessages('drafts', 1)
      return res.message
    } catch (e) {
      toast.error('Failed to save draft')
      throw e
    }
  }

  const sendReply = async () => {
    if (!replyToId) return
    try {
      await mailApi.replyToMessage(replyToId, replyBody, null, getHeaders)
      toast.success('Reply sent')
      setReplyToId(null)
      setReplyBody('')
      openMessage({ _id: selectedId })
      loadCounts()
      loadMessages(folder, page)
    } catch (e) {
      toast.error('Reply failed')
    }
  }

  const list = searchResults !== null ? searchResults : messages
  const selectedMessage = list.find(m => m._id === selectedId) || (selectedId && thread.length ? thread.find(m => m._id === selectedId) : null)

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">{t('admin.manageUsers.pleaseLogIn')}</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-[#006838] border-b-4 border-[#88C250] flex items-center px-4 sm:px-6 z-30">
        {/* Left: back + logo + title — aligned in one row */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-none bg-white/10 hover:bg-[#88C250] text-white hover:text-[#006838] border-2 border-white/20 transition-all shrink-0"
            aria-label="Go back"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <img src={assets.logo} alt="Logo" className="h-10 w-10 object-contain shrink-0" />
            <span className="font-bold text-white text-lg sm:text-xl hidden sm:inline leading-none font-merriweather tracking-tight">{t('nav.messages')}</span>
          </div>
        </div>
        {/* Center: search — with margin so it doesn’t touch right block */}
        <div className="flex-1 min-w-0 max-w-xl mx-4 sm:mx-6">
          <div className="bg-white/10 border-2 border-white/20 rounded-none px-4 py-2 flex items-center gap-3 h-11">
            <FaSearch className="text-[#88C250] shrink-0" size={16} />
            <input
              type="text"
              placeholder={t('admin.manageUsers.searchMail')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 min-w-0 bg-transparent outline-none text-sm font-bold text-white placeholder-white/40"
            />
            <button onClick={handleSearch} className="text-white hover:text-[#88C250] text-sm font-bold shrink-0 transition-colors">{t('buttons.search')}</button>
            {searchResults !== null && (
              <button onClick={() => { setSearchResults(null); setSearchQuery(''); loadMessages(folder); }} className="text-[#88C250] text-sm font-bold shrink-0 hover:text-white px-2">X</button>
            )}
          </div>
        </div>
        {/* Right corner: global search + language + notification + profile */}
        <div className="flex items-center gap-4 ml-auto shrink-0">
          <div className="hidden lg:block"><AppBarSearch variant="dark" /></div>
          <LanguageSwitch variant="headerIcon" />
          <div className="flex items-center gap-2">
            {showDoctorBell && <DoctorNotificationBell />}
            {showPatientBell && <NotificationBell />}
          </div>
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-none bg-white/10 hover:bg-[#88C250] text-white hover:text-[#006838] border-2 border-white/20 transition-all shrink-0"
            title={myName}
            aria-label="Profile"
          >
            <FaUserCircle className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex pt-14 flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r-2 border-gray-100 flex flex-col shrink-0">
          <button
            onClick={() => { setComposeDraft(null); setForwardMessage(null); setReplyToId(null); setComposeOpen(true) }}
            className="m-4 py-4 px-6 bg-[#006838] text-[#88C250] border-2 border-[#006838] hover:bg-[#88C250] hover:text-[#006838] transition-all flex items-center justify-center gap-3 text-xs font-bold tracking-widest rounded-none"
          >
            <FaPencilAlt size={14} /> {t('admin.internalMail.compose').toUpperCase()}
          </button>
          <nav className="flex-1 overflow-y-auto py-2">
            {[
              { id: 'inbox', labelKey: 'admin.internalMail.inbox', icon: FaInbox, count: counts.inbox, unread: counts.unread },
              { id: 'sent', labelKey: 'admin.internalMail.sent', icon: FaPaperPlane, count: counts.sent },
              { id: 'drafts', labelKey: 'admin.internalMail.drafts', icon: FaFileAlt, count: counts.drafts },
              { id: 'starred', labelKey: 'admin.internalMail.starred', icon: FaStar, count: counts.starred },
              { id: 'important', labelKey: 'admin.internalMail.important', icon: FaExclamationCircle, count: counts.important },
              { id: 'trash', labelKey: 'admin.internalMail.trash', icon: FaTrash, count: counts.trash },
            ].map(({ id, labelKey, icon: Icon, count, unread }) => (
              <button
                key={id}
                onClick={() => { setFolder(id); setSearchResults(null); setSelectedId(null); loadMessages(id, 1) }}
                className={`w-full flex items-center gap-4 px-6 py-4 text-left text-[11px] font-bold tracking-widest transition-all ${folder === id ? 'bg-[#006838] text-[#88C250]' : 'text-[#006838]/60 hover:bg-gray-50'}`}
              >
                <Icon size={16} className={folder === id ? 'text-[#88C250]' : 'text-[#006838]/40'} />
                <span className="flex-1">{t(labelKey).toUpperCase()}</span>
                {unread != null && unread > 0 && <span className="bg-[#88C250] text-[#006838] text-[10px] px-2 py-0.5 font-bold">{unread}</span>}
                {count != null && count > 0 && unread == null && <span className="text-[#006838]/40 text-[10px]">{count}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* List + View */}
        <main className="flex-1 flex min-w-0 bg-white">
          <div className={`flex flex-col border-r-2 border-gray-100 ${selectedId ? 'w-0 md:w-96 overflow-hidden' : 'flex-1'}`}>
            <div className="h-14 border-b-2 border-gray-100 flex items-center gap-4 px-4 bg-gray-50/30">
              <input
                type="checkbox"
                checked={selectedIds.size === list.length && list.length > 0}
                onChange={e => setSelectedIds(e.target.checked ? new Set(list.map(m => m._id)) : new Set())}
                className="w-4 h-4 border-2 border-gray-300 rounded-none checked:bg-[#006838]"
              />
              <button onClick={() => handleBulk('read')} className="p-2 border-2 border-transparent hover:border-[#88C250]/50 text-[#006838]/60 hover:text-[#006838] transition-all" title={t('admin.manageUsers.markRead')}><FaEnvelopeOpen size={16} /></button>
              <button onClick={() => handleBulk('trash')} className="p-2 border-2 border-transparent hover:border-[#88C250]/50 text-[#006838]/60 hover:text-[#006838] transition-all" title={t('admin.manageUsers.delete')}><FaTrash size={16} /></button>
              <button onClick={() => handleBulk('starred')} className="p-2 border-2 border-transparent hover:border-[#88C250]/50 text-[#006838]/60 hover:text-[#006838] transition-all" title={t('admin.manageUsers.star')}><FaStar size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">{t('app.loading')}</div>
              ) : list.length === 0 ? (
                <div className="flex-1 min-h-[200px]">
                  <EmptyState variant="email" message={t('admin.internalMail.thisFolderEmpty')} />
                </div>
              ) : (
                list.map(msg => (
                  <div
                    key={msg._id}
                    onClick={() => openMessage(msg)}
                    className={`flex items-center gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-all ${selectedId === msg._id ? 'bg-[#006838]/5 border-l-4 border-l-[#88C250]' : ''} ${msg._recipientMeta && !msg._recipientMeta.readAt ? 'font-bold' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(msg._id)}
                      onChange={e => { e.stopPropagation(); setSelectedIds(prev => { const n = new Set(prev); if (n.has(msg._id)) n.delete(msg._id); else n.add(msg._id); return n }) }}
                      onClick={e => e.stopPropagation()}
                      className="w-4 h-4 border-2 border-gray-300 rounded-none checked:bg-[#006838]"
                    />
                    <button onClick={e => { e.stopPropagation(); msg._recipientMeta && toggleStar(msg._id) }} className="text-gray-300 hover:text-[#88C250] shrink-0 transition-all">
                      <FaStar size={14} className={msg._recipientMeta?.starred ? 'fill-[#88C250] text-[#88C250]' : ''} />
                    </button>
                    <span className="truncate shrink-0 w-28 text-xs font-bold text-[#006838] tracking-tight">{msg.senderName || msg.senderRole || '—'}</span>
                    <span className={`flex-1 truncate text-sm text-[#006838]/80 ${msg._recipientMeta && !msg._recipientMeta.readAt ? 'font-bold text-[#006838]' : ''}`}>{msg.subject || '(No subject)'}</span>
                    <span className="text-[10px] font-bold text-[#006838]/30 shrink-0 tracking-widest">{formatDate(msg.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
            {total > 20 && (
              <div className="flex justify-center gap-4 py-4 border-t-2 border-gray-100 bg-gray-50/20">
                <button disabled={page <= 1} onClick={() => loadMessages(folder, page - 1)} className="px-6 py-2 border-2 border-[#006838]/10 font-bold text-[10px] tracking-widest hover:border-[#88C250] disabled:opacity-30 transition-all">{t('buttons.prev').toUpperCase()}</button>
                <span className="py-2 text-[10px] font-bold text-[#006838]/40 tracking-widest">{t('admin.internalMail.page').toUpperCase()} {page}</span>
                <button disabled={page * 20 >= total} onClick={() => loadMessages(folder, page + 1)} className="px-6 py-2 border-2 border-[#006838]/10 font-bold text-[10px] tracking-widest hover:border-[#88C250] disabled:opacity-30 transition-all">{t('buttons.next').toUpperCase()}</button>
              </div>
            )}
          </div>

          {/* Message view */}
          <div className={`flex-1 flex flex-col min-w-0 ${selectedId ? 'flex' : 'hidden md:flex'} bg-gray-50`}>
            {!selectedId ? (
              <div className="flex-1 min-h-[200px]">
                <EmptyState variant="data" title={t('admin.manageUsers.noDataTitle')} message={t('admin.manageUsers.selectMessage')} />
              </div>
            ) : (
              <>
                <div className="bg-white border-b p-4 overflow-y-auto flex-1">
                  {thread.length > 0 ? (
                    thread.map(m => (
                      <div key={m._id} className="mb-6 pb-4 border-b border-gray-200 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-semibold">{m.senderName || m.senderRole}</span>
                            <span className="text-gray-500 text-sm ml-2">{m.senderRole}</span>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(m.createdAt)}</span>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: m.body || '' }} />
                        {m.attachments?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {m.attachments.map((a, i) => (
                              <a key={i} href={a.url?.startsWith('http') ? a.url : `${import.meta.env.VITE_BACKEND_URL || ''}${a.url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#006838] font-bold flex items-center gap-1 hover:text-[#88C250] transition-all">
                                <FaPaperclip size={12} /> {a.filename}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : selectedMessage && !selectedMessage.isDraft ? (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold">{selectedMessage.senderName || selectedMessage.senderRole}</span>
                          <span className="text-gray-500 text-sm ml-2">{selectedMessage.senderRole}</span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(selectedMessage.createdAt)}</span>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: selectedMessage.body || '' }} />
                    </div>
                  ) : null}
                </div>
                {selectedId && thread.length > 0 && replyToId && !messages.find(m => m._id === selectedId)?.isDraft && (
                  <div className="p-4 bg-white border-t">
                    <textarea
                      value={replyBody}
                      onChange={e => setReplyBody(e.target.value)}
                      placeholder={t('buttons.reply') + '...'}
                      className="w-full border-2 border-gray-100 rounded-none p-4 text-sm min-h-[120px] focus:border-[#88C250] outline-none transition-all"
                      rows={4}
                    />
                    <div className="flex justify-end gap-3 mt-4">
                      <button onClick={() => { setReplyToId(null); setReplyBody('') }} className="px-8 py-3 border-2 border-gray-100 font-bold text-[10px] tracking-widest hover:bg-gray-50 transition-all">{t('buttons.cancel').toUpperCase()}</button>
                      <button onClick={sendReply} disabled={!replyBody.trim()} className="px-8 py-3 bg-[#006838] text-[#88C250] font-bold text-[10px] tracking-widest disabled:opacity-30 flex items-center gap-2 border-2 border-[#006838] hover:bg-[#88C250] hover:text-[#006838] transition-all">
                        <FaReply size={14} /> {t('buttons.reply').toUpperCase()}
                      </button>
                    </div>
                  </div>
                )}
                {selectedId && thread.length > 0 && !replyToId && (
                  <div className="p-4 bg-gray-50/50 border-t-2 border-gray-100 flex gap-6">
                    <button onClick={() => setReplyToId(thread[thread.length - 1]?._id)} className="text-[10px] font-extrabold tracking-widest text-[#006838] hover:text-[#88C250] flex items-center gap-2 transition-all">
                      <FaReply size={12} /> {t('buttons.reply').toUpperCase()}
                    </button>
                    <button onClick={() => { const m = thread[thread.length - 1]; setForwardMessage(m); setComposeOpen(true); }} className="text-[10px] font-extrabold tracking-widest text-[#006838] hover:text-[#88C250] transition-all">
                      {t('admin.internalMail.forward').toUpperCase()}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Compose modal */}
      {composeOpen && (
        <ComposeModal
          t={t}
          draft={composeDraft}
          forward={forwardMessage}
          onClose={() => { setComposeOpen(false); setComposeDraft(null); setForwardMessage(null); loadMessages(folder); loadCounts() }}
          onSend={sendCompose}
          onSaveDraft={saveComposeDraft}
          getHeaders={getHeaders}
        />
      )}
    </div>
  )
}

function ComposeModal({ t, draft, forward, onClose, onSend, onSaveDraft, getHeaders }) {
  const [subject, setSubject] = useState(forward ? `Fwd: ${forward.subject || ''}` : (draft?.subject || ''))
  const [body, setBody] = useState(forward ? `\n\n---------- Forwarded message ---------\nFrom: ${forward.senderName || forward.senderRole}\n${forward.body || ''}` : (draft?.body || ''))
  const [roleFilter, setRoleFilter] = useState('doctor')
  const [recipients, setRecipients] = useState([])
  const [resolved, setResolved] = useState([])
  const [loadingResolve, setLoadingResolve] = useState(false)
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState([])
  useEffect(() => {
    if (forward) {
      setSubject(`Fwd: ${forward.subject || ''}`)
      setBody(`\n\n---------- Forwarded message ---------\nFrom: ${forward.senderName || forward.senderRole}\n${forward.body || ''}`)
    } else {
      setSubject(draft?.subject || '')
      setBody(draft?.body || '')
    }
  }, [draft?._id, forward?._id])

  const resolve = async () => {
    setLoadingResolve(true)
    try {
      const res = await mailApi.resolveRecipients({ role: roleFilter }, getHeaders)
      if (res.success) setResolved(res.recipients || [])
    } catch (e) {
      toast.error('Failed to load recipients')
    } finally {
      setLoadingResolve(false)
    }
  }

  useEffect(() => {
    resolve()
  }, [roleFilter])

  const toggleRecipient = (r) => {
    setRecipients(prev => prev.some(x => x.id === r.id && x.role === r.role) ? prev.filter(x => !(x.id === r.id && x.role === r.role)) : [...prev, r])
  }

  const handleSend = async () => {
    if (!recipients.length) {
      toast.error('Select at least one recipient')
      return
    }
    setSending(true)
    try {
      await onSend(
        { subject, body, recipientFilter: recipients },
        attachments.length ? { attachments } : null
      )
    } finally {
      setSending(false)
    }
  }

  const handleSaveDraft = async () => {
    try {
      await onSaveDraft(
        { draftId: draft?._id, subject, body, recipientFilter: recipients },
        attachments.length ? { attachments } : null
      )
    } catch (e) { }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center md:items-center z-50 p-4">
      <div className="bg-white rounded-none border-4 border-[#006838] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-[#006838] tracking-widest text-sm">{t('admin.manageUsers.newMessage').toUpperCase()}</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#88C250] hover:text-[#006838] transition-all"><FaTimes size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#006838]/40 tracking-widest mb-2">{t('admin.manageUsers.to').toUpperCase()}</label>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full border-2 border-gray-100 rounded-none px-4 py-3 text-sm focus:border-[#88C250] outline-none">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <button type="button" onClick={resolve} disabled={loadingResolve} className="mt-2 text-[10px] font-bold text-[#006838] hover:text-[#88C250] tracking-widest transition-all">{t('admin.manageUsers.refreshList').toUpperCase()}</button>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#006838]/40 tracking-widest mb-2">{t('admin.manageUsers.selectRecipients').toUpperCase()}</label>
            <div className="border-2 border-gray-100 rounded-none max-h-40 overflow-y-auto p-2 space-y-1">
              {resolved.map(r => (
                <label key={`${r.role}-${r.id}`} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 transition-all">
                  <input type="checkbox" checked={recipients.some(x => x.id == r.id && x.role === r.role)} onChange={() => toggleRecipient(r)} className="w-4 h-4 border-2 border-gray-300 rounded-none checked:bg-[#006838]" />
                  <span className="text-xs font-bold text-[#006838]">{r.name || r.email || r.id}</span>
                  {r.email && <span className="text-[#006838]/40 text-[10px] tracking-tight">({r.email})</span>}
                </label>
              ))}
              {resolved.length === 0 && !loadingResolve && (
                <EmptyState variant="users" iconSize="w-10 h-10" title={t('admin.manageUsers.noUsers')} message={t('admin.manageUsers.noUsersInRole')} className="py-6" />
              )}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#006838]/40 tracking-widest mb-2">{t('admin.manageUsers.subject').toUpperCase()}</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full border-2 border-gray-100 rounded-none px-4 py-3 text-sm focus:border-[#88C250] outline-none" placeholder={t('admin.manageUsers.subject')} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#006838]/40 tracking-widest mb-2">{t('admin.manageUsers.message').toUpperCase()}</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full border-2 border-gray-100 rounded-none px-4 py-3 text-sm min-h-[140px] focus:border-[#88C250] outline-none" placeholder={t('admin.manageUsers.writeMessage')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.manageUsers.attachments')}</label>
            <input type="file" multiple onChange={e => setAttachments([...e.target.files])} className="text-sm" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t-2 border-gray-100 bg-gray-50/50">
          <button onClick={handleSaveDraft} className="px-8 py-3 border-2 border-gray-100 font-bold text-[10px] tracking-widest hover:bg-gray-100 transition-all">{t('admin.manageUsers.saveDraft').toUpperCase()}</button>
          <button onClick={handleSend} disabled={sending || !recipients.length} className="px-8 py-3 bg-[#006838] text-[#88C250] font-bold text-[10px] tracking-widest disabled:opacity-30 flex items-center gap-2 border-2 border-[#006838] hover:bg-[#88C250] hover:text-[#006838] transition-all">
            {sending ? t('admin.manageUsers.sending').toUpperCase() : <> <FaPaperPlane size={14} /> {t('buttons.send').toUpperCase()}</>}
          </button>
        </div>
      </div>
    </div>
  )
}
