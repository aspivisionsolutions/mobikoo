exports.initiatePayment = (req, res) => {
  const { customer, plan, device } = req.body;

  // Simulate a dummy payment session (sandbox)
  const dummyPaymentSession = {
    paymentSessionId: 'dummy-session-' + Date.now(),
    paymentUrl: 'https://sandbox.cashfree.com/dummy-payment',
    customer,
    plan,
    device,
  };

  res.json({
    success: true,
    paymentSession: dummyPaymentSession,
    message: 'Dummy payment session created',
  });
};

exports.paymentCallback = (req, res) => {
  const { paymentStatus, customer, plan, device } = req.body;

  // Log all details in a DB-friendly format
  const logData = {
    paymentStatus,
    customer,
    plan,
    device,
    createdAt: new Date(),
  };

  console.log('LandingPage Dummy Payment Record:', JSON.stringify(logData, null, 2));

  res.json({ success: true, message: 'Payment processed (dummy)', data: logData });
};