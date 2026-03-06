import axios from 'axios'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

export async function getFolderCounts(getHeaders) {
  const { data } = await axios.get(`${baseUrl}/api/mail/counts`, { headers: getHeaders() })
  return data
}

export async function getFolderMessages(folder, page, getHeaders) {
  const { data } = await axios.get(`${baseUrl}/api/mail/folders/${folder}`, {
    params: { page, limit: 20 },
    headers: getHeaders()
  })
  return data
}

export async function getMessage(messageId, getHeaders) {
  const { data } = await axios.get(`${baseUrl}/api/mail/message/${messageId}`, { headers: getHeaders() })
  return data
}

export async function getThread(messageId, getHeaders) {
  const { data } = await axios.get(`${baseUrl}/api/mail/thread/${messageId}`, { headers: getHeaders() })
  return data
}

export async function resolveRecipients(body, getHeaders) {
  const { data } = await axios.post(`${baseUrl}/api/mail/recipients/resolve`, body, { headers: getHeaders() })
  return data
}

export async function sendMessage({ subject, body, threadId, recipientFilter }, formData, getHeaders) {
  const headers = getHeaders()
  if (formData?.attachments?.length) {
    const fd = new FormData()
    fd.append('subject', subject || '')
    fd.append('body', body || '')
    if (threadId) fd.append('threadId', threadId)
    fd.append('recipientFilter', JSON.stringify(recipientFilter))
    formData.attachments.forEach(f => fd.append('attachments', f))
    const { data } = await axios.post(`${baseUrl}/api/mail/send`, fd, { headers })
    return data
  }
  const { data } = await axios.post(`${baseUrl}/api/mail/send`, { subject, body, threadId, recipientFilter: JSON.stringify(recipientFilter) }, { headers })
  return data
}

export async function saveDraft({ draftId, subject, body, recipientFilter }, formData, getHeaders) {
  const headers = getHeaders()
  if (formData?.attachments?.length) {
    const fd = new FormData()
    fd.append('draftId', draftId || '')
    fd.append('subject', subject || '')
    fd.append('body', body || '')
    fd.append('recipientFilter', JSON.stringify(recipientFilter || []))
    formData.attachments.forEach(f => fd.append('attachments', f))
    const { data } = await axios.post(`${baseUrl}/api/mail/draft`, fd, { headers })
    return data
  }
  const { data } = await axios.post(`${baseUrl}/api/mail/draft`, { draftId, subject, body, recipientFilter: JSON.stringify(recipientFilter || []) }, { headers: getHeaders() })
  return data
}

export async function replyToMessage(messageId, body, formData, getHeaders) {
  const headers = getHeaders()
  if (formData?.attachments?.length) {
    const fd = new FormData()
    fd.append('messageId', messageId)
    fd.append('body', body || '')
    formData.attachments.forEach(f => fd.append('attachments', f))
    const { data } = await axios.post(`${baseUrl}/api/mail/reply`, fd, { headers })
    return data
  }
  const { data } = await axios.post(`${baseUrl}/api/mail/reply`, { messageId, body }, { headers })
  return data
}

export async function updateMessageMeta(messageId, payload, getHeaders) {
  const { data } = await axios.patch(`${baseUrl}/api/mail/message/${messageId}`, payload, { headers: getHeaders() })
  return data
}

export async function bulkAction(messageIds, action, getHeaders) {
  const { data } = await axios.post(`${baseUrl}/api/mail/bulk`, { messageIds, action }, { headers: getHeaders() })
  return data
}

export async function searchMail(params, getHeaders) {
  const { data } = await axios.get(`${baseUrl}/api/mail/search`, { params, headers: getHeaders() })
  return data
}

export async function deleteDraft(draftId, getHeaders) {
  const { data } = await axios.delete(`${baseUrl}/api/mail/draft/${draftId}`, { headers: getHeaders() })
  return data
}

export function getMailAuthHeaders(tokens, role) {
  const token = role === 'doctor' ? tokens.dToken : role === 'admin' ? tokens.aToken : role === 'hospital' ? tokens.hToken : role === 'pharmacy' ? tokens.pToken : role === 'lab' ? tokens.lToken : tokens.token
  if (role === 'doctor') return () => ({ dToken: token })
  if (role === 'admin') return () => ({ aToken: token })
  if (role === 'hospital') return () => ({ hToken: token })
  if (role === 'pharmacy') return () => ({ pToken: token })
  if (role === 'lab') return () => ({ lToken: token })
  return () => ({ token })
}
