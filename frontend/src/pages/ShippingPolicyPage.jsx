import React from 'react';

const ShippingPolicyPage = () => {
  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <h1>Shipping Policy</h1>
      
      <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Delivery Timeline</h2>
          <ul>
            <li><strong>Standard Shipping:</strong> 5-7 business days</li>
            <li><strong>Express Shipping:</strong> 2-3 business days</li>
            <li><strong>Overnight Shipping:</strong> Next business day (where available)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Shipping Charges</h2>
          <p>
            Orders under ₹500: ₹50<br />
            Orders ₹500 - ₹2000: ₹100<br />
            Orders above ₹2000: FREE Shipping
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Shipping Areas</h2>
          <p>
            We currently ship to all major cities across India. Delivery times may vary based on location and local conditions. We use reliable courier partners to ensure your products reach safely and on time.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Order Tracking</h2>
          <p>
            Once your order is shipped, you will receive a tracking ID via email. You can use this to track your package in real-time on the courier's website.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Damaged or Lost Items</h2>
          <p>
            If your package arrives damaged or is lost in transit, please contact our customer support team immediately with photos of the damage. We will initiate a replacement or refund process.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Contact Us</h2>
          <p>
            For shipping inquiries, email us at: <strong>support@fixnfit.com</strong><br />
            Phone: <strong>+91 12345 67890</strong><br />
            Hours: Mon-Sat, 9:00 AM - 6:00 PM
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
