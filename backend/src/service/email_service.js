const nodemailer = require("nodemailer");

// Konfigurimi i transporter-it
const transporter = nodemailer.createTransport({
  service: "gmail", // mund të përdorësh Gmail ose ndonjë tjetër
  auth: {
    user: "emailjuaj@gmail.com",
    pass: "passwordiapoAppPassword",
  },
});

async function sendWateringNotification(toEmail, plantName) {
  const mailOptions = {
    from: '"Plant Care App" <emailjuaj@gmail.com>',
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
