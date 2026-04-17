import React from 'react';

const ReturnsPage = () => {
  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <h1>Returns & Exchange Policy</h1>
      
      <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Return Window</h2>
          <p>
            You have <strong>30 days</strong> from the date of delivery to return or exchange your product. After 30 days, no returns or exchanges will be accepted.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Return Conditions</h2>
          <p>To be eligible for a return or exchange:</p>
          <ul>
            <li>Product must be in its original packaging and condition</li>
            <li>All accessories and documentation must be included</li>
            <li>Product should not show signs of use or damage</li>
            <li>Receipt or proof of purchase must be provided</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Non-Returnable Items</h2>
          <p>The following items cannot be returned:</p>
          <ul>
            <li>Items purchased as final sale</li>
            <li>Damaged products due to customer misuse</li>
            <li>Products without original packaging</li>
            <li>Items used beyond testing</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>How to Return</h2>
          <ol>
            <li>Contact our customer service team with your order number</li>
            <li>Get a return authorization (RMA) number</li>
            <li>Ship the item back to us with the RMA number clearly marked</li>
            <li>Once received and inspected, your refund will be processed</li>
          </ol>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Refund Processing</h2>
          <p>
            Refunds are processed within <strong>7-10 business days</strong> after we receive and verify your returned item. The refund will be credited to your original payment method.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Shipping Costs</h2>
          <p>
            <strong>Free Returns:</strong> For defective products or items damaged during shipping<br />
            <strong>Paid Returns:</strong> For returns due to change of mind (customer bears shipping cost)
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Exchanges</h2>
          <p>
            If you want to exchange for a different product, you can do so within 30 days. Simply contact us with your request. No additional charges apply if exchanging for a product of equal or lesser value.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Contact Us</h2>
          <p>
            For returns or exchanges, email us at: <strong>support@fixnfit.com</strong><br />
            Phone: <strong>+91 12345 67890</strong><br />
            Hours: Mon-Sat, 9:00 AM - 6:00 PM
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReturnsPage;
