import { createContext, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'

export const ChatContext = createContext()

const ChatContextProvider = ({ children, role: roleProp = null, tokens = {}, backendUrl: backendUrlProp = null, socketUrl: socketUrlProp = null }) => {
  const [rooms, setRooms] = useState([])
  const [activeRoomId, setActiveRoomId] = useState(null)
  const [messages, setMessages] = useState([])
  const [unreadTotal, setUnreadTotal] = useState(0)
  const [currentFolder, setCurrentFolder] = useState('inbox')
  const socketRef = useRef(null)
  const activeRoomRef = useRef(null)
  const [socketStatus, setSocketStatus] = useState('disconnected')
  const [socketError, setSocketError] = useState(null)

  const backendUrl = backendUrlProp || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
  const socketUrl = socketUrlProp || import.meta.env.VITE_SOCKET_URL || backendUrl

  const role = roleProp || tokens.role || 'patient'
  const token = useMemo(() => {
    if (role === 'doctor') return tokens.dToken
    if (role === 'admin') return tokens.aToken
    if (role === 'hospital') return tokens.hToken
    if (role === 'pharmacy') return tokens.pToken
    if (role === 'lab') return tokens.lToken
    return tokens.token
  }, [tokens, role])

  const authHeaders = useMemo(() => {
    if (role === 'doctor') return { dToken: token }
    if (role === 'admin') return { aToken: token }
    if (role === 'hospital') return { hToken: token }
    if (role === 'pharmacy') return { pToken: token }
    if (role === 'lab') return { lToken: token }
    return { token }
  }, [token, role])

  useEffect(() => {
    activeRoomRef.current = activeRoomId
  }, [activeRoomId])

  const connectSocket = () => {
    if (!token) return
    if (socketRef.current) return
    setSocketStatus('connecting')
    setSocketError(null)
    const socket = io(socketUrl, { auth: { token, role } })
    socketRef.current = socket
    socket.on('connect', () => setSocketStatus('connected'))
    socket.on('authenticated', (payload) => {
      if (payload?.success) {
        setSocketStatus('authenticated')
        setSocketError(null)
      } else {
        setSocketStatus('error')
        setSocketError(payload?.message || 'Authentication failed')
      }
    })
    socket.on('connect_error', (err) => {
      setSocketStatus('error')
      setSocketError(err?.message || 'Unable to connect to chat')
    })
    socket.on('disconnect', () => {
      setSocketStatus('disconnected')
    })
    socket.on('error', (payload) => {
      if (payload?.message) {
        setSocketError(payload.message)
      }
    })
    socket.on('receiveMessage', (msg) => {
      setMessages(prev => {
        if (activeRoomRef.current && String(msg.roomId) === String(activeRoomRef.current)) {
          return [...prev, msg]
        }
        return prev
      })
      loadRooms()
    })
  }

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setSocketStatus('disconnected')
    setSocketError(null)
  }

  const loadRooms = async (folder) => {
    if (!token) return
    const targetFolder = folder !== undefined && folder !== null ? folder : currentFolder
    if (folder !== undefined && folder !== null) setCurrentFolder(targetFolder)
    try {
      const { data } = await axios.get(backendUrl + '/api/chats', { headers: authHeaders, params: { folder: targetFolder } })
      if (data.success) {
        setRooms(data.rooms)
        const count = data.rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0)
        setUnreadTotal(count)
      }
    } catch (error) {
      console.error('Failed to load rooms', error)
    }
  }

  const updateRoomFolder = async (roomId, folder) => {
    if (!token) return false
    try {
      const { data } = await axios.patch(backendUrl + `/api/chats/${roomId}`, { folder }, { headers: authHeaders })
      if (data.success) {
        await loadRooms(currentFolder)
        if (String(activeRoomId) === String(roomId)) setActiveRoomId(null)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update room folder', error)
      return false
    }
  }

  const openRoom = async (roomId) => {
    setActiveRoomId(roomId)
    if (socketRef.current) socketRef.current.emit('joinRoom', roomId)
    const { data } = await axios.get(backendUrl + `/api/chats/${roomId}/messages`, { headers: authHeaders })
    if (data.success) {
      setMessages(data.messages)
      await loadRooms(currentFolder)
    }
  }

  const startDirectChat = async (targetRole, targetId) => {
    if (!token) return null
    const { data } = await axios.post(backendUrl + '/api/chats', { targetRole, userId: targetId }, { headers: authHeaders })
    if (data.success) {
      await loadRooms()
      return data.room
    }
    return null
  }

  const sendMessage = async (text) => {
    if (!socketRef.current || !activeRoomRef.current || !text) throw new Error('No active chat selected')
    if (socketStatus !== 'authenticated') throw new Error(socketError || 'Chat not connected')
    return new Promise((resolve, reject) => {
      socketRef.current.emit('sendMessage', { roomId: activeRoomRef.current, text }, (response) => {
        if (response?.success) {
          resolve(response.message)
        } else {
          reject(new Error(response?.message || 'Failed to send message'))
        }
      })
    })
  }

  const searchUsers = async (role, q) => {
    if (!token) return []
    // Fetch ALL users - no limit parameter, backend will return all matching users
    const { data } = await axios.get(backendUrl + '/api/chats/search', { headers: authHeaders, params: { role, q } })
    if (data.success) return data.results
    return []
  }

  useEffect(() => {
    connectSocket()
    loadRooms()
    return () => disconnectSocket()
  }, [token, role])

  const value = {
    rooms,
    activeRoomId,
    messages,
    unreadTotal,
    currentFolder,
    setCurrentFolder,
    socketStatus,
    socketError,
    loadRooms,
    updateRoomFolder,
    openRoom,
    startDirectChat,
    sendMessage,
    searchUsers,
    socket: socketRef.current
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export default ChatContextProvider