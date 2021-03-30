export async function send(emails: string[], subject: string, html: string) {
    return new Promise((resolve, reject) => {
        var API_KEY = process.env.MAILGUN_TOKEN;
        var DOMAIN = 'yumyum.today';

        var mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });

        const data = {
            from: 'YumYum Mailer<mail@yumyum.today>',
            to: emails.join(","),
            subject: subject,
            html: html
        };

        if (emails.length == 0) {
            console.log("Empty to: fields. No email sent");
        }

        mailgun.messages().send(data, (error, body) => {
            if (error) {
                console.log("error is " + error);
                console.log(emails);
                console.log(emails.join(","));
                resolve(false); // or use rejcet(false) but then you will have to handle errors
            }
            else {
                console.log(`Email sent to ${emails.join(",")}`);
                resolve(true);
            }
        });
    });
}