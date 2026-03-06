import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { AppContext } from '../context/AppContext'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { HospitalContext } from '../context/HospitalContext'
import { PharmacyContext } from '../context/PharmacyContext'
import { LabContext } from '../context/LabContext'
import { ChatContext } from '../context/ChatContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import EmptyState from '../components/EmptyState'
import {
  FaPaperPlane,
  FaEllipsisV,
  FaSearch,
  FaTimes,
  FaCheckCircle,
  FaPaperclip,
  FaSmile,
  FaPencilAlt,
  FaInbox,
  FaPaperPlane as FaSent,
  FaTrash,
  FaUserPlus,
  FaChevronDown,
  FaBell,
  FaArchive,
  FaEnvelopeOpen,
} from 'react-icons/fa'

const VerifiedBadge = () => (
  <img src={assets.verified_icon} alt="Verified" className="inline-block w-3 h-3 ml-1" />
)

const hydratedName = (member = {}) => {
  if (!member) return ''
  if (member.name) return member.name
  if (member.support || member.role === 'admin') return 'E-ivuzeSupport'
  return member.role || ''
}

const UserAvatar = ({ user, size = 'w-10 h-10', textSize = 'text-lg' }) => {
  const name = hydratedName(user)
  const imageUrl = user?.image || user?.profileImage

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${size} rounded-full object-cover shrink-0 border border-[#205c90]/20`}
      />
    )
  }

  return (
    <div
      className={`${size} rounded-full bg-[#205c90] flex items-center justify-center text-white font-medium ${textSize} shrink-0 uppercase`}
    >
      {name.charAt(0) || 'U'}
    </div>
  )
}

const Messages = () => {
  const { t } = useTranslation()
  const {
    rooms,
    messages,
    activeRoomId,
    openRoom,
    sendMessage,
    startDirectChat,
    searchUsers,
    loadRooms,
    updateRoomFolder,
    currentFolder,
    setCurrentFolder,
    socketStatus,
  } = useContext(ChatContext)
  const { token, userData } = useContext(AppContext)
  const location = useLocation()
  const navigate = useNavigate()
  const autoOpenedRoomRef = useRef(false)
  const { aToken } = useContext(AdminContext)
  const { dToken, profileData, getProfileData } = useContext(DoctorContext)
  const { hToken, hospitalUser, getHospitalDetails } = useContext(HospitalContext)
  const { pToken, pharmacyUser, getProfile: getPharmacyProfile } = useContext(PharmacyContext)
  const { lToken, labProfile, getLabProfile } = useContext(LabContext)

  useEffect(() => {
    if (dToken && !profileData) getProfileData()
    if (hToken && !hospitalUser) getHospitalDetails()
    if (pToken && !pharmacyUser) getPharmacyProfile()
    if (lToken && !labProfile) getLabProfile()
  }, [dToken, hToken, pToken, lToken])

  const myRole = aToken
    ? 'admin'
    : dToken
      ? 'doctor'
      : hToken
        ? 'hospital'
        : pToken
          ? 'pharmacy'
          : lToken
            ? 'lab'
            : token
              ? 'patient'
              : 'patient'

  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarSection, setSidebarSection] = useState('inbox') // inbox | sent | archived | trash
  const [showMobileSidebar, setShowMobileSidebar] = useState(true)
  const [targetRole, setTargetRole] = useState('')
  const [allResults, setAllResults] = useState([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7

  // Load rooms when switching sidebar section (inbox/sent use folder=inbox; sent filters by lastMessageFromMe client-side)
  useEffect(() => {
    if (sidebarSection === 'inbox' || sidebarSection === 'sent') loadRooms('inbox')
    else if (sidebarSection === 'archived') loadRooms('archived')
    else if (sidebarSection === 'trash') loadRooms('trash')
  }, [sidebarSection])

  useEffect(() => {
    const params = new URLSearchParams(location.search || '')
    const roomIdFromUrl = params.get('roomId')
    if (!roomIdFromUrl) return
    if (autoOpenedRoomRef.current) return
    autoOpenedRoomRef.current = true
    openRoom(roomIdFromUrl).catch((err) => console.error('Failed to open room from URL', err))
  }, [location.search, openRoom])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const roleOptionDefs = {
    admin: [],
    patient: ['admin', 'doctor', 'hospital', 'pharmacy', 'lab'],
    doctor: ['admin', 'patient', 'hospital', 'pharmacy', 'lab'],
    hospital: ['admin', 'doctor', 'patient', 'pharmacy', 'lab'],
    pharmacy: ['admin', 'doctor', 'patient', 'lab'],
    lab: ['admin', 'doctor', 'patient', 'hospital', 'pharmacy'],
    default: ['admin', 'patient', 'doctor', 'hospital', 'pharmacy', 'lab'],
  }

  const labels = {
    admin: 'E-ivuzeSupport',
    patient: 'Patient',
    doctor: 'Doctor',
    hospital: 'Hospital',
    pharmacy: 'Pharmacy',
    lab: 'Diagnostic Center',
  }

  const roleOptions = (roleOptionDefs[myRole] || roleOptionDefs.default).map((value) => ({
    value,
    label: labels[value] || value,
  }))

  useEffect(() => {
    if (!roleOptions.length) return
    if (!roleOptions.find((opt) => opt.value === targetRole)) {
      setTargetRole(roleOptions[0]?.value || '')
    }
  }, [roleOptions, targetRole])

  const runSearch = async () => {
    if (!targetRole) {
      setAllResults([])
      return
    }
    setLoading(true)
    const r = await searchUsers(targetRole, userSearchQuery)
    setAllResults(r)
    setCurrentPage(1)
    setLoading(false)
  }

  const filteredResults = allResults.filter((user) => {
    if (!userSearchQuery.trim()) return true
    const q = userSearchQuery.toLowerCase()
    return (
      (user.name && user.name.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q))
    )
  })

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage)

  const startWith = async (user) => {
    const room = await startDirectChat(targetRole, user._id)
    if (room) {
      openRoom(room._id)
      setShowNewChat(false)
      setAllResults([])
      setUserSearchQuery('')
      setCurrentPage(1)
      setShowMobileSidebar(false)
    }
  }

  useEffect(() => {
    if (showNewChat) {
      setUserSearchQuery('')
      runSearch()
    }
  }, [showNewChat])

  useEffect(() => {
    if (showNewChat) {
      setUserSearchQuery('')
      setCurrentPage(1)
      runSearch()
    }
  }, [targetRole])

  const handleSend = async () => {
    if (!text.trim() || sending) return
    const messageContent = text.trim()
    setText('')
    setSending(true)
    try {
      await sendMessage(messageContent)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (error) {
      setText(messageContent)
      console.error('Send error:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const filteredRooms = useMemo(() => {
    let list = rooms
    if (sidebarSection === 'sent') list = rooms.filter((r) => r.lastMessageFromMe === true)
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter(
      (room) =>
        room.members.some((m) => hydratedName(m).toLowerCase().includes(q)) ||
        (room.lastMessage && room.lastMessage.toLowerCase().includes(q))
    )
  }, [rooms, sidebarSection, searchQuery])

  const activeRoom = rooms.find((r) => String(r._id) === String(activeRoomId))

  const myId = useMemo(() => {
    const id =
      profileData?._id || hospitalUser?._id || pharmacyUser?._id || labProfile?._id || userData?._id
    return id ? String(id) : null
  }, [profileData, hospitalUser, pharmacyUser, labProfile, userData])

  const myName = useMemo(() => {
    const name =
      profileData?.name ||
      hospitalUser?.name ||
      pharmacyUser?.name ||
      labProfile?.name ||
      userData?.name
    return name ? String(name).toLowerCase().trim() : null
  }, [profileData, hospitalUser, pharmacyUser, labProfile, userData])

  const getDisplayMembers = (members = []) => {
    if (myRole === 'admin') {
      const filtered = members.filter((m) => m.role !== 'admin' && !m.support)
      return filtered.length > 0 ? filtered : members
    }
    const others = members.filter((m) => {
      const memberId = m._id ? String(m._id) : null
      const memberName = m.name ? String(m.name).toLowerCase().trim() : null
      const isMeById = myId && memberId === myId
      const isMeByName = myName && memberName === myName
      const isMeByAdmin = myRole === 'admin' && (m.role === 'admin' || m.support)
      return !isMeById && !isMeByName && !isMeByAdmin
    })
    return others.length > 0 ? others : members
  }

  const getRoomName = (members = []) => hydratedName(getDisplayMembers(members)[0])

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' })
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
  }

  const unreadCount = useMemo(
    () => rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0),
    [rooms]
  )

  const currentUserDisplay = useMemo(() => {
    const name =
      profileData?.name ||
      hospitalUser?.name ||
      pharmacyUser?.name ||
      labProfile?.name ||
      userData?.name
    const email = userData?.email || profileData?.email
    return email || name || 'User'
  }, [profileData, hospitalUser, pharmacyUser, labProfile, userData])

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ========== TOP HEADER (Gmail-style) ========== */}
      <header className="absolute top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 z-30">
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="lg:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600"
        >
          <FaEllipsisV size={18} />
        </button>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-gray-200">
            <img src={assets.logo} alt="OneHealth" className="w-full h-full object-contain" />
          </div>
          <span className="font-semibold text-[#205c90] text-lg hidden sm:block">Messages</span>
        </div>

        <div className="flex-1 max-w-2xl mx-4">
          <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
            <FaSearch className="text-gray-400" size={14} />
            <input
              type="text"
              placeholder={t('buttons.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-500"
            />
            <FaChevronDown className="text-gray-400" size={12} />
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-600 shrink-0">
          <button className="p-2 rounded-full hover:bg-gray-100" title="Notifications">
            <FaBell size={18} />
          </button>
          <span className="text-xs text-gray-500 hidden md:inline">
            Last activity: {socketStatus === 'authenticated' ? 'Now' : '—'}
          </span>
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <span className="text-sm text-gray-700 max-w-[120px] truncate hidden sm:block">
              {currentUserDisplay}
            </span>
            <FaChevronDown size={12} className="text-gray-500" />
            <UserAvatar
              user={
                profileData || hospitalUser || pharmacyUser || labProfile || userData || {}
              }
              size="w-8 h-8"
              textSize="text-xs"
            />
          </div>
        </div>
      </header>

      <div className="flex pt-14 flex-1 min-h-0">
        {/* ========== LEFT SIDEBAR (Gmail nav) ========== */}
        <aside
          className={`${showMobileSidebar ? 'flex' : 'hidden'} lg:flex flex-col w-56 lg:w-64 bg-white border-r border-gray-200 shrink-0`}
        >
          <div className="p-3">
            <button
              onClick={() => setShowNewChat(true)}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#205c90] text-white rounded-lg hover:bg-[#14324f] transition-colors text-sm font-medium shadow-sm"
            >
              <FaPencilAlt size={14} />
              New message
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              Main
            </div>
            <button
              onClick={() => { setSidebarSection('inbox'); setCurrentFolder('inbox') }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${sidebarSection === 'inbox' ? 'bg-[#205c90]/10 text-[#205c90]' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FaInbox size={18} className="shrink-0" />
              <span>Inbox</span>
              {unreadCount > 0 && (
                <span className="ml-auto bg-[#205c90] text-white text-xs font-medium min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setSidebarSection('sent'); setCurrentFolder('inbox') }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${sidebarSection === 'sent' ? 'bg-[#205c90]/10 text-[#205c90]' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FaSent size={18} className="shrink-0" />
              Sent
            </button>
            <button
              onClick={() => { setSidebarSection('archived'); setCurrentFolder('archived') }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${sidebarSection === 'archived' ? 'bg-[#205c90]/10 text-[#205c90]' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FaArchive size={18} className="shrink-0" />
              Archive
            </button>
            <button
              onClick={() => { setSidebarSection('trash'); setCurrentFolder('trash') }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${sidebarSection === 'trash' ? 'bg-[#205c90]/10 text-[#205c90]' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FaTrash size={18} className="shrink-0" />
              Trash
            </button>
          </nav>
        </aside>

        {/* ========== CENTER: Email list + Preview ========== */}
        <main className="flex-1 flex min-w-0 bg-white">
          {/* Toolbar above list */}
          <div className="absolute top-0 left-0 right-0 h-12 border-b border-gray-200 flex items-center px-2 gap-1 bg-white z-20">
            {(sidebarSection === 'archived' || sidebarSection === 'trash') && (
              <button
                onClick={async () => {
                  if (!activeRoomId) return
                  const ok = await updateRoomFolder(activeRoomId, 'inbox')
                  if (ok) toast.success('Moved to Inbox')
                }}
                disabled={!activeRoomId}
                className="p-2 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Move to Inbox"
              >
                <FaInbox size={16} />
              </button>
            )}
            {(sidebarSection === 'inbox' || sidebarSection === 'sent') && (
              <button
                onClick={async () => {
                  if (!activeRoomId) return
                  const ok = await updateRoomFolder(activeRoomId, 'archived')
                  if (ok) toast.success('Moved to Archive')
                }}
                disabled={!activeRoomId}
                className="p-2 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Archive"
              >
                <FaArchive size={16} />
              </button>
            )}
            <button
              onClick={async () => {
                if (!activeRoomId) return
                const ok = await updateRoomFolder(activeRoomId, 'trash')
                if (ok) toast.success('Moved to Trash')
              }}
              disabled={!activeRoomId}
              className="p-2 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Move to Trash"
            >
              <FaTrash size={16} />
            </button>
            <button className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Mark as read (open conversation)">
              <FaEnvelopeOpen size={16} />
            </button>
          </div>

          {/* Left: conversation list (email list style) */}
          <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col pt-12 overflow-hidden">
            {filteredRooms.length === 0 ? (
              <div className="flex-1 min-h-[200px]">
                <EmptyState variant="email" title="No conversations" message="No conversations yet" className="py-12">
                  {myRole !== 'admin' && (
                    <button
                      onClick={() => setShowNewChat(true)}
                      className="mt-4 px-4 py-2 bg-[#205c90] text-white rounded-lg text-sm hover:bg-[#14324f] transition-colors"
                    >
                      New message
                    </button>
                  )}
                </EmptyState>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {filteredRooms.map((room) => {
                  const isActive = String(activeRoomId) === String(room._id)
                  const displayMembers = getDisplayMembers(room.members)
                  const roomName = getRoomName(room.members)
                  const lastPreview = room.lastMessage || 'No messages yet'

                  return (
                    <button
                      key={room._id}
                      onClick={() => {
                        openRoom(room._id)
                        setShowMobileSidebar(false)
                      }}
                      className={`w-full text-left px-3 py-3 flex items-start gap-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${isActive ? 'bg-[#205c90]/5' : ''}`}
                    >
                      <UserAvatar user={displayMembers[0]} size="w-10 h-10" textSize="text-sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-semibold text-gray-900 truncate text-sm">
                            {roomName}
                          </span>
                          <span className="text-xs text-gray-500 shrink-0">
                            {formatTime(room.updatedAt || room.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{lastPreview}</p>
                        {room.unreadCount > 0 && (
                          <span className="inline-block mt-1 bg-[#205c90] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: message preview / thread */}
          <div className="flex-1 flex flex-col min-w-0 pt-12 bg-gray-50">
            {!activeRoom ? (
              <>
                <div className="flex-1 min-h-[200px]">
                  <EmptyState variant="data" title="No conversation selected" message="Choose a conversation or start a new message" />
                </div>
                <div className="px-4 py-3 border-t border-gray-200 bg-white text-center text-sm text-gray-500">
                  You are using your OneHealth messages.
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto flex flex-col">
                  <div className="p-4 bg-white border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <UserAvatar
                        user={getDisplayMembers(activeRoom.members)[0]}
                        size="w-10 h-10"
                        textSize="text-sm"
                      />
                      <div>
                        <h2 className="font-semibold text-gray-900 flex items-center gap-1">
                          {hydratedName(getDisplayMembers(activeRoom.members)[0])}
                          {(getDisplayMembers(activeRoom.members)[0]?.support ||
                            getDisplayMembers(activeRoom.members)[0]?.verified) && (
                              <VerifiedBadge />
                            )}
                        </h2>
                        <p className="text-xs text-gray-500">
                          {socketStatus === 'authenticated' ? 'Online' : 'Connecting...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {messages.length === 0 && (
                      <EmptyState variant="email" title="No messages yet" message="Say hi!" iconSize="w-12 h-12" className="py-8" />
                    )}
                    {messages.map((m, idx) => {
                      const mine = m.sender?.role === myRole
                      const time = new Date(m.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })

                      return (
                        <div
                          key={idx}
                          className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-lg ${mine ? 'bg-[#205c90] text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}
                          >
                            {!mine &&
                              messages[idx - 1]?.sender?.role !== m.sender?.role && (
                                <p className="text-xs font-medium mb-1 opacity-70">
                                  {m.sender?.role === 'admin'
                                    ? 'Support'
                                    : (m.sender?.role || 'User')}
                                </p>
                              )}
                            <div className="text-sm leading-relaxed break-words">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ node, ...props }) => (
                                    <p className="mb-2 last:mb-0 whitespace-pre-wrap" {...props} />
                                  ),
                                  ul: ({ node, ...props }) => (
                                    <ul className="list-disc pl-4 mb-2" {...props} />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol className="list-decimal pl-4 mb-2" {...props} />
                                  ),
                                  a: ({ node, ...props }) => (
                                    <a
                                      className="underline hover:opacity-80"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      {...props}
                                    />
                                  ),
                                  strong: ({ node, ...props }) => (
                                    <strong className="font-bold" {...props} />
                                  ),
                                }}
                              >
                                {m.text}
                              </ReactMarkdown>
                            </div>
                            <div
                              className={`flex items-center gap-1 justify-end mt-1 ${mine ? 'text-white/80' : 'text-gray-500'}`}
                            >
                              <span className="text-xs">{time}</span>
                              {mine && socketStatus === 'authenticated' && (
                                <FaCheckCircle size={12} className="opacity-80" />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply area (Gmail-style compose reply) */}
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-end gap-2">
                      <button className="text-gray-400 hover:text-[#205c90] p-2 shrink-0 hidden sm:block">
                        <FaSmile size={20} />
                      </button>
                      <button className="text-gray-400 hover:text-[#205c90] p-2 shrink-0 hidden sm:block">
                        <FaPaperclip size={18} />
                      </button>
                      <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2 border border-gray-200 min-h-[44px] flex items-center">
                        <input
                          type="text"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSend()
                            }
                          }}
                          placeholder="Reply..."
                          disabled={socketStatus !== 'authenticated' || sending}
                          className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-500 bg-transparent"
                        />
                      </div>
                      <button
                        onClick={handleSend}
                        disabled={
                          !text.trim() || sending || socketStatus !== 'authenticated'
                        }
                        className="bg-[#205c90] text-white p-2.5 rounded-lg hover:bg-[#14324f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <FaPaperPlane size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* ========== New message modal: select user (like "compose" → choose recipient) ========== */}
      {showNewChat && myRole !== 'admin' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#205c90]">New message</h3>
              <button
                onClick={() => {
                  setShowNewChat(false)
                  setAllResults([])
                  setUserSearchQuery('')
                  setCurrentPage(1)
                }}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send to (choose user type)
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full border border-gray-300 bg-white text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#205c90] focus:border-transparent"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by name or email
                </label>
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Type to search users..."
                  className="w-full border border-gray-300 bg-white text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#205c90] focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>

            <div className="px-6 py-4 flex-1 overflow-y-auto">
              {loading && (
                <div className="text-center py-8 text-gray-500">Loading users...</div>
              )}
              {!loading && filteredResults.length === 0 && (
                <EmptyState variant="users" iconSize="w-12 h-12" className="py-6" message={userSearchQuery ? 'No users found matching your search' : 'Select a type and search to find users'} />
              )}
              {!loading &&
                paginatedResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-2 -mx-2"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <UserAvatar user={user} textSize="text-base" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-900 text-sm truncate">
                            {user.support ? 'E-ivuzeSupport' : user.name}
                          </span>
                          {(user.support || user.verified) && <VerifiedBadge />}
                        </div>
                        {user.email && (
                          <span className="text-xs text-gray-500 truncate block">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => startWith(user)}
                      className="bg-[#205c90] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#14324f] transition-colors ml-2 shrink-0"
                    >
                      Message
                    </button>
                  </div>
                ))}

              {!loading && filteredResults.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-gray-200 gap-3">
                  <div className="text-xs text-gray-500">
                    Showing {startIndex + 1}–
                    {Math.min(startIndex + itemsPerPage, filteredResults.length)} of{' '}
                    {filteredResults.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages
