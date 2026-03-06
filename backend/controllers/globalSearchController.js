import doctorModel from '../models/doctorModel.js';
import userModel from '../models/userModel.js';
import appointmentModel from '../models/appointmentModel.js';
import recordModel from '../models/recordModel.js';

const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();

const buildRegex = (q) => {
  const escaped = escapeRegex(q);
  if (!escaped) return null;
  return new RegExp(escaped, 'i');
};

/**
 * GET /api/search/global?q=...
 * req.principal = { role, id } (from authAny)
 * Returns { doctors, patients, records, appointments } with items relevant to the role.
 */
export const globalSearch = async (req, res) => {
  try {
    const principal = req.principal;
    const q = (req.query.q || '').trim();
    if (!principal) {
      return res.json({ success: false, message: 'Not authorized' });
    }
    const regex = buildRegex(q);
    const limit = 8;

    const result = { doctors: [], patients: [], records: [], appointments: [] };

    if (!regex || q.length < 2) {
      return res.json({ success: true, ...result });
    }

    const { role, id } = principal;

    if (role === 'patient') {
      const [doctors, appointments, records] = await Promise.all([
        doctorModel
          .find({
            available: true,
            status: 'approved',
            deleted_at: null,
            $or: [{ name: regex }, { speciality: regex }]
          })
          .select('name speciality image')
          .limit(limit)
          .lean(),
        appointmentModel.find({ userId: id }).sort({ date: -1 }).limit(30).lean(),
        recordModel.find({ userId: id }).sort({ createdAt: -1 }).limit(30).lean()
      ]);
      result.doctors = doctors.map((d) => ({ _id: d._id, name: d.name, speciality: d.speciality, image: d.image, type: 'doctor' }));
      result.appointments = appointments
        .filter(
          (a) =>
            (a.docData && regex.test(a.docData.docName || '')) ||
            regex.test(a.slotDate || '') ||
            regex.test(a.slotTime || '')
        )
        .slice(0, limit)
        .map((a) => ({
          _id: a._id,
          slotDate: a.slotDate,
          slotTime: a.slotTime,
          docName: a.docData?.docName,
          userData: a.userData,
          type: 'appointment'
        }));
      result.records = records
        .filter((r) => regex.test(r.title || '') || regex.test(r.description || ''))
        .slice(0, limit)
        .map((r) => ({ _id: r._id, title: r.title, description: r.description, createdAt: r.createdAt, type: 'record' }));
    } else if (role === 'doctor') {
      const [appointments, records] = await Promise.all([
        appointmentModel.find({ docId: id }).sort({ date: -1 }).limit(50).lean(),
        recordModel.find({ docId: id }).sort({ createdAt: -1 }).limit(50).lean()
      ]);
      const patientIds = [...new Set(appointments.map((a) => a.userId).filter(Boolean))];
      const patients = await userModel
        .find({
          _id: { $in: patientIds },
          $or: [{ name: regex }, { email: regex }]
        })
        .select('name email image')
        .limit(limit)
        .lean();
      result.patients = patients.map((p) => ({ _id: p._id, name: p.name, email: p.email, image: p.image, type: 'patient' }));
      result.records = records
        .filter((r) => regex.test(r.title || '') || regex.test(r.description || ''))
        .slice(0, limit)
        .map((r) => ({ _id: r._id, title: r.title, appointmentId: r.appointmentId, createdAt: r.createdAt, type: 'record' }));
      result.appointments = appointments
        .filter(
          (a) =>
            (a.userData && regex.test(a.userData.name || '')) ||
            regex.test(a.slotDate || '') ||
            regex.test(a.slotTime || '')
        )
        .slice(0, limit)
        .map((a) => ({
          _id: a._id,
          slotDate: a.slotDate,
          slotTime: a.slotTime,
          docName: a.docData?.docName,
          userData: a.userData,
          type: 'appointment'
        }));
    } else if (role === 'admin') {
      const [doctors, users, appointments] = await Promise.all([
        doctorModel
          .find({
            $or: [{ name: regex }, { speciality: regex }, { email: regex }]
          })
          .select('name speciality email image')
          .limit(limit)
          .lean(),
        userModel
          .find({ $or: [{ name: regex }, { email: regex }] })
          .select('name email image')
          .limit(limit)
          .lean(),
        appointmentModel.find({}).sort({ date: -1 }).limit(50).lean()
      ]);
      result.doctors = doctors.map((d) => ({ _id: d._id, name: d.name, speciality: d.speciality, email: d.email, image: d.image, type: 'doctor' }));
      result.patients = users.map((u) => ({ _id: u._id, name: u.name, email: u.email, image: u.image, type: 'patient' }));
      result.appointments = appointments
        .filter(
          (a) =>
            (a.docData && regex.test(a.docData.docName || '')) ||
            (a.userData && regex.test(a.userData.name || '')) ||
            regex.test(a.slotDate || '')
        )
        .slice(0, limit)
        .map((a) => ({
          _id: a._id,
          slotDate: a.slotDate,
          slotTime: a.slotTime,
          docName: a.docData?.docName,
          userData: a.userData,
          type: 'appointment'
        }));
    } else {
      return res.json({ success: true, ...result });
    }

    res.json({ success: true, ...result });
  } catch (error) {
    res.json({ success: false, message: error.message || 'Search failed' });
  }
};
