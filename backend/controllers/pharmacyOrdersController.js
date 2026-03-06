import pharmacyOrderModel from '../models/pharmacyOrderModel.js';
import medicationModel from '../models/medicationModel.js';
import pharmacyModel from '../models/pharmacyModel.js';
import { v2 as cloudinary } from 'cloudinary';
import connectCloudinary from '../config/cloudinary.js';

// Ensure Cloudinary is configured
connectCloudinary();

// Create order from patient (public endpoint via user API)
export const createOrderFromPatient = async (req, res) => {
  try {
    const userId = req.body.userId;
    const {
      pharmacyId,
      items,
      deliveryAddress,
      paymentType // 'self' | 'insurance'
    } = req.body;

    if (!userId) {
      return res.json({ success: false, message: 'User not authenticated' });
    }

    if (!pharmacyId) {
      return res.json({ success: false, message: 'Pharmacy is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: 'At least one medication is required' });
    }

    // Validate pharmacy exists and is approved
    const pharmacy = await pharmacyModel.findById(pharmacyId);
    if (!pharmacy || pharmacy.status !== 'APPROVED' || !pharmacy.verified) {
      return res.json({ success: false, message: 'Selected pharmacy is not available' });
    }

    // Upload prescription image if provided
    let prescriptionImageUrl = null;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'pharmacy_prescriptions',
          resource_type: 'image'
        });
        prescriptionImageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('❌ Prescription upload error:', uploadError);
        return res.json({ success: false, message: 'Failed to upload prescription image' });
      }
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const qty = Number(item.qty || 0);
      if (!qty || qty <= 0) continue;

      let medication = null;
      if (item.medicationId) {
        medication = await medicationModel.findOne({
          _id: item.medicationId,
          pharmacyId
        });
        if (!medication) {
          return res.json({
            success: false,
            message: 'Medication not found for this pharmacy'
          });
        }
      } else if (item.name) {
        const name = item.name.trim();
        medication = await medicationModel.findOne({ pharmacyId, name });
        if (!medication) {
          medication = await medicationModel.create({
            pharmacyId,
            sku: `AUTO-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
            name,
            brand: item.brand || '',
            category: item.category || 'General',
            description: item.description || '',
            dosage: item.dosage || '',
            price: Number(item.price || 0),
            stock: 0,
            batch: [],
            prescriptionRequired: true,
            temperatureSensitive: false,
            storageInstructions: ''
          });
        }
      }

      if (!medication) continue;
      const linePrice =
        typeof item.price === 'number' && item.price > 0
          ? item.price
          : medication.price || 0;
      total += linePrice * qty;

      orderItems.push({
        medicationId: medication._id,
        qty,
        price: linePrice,
        batchNumber: null
      });
    }

    if (orderItems.length === 0) {
      return res.json({ success: false, message: 'No valid medications to order' });
    }

    if (!deliveryAddress || !deliveryAddress.line1 || !deliveryAddress.city) {
      return res.json({ success: false, message: 'Delivery address is incomplete' });
    }

    const orderStatus = paymentType === 'insurance' ? 'Pending' : 'Verified';
    const now = new Date();

    const order = new pharmacyOrderModel({
      patientId: userId,
      pharmacyId,
      items: orderItems,
      total,
      paymentStatus: paymentType === 'insurance' ? 'pending' : 'pending',
      prescriptionImageUrl,
      orderStatus,
      deliveryAddress: {
        line1: deliveryAddress.line1,
        line2: deliveryAddress.line2 || '',
        city: deliveryAddress.city,
        country: deliveryAddress.country || 'Rwanda'
      },
      messages: [{
        sender: 'patient',
        text: paymentType === 'insurance'
          ? 'Order placed using insurance (pending verification).'
          : 'Order placed with self-payment.',
        createdAt: new Date()
      }],
      audit: [{
        action: `Order created (${paymentType})`,
        byUserId: userId,
        byUserModel: 'user',
        timestamp: now,
        note: paymentType === 'insurance' ? 'Requires pharmacy confirmation' : 'Auto-verified'
      }],
      verifiedAt: paymentType === 'insurance' ? null : now
    });

    const savedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Create order from patient error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get reports
export const getReports = async (req, res) => {
  try {
    const pharmacyId = req.body.pharmacyId;
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Daily sales
    const orders = await pharmacyOrderModel.find({
      pharmacyId,
      ...dateQuery,
      orderStatus: { $in: ['Shipped', 'Delivered'] }
    });

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;

    // Orders by status
    const ordersByStatus = await pharmacyOrderModel.aggregate([
      { $match: { pharmacyId, ...dateQuery } },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    // Average fulfillment time
    const fulfilledOrders = await pharmacyOrderModel.find({
      pharmacyId,
      ...dateQuery,
      deliveredAt: { $exists: true }
    });

    let avgFulfillmentTime = 0;
    if (fulfilledOrders.length > 0) {
      const totalTime = fulfilledOrders.reduce((sum, order) => {
        const timeDiff = order.deliveredAt - order.createdAt;
        return sum + (timeDiff / (1000 * 60 * 60)); // Convert to hours
      }, 0);
      avgFulfillmentTime = totalTime / fulfilledOrders.length;
    }

    res.json({
      success: true,
      reports: {
        totalSales,
        totalOrders,
        ordersByStatus,
        avgFulfillmentTime: Math.round(avgFulfillmentTime * 100) / 100,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const pharmacyId = req.body.pharmacyId;
    const { status, startDate, endDate } = req.query;

    let query = { pharmacyId };

    if (status) {
      query.orderStatus = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await pharmacyOrderModel.find(query)
      .populate('patientId', 'name email phone address')
      .populate('items.medicationId', 'name sku price')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.body.pharmacyId;

    const order = await pharmacyOrderModel.findOne({ _id: id, pharmacyId })
      .populate('patientId', 'name email phone address')
      .populate('items.medicationId', 'name sku price images');

    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, courier, note } = req.body;
    const pharmacyId = req.body.pharmacyId;
    const pharmacyUserId = req.body.pharmacyUserId;

    const order = await pharmacyOrderModel.findOne({ _id: id, pharmacyId })
      .populate('patientId', 'name email');
    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    const validStatuses = ['Pending', 'Verified', 'Rejected', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.json({ success: false, message: 'Invalid status' });
    }

    // Update status
    order.orderStatus = status;

    // Set timestamps
    if (status === 'Verified' && !order.verifiedAt) {
      order.verifiedAt = new Date();
    }
    if (status === 'Shipped' && !order.shippedAt) {
      order.shippedAt = new Date();
      if (courier) {
        order.courier = { ...order.courier, ...courier };
      }
    }
    if (status === 'Delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    // Add audit log
    order.audit.push({
      action: `Status changed to ${status}`,
      byUserId: pharmacyUserId,
      byUserModel: 'pharmacyuser',
      timestamp: new Date(),
      note: note || ''
    });

    order.updatedAt = new Date();
    await order.save();

    // Send email notification to patient
    if (order.patientId && order.patientId.email) {
      // Dynamic import
      const { sendEmail } = await import('../utils/emailService.js');
      const emailSubject = `Order Status Update: ${status} - One Healthline Connect`;
      const emailText = `Your pharmacy order #${order._id.toString().slice(-6)} status has been updated to "${status}". ${note ? `\n\nNote: ${note}` : ''}\n\nThank you for using One Healthline Connect.`;

      await sendEmail({
        to: order.patientId.email,
        subject: emailSubject,
        text: emailText,
        html: `<p>Hello ${order.patientId.name},</p><p>Your pharmacy order <strong>#${order._id.toString().slice(-6)}</strong> status has been updated to <strong>${status}</strong>.</p>${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}<p>Thank you for using One Healthline Connect.</p>`
      });
    }

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Add message to order (Pharmacy)
export const addOrderMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body; // Expect sender to be passed or derived
    const pharmacyId = req.body.pharmacyId;

    if (!text || !text.trim()) {
      return res.json({ success: false, message: 'Message text required' });
    }

    const order = await pharmacyOrderModel.findOne({ _id: id, pharmacyId })
      .populate('patientId', 'name email');

    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    order.messages.push({
      sender: 'pharmacy',
      text: text.trim(),
      createdAt: new Date()
    });

    await order.save();

    // Send email notification to patient
    if (order.patientId && order.patientId.email) {
      const { sendEmail } = await import('../utils/emailService.js');
      const emailSubject = `New Message from Pharmacy - Order #${order._id.toString().slice(-6)}`;

      await sendEmail({
        to: order.patientId.email,
        subject: emailSubject,
        text: `You have received a new message from the pharmacy regarding order #${order._id.toString().slice(-6)}:\n\n"${text.trim()}"\n\nPlease log in to reply.`,
        html: `<p>Hello ${order.patientId.name},</p><p>You have received a new message from the pharmacy regarding order <strong>#${order._id.toString().slice(-6)}</strong>:</p><blockquote>${text.trim()}</blockquote><p>Please log in to your dashboard to reply.</p>`
      });
    }

    res.json({ success: true, message: 'Message added', order });
  } catch (error) {
    console.error('Add order message error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Add message to order (Patient)
export const addOrderMessageFromPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.body.userId; // From authUser middleware

    if (!text || !text.trim()) {
      return res.json({ success: false, message: 'Message text required' });
    }

    const order = await pharmacyOrderModel.findOne({ _id: id, patientId: userId })
      .populate('pharmacyId', 'email name'); // Populate pharmacy details for email

    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    order.messages.push({
      sender: 'patient',
      text: text.trim(),
      createdAt: new Date()
    });

    await order.save();

    // Send email notification to Pharmacy
    if (order.pharmacyId && order.pharmacyId.email) {
      const { sendEmail } = await import('../utils/emailService.js');
      const emailSubject = `New Message from Patient - Order #${order._id.toString().slice(-6)}`;

      await sendEmail({
        to: order.pharmacyId.email,
        subject: emailSubject,
        text: `You have received a new message from the patient regarding order #${order._id.toString().slice(-6)}:\n\n"${text.trim()}"\n\nPlease log in to the pharmacy dashboard to reply.`,
        html: `<p>Hello ${order.pharmacyId.name},</p><p>You have received a new message from the patient regarding order <strong>#${order._id.toString().slice(-6)}</strong>:</p><blockquote>${text.trim()}</blockquote><p>Please log in to your dashboard to reply.</p>`
      });
    }

    res.json({ success: true, message: 'Message added', order });
  } catch (error) {
    console.error('Add patient message error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get single order (Patient)
export const getPatientOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId; // From authUser

    const order = await pharmacyOrderModel.findOne({ _id: id, patientId: userId })
      .populate('pharmacyId', 'name email phone address') // Populate pharmacy info
      .populate('items.medicationId', 'name sku price images');

    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get patient order error:', error);
    res.json({ success: false, message: error.message });
  }
};


