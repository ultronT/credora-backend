const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const formData = JSON.parse(event.body);
  const { formType } = formData;

  // These credentials will be set securely in Netlify's panel
  const yourEmail = process.env.EMAIL_USER;
  const yourAppPassword = process.env.EMAIL_PASS;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: yourEmail,
      pass: yourAppPassword,
    },
  });

  let mailToOwner;
  let mailToUser;

  // Logic for Contact & Popup Forms
  if (formType === 'contact' || formType === 'popup') {
    const { name, email, phone, message, subject } = formData;
    mailToOwner = {
      from: yourEmail,
      to: 'management@credoraconsultancy.com',
      subject: `New Lead (${formType}): ${subject || name}`,
      html: `<h2>New Form Submission</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone || 'Not provided'}</p><p><strong>Message:</strong></p><p>${message}</p>`,
    };
    mailToUser = {
      from: `Credora Consultancy <${yourEmail}>`,
      to: email,
      subject: 'Thank you for contacting us!',
      html: `<h2>Thank You, ${name}!</h2><p>We have received your message and will get back to you shortly.</p><p>Best regards,<br>The Credora Consultancy Team</p>`,
    };
  } 
  // Logic for Careers Form
  else if (formType === 'careers') {
    const { fullName, email, phone, position } = formData;
    mailToOwner = {
      from: yourEmail,
      to: 'management@credoraconsultancy.com',
      subject: `New Job Application for ${position}: ${fullName}`,
      html: `<h2>New Job Application</h2><p><strong>Name:</strong> ${fullName}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone}</p><p><strong>Position:</strong> ${position}</p>`,
    };
    mailToUser = {
      from: `Credora Consultancy <${yourEmail}>`,
      to: email,
      subject: 'We have received your application',
      html: `<h2>Thank You, ${fullName}!</h2><p>We have received your application for the <strong>${position}</strong> position. Our team will review it and be in touch if your profile is a match.</p><p>Best regards,<br>The Credora Consultancy Team</p>`,
    };
  } 
  else {
    return { statusCode: 400, body: 'Invalid form type' };
  }

  try {
    await transporter.sendMail(mailToOwner);
    await transporter.sendMail(mailToUser);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Emails sent successfully!' }),
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send emails.' }),
    };
  }
};