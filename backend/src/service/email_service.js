const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
} else {
  console.warn(
    "Email credentials not provided. Set EMAIL_USER and EMAIL_PASS in .env to enable notifications."
  );
}

async function sendWateringNotification(toEmail, plantName) {
  if (!transporter) {
    console.warn("Skipping email send: transporter not configured");
    return;
  }

  const mailOptions = {
    from: `"Plant Care App" <${EMAIL_USER}>`,
    to: toEmail,
    subject: `Time to water your plant: ${plantName}`,
    text: `Hello! It's time to water your plant "${plantName}". Keep it healthy! 🌱`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to ${toEmail} for plant ${plantName}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = {
  sendWateringNotification,
};
