const nodemailer = require('nodemailer');

export async function send(emails: string[], subject: string, html: string) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'yumyumlifemailer@gmail.com',
                pass: process.env.MAILER_PASSWORD
            }
        });

        const mailOptions = {
            from: 'Yum Yum <yumyumlifemailer@gmail.com>',
            to: emails.join(","),
            subject: subject,
            html: html
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("error is " + error);
                resolve(false); // or use rejcet(false) but then you will have to handle errors
            }
            else {
                console.log('Email sent: ' + info.response);
                resolve(true);
            }
        });
    });
}