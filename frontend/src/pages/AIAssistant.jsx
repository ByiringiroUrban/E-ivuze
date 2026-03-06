import React, { useState, useEffect, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { HospitalContext } from '../context/HospitalContext';
import { PharmacyContext } from '../context/PharmacyContext';
import { LabContext } from '../context/LabContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaRobot,
  FaPaperPlane,
  FaTimes,
  FaBars,
  FaSearch,
  FaDownload,
  FaUserMd
} from 'react-icons/fa';
import { assets } from '../assets/assets';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AIAssistant = () => {
  const { t, i18n } = useTranslation();
  const { backendUrl, token, userData } = useContext(AppContext);
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const { hToken } = useContext(HospitalContext);
  const { pToken } = useContext(PharmacyContext);
  const { lToken } = useContext(LabContext);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const patientToken = typeof token === 'string' ? token : '';
  const role = aToken
    ? 'admin'
    : dToken
      ? 'doctor'
      : hToken
        ? 'hospital'
        : pToken
          ? 'pharmacy'
          : lToken
            ? 'lab'
            : patientToken
              ? 'patient'
              : 'guest';

  const activeToken =
    role === 'admin'
      ? aToken
      : role === 'doctor'
        ? dToken
        : role === 'hospital'
          ? hToken
          : role === 'pharmacy'
            ? pToken
            : role === 'lab'
              ? lToken
              : role === 'patient'
                ? patientToken
                : '';

  const identityKey = `${role}:${activeToken || ''}`;

  const aiAuthHeaders = (() => {
    if (!activeToken) return {};
    if (role === 'doctor') return { dToken: activeToken };
    if (role === 'admin') return { aToken: activeToken };
    if (role === 'hospital') return { hToken: activeToken };
    if (role === 'pharmacy') return { pToken: activeToken };
    if (role === 'lab') return { lToken: activeToken };
    return { token: activeToken };
  })();

  // State
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isRenaming, setIsRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Extra features state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchAnswer, setSearchAnswer] = useState('');
  const [handoffLoading, setHandoffLoading] = useState(false);

  useEffect(() => {
    setConversations([]);
    setCurrentConversation(null);
    setMessages([]);
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identityKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/ai/conversations`, { headers: aiAuthHeaders });
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/ai/conversations/${conversationId}`, { headers: aiAuthHeaders });
      if (data.success) {
        setCurrentConversation(data.conversation);
        setMessages(data.messages || []);
        setShowMobileSidebar(false);
      }
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const createNewConversation = async () => {
    setCurrentConversation(null);
    setMessages([]);
    setShowMobileSidebar(false);
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (!window.confirm(t('ai.confirmDelete') || 'Delete this chat?')) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/ai/conversations/${conversationId}`, { headers: aiAuthHeaders });
      if (data.success) {
        await loadConversations();
        if (currentConversation?._id === conversationId) {
          setCurrentConversation(null);
          setMessages([]);
        }
      }
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  };

  const updateConversationTitle = async (conversationId, newTitle) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/ai/conversations/${conversationId}`,
        { title: newTitle },
        { headers: aiAuthHeaders }
      );
      if (data.success) await loadConversations();
    } catch (error) {
      console.error('Update error', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage.trim();
    setInputMessage('');

    // Optimistic update: Show user message immediately
    const tempUserMessage = { sender: 'user', text: messageText, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMessage]);

    setIsLoading(true);
    setIsTyping(true);

    let conversationId = currentConversation?._id || 'new';

    try {
      if (!currentConversation) conversationId = 'new';

      const { data } = await axios.post(
        `${backendUrl}/api/ai/conversations/${conversationId}/messages`,
        { text: messageText },
        { headers: aiAuthHeaders }
      );

      if (data.success) {
        if (data.conversation) {
          setCurrentConversation(data.conversation);
          loadConversations();
        }
        // Replace temp message with actual data from server
        setMessages(prev => {
          const filtered = prev.filter(m => m !== tempUserMessage);
          return [...filtered, data.userMessage, data.assistantMessage];
        });
      } else {
        // Rollback on error
        setMessages(prev => prev.filter(m => m !== tempUserMessage));
        setInputMessage(messageText);
        toast.error(data.message || 'Failed to send');
      }
    } catch (error) {
      // Rollback on error
      setMessages(prev => prev.filter(m => m !== tempUserMessage));
      setInputMessage(messageText);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      // Ensure we scroll to the bottom after state updates
      setTimeout(scrollToBottom, 100);
    }
  };

  const runSemanticSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim() || searchLoading) return;
    setSearchLoading(true);
    setSearchResults([]);
    setSearchAnswer('');
    try {
      const { data } = await axios.post(`${backendUrl}/api/search/semantic`, {
        q: searchQuery, topK: 3, includeAnswer: true, language: i18n.language?.split('-')[0] || 'rw'
      }, { headers: aiAuthHeaders });
      if (data.success) {
        setSearchResults(data.results || []);
        setSearchAnswer(data.answer || '');
      }
    } catch (e) { toast.error('Search failed'); }
    finally { setSearchLoading(false); }
  };

  const requestHandoff = async () => {
    if (handoffLoading) return;
    if (!currentConversation?._id) return toast.error('No active conversation');
    if (role !== 'patient' || !patientToken) return toast.error('Only patients can request support');
    setHandoffLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/ai/conversations/${currentConversation._id}/handoff`,
        {},
        { headers: { token: patientToken } }
      );
      if (data.success) {
        toast.success('Support requested');
        navigate(`/messages?roomId=${data.roomId}`);
      }
    } catch (e) { toast.error('Handoff failed'); }
    finally { setHandoffLoading(false); }
  };

  const exportChat = () => {
    if (!messages.length) return;
    const exportData = { conversation: currentConversation, messages };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex h-screen bg-[#022c22] text-gray-100 font-sans overflow-hidden">

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#064e3b] flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar Header */}
        <div className="p-3">
          <button
            onClick={() => window.open('/', '_blank')}
            className="flex items-center gap-2 px-3 py-2 mb-4 hover:bg-[#14324f] rounded-md transition-colors w-full group"
          >
            <div className="w-6 h-6 rounded-sm bg-white p-0.5">
              <img src={assets.logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-medium text-gray-200 group-hover:text-[#059669]">e-Ivuze AI</span>
          </button>

          <button
            onClick={createNewConversation}
            className="flex items-center gap-3 px-3 py-3 w-full border border-[#059669]/30 rounded-md hover:bg-[#059669]/10 transition-colors text-sm text-[#059669] mb-2"
          >
            <FaPlus className="text-xs" />
            New chat
          </button>

          <button
            onClick={requestHandoff}
            disabled={handoffLoading || role !== 'patient' || !patientToken}
            className="flex items-center gap-3 px-3 py-3 w-full bg-[#1e40af] text-white rounded-md hover:bg-[#064e3b] transition-colors text-sm disabled:opacity-50"
          >
            <FaUserMd className="text-sm" />
            {handoffLoading ? 'Connecting...' : 'Contact Support'}
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin scrollbar-thumb-[#205c90]/20">
          <div className="text-xs font-medium text-gray-500 px-3 py-2">History</div>
          {conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => loadConversation(conv._id)}
              className={`group flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer text-sm transition-colors ${currentConversation?._id === conv._id ? 'bg-[#14324f]' : 'hover:bg-[#14324f]'
                }`}
            >
              <FaRobot className="text-[#059669] shrink-0" />
              <div className="flex-1 truncate text-gray-100">
                {isRenaming === conv._id ? (
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => {
                      updateConversationTitle(conv._id, renameValue);
                      setIsRenaming(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateConversationTitle(conv._id, renameValue);
                        setIsRenaming(null);
                      }
                    }}
                    autoFocus
                    className="w-full bg-transparent outline-none text-white border-b border-[#059669]"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  conv.title || 'New Chat'
                )}
              </div>

              <div className="hidden group-hover:flex items-center gap-2 text-gray-400">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(conv._id);
                    setRenameValue(conv.title || '');
                  }}
                  className="hover:text-[#059669]"
                >
                  <FaEdit size={12} />
                </button>
                <button
                  onClick={(e) => deleteConversation(conv._id, e)}
                  className="hover:text-red-400"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#059669]/10">
          {userData && (
            <div className="flex items-center gap-3 px-3 py-3 hover:bg-[#14324f] rounded-md cursor-pointer transition-colors">
              <img
                src={userData.image || assets.profile_pic}
                alt="User"
                className="w-8 h-8 rounded-sm"
              />
              <div className="text-sm text-gray-100 font-medium truncate">
                {userData.name}
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-[#064e3b] border-b border-[#059669]/10 text-gray-100">
          <button onClick={() => setShowMobileSidebar(true)}>
            <FaBars />
          </button>
          <span className="text-sm font-medium">e-Ivuze AI</span>
          <button onClick={createNewConversation}>
            <FaPlus />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#059669]/10 bg-[#022c22]">
          {!currentConversation && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-100">
              <div className="bg-white p-6 rounded-full mb-6 border border-[#059669]/20 shadow-lg">
                <img src={assets.logo} alt="e-Ivuze" className="w-16 h-16 object-contain" />
              </div>
              <h2 className="text-2xl font-semibold mb-8 text-[#059669]">How can I help you today?</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl px-4 w-full">
                {[
                  "Explain healthy sleep habits",
                  "What are symptoms of flu?",
                  "How do I lower cholesterol?",
                  "Schedule an appointment"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputMessage(prompt);
                      if (inputRef.current) inputRef.current.focus();
                    }}
                    className="border border-[#059669]/30 p-4 rounded-xl text-left hover:bg-[#064e3b] hover:border-[#059669]/50 transition-colors text-sm text-gray-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col pb-32 pt-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="group w-full text-gray-100 border-b border-[#059669]/5"
                >
                  <div className="max-w-3xl mx-auto flex gap-6 p-4 md:py-6 relative">
                    <div className="flex-shrink-0 flex flex-col relative items-end">
                      <div className="w-8 h-8 relative rounded-sm overflow-hidden flex items-center justify-center">
                        {msg.sender === 'user' ? (
                          <img src={userData?.image || assets.profile_pic} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <div className="bg-[#059669] w-full h-full flex items-center justify-center">
                            <FaRobot className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative flex-1 overflow-hidden">
                      <div className="prose prose-invert max-w-none text-[15px] leading-7 text-gray-100">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ node, ...props }) => <p className="mb-4 last:mb-0 whitespace-pre-wrap" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-4" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-4" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold text-[#059669]" {...props} />,
                            a: ({ node, ...props }) => <a className="text-[#059669] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                            code: ({ node, inline, ...props }) => (
                              inline
                                ? <code className="bg-[#064e3b] px-1 rounded text-[#059669]" {...props} />
                                : <code className="block bg-[#064e3b] p-3 rounded-lg my-2 overflow-x-auto" {...props} />
                            )
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="w-full text-gray-100">
                  <div className="max-w-3xl mx-auto flex gap-6 p-4 md:py-6">
                    <div className="w-8 h-8 bg-[#059669] rounded-sm flex items-center justify-center shrink-0">
                      <FaRobot className="text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 py-2">
                      <div className="w-2.5 h-2.5 bg-[#059669] rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
                      <div className="w-2.5 h-2.5 bg-[#059669] rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></div>
                      <div className="w-2.5 h-2.5 bg-[#059669] rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Semantic Search Modal */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-50 bg-[#022c22]/95 backdrop-blur-sm p-4 flex items-center justify-center"
            >
              <div className="bg-[#064e3b] w-full max-w-2xl rounded-xl border border-[#059669]/20 shadow-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-[#059669]">Semantic Knowledge Search</h3>
                  <button onClick={() => setShowSearch(false)}><FaTimes className="text-gray-400 hover:text-[#059669]" /></button>
                </div>
                <form onSubmit={runSemanticSearch} className="flex gap-2 mb-6">
                  <input
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 bg-[#022d22] text-white border border-[#059669]/20 rounded-md px-4 py-2 focus:outline-none focus:border-[#059669]"
                    placeholder={t('ai.search.placeholderKnowledge')}
                  />
                  <button type="submit" disabled={searchLoading} className="bg-[#059669] text-white px-4 py-2 rounded-md font-medium hover:bg-[#022d22]">
                    {searchLoading ? t('ai.search.loading') : t('ai.search.go')}
                  </button>
                </form>
                {searchAnswer && (
                  <div className="bg-[#022d22] p-4 rounded-md mb-4 border border-[#059669]/10">
                    <div className="text-sm font-bold text-[#059669] mb-2">{t('ai.search.answer')}</div>
                    <div className="prose prose-invert max-w-none text-sm text-gray-100 leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => <p className="mb-4 last:mb-0 whitespace-pre-wrap" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-4" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-4" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold text-[#059669]" {...props} />,
                          a: ({ node, ...props }) => (
                            <a className="text-[#059669] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                          ),
                          code: ({ node, inline, ...props }) => (
                            inline
                              ? <code className="bg-[#064e3b] px-1 rounded text-[#059669]" {...props} />
                              : <code className="block bg-[#064e3b] p-3 rounded-lg my-2 overflow-x-auto" {...props} />
                          )
                        }}
                      >
                        {searchAnswer}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((r, i) => (
                    <div key={i} className="bg-[#022d22] p-3 rounded text-sm text-gray-300 border border-[#059669]/10">
                      <div className="font-bold text-[#059669] text-xs uppercase mb-1">{r.document?.title || 'Source'}</div>
                      <div className="prose prose-invert max-w-none text-sm text-gray-300">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ node, ...props }) => <p className="mb-3 last:mb-0 whitespace-pre-wrap" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-3" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-3" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            a: ({ node, ...props }) => (
                              <a className="text-[#059669] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                            ),
                            code: ({ node, inline, ...props }) => (
                              inline
                                ? <code className="bg-[#064e3b] px-1 rounded text-[#059669]" {...props} />
                                : <code className="block bg-[#064e3b] p-3 rounded-lg my-2 overflow-x-auto" {...props} />
                            )
                          }}
                        >
                          {r.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#022c22] via-[#022c22] to-transparent pt-10 pb-6 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Quick Actions */}
            {messages.length > 0 && currentConversation && (
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={exportChat}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#064e3b] border border-[#059669]/20 rounded-full text-xs text-gray-300 hover:bg-[#1a3a5a] hover:border-[#059669]/40"
                >
                  <FaDownload /> Export
                </button>
                <button
                  onClick={requestHandoff}
                  disabled={handoffLoading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#064e3b] border border-[#059669]/20 rounded-full text-xs text-gray-300 hover:bg-[#1a3a5a] hover:border-[#059669]/40"
                >
                  <FaUserMd /> {handoffLoading ? 'Connecting...' : 'Talk to Doctor'}
                </button>
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#064e3b] border border-[#059669]/20 rounded-full text-xs text-gray-300 hover:bg-[#1a3a5a] hover:border-[#059669]/40"
                >
                  <FaSearch /> Search
                </button>
              </div>
            )}

            {/* Main Input */}
            <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 bg-[#064e3b] p-2 md:p-3 rounded-xl border border-[#059669]/20 shadow-md focus-within:border-[#059669]/40 transition-colors">
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                className="p-2 text-gray-400 hover:text-[#059669] transition-colors"
                title="Search Knowledge"
              >
                <FaSearch />
              </button>
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Message e-Ivuze AI..."
                className="flex-1 max-h-[200px] min-h-[44px] py-3 px-2 bg-transparent border-none focus:ring-0 text-white resize-none text-[15px] scrollbar-hide placeholder-gray-500"
                rows={1}
                style={{ height: 'auto', overflowY: 'hidden' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className={`p-2 rounded-md transition-colors mb-1 ${inputMessage.trim() && !isLoading ? 'bg-[#059669] text-white hover:bg-[#022d22]' : 'bg-transparent text-gray-500 cursor-not-allowed'
                  }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <FaPaperPlane size={16} />
                )}
              </button>
            </form>
            <p className="text-center text-[11px] text-gray-500 mt-3">
              e-Ivuze AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIAssistant;
