import recordModel from '../models/recordModel.js';
import appointmentModel from '../models/appointmentModel.js';
import {v2 as cloudinary} from 'cloudinary';

// Create record
const createRecord = async (req, res) => {
    try {
        const { appointmentId, recordType, title, description } = req.body;
        const docId = req.body.docId;

        if (!appointmentId || !title) {
            return res.json({ success: false, message: 'Appointment ID and title are required' });
        }

        // Get appointment
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        // Check if doctor owns this appointment
        if (appointment.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized access' });
        }

        // Upload attachments if any
        let attachments = [];
        if (req.files && req.files.attachments) {
            const files = Array.isArray(req.files.attachments) 
                ? req.files.attachments 
                : [req.files.attachments];
            
            for (const file of files) {
                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    folder: 'medical_records',
                    resource_type: 'auto'
                });
                attachments.push(result.secure_url);
            }
        }

        // Create record
        const recordData = {
            appointmentId,
            userId: appointment.userId,
            docId,
            recordType: recordType || 'consultation',
            title,
            description: description || '',
            attachments
        };

        const newRecord = new recordModel(recordData);
        const savedRecord = await newRecord.save();

        res.json({ 
            success: true, 
            message: 'Record created successfully',
            record: savedRecord 
        });

    } catch (error) {
        console.error('Error creating record:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get records by appointment
const getRecordsByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.body.userId || req.body.docId;

        if (!appointmentId) {
            return res.json({ success: false, message: 'Appointment ID is required' });
        }

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        // Check authorization
        if (appointment.userId !== userId && appointment.docId !== userId) {
            return res.json({ success: false, message: 'Unauthorized access' });
        }

        const records = await recordModel.find({ appointmentId })
            .sort({ createdAt: -1 });

        res.json({ success: true, records });

    } catch (error) {
        console.error('Error getting records:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get all records for user
const getUserRecords = async (req, res) => {
    try {
        const userId = req.body.userId;

        // Convert to string if needed (models use String type)
        const userIdStr = userId ? userId.toString() : userId;

        const records = await recordModel.find({ userId: userIdStr })
            .sort({ createdAt: -1 });

        res.json({ success: true, records });

    } catch (error) {
        console.error('Error getting user records:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get all records for doctor
const getDoctorRecords = async (req, res) => {
    try {
        const docId = req.body.docId;

        // Convert to string if needed (models use String type)
        const docIdStr = docId ? docId.toString() : docId;

        const records = await recordModel.find({ docId: docIdStr })
            .sort({ createdAt: -1 });

        res.json({ success: true, records });

    } catch (error) {
        console.error('Error getting doctor records:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get records for a specific patient (for doctor)
const getPatientRecords = async (req, res) => {
    try {
        const { patientId } = req.body;
        const docId = req.body.docId;

        if (!patientId) {
            return res.json({ success: false, message: 'Patient ID is required' });
        }

        // Convert to string if needed (models use String type)
        const patientIdStr = patientId.toString();
        const docIdStr = docId.toString();

        const records = await recordModel.find({ userId: patientIdStr, docId: docIdStr })
            .sort({ createdAt: -1 });

        res.json({ success: true, records });

    } catch (error) {
        console.error('Error getting patient records:', error);
        res.json({ success: false, message: error.message });
    }
};

// Update record
const updateRecord = async (req, res) => {
    try {
        const { recordId, title, description } = req.body;
        const docId = req.body.docId;

        if (!recordId) {
            return res.json({ success: false, message: 'Record ID is required' });
        }

        const record = await recordModel.findById(recordId);
        if (!record) {
            return res.json({ success: false, message: 'Record not found' });
        }

        // Check authorization
        if (record.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized access' });
        }

        // Update record
        if (title) record.title = title;
        if (description !== undefined) record.description = description;
        record.updatedAt = new Date();
        await record.save();

        res.json({ 
            success: true, 
            message: 'Record updated successfully',
            record 
        });

    } catch (error) {
        console.error('Error updating record:', error);
        res.json({ success: false, message: error.message });
    }
};

// Delete record
const deleteRecord = async (req, res) => {
    try {
        const { recordId } = req.body;
        const docId = req.body.docId;

        if (!recordId) {
            return res.json({ success: false, message: 'Record ID is required' });
        }

        const record = await recordModel.findById(recordId);
        if (!record) {
            return res.json({ success: false, message: 'Record not found' });
        }

        // Check authorization
        if (record.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized access' });
        }

        await recordModel.findByIdAndDelete(recordId);

        res.json({ success: true, message: 'Record deleted successfully' });

    } catch (error) {
        console.error('Error deleting record:', error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    createRecord, 
    getRecordsByAppointment, 
    getUserRecords, 
    getDoctorRecords, 
    getPatientRecords,
    updateRecord, 
    deleteRecord 
};






