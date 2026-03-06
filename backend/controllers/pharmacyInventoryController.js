import medicationModel from '../models/medicationModel.js';
import pharmacyModel from '../models/pharmacyModel.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create medication
export const createMedication = async (req, res) => {
  try {
    const pharmacyId = req.body.pharmacyId;
    const {
      sku,
      name,
      brand,
      category,
      description,
      dosage,
      price,
      stock,
      prescriptionRequired,
      temperatureSensitive,
      storageInstructions
    } = req.body;

    if (!sku || !name || !category || !price) {
      return res.json({ success: false, message: 'Missing required fields' });
    }

    // Check if SKU already exists for this pharmacy
    const existing = await medicationModel.findOne({ pharmacyId, sku });
    if (existing) {
      return res.json({ success: false, message: 'SKU already exists for this pharmacy' });
    }

    const medication = new medicationModel({
      pharmacyId,
      sku,
      name,
      brand: brand || '',
      category,
      description: description || '',
      dosage: dosage || '',
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      prescriptionRequired: prescriptionRequired === 'true' || prescriptionRequired === true,
      temperatureSensitive: temperatureSensitive === 'true' || temperatureSensitive === true,
      storageInstructions: storageInstructions || '',
      images: []
    });

    await medication.save();

    res.json({ success: true, message: 'Medication created', medication });
  } catch (error) {
    console.error('Create medication error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get all medications
export const getMedications = async (req, res) => {
  try {
    const pharmacyId = req.body.pharmacyId;
    const { category, search, lowStock } = req.query;

    let query = { pharmacyId };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    if (lowStock === 'true') {
      query.stock = { $lt: 10 };
    }

    const medications = await medicationModel.find(query).sort({ createdAt: -1 });

    res.json({ success: true, medications });
  } catch (error) {
    console.error('Get medications error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get single medication
export const getMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.body.pharmacyId;

    const medication = await medicationModel.findOne({ _id: id, pharmacyId });
    if (!medication) {
      return res.json({ success: false, message: 'Medication not found' });
    }

    res.json({ success: true, medication });
  } catch (error) {
    console.error('Get medication error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Update medication
export const updateMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.body.pharmacyId;
    const updateData = req.body;

    const medication = await medicationModel.findOne({ _id: id, pharmacyId });
    if (!medication) {
      return res.json({ success: false, message: 'Medication not found' });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'pharmacyId' && key !== 'createdAt') {
        if (key === 'price' || key === 'stock') {
          medication[key] = parseFloat(updateData[key]);
        } else if (key === 'prescriptionRequired' || key === 'temperatureSensitive') {
          medication[key] = updateData[key] === 'true' || updateData[key] === true;
        } else {
          medication[key] = updateData[key];
        }
      }
    });

    medication.updatedAt = new Date();
    await medication.save();

    res.json({ success: true, message: 'Medication updated', medication });
  } catch (error) {
    console.error('Update medication error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Delete medication
export const deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.body.pharmacyId;

    const medication = await medicationModel.findOneAndDelete({ _id: id, pharmacyId });
    if (!medication) {
      return res.json({ success: false, message: 'Medication not found' });
    }

    res.json({ success: true, message: 'Medication deleted' });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Bulk upload medications (CSV/XLSX)
export const bulkUploadMedications = async (req, res) => {
  try {
    const pharmacyId = req.body.pharmacyId;
    const { medications } = req.body; // Array of medication objects

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return res.json({ success: false, message: 'Invalid medications data' });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const med of medications) {
      try {
        // Check if SKU exists
        const existing = await medicationModel.findOne({ pharmacyId, sku: med.sku });
        if (existing) {
          results.failed.push({ sku: med.sku, reason: 'SKU already exists' });
          continue;
        }

        const medication = new medicationModel({
          pharmacyId,
          sku: med.sku,
          name: med.name,
          brand: med.brand || '',
          category: med.category || 'General',
          description: med.description || '',
          dosage: med.dosage || '',
          price: parseFloat(med.price) || 0,
          stock: parseInt(med.stock) || 0,
          prescriptionRequired: med.prescriptionRequired === true || med.prescriptionRequired === 'true',
          temperatureSensitive: med.temperatureSensitive === true || med.temperatureSensitive === 'true',
          storageInstructions: med.storageInstructions || '',
          images: []
        });

        await medication.save();
        results.success.push(med.sku);
      } catch (error) {
        results.failed.push({ sku: med.sku, reason: error.message });
      }
    }

    res.json({
      success: true,
      message: `Uploaded ${results.success.length} medications, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Public: list medications for a specific pharmacy
export const getMedicationsPublic = async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    if (!pharmacyId) {
      return res.json({ success: false, message: 'Pharmacy ID is required' });
    }

    const pharmacy = await pharmacyModel.findById(pharmacyId);
    if (!pharmacy || pharmacy.status !== 'APPROVED' || !pharmacy.verified) {
      return res.json({ success: false, message: 'Pharmacy not found or not approved' });
    }

    const medications = await medicationModel
      .find({ pharmacyId })
      .select('name dosage price stock category prescriptionRequired temperatureSensitive description');

    res.json({ success: true, medications });
  } catch (error) {
    console.error('Get medications public error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Public: search medications across pharmacies
export const searchMedicationsPublic = async (req, res) => {
  try {
    const { search, pharmacyId, category } = req.query;

    const approvedPharmacies = await pharmacyModel
      .find({ status: 'APPROVED', verified: true })
      .select('_id');
    const approvedIds = approvedPharmacies.map((p) => p._id);

    let query = { pharmacyId: { $in: approvedIds } };

    if (pharmacyId) {
      query.pharmacyId = pharmacyId;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { dosage: { $regex: search, $options: 'i' } }
      ];
    }

    const medications = await medicationModel
      .find(query)
      .populate('pharmacyId', 'name phone address')
      .sort({ name: 1 });

    res.json({ success: true, medications });
  } catch (error) {
    console.error('Search medications public error:', error);
    res.json({ success: false, message: error.message });
  }
};

