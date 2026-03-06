import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId : {type : String, required: true},
    docId : {type : String, required: true},
    slotDate : {type : String, required: true},
    slotTime : {type : String, required: true},
    userData : {type : Object, required: true},
    docData : {type : Object, required: true},
    amount : {type : Number, required: true},
    date : {type : Number, required: true},
    cancelled : {type : Boolean, default: false},
    payment : {type : Boolean, default: false},
    paymentStatus : {type : String, enum: ['pending', 'approved', 'rejected', 'not_paid'], default: 'not_paid'},
    paymentId: {type: String, default: null},
    isCompleted : {type : Boolean, default: false},
    videoCallChannel : {type : String, default: null},
    videoCallActive : {type : Boolean, default: false},
    // Appointment approval fields
    approvalStatus : {type : String, enum: ['pending', 'approved', 'rejected'], default: 'pending'},
    rejectionMessage : {type : String, default: null},
    approvedAt : {type : Date, default: null},
    rejectedAt : {type : Date, default: null},
    // Appointment reminders
    appointmentDate : {type : Date, default: null},
    remindersSent : {type : [String], default: []},
    docName : {type : String, default: ''},
    isVideo : {type : Boolean, default: false}
})

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment',appointmentSchema)

export default appointmentModel