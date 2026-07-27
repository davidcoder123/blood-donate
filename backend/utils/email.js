const { Resend } = require("resend");

// Initialize Resend using your API Key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Define default sender address
// Note: Use 'onboarding@resend.dev' for testing. Once you verify a custom domain in Resend,
// update process.env.RESEND_FROM_EMAIL to "Blood Donor Finder <noreply@yourdomain.com>"
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Blood Donor Finder <onboarding@resend.dev>";

// Send OTP email for registration verification
const sendOTP = async (email, otp) => {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Your Email Verification OTP",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px">
        <h2 style="color:#dc2626">🩸 Blood Donate</h2>
        <p>Your OTP for email verification:</p>
        <div style="background:#f3f4f6;padding:20px;text-align:center;font-size:36px;
                    font-weight:bold;letter-spacing:12px;border-radius:8px;color:#1f2937">
          ${otp}
        </div>
        <p style="color:#6b7280;margin-top:16px">This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color:#6b7280">If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};

// Send blood request alert to matching donors
const sendBloodAlert = async (donor, request) => {
  const hospitalPhone = request.hospital?.phone || "";
  const waLink = `https://wa.me/${hospitalPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi, I saw the urgent ${request.bloodGroup} blood request at ${request.hospital?.hospitalName}. I can donate.`,
  )}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: donor.email,
    subject: `🩸 Urgent Blood Request - ${request.bloodGroup} Needed`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#dc2626;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">🩸 Urgent Blood Request</h1>
        </div>
        <div style="padding:30px;background:#f9fafb">
          <p>Dear <strong>${donor.name}</strong>,</p>
          <p>An urgent blood request has been posted near you.</p>
          <div style="background:white;border-left:4px solid #dc2626;padding:20px;
                      margin:20px 0;border-radius:4px">
            <h2 style="color:#dc2626;margin:0 0 12px">${request.bloodGroup} Blood Needed</h2>
            <p><strong>Hospital:</strong> ${request.hospital?.hospitalName}</p>
            <p><strong>Units needed:</strong> ${request.unitsNeeded}</p>
            <p><strong>Urgency:</strong> ${request.urgency.toUpperCase()}</p>
            <p><strong>City:</strong> ${request.hospital?.city}, ${request.hospital?.state || ""}</p>
              ${
                request.hospital?.address
                  ? `<p><strong>Address:</strong> ${request.hospital.address}</p>`
                  : ""
              }
              ${request.notes ? `<p><strong>Notes:</strong> ${request.notes}</p>` : ""}
              ${
                request.hospital?.address
                  ? `<p><strong>📍 Location:</strong> 
                    <a href="https://www.google.com/maps/search/${encodeURIComponent(request.hospital.address)}" 
                      target="_blank"
                      style="color:#dc2626;font-weight:bold;">
                      View on Google Maps
                    </a>
                  </p>`
                  : request.hospital?.location?.coordinates &&
                      request.hospital.location.coordinates[0] !== 0
                    ? `<p><strong>📍 Location:</strong> 
                      <a href="https://www.google.com/maps?q=${request.hospital.location.coordinates[1]},${request.hospital.location.coordinates[0]}" 
                        target="_blank"
                        style="color:#dc2626;font-weight:bold;">
                        View on Google Maps
                      </a>
                    </p>`
                    : ""
              }
          </div>
          <div style="text-align:center;margin:20px 0">
            <a href="${process.env.CLIENT_URL}/donor" 
               style="background:#dc2626;color:white;padding:14px 28px;
                      text-decoration:none;border-radius:8px;font-size:15px">
              View &amp; Respond
            </a>
          </div>
          <div style="text-align:center;margin:16px 0">
            <a href="${waLink}"
               style="background:#25D366;color:white;padding:12px 24px;
                      text-decoration:none;border-radius:8px;font-size:14px">
              💬 WhatsApp Hospital
            </a>
          </div>
        </div>
      </div>
    `,
  });
};

// Hospital approval/rejection email
const sendApprovalEmail = async (hospital, approved) => {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: hospital.email,
    subject: approved
      ? "✅ Hospital Account Approved"
      : "❌ Hospital Account Rejected",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px">
        <h2 style="color:${approved ? "#16a34a" : "#dc2626"}">
          ${approved ? "✅ Account Approved" : "❌ Account Rejected"}
        </h2>
        <p>Dear <strong>${hospital.hospitalName}</strong>,</p>
        <p>Your hospital account has been <strong>${approved ? "approved" : "rejected"}</strong>.</p>
        ${
          approved
            ? `<p>You can now <a href="${process.env.CLIENT_URL}/login">login</a> and post blood requests.</p>`
            : "<p>Please contact support for more information.</p>"
        }
      </div>
    `,
  });
};

// Password reset email
const sendPasswordReset = async (email, resetUrl) => {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px">
        <h2 style="color:#dc2626">🩸 Password Reset</h2>
        <p>You requested a password reset. Click the button below:</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${resetUrl}" style="background:#dc2626;color:white;padding:14px 28px;
                                       text-decoration:none;border-radius:8px">
            Reset Password
          </a>
        </div>
        <p style="color:#6b7280">This link expires in <strong>1 hour</strong>.</p>
        <p style="color:#6b7280">If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  sendOTP,
  sendBloodAlert,
  sendApprovalEmail,
  sendPasswordReset,
};

// console.log("GMAIL_USER:", process.env.GMAIL_USER);
// console.log("GMAIL_PASS:", process.env.GMAIL_PASS ? "Loaded" : "Missing");

// const nodemailer = require("nodemailer");

// // Gmail transporter configured for Port 465 (SSL)
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true, // true for port 465, false for other ports
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS, // Make sure this is a 16-character Google App Password!
//   },
//   // Timeouts to prevent hanging requests on network delay
//   connectionTimeout: 10000,
//   greetingTimeout: 5000,
//   socketTimeout: 10000,
// });

// transporter.verify((error, success) => {
//   if (error) {
//     console.error("❌ SMTP Connection Error:", error);
//   } else {
//     console.log("✅ SMTP Ready to send emails");
//   }
// });

// // Send OTP email for registration verification
// const sendOTP = async (email, otp) => {
//   await transporter.sendMail({
//     from: `"Blood Donor Finder" <${process.env.GMAIL_USER}>`,
//     to: email,
//     subject: "Your Email Verification OTP",
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px">
//         <h2 style="color:#dc2626">🩸 Blood Donate</h2>
//         <p>Your OTP for email verification:</p>
//         <div style="background:#f3f4f6;padding:20px;text-align:center;font-size:36px;
//                     font-weight:bold;letter-spacing:12px;border-radius:8px;color:#1f2937">
//           ${otp}
//         </div>
//         <p style="color:#6b7280;margin-top:16px">This OTP expires in <strong>10 minutes</strong>.</p>
//         <p style="color:#6b7280">If you did not request this, ignore this email.</p>
//       </div>
//     `,
//   });
// };

// // Send blood request alert to matching donors
// const sendBloodAlert = async (donor, request) => {
//   const hospitalPhone = request.hospital?.phone || "";
//   const waLink = `https://wa.me/${hospitalPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
//     `Hi, I saw the urgent ${request.bloodGroup} blood request at ${request.hospital?.hospitalName}. I can donate.`,
//   )}`;

//   await transporter.sendMail({
//     from: `"Blood Donor Finder" <${process.env.GMAIL_USER}>`,
//     to: donor.email,
//     subject: `🩸 Urgent Blood Request - ${request.bloodGroup} Needed`,
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
//         <div style="background:#dc2626;padding:20px;text-align:center">
//           <h1 style="color:white;margin:0">🩸 Urgent Blood Request</h1>
//         </div>
//         <div style="padding:30px;background:#f9fafb">
//           <p>Dear <strong>${donor.name}</strong>,</p>
//           <p>An urgent blood request has been posted near you.</p>
//           <div style="background:white;border-left:4px solid #dc2626;padding:20px;
//                       margin:20px 0;border-radius:4px">
//             <h2 style="color:#dc2626;margin:0 0 12px">${request.bloodGroup} Blood Needed</h2>
//             <p><strong>Hospital:</strong> ${request.hospital?.hospitalName}</p>
//             <p><strong>Units needed:</strong> ${request.unitsNeeded}</p>
//             <p><strong>Urgency:</strong> ${request.urgency.toUpperCase()}</p>
//             <p><strong>City:</strong> ${request.hospital?.city}, ${request.hospital?.state || ""}</p>
//               ${
//                 request.hospital?.address
//                   ? `<p><strong>Address:</strong> ${request.hospital.address}</p>`
//                   : ""
//               }
//               ${request.notes ? `<p><strong>Notes:</strong> ${request.notes}</p>` : ""}
//               ${
//                 request.hospital?.address
//                   ? `<p><strong>📍 Location:</strong>
//                     <a href="https://www.google.com/maps/search/${encodeURIComponent(request.hospital.address)}"
//                       target="_blank"
//                       style="color:#dc2626;font-weight:bold;">
//                       View on Google Maps
//                     </a>
//                   </p>`
//                   : request.hospital?.location?.coordinates &&
//                       request.hospital.location.coordinates[0] !== 0
//                     ? `<p><strong>📍 Location:</strong>
//                       <a href="https://www.google.com/maps?q=${request.hospital.location.coordinates[1]},${request.hospital.location.coordinates[0]}"
//                         target="_blank"
//                         style="color:#dc2626;font-weight:bold;">
//                         View on Google Maps
//                       </a>
//                     </p>`
//                     : ""
//               }

//           </div>
//           <div style="text-align:center;margin:20px 0">
//             <a href="${process.env.CLIENT_URL}/donor"
//                style="background:#dc2626;color:white;padding:14px 28px;
//                       text-decoration:none;border-radius:8px;font-size:15px">
//               View &amp; Respond
//             </a>
//           </div>
//           <div style="text-align:center;margin:16px 0">
//             <a href="${waLink}"
//                style="background:#25D366;color:white;padding:12px 24px;
//                       text-decoration:none;border-radius:8px;font-size:14px">
//               💬 WhatsApp Hospital
//             </a>
//           </div>
//         </div>
//       </div>
//     `,
//   });
// };

// // Hospital approval/rejection email
// const sendApprovalEmail = async (hospital, approved) => {
//   await transporter.sendMail({
//     from: `"Blood Donor Finder" <${process.env.GMAIL_USER}>`,
//     to: hospital.email,
//     subject: approved
//       ? "✅ Hospital Account Approved"
//       : "❌ Hospital Account Rejected",
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px">
//         <h2 style="color:${approved ? "#16a34a" : "#dc2626"}">
//           ${approved ? "✅ Account Approved" : "❌ Account Rejected"}
//         </h2>
//         <p>Dear <strong>${hospital.hospitalName}</strong>,</p>
//         <p>Your hospital account has been <strong>${approved ? "approved" : "rejected"}</strong>.</p>
//         ${
//           approved
//             ? `<p>You can now <a href="${process.env.CLIENT_URL}/login">login</a> and post blood requests.</p>`
//             : "<p>Please contact support for more information.</p>"
//         }
//       </div>
//     `,
//   });
// };

// // Password reset email
// const sendPasswordReset = async (email, resetUrl) => {
//   await transporter.sendMail({
//     from: `"Blood Donor Finder" <${process.env.GMAIL_USER}>`,
//     to: email,
//     subject: "Password Reset Request",
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px">
//         <h2 style="color:#dc2626">🩸 Password Reset</h2>
//         <p>You requested a password reset. Click the button below:</p>
//         <div style="text-align:center;margin:24px 0">
//           <a href="${resetUrl}" style="background:#dc2626;color:white;padding:14px 28px;
//                                        text-decoration:none;border-radius:8px">
//             Reset Password
//           </a>
//         </div>
//         <p style="color:#6b7280">This link expires in <strong>1 hour</strong>.</p>
//         <p style="color:#6b7280">If you did not request this, ignore this email.</p>
//       </div>
//     `,
//   });
// };

// module.exports = {
//   sendOTP,
//   sendBloodAlert,
//   sendApprovalEmail,
//   sendPasswordReset,
// };

// console.log("GMAIL_USER:", process.env.GMAIL_USER);
// console.log("GMAIL_PASS:", process.env.GMAIL_PASS ? "Loaded" : "Missing");

// const nodemailer = require("nodemailer");

// // Gmail transporter - free forever
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS, // Use App Password, not your real password
//   },
// });

// transporter.verify((error, success) => {
//   if (error) {
//     console.error("SMTP Error:", error);
//   } else {
//     console.log("SMTP Ready");
//   }
// });

// // Send OTP email for registration verification
// const sendOTP = async (email, otp) => {
//   await transporter.sendMail({
//     from: `"Blood Donor Finder" <${process.env.GMAIL_USER}>`,
//     to: email,
//     subject: "Your Email Verification OTP",
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px">
//         <h2 style="color:#dc2626">🩸 Blood Donate</h2>
//         <p>Your OTP for email verification:</p>
//         <div style="background:#f3f4f6;padding:20px;text-align:center;font-size:36px;
//                     font-weight:bold;letter-spacing:12px;border-radius:8px;color:#1f2937">
//           ${otp}
//         </div>
//         <p style="color:#6b7280;margin-top:16px">This OTP expires in <strong>10 minutes</strong>.</p>
//         <p style="color:#6b7280">If you did not request this, ignore this email.</p>
//       </div>
//     `,
//   });
// };

// // Send blood request alert to matching donors
// const sendBloodAlert = async (donor, request) => {
//   const hospitalPhone = request.hospital?.phone || "";
//   const waLink = `https://wa.me/${hospitalPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
//     `Hi, I saw the urgent ${request.bloodGroup} blood request at ${request.hospital?.hospitalName}. I can donate.`,
//   )}`;

//   await transporter.sendMail({
//     from: `"Blood Donor Finder" <${process.env.GMAIL_USER}>`,
//     to: donor.email,
//     subject: `🩸 Urgent Blood Request - ${request.bloodGroup} Needed`,
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
//         <div style="background:#dc2626;padding:20px;text-align:center">
//           <h1 style="color:white;margin:0">🩸 Urgent Blood Request</h1>
//         </div>
//         <div style="padding:30px;background:#f9fafb">
//           <p>Dear <strong>${donor.name}</strong>,</p>
//           <p>An urgent blood request has been posted near you.</p>
//           <div style="background:white;border-left:4px solid #dc2626;padding:20px;
//                       margin:20px 0;border-radius:4px">
//             <h2 style="color:#dc2626;margin:0 0 12px">${request.bloodGroup} Blood Needed</h2>
//             <p><strong>Hospital:</strong> ${request.hospital?.hospitalName}</p>
//             <p><strong>Units needed:</strong> ${request.unitsNeeded}</p>
//             <p><strong>Urgency:</strong> ${request.urgency.toUpperCase()}</p>
//             <p><strong>City:</strong> ${request.hospital?.city}, ${request.hospital?.state || ""}</p>
//               ${
//                 request.hospital?.address
//                   ? `<p><strong>Address:</strong> ${request.hospital.address}</p>`
//                   : ""
//               }
//               ${request.notes ? `<p><strong>Notes:</strong> ${request.notes}</p>` : ""}
//               ${
//                 request.hospital?.address
//                   ? `<p><strong>📍 Location:</strong>
//                     <a href="https://www.google.com/maps/search/${encodeURIComponent(request.hospital.address)}"
//                       target="_blank"
//                       style="color:#dc2626;font-weight:bold;">
//                       View on Google Maps
//                     </a>
//                   </p>`
//                   : request.hospital?.location?.coordinates &&
//                       request.hospital.location.coordinates[0] !== 0
//                     ? `<p><strong>📍 Location:</strong>
//                       <a href="https://www.google.com/maps?q=${request.hospital.location.coordinates[1]},${request.hospital.location.coordinates[0]}"
//                         target="_blank"
//                         style="color:#dc2626;font-weight:bold;">
//                         View on Google Maps
//                       </a>
//                     </p>`
//                     : ""
//               }

//           </div>
//           <div style="text-align:center;margin:20px 0">
//             <a href="${process.env.CLIENT_URL}/donor"
//                style="background:#dc2626;color:white;padding:14px 28px;
//                       text-decoration:none;border-radius:8px;font-size:15px">
//               View &amp; Respond
//             </a>
//           </div>
//           <div style="text-align:center;margin:16px 0">
//             <a href="${waLink}"
//                style="background:#25D366;color:white;padding:12px 24px;
//                       text-decoration:none;border-radius:8px;font-size:14px">
//               💬 WhatsApp Hospital
//             </a>
//           </div>
//         </div>
//       </div>
//     `,
//   });
// };

// // Hospital approval/rejection email
// const sendApprovalEmail = async (hospital, approved) => {
//   await transporter.sendMail({
//     from: `"Blood Donor Finder" <${process.env.GMAIL_USER}>`,
//     to: hospital.email,
//     subject: approved
//       ? "✅ Hospital Account Approved"
//       : "❌ Hospital Account Rejected",
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px">
//         <h2 style="color:${approved ? "#16a34a" : "#dc2626"}">
//           ${approved ? "✅ Account Approved" : "❌ Account Rejected"}
//         </h2>
//         <p>Dear <strong>${hospital.hospitalName}</strong>,</p>
//         <p>Your hospital account has been <strong>${approved ? "approved" : "rejected"}</strong>.</p>
//         ${
//           approved
//             ? `<p>You can now <a href="${process.env.CLIENT_URL}/login">login</a> and post blood requests.</p>`
//             : "<p>Please contact support for more information.</p>"
//         }
//       </div>
//     `,
//   });
// };

// // Password reset email
// const sendPasswordReset = async (email, resetUrl) => {
//   await transporter.sendMail({
//     from: `"Blood Donor Finder" <${process.env.GMAIL_USER}>`,
//     to: email,
//     subject: "Password Reset Request",
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px">
//         <h2 style="color:#dc2626">🩸 Password Reset</h2>
//         <p>You requested a password reset. Click the button below:</p>
//         <div style="text-align:center;margin:24px 0">
//           <a href="${resetUrl}" style="background:#dc2626;color:white;padding:14px 28px;
//                                        text-decoration:none;border-radius:8px">
//             Reset Password
//           </a>
//         </div>
//         <p style="color:#6b7280">This link expires in <strong>1 hour</strong>.</p>
//         <p style="color:#6b7280">If you did not request this, ignore this email.</p>
//       </div>
//     `,
//   });
// };

// module.exports = {
//   sendOTP,
//   sendBloodAlert,
//   sendApprovalEmail,
//   sendPasswordReset,
// };
