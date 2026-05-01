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


    let info = await transporter.sendMail({
        from: process.env.MAIL_FROM || `"United Hotels" ${smtpUser}`, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: "Welcome to United Hotels", // plain text body
        html: output, // html body
    });

    console.log("Message sent: %s", info.messageId);

}

module.exports = sendMail