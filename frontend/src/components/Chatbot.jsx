import React, { useContext, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaRobot, FaTimes, FaPaperPlane, FaUserMd } from 'react-icons/fa';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AppContext } from '../context/AppContext';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { HospitalContext } from '../context/HospitalContext';
import { PharmacyContext } from '../context/PharmacyContext';
import { LabContext } from '../context/LabContext';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const { i18n, t } = useTranslation();
  const { backendUrl, token } = useContext(AppContext);
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const { hToken } = useContext(HospitalContext);
  const { pToken } = useContext(PharmacyContext);
  const { lToken } = useContext(LabContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [showConsent, setShowConsent] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('aiConsentAccepted');
  });
  const messagesEndRef = useRef(null);
  const currentLanguage = i18n.language ? i18n.language.split('-')[0] : 'rw';
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

  // Knowledge base for system questions
  const knowledgeBase = {
    en: {
      greeting: "Hello! I'm here to help you with questions about E-ivuzeConnect. How can I assist you today?",
      default: "I'm here to help with questions about E-ivuzeConnect. You can ask me about: account creation, booking appointments, payments, video consultations, hospital registration, health records, or any other system-related questions.",
      account: "To create an account, click 'Register' or 'Create Account' in the navigation bar. Choose your role (Patient or Doctor), fill in your details including name, email, and password (minimum 8 characters). For doctors, you'll also need to provide your medical license number, specialty, degree, and experience.",
      appointment: "To book an appointment: 1) Browse doctors by specialty or view all available doctors, 2) Click on a doctor's profile to see their availability, 3) Select an available time slot, 4) Confirm your appointment details and submit. The doctor will review and approve your appointment request.",
      payment: "After your appointment is approved by the doctor, you'll see a payment option. Click 'Pay Online' and you'll receive a payment code. Dial this code on your mobile money service (MTN, Airtel, etc.), complete the payment, take a screenshot of the confirmation, and upload it as payment proof.",
      video: "When your appointment time arrives and payment is confirmed, you'll see a 'Join Meeting' button in your appointment details. Click it to enter the video consultation room. Make sure you have a stable internet connection and allow camera/microphone permissions when prompted.",
      hospital: "Hospitals can register by clicking 'Register Your Hospital' on the login page. Fill in your hospital details including name, address, and create an admin account. Your registration will be reviewed by our admin team. Once approved, you'll receive a notification and can log in to manage your hospital doctors, view patients, and handle patient transfers.",
      records: "After your appointment is completed, you can access your health records and prescriptions from your dashboard. Go to 'My Prescriptions' to view all prescriptions issued by doctors. Your medical records are securely stored and can be accessed anytime from your profile.",
      cancel: "Yes, you can cancel appointments that haven't been completed yet. Go to 'My Appointments' in your dashboard, find the appointment you want to cancel, and click 'Cancel Appointment'. To reschedule, cancel the current appointment and book a new one with your preferred time slot.",
      doctor: "Doctors need to provide: a valid medical license number (minimum 5 characters), their medical specialty, educational degree (e.g., MBBS, MD), years of experience, professional bio, and address. A profile picture is optional but recommended. All information is verified to ensure quality healthcare services.",
      password: "If you forget your password, please contact our support team at team@E-ivuze.com. We'll help you reset your account. For security reasons, password reset must be done through our support team.",
      transfer: "Hospitals can transfer patient records to other approved hospitals on the platform. This is useful when a patient needs to be referred to another facility. The receiving hospital can accept or reject the transfer. When accepted, a copy of the patient record is created in the receiving hospital's system.",
      unknown: "I'm not sure about that specific question. Could you please rephrase it or ask about: account creation, booking appointments, payments, video consultations, hospital registration, health records, or system features? For more detailed help, contact support at team@E-ivuze.com."
    },
    rw: {
      greeting: "Muraho! Ndi hano kugufasha kubibazo byerekeye E-ivuzeConnect. Nshobora kugufasha iki?",
      default: "Ndi hano kugufasha kubibazo byerekeye E-ivuzeConnect. Urashobora kumbaza ibijyanye na: kwiyandikisha, gusaba ikipe, kwishyura, guhura na dokoteri binyuze kuri video, kwiyandikisha ishuri, amakuru y'ubuzima, primarygwa ibindi bibazo byerekeye sisitemu.",
      account: "Kugira ngo wiyandikishe, kanda 'Register' primarygwa 'Create Account' mu menu. Hitamo uruhare rwawe (Umuvurwa primarygwa Dokoteri), uzuzure amakuru yawe harimo izina, imeri, na password (ibihimbano 8 byibuze). Kuri dokoteri, ukagomba kwinjiza numero y'uruhushya rwawe rwo kuvura, ubwoko bw'ubuvuzi, impamyabumenyi, n'ubuhanga.",
      appointment: "Kugira ngo usabe ikipe: 1) Rondera dokoteri ukurikije ubwoko bw'ubuvuzi primarygwa reba dokoteri bose buboneka, 2) Kanda kuri profil ya dokoteri kugira ngo ubone igihe yuboneka, 3) Hitamo igihe cyuboneka, 4) Emeza amakuru ya ikipe yawe hanyuma uwohereze. Dokoteri azareba hanyuma akemera gusaba kwawe.",
      payment: "Nyuma y'uko dokoteri akemeye ikipe yawe, uzabona ahantu ho kwishyura. Kanda 'Pay Online' hanyuma uzahabwa code yo kwishyura. Koresha code iyi kuri serivisi yawe ya mobile money (MTN, Airtel, n'izindi), ukomeze kwishyura, ukure screenshot y'emeza, hanyuma uwohereze nk'ikimenyetso cyo kwishyura.",
      video: "Igihe igihe cyawe cy'ikipe cyageze kandi kwishyura kwemejwe, uzabona buto 'Join Meeting' mu makuru yawe y'ikipe. Kanda kugira ngo winjire mu nzu y'ubuvuzi bwa video. Menya ko ufite interineti nziza kandi wemerera kamera/mikrofoni igihe ubujijwe.",
      hospital: "Amashuri arashobora kwiyandikisha ukanda 'Register Your Hospital' kuri paje y'injira. Uzuzure amakuru y'ishuri ryawe harimo izina, aho riherereye, hanyuma ukagire konti ya admin. Kwiyandikisha kwawe kuzarebwa na timu y'admin. Nyuma y'uko kwemezwa, uzahabwa amakuru kandi wongera winjire kugira ngo uyobore dokoteri z'ishuri ryawe, urebe abavurwa, kandi uyobore kohereza abavurwa.",
      records: "Nyuma y'uko ikipe yawe irangije, urashobora kugera ku makuru yawe y'ubuzima na preskripsiyo biva kuri dashboard yawe. Jya kuri 'My Prescriptions' kugira ngo urebe preskripsiyo zose dokoteri zatanze. Amakuru yawe y'ubuzima yabitswe neza kandi urashobora kuyagera igihe icyo ari cyo cyose kuri profil yawe.",
      cancel: "Yego, urashobora guhagarika ikipe zidakomeje. Jya kuri 'My Appointments' mu dashboard yawe, shakisha ikipe ushaka guhagarika, hanyuma ukande 'Cancel Appointment'. Kugira ngo wongere gahunda, hagarika ikipe y'ubu hanyuma usabe iyindi n'igihe wifuza.",
      doctor: "Dokoteri bagomba kwinjiza: numero y'uruhushya rwo kuvura (ibihimbano 5 byibuze), ubwoko bw'ubuvuzi, impamyabumenyi (urugero: MBBS, MD), imyaka y'ubuhanga, amakuru y'umwuga, n'aho batuye. Ifoto y'umuntu niyo nteranyo ariko ikagira akamaro. Amakuru yose aragenzurwa kugira ngo dufashe serivisi z'ubuzima zizewe.",
      password: "Niba wibagiwe password yawe, nyamuneka wongere ku timu yacu y'ubufasha kuri team@E-ivuze.com. Tuzagufasha kugenzura konti yawe. Kubera ubwoba bw'umutekano, kugenzura password bigomba gukorwa binyuze ku timu y'ubufasha.",
      transfer: "Amashuri arashobora kohereza amakuru y'abavurwa kuri andi mashuri yemezwe kuri sisitemu. Ibi byagira akamaro igihe umuvurwa agomba koherezwa kuri andi mashuri. Ishuri rikiriho rishobora kwemera primarygwa guta kohereza. Igihe rikiriho rikiriho, kopi y'amakuru y'umuvurwa ikagira mu sisitemu y'ishuri rikiriho.",
      unknown: "Sinzi neza kubyo bibazo. Nyamuneka wongere ubyohereze primarygwa wibaze ibijyanye na: kwiyandikisha, gusaba ikipe, kwishyura, guhura na dokoteri binyuze kuri video, kwiyandikisha ishuri, amakuru y'ubuzima, primarygwa ibiranga sisitemu? Kugira ngo wongere ubufasha, ohereza ubutumwa kuri team@E-ivuze.com."
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleConsentAccept = () => {
    localStorage.setItem('aiConsentAccepted', 'true');
    setShowConsent(false);
  };

  const requestHandoff = async () => {
    if (handoffLoading) return;
    if (showConsent) return;
    if (role !== 'patient' || !patientToken) return;
    if (!conversationId) return;

    setHandoffLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/ai/conversations/${conversationId}/handoff`,
        {},
        { headers: { token: patientToken } }
      );
      if (data?.success && data?.roomId) {
        navigate(`/messages?roomId=${data.roomId}`);
      }
    } catch (e) {
      // ignore
    } finally {
      setHandoffLoading(false);
    }
  };

  useEffect(() => {
    setConversationId(null);
    setMessages([]);
  }, [identityKey]);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      setShowConsent(!localStorage.getItem('aiConsentAccepted'));
    }

    if (isOpen && messages.length === 0) {
      const kb = knowledgeBase[currentLanguage] || knowledgeBase.en;
      // Add greeting message when chatbot opens
      setMessages([{
        type: 'bot',
        text: kb.greeting
      }]);
    }
  }, [isOpen, currentLanguage, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const getAnswer = (question) => {
    const lowerQuestion = question.toLowerCase();
    const kb = knowledgeBase[currentLanguage] || knowledgeBase.en;

    // Check for keywords and return appropriate answer
    if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi') || lowerQuestion.includes('muraho') || lowerQuestion.includes('bite')) {
      return kb.greeting;
    } else if (lowerQuestion.includes('account') || lowerQuestion.includes('register') || lowerQuestion.includes('sign up') || lowerQuestion.includes('kwiyandikisha')) {
      return kb.account;
    } else if (lowerQuestion.includes('appointment') || lowerQuestion.includes('book') || lowerQuestion.includes('schedule') || lowerQuestion.includes('gusaba ikipe')) {
      return kb.appointment;
    } else if (lowerQuestion.includes('pay') || lowerQuestion.includes('payment') || lowerQuestion.includes('money') || lowerQuestion.includes('kwishyura')) {
      return kb.payment;
    } else if (lowerQuestion.includes('video') || lowerQuestion.includes('consultation') || lowerQuestion.includes('call') || lowerQuestion.includes('guhura')) {
      return kb.video;
    } else if (lowerQuestion.includes('hospital') || lowerQuestion.includes('ishuri')) {
      return kb.hospital;
    } else if (lowerQuestion.includes('record') || lowerQuestion.includes('prescription') || lowerQuestion.includes('health') || lowerQuestion.includes('amakuru y\'ubuzima')) {
      return kb.records;
    } else if (lowerQuestion.includes('cancel') || lowerQuestion.includes('reschedule') || lowerQuestion.includes('guhagarika')) {
      return kb.cancel;
    } else if (lowerQuestion.includes('doctor') || lowerQuestion.includes('dokoteri') || lowerQuestion.includes('requirement')) {
      return kb.doctor;
    } else if (lowerQuestion.includes('password') || lowerQuestion.includes('forgot') || lowerQuestion.includes('reset') || lowerQuestion.includes('wibagiwe')) {
      return kb.password;
    } else if (lowerQuestion.includes('transfer') || lowerQuestion.includes('kohereza')) {
      return kb.transfer;
    } else {
      return kb.unknown;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;
    if (showConsent) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    const optimisticUserMessage = {
      type: 'user',
      text: messageText,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticUserMessage]);

    try {
      let headers = {};
      if (role === 'doctor' && activeToken) headers = { dToken: activeToken };
      else if (role === 'admin' && activeToken) headers = { aToken: activeToken };
      else if (role === 'hospital' && activeToken) headers = { hToken: activeToken };
      else if (activeToken) headers = { token: activeToken };
      const id = conversationId || 'new';

      const { data } = await axios.post(
        `${backendUrl}/api/ai/conversations/${id}/messages`,
        { text: messageText },
        { headers }
      );

      if (data?.success && data?.assistantMessage?.text) {
        if (data?.conversation?._id) {
          setConversationId(data.conversation._id);
        }

        setMessages(prev => [
          ...prev,
          {
            type: 'bot',
            text: data.assistantMessage.text,
            createdAt: data.assistantMessage.createdAt
          }
        ]);
        return;
      }

      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          text: getAnswer(messageText),
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          text: getAnswer(messageText),
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('chatbot.open') || 'Open chatbot'}
        title={t('chatbot.open') || 'Open chatbot'}
        className="fixed bottom-24 right-6 z-[9999] flex h-14 w-14 items-center justify-center  border border-white bg-gradient-to-br from-primary via-primary to-primary/80 text-white shadow-xl transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        <FaRobot className="text-2xl" />
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-40 right-6 z-[10000] flex h-[480px] w-[350px] max-h-[80vh] max-w-[90vw] flex-col overflow-hidden  border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between  bg-primary px-5 py-4 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <FaRobot />
              <span>{t('chatbot.title') || 'Chatbot Assistant'}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className=" p-1 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <FaTimes />
            </button>
          </div>

          {role === 'patient' && !!patientToken && !!conversationId && (
            <div className="border-b border-slate-200 bg-white px-4 py-3">
              <button
                type="button"
                onClick={requestHandoff}
                disabled={handoffLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary px-3 py-2 text-xs font-semibold   tracking-wider text-white transition hover:bg-primary/90 disabled:opacity-60"
              >
                <FaUserMd />
                {handoffLoading ? (t('ai.handoff.loading') || 'Connecting...') : (t('ai.handoff.cta') || 'Contact Support')}
              </button>
            </div>
          )}

          {showConsent && (
            <div className="border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
              <p className="text-xs leading-relaxed">
                {t('ai.consent.message') || 'By using this feature, you consent to storing health information. This AI provides informational guidance only and is not a substitute for professional medical care. For emergencies, call emergency services immediately.'}
              </p>
              <button
                onClick={handleConsentAccept}
                className="mt-2 w-full bg-primary px-3 py-2 text-xs font-semibold   tracking-wider text-white transition hover:bg-primary/90"
              >
                {t('ai.consent.accept') || 'Acknowledge Protocol'}
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-5">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.type === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white text-slate-700'
                    }`}
                >
                  {msg.type === 'bot' ? (
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => <p className="mb-3 last:mb-0 whitespace-pre-wrap" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                          a: ({ node, ...props }) => (
                            <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                          ),
                          code: ({ node, inline, ...props }) =>
                            inline
                              ? <code className="bg-slate-100 px-1 rounded" {...props} />
                              : <code className="block bg-slate-100 p-3 rounded my-2 overflow-x-auto" {...props} />
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-white px-4 py-2 text-sm leading-relaxed text-slate-700 shadow-sm">
                  {t('chatbot.typing') || '...'}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-slate-200 bg-white px-4 py-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t('chatbot.placeholder') || 'Type your question...'}
                disabled={isSending || showConsent}
                className="flex-1  border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
              />
              <button
                type="submit"
                disabled={isSending || showConsent}
                className="flex items-center justify-center  bg-primary px-4 py-2 text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
};

export default Chatbot;
