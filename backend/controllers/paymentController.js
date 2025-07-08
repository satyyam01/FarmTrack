const razorpay = require('../utils/razorpay');
const crypto = require('crypto');
const Farm = require('../models/farm');
const Subscription = require('../models/subscription');

// Test Razorpay connection by fetching orders (universal API call)
exports.testConnection = async (req, res) => {
  try {
    // Fetch all orders (as a simple test API call)
    const orders = await razorpay.orders.all({ count: 1 });
    res.status(200).json({ success: true, message: 'Razorpay connection successful', orders });
  } catch (error) {
    console.error('Razorpay connection error:', error);
    res.status(500).json({ success: false, message: 'Razorpay connection failed', error });
  }
};

// Create a Razorpay order for farm premium upgrade
exports.createOrder = async (req, res) => {
  try {
    const { farmId, amount } = req.body;
    if (!farmId || !amount) {
      return res.status(400).json({ success: false, message: 'farmId and amount are required' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `farm-${farmId.slice(-6)}-${Date.now()}`.slice(0, 40),
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create Razorpay order', error });
  }
};

// Verify Razorpay payment and activate premium
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, farmId, amount } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !farmId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify signature
    const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Activate premium for the farm (1 month from now)
    const premiumDurationMs = 30 * 24 * 60 * 60 * 1000; // 1 month
    const premiumExpiry = new Date(Date.now() + premiumDurationMs);
    const animalLimit = 100; // Example premium limit
    const allowedRoles = ['owner', 'vet', 'worker'];

    // Update farm
    const farm = await Farm.findByIdAndUpdate(
      farmId,
      {
        isPremium: true,
        premiumExpiry,
        animalLimit,
        allowedRoles
      },
      { new: true }
    );

    // Create subscription record
    const subscription = await Subscription.create({
      user: farm.owner,
      planType: 'premium',
      startDate: new Date(),
      endDate: premiumExpiry,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'active',
      amount,
      currency: 'INR'
    });

    // Link subscription to farm
    farm.subscription = subscription._id;
    await farm.save();

    res.status(200).json({ success: true, message: 'Payment verified and premium activated', farm, subscription });
  } catch (error) {
    console.error('Razorpay payment verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment', error });
  }
}; 