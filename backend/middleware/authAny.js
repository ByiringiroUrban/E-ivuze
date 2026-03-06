import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import doctorModel from '../models/doctorModel.js'
import hospitalUserModel from '../models/hospitalUserModel.js'
import pharmacyUserModel from '../models/pharmacyUserModel.js'
import labModel from '../models/labModel.js'

const adminEmail = process.env.ADMIN_EMAIL || 'admin@rwandahealth.com'
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123456'
const expectedAdminTokenValue = adminEmail + adminPassword

const authAny = async (req, res, next) => {
  try {
    const headers = req.headers || {}

    const candidates = [
      { header: headers.token, role: 'patient', key: 'userId', model: userModel },
      { header: headers.dtoken || headers.dToken, role: 'doctor', key: 'docId', model: doctorModel },
      { header: headers.atoken || headers.aToken, role: 'admin', key: 'adminId', model: null },
      { header: headers.htoken || headers.hToken, role: 'hospital', key: 'hospitalUserId', model: hospitalUserModel },
      { header: headers.ptoken || headers.pToken, role: 'pharmacy', key: 'pharmacyUserId', model: pharmacyUserModel },
      { header: headers.ltoken || headers.lToken, role: 'lab', key: 'labId', model: labModel }
    ]

    let principal = null
    for (const c of candidates) {
      if (!c.header) continue
      let decoded
      try {
        decoded = jwt.verify(c.header, process.env.JWT_SECRET)
      } catch (e) {
        continue
      }
      if (c.role === 'admin') {
        if (decoded !== expectedAdminTokenValue) {
          continue
        }
        principal = { role: 'admin', id: 'admin', name: 'E-ivuzeSupport', email: adminEmail, support: true, verified: true }
        break
      }
      const id = decoded.id || decoded
      let entity = null
      if (c.model) {
        entity = await c.model.findById(id)
      }
      if (!entity) continue
      const name = entity?.name || undefined
      const email = entity?.email || undefined
      principal = { role: c.role, id, name, email, support: false, verified: !!entity?.verified }
      break
    }

    if (!principal) {
      return res.json({ success: false, message: 'Not Authorized Login Again' })
    }

    req.principal = principal
    next()
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export default authAny