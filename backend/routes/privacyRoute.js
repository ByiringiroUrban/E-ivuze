import express from 'express'
import { submitDeleteRequest } from '../controllers/privacyController.js'
import authUserOptional from '../middleware/authUserOptional.js'

const router = express.Router()

// Submit a data deletion request (queued for admin review)
router.post('/delete-request', authUserOptional, submitDeleteRequest)

export default router
