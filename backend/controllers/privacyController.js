import auditLogModel from '../models/auditLogModel.js'
import { redactForLogs } from '../utils/redactForLogs.js'

export const submitDeleteRequest = async (req, res) => {
  try {
    const userId = req.body.userId || null
    const { reason = '', email = '', details = '' } = req.body || {}

    const changes = {
      reason: String(reason || '').slice(0, 300),
      providedEmail: String(email || '').slice(0, 120) || null,
      detailsLen: String(details || '').length || 0
    }

    const actorId = userId ? String(userId) : 'anonymous'
    const actorType = 'USER'
    const targetId = actorId
    const targetType = 'USER'

    await auditLogModel.create({
      action: 'DELETE_REQUEST',
      actorId,
      actorType,
      targetId,
      targetType,
      changes,
      timestamp: new Date(),
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent'] || undefined
    })

    console.info('Privacy delete request received:', redactForLogs({ actorId, actorType, targetId, targetType, changes }))

    return res.json({ success: true, message: 'Your data deletion request has been received and queued for review.' })
  } catch (error) {
    console.error('Privacy delete request error:', redactForLogs(error))
    return res.json({ success: false, message: error.message || 'Failed to submit deletion request' })
  }
}
