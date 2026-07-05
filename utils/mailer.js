const nodemailer = require("nodemailer")


//function that sends mail to the user 
const sendMail = async (email, output, subject) => {
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    if (!smtpUser || !smtpPass) {
        throw new Error("SMTP_USER and SMTP_PASS must be set to send emails")
    }

    let transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || "gmail",
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: smtpUser,
            pass: smtpPass
        },
        tls: {
            rejectUnauthorized: false
        }
    })


    // Blind-copy the business archive inbox on auth mails too, matching the
    // main transactional client (utils/emails/client.js).
    const archive = (process.env.EMAIL_ARCHIVE_BCC ?? 'info@united-tourism.com').trim() || null;
    const bcc = archive && archive.toLowerCase() !== String(email).toLowerCase() ? archive : undefined;

    let info = await transporter.sendMail({
        from: process.env.MAIL_FROM || `"United Hotels" ${smtpUser}`, // sender address
        to: email, // list of receivers
        bcc, // business archive copy
        subject: subject, // Subject line
        text: "Welcome to United Hotels", // plain text body
        html: output, // html body
    });

    console.log("Message sent: %s", info.messageId);

}

module.exports = sendMail