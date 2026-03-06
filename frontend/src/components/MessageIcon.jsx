import { useContext } from 'react'
import { ChatContext } from '../context/ChatContext'
import { useNavigate } from 'react-router-dom'
import { FaEnvelope } from 'react-icons/fa'

const MessageIcon = () => {
  const { unreadTotal } = useContext(ChatContext)
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate('/messages')} className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all" aria-label="Mail">
      <FaEnvelope className="w-5 h-5 text-[#88C250]" />
      {unreadTotal > 0 && (
        <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-[#88C250] text-[#006838] px-1.5 py-0.5 rounded-full">{unreadTotal}</span>
      )}
    </button>
  )
}

export default MessageIcon