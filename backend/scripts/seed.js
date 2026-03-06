import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Import Models
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import hospitalModel from '../models/hospitalModel.js';
import pharmacyModel from '../models/pharmacyModel.js';
import labModel from '../models/labModel.js';
import appointmentModel from '../models/appointmentModel.js';
import medicationModel from '../models/medicationModel.js';
import clinicalVisitModel from '../models/clinicalVisitModel.js';
import prescriptionModel from '../models/prescriptionModel.js';
import vitalSignModel from '../models/vitalSignModel.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://irabaruta:01402@mydb.qhgx1yd.mongodb.net/E-ivuze?appName=mydb";

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // --- CLEAR DATA ---
        console.log("⏳ Clearing existing data...");
        await Promise.all([
            userModel.deleteMany({}),
            doctorModel.deleteMany({}),
            hospitalModel.deleteMany({}),
            pharmacyModel.deleteMany({}),
            labModel.deleteMany({}),
            appointmentModel.deleteMany({}),
            medicationModel.deleteMany({}),
            clinicalVisitModel.deleteMany({}),
            prescriptionModel.deleteMany({}),
            vitalSignModel.deleteMany({})
        ]);
        console.log("✅ Data cleared");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // --- 1. SEED HOSPITALS ---
        const hospitals = [
            { name: "King Faisal Hospital", address: { line1: "KG 544 St", city: "Kigali", country: "Rwanda" }, phone: "+250 252 588 888", website: "https://kfh.rw", status: "APPROVED" },
            { name: "CHUK (University Teaching Hospital of Kigali)", address: { line1: "KN 4 Ave", city: "Kigali", country: "Rwanda" }, phone: "+250 252 575 405", website: "https://chuk.rw", status: "APPROVED" },
            { name: "Legacy Clinics", address: { line1: "KG 11 Ave", city: "Kigali", country: "Rwanda" }, phone: "+250 788 122 100", website: "https://legacyclinics.rw", status: "APPROVED" },
            { name: "Rwanda Military Hospital", address: { line1: "Kanombe", city: "Kigali", country: "Rwanda" }, phone: "+250 252 586 420", website: "https://rwandamilitaryhospital.rw", status: "APPROVED" },
            { name: "CHUB (Butare University Teaching Hospital)", address: { line1: "Huye", city: "Huye", country: "Rwanda" }, phone: "+250 252 530 330", website: "https://chub.rw", status: "APPROVED" }
        ];
        const createdHospitals = await hospitalModel.insertMany(hospitals);
        console.log("✅ Seeded Hospitals");

        // --- 2. SEED PHARMACIES ---
        const pharmacies = [
            { name: "Pharmacie Conseil", email: "conseil@example.com", phone: "+250 788 300 100", address: { line1: "KN 2 St", city: "Kigali", country: "Rwanda" }, licenseNumber: "L-PHA-2023-001", status: "APPROVED" },
            { name: "Kipharma Pharmacy", email: "kipharma@example.com", phone: "+250 788 300 200", address: { line1: "KN 3 Rd", city: "Kigali", country: "Rwanda" }, licenseNumber: "L-PHA-2023-002", status: "APPROVED" },
            { name: "Vine Pharmacy", email: "vine@example.com", phone: "+250 788 300 500", address: { line1: "Huye Central", city: "Huye", country: "Rwanda" }, licenseNumber: "L-PHA-2023-005", status: "APPROVED" }
        ];
        const createdPharmacies = await pharmacyModel.insertMany(pharmacies);
        console.log("✅ Seeded Pharmacies");

        // --- 3. SEED MEDICATIONS ---
        const medList = [
            { name: "Paracetamol", category: "Analgesics", price: 100, qty: 1000 },
            { name: "Amoxicillin", category: "Antibiotics", price: 500, qty: 500 },
            { name: "Ibuprofen", category: "Analgesics", price: 200, qty: 800 },
            { name: "Metformin", category: "Antidiabetic", price: 1500, qty: 300 },
            { name: "Artemether/Lumefantrine (Coartem)", category: "Antimalarials", price: 3000, qty: 200 }
        ];

        const medications = [];
        createdPharmacies.forEach(ph => {
            medList.forEach((m, index) => {
                medications.push({
                    pharmacyId: ph._id,
                    sku: `SKU-${ph.name.substring(0, 3).toUpperCase()}-${index}`,
                    name: m.name,
                    category: m.category,
                    price: m.price,
                    stock: m.qty,
                    batch: [{ batchNumber: `B${index}01`, expiryDate: new Date('2026-12-31'), qty: m.qty }]
                });
            });
        });
        await medicationModel.insertMany(medications);
        console.log("✅ Seeded Pharmacy Medications");

        // --- 4. SEED DOCTORS ---
        const doctors = [
            { name: "Dr. Jean de Dieu Kagame", email: "jean.kagame@example.com", password: hashedPassword, speciality: "General Physician", degree: "MBBS", experience: "10 Years", about: "Specialist in Internal Medicine with 10 years experience.", address: { line1: "Nyarugenge", city: "Kigali" }, image: "https://res.cloudinary.com/demo/image/upload/v1611151603/doctor1.jpg", licenseNumber: "RMC/2014/101", date: Date.now(), hospitalId: createdHospitals[0]._id, status: "approved", nid: "1198480012345678" },
            { name: "Dr. Marie Claire Uwase", email: "marie.uwase@example.com", password: hashedPassword, speciality: "Gynecologist", degree: "MD, MMed", experience: "8 Years", about: "Focus on maternal and child health.", address: { line1: "Gasabo", city: "Kigali" }, image: "https://res.cloudinary.com/demo/image/upload/v1611151603/doctor2.jpg", licenseNumber: "RMC/2016/542", date: Date.now(), hospitalId: createdHospitals[2]._id, status: "approved", nid: "1199080087654321" },
            { name: "Dr. Emmanuel Niyonkuru", email: "emmanuel.niyonkuru@example.com", password: hashedPassword, speciality: "Dermatologist", degree: "MD", experience: "12 Years", about: "Expert in tropical skin conditions.", address: { line1: "Musanze", city: "Musanze" }, image: "https://res.cloudinary.com/demo/image/upload/v1611151603/doctor3.jpg", licenseNumber: "RMC/2012/998", date: Date.now(), hospitalId: createdHospitals[1]._id, status: "approved", nid: "1198280011223344" },
            { name: "Dr. Alice Mutoni", email: "alice.mutoni@example.com", password: hashedPassword, speciality: "Pediatricians", degree: "MBBS, DCH", experience: "5 Years", about: "Passionate about pediatric care.", address: { line1: "Kicukiro", city: "Kigali" }, image: "https://res.cloudinary.com/demo/image/upload/v1611151603/doctor4.jpg", licenseNumber: "RMC/2019/319", date: Date.now(), hospitalId: createdHospitals[3]._id, status: "approved", nid: "1199580099887766" },
            { name: "Dr. Patrick Habimana", email: "patrick.habimana@example.com", password: hashedPassword, speciality: "Neurologist", degree: "MD, PhD", experience: "15 Years", about: "Neurology specialist in Rwanda.", address: { line1: "Huye", city: "Huye" }, image: "https://res.cloudinary.com/demo/image/upload/v1611151603/doctor5.jpg", licenseNumber: "RMC/2009/002", date: Date.now(), hospitalId: createdHospitals[4]._id, status: "approved", nid: "1197980055443322" }
        ];
        const createdDoctors = await doctorModel.insertMany(doctors);
        console.log("✅ Seeded Doctors");

        // --- 5. SEED USERS (PATIENTS) ---
        const persons = [
            { firstName: "Ivan", lastName: "Sano", email: "sano.ivan@example.com", nid: "1200080011111111" },
            { firstName: "Eric", lastName: "Kamanzi", email: "kamanzi.eric@example.com", nid: "1199080022222222" },
            { firstName: "Aimable", lastName: "Tuyishime", email: "tuyishime.aimable@example.com", nid: "1198080033333333" },
            { firstName: "Gloria", lastName: "Gaju", email: "gaju.gloria@example.com", nid: "1199580044444444" },
            { firstName: "Kevin", lastName: "Mugisha", email: "mugisha.kevin@example.com", nid: "1199880055555555" }
        ];

        const usersData = persons.map(p => ({
            name: `${p.firstName} ${p.lastName}`,
            firstName: p.firstName,
            lastName: p.lastName,
            email: p.email,
            password: hashedPassword,
            role: 'user',
            phone: "078" + Math.floor(1000000 + Math.random() * 9000000),
            gender: Math.random() > 0.5 ? "male" : "female",
            dob: "199" + Math.floor(Math.random() * 9) + "-05-20",
            address: { line1: "Street 23", city: "Kigali", province: "Kigali City", district: "Gasabo", sector: "Kimironko", cell: "Bibare" },
            nid: p.nid,
            onboardingCompleted: true,
            languagePreference: 'English',
            image: "https://res.cloudinary.com/demo/image/upload/v1611151603/user.jpg"
        }));
        const createdUsers = await userModel.insertMany(usersData);
        console.log("✅ Seeded Users");

        // --- 6. SEED LABS ---
        const labs = [
            { name: "Kigali Medical Diagnostic Center", email: "kmdc@example.com", password: hashedPassword, phone: "+250 788 400 100", address: { line1: "Nyarugenge", city: "Kigali" }, speciality: ["Pathology", "Radiology"], fees: 5000 },
            { name: "Bio-Medical Center Kigali", email: "bmc@example.com", password: hashedPassword, phone: "+250 788 400 200", address: { line1: "Gasabo", city: "Kigali" }, speciality: ["Microbiology", "Hematology"], fees: 4000 }
        ];
        await labModel.insertMany(labs);
        console.log("✅ Seeded Labs");

        // --- 7. SEED APPOINTMENTS, VISITS & PRESCRIPTIONS ---
        console.log("⏳ Seeding Clinical Flow...");
        for (let i = 0; i < 5; i++) {
            const user = createdUsers[i];
            const doctor = createdDoctors[i];
            const hospital = createdHospitals[i % createdHospitals.length];

            // 1. Appointment
            const appointment = new appointmentModel({
                userId: user._id.toString(),
                docId: doctor._id.toString(),
                slotDate: "2026_03_1" + (i + 1),
                slotTime: "10:00 AM",
                userData: user.toObject(),
                docData: doctor.toObject(),
                amount: 3000,
                date: Date.now() - (i * 86400000),
                payment: true,
                paymentStatus: 'approved',
                approvalStatus: 'approved',
                approvedAt: new Date(),
                isCompleted: true
            });
            await appointment.save();

            // 2. Vital Signs (Multiple records required by model)
            const vitalList = [
                { type: 'Temperature', value: (36.5 + (Math.random() * 1.5)).toFixed(1), unit: '°C' },
                { type: 'Blood Pressure', value: "120/80", unit: 'mmHg' },
                { type: 'Heart Rate', value: (70 + Math.floor(Math.random() * 15)).toString(), unit: 'bpm' },
                { type: 'Weight', value: (65 + Math.floor(Math.random() * 10)).toString(), unit: 'kg' }
            ];

            const vitalsIds = [];
            for (const v of vitalList) {
                const vitalRecord = new vitalSignModel({
                    userId: user._id.toString(),
                    docId: doctor._id.toString(),
                    appointmentId: appointment._id.toString(),
                    type: v.type,
                    value: v.value,
                    unit: v.unit
                });
                await vitalRecord.save();
                vitalsIds.push(vitalRecord._id);
            }

            // 3. Prescription
            const prescription = new prescriptionModel({
                appointmentId: appointment._id,
                userId: user._id,
                docId: doctor._id,
                facilityId: hospital._id,
                diagnosis: "Routine checkup and vitals assessment",
                medications: [
                    { name: "Paracetamol", dosage: "500mg", frequency: "1-0-1", duration: "3 days", instructions: "Take after food" }
                ],
                status: 'Active'
            });
            await prescription.save();

            // 4. Clinical Visit Record
            const clinicalVisit = new clinicalVisitModel({
                patientId: user._id.toString(),
                docId: doctor._id.toString(),
                facilityId: hospital._id.toString(),
                appointmentId: appointment._id.toString(),
                visitType: 'Outpatient',
                chiefComplaint: "General checkup",
                diagnosis: [{ description: "Stable condition", type: "Primary" }],
                treatmentPlan: "Encouraged regular exercise and balanced diet.",
                vitalSignsId: vitalsIds,
                prescriptionId: prescription._id.toString()
            });
            await clinicalVisit.save();
        }
        console.log("✅ Seeded Clinical Records (Appointments, Vitals, Prescriptions, Visits)");

        console.log("🚀 Database seeding completed successfully!");
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};

seedData();
