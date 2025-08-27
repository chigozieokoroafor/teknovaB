require("dotenv").config()

const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");
const randToken = require("rand-token")
const axios = require("axios");
const { Readable } = require("stream");
const { BUNNY } = require("./consts");
const { generalError } = require("../errorHandler/statusCodes");


exports.sendEmail = (subject, to, html, attachments, envelope) => { //attachments should be an array; envelope is a json containing a 'to' and 'cc'
    try {
        const smtpTransport = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PWD,
            }
        });

        const mailOptions = {
            from: `"TEKNOVA" <${process.env.MAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            html,  // html body
        };
        if (attachments) {
            mailOptions.attachments = attachments;
        }

        if (envelope) {
            envelope.from = process.env.MAIL_USER
            mailOptions.envelope = envelope;
        }

        // mailOptions.cc = envelope.cc

        smtpTransport.sendMail(mailOptions, (err, result) => {
            if (err) {
                console.log('Error occurred while sending mail:::', err);
                return false;
            }
            console.log('Message sent:', result);
            return true;
        });
    } catch (err) {
        console.log('sendEmail', err.message);
    }
}

exports.sendAccountVerificationMail = (email, verificationLink, username) => {
    const html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Teknova</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #4a148c; /* Deep purple */
            padding: 20px;
            text-align: center;
        }
        .logo {
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        .content {
            padding: 30px;
        }
        .verification-box {
            background-color: #f3e5f5; /* Light purple background */
            border-radius: 5px;
            padding: 25px;
            margin: 20px 0;
            text-align: center;
        }
        .button {
            display: inline-block;
            background-color: #7b1fa2; /* Medium purple */
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 15px 0;
            font-size: 16px;
        }
        .disclaimer {
            background-color: #ede7f6; /* Very light purple */
            padding: 15px;
            border-left: 4px solid #9575cd; /* Light-medium purple */
            margin: 20px 0;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f5f5f5;
            color: #757575;
            font-size: 12px;
        }
        a {
            color: #6a1b9a; /* Dark purple for links */
            text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">TEKNOVA</h1>
        </div>
        
        <div class="content">
            <h2>Verify Your Email Address</h2>
            
            <p>Hello ${username ?? ''},</p>
            
            <p>Thank you for creating an account with Teknova, your premier destination for phones and the latest gadgets. We're excited to have you join our tech community!</p>
            
            <p>To complete your registration and access exclusive deals on the newest tech products, please verify your email address by clicking the button below:</p>
            
            <div class="verification-box">
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationLink}" >Verify My Email</a>
                <p>This link will expire shortly.</p>
            </div>
            
            <p>Once verified, you'll have access to:</p>
            <ul>
                <li>Exclusive member-only deals</li>
                <li>Early access to new product releases</li>
                <li>Special promotions and discounts</li>
                <li>Personalized tech recommendations</li>
            </ul>
            
            <div class="disclaimer">
                <strong>IMPORTANT:</strong> If you did not create an account with Teknova, please disregard this email. No action is needed, and your email will not be used without your permission. This email was sent as a result of a sign-up request for your email address.
            </div>
            
            <p>If you have any questions or need assistance, our customer support team is here to help. Simply reply to this email or contact us at support@teknova.com.</p>
            
            <p>Thank you for choosing Teknova for all your technology needs!</p>
            
            <p>Best regards,<br>
            The Teknova Team</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Teknova. All rights reserved.</p>
            <p>123 Tech Avenue, Innovation City, TC 12345</p>
            <p><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a> | <a href="#">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
    `

    const subject = "Verify Your Email - Teknova"

    this.sendEmail(subject, email, html)
}

exports.sendOrderUpdateNotifcationMail = (email, orderId, status, dateOrdered, year) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px; margin: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
    <tr>
      <td style="background-color: #4CAF50; color: #ffffff; padding: 16px; text-align: center; font-size: 20px; font-weight: bold;">
        Order Status Update
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; color: #333333;">
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 16px;">
          We wanted to let you know that the status of your order has been updated.
        </p>
        <table cellpadding="8" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; margin-top: 15px; background-color: #fafafa; border: 1px solid #e0e0e0;">
          <tr>
            <td style="font-weight: bold; width: 150px;">Order ID:</td>
            <td>${orderId}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Status:</td>
            <td>${status}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Date Ordered:</td>
            <td>${dateOrdered}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; font-size: 14px;">
          You can log into your account at any time to track the progress of your order.
        </p>
        <p style="font-size: 14px;">Thank you for shopping with us!</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f1f1f1; color: #777777; text-align: center; font-size: 12px; padding: 12px;">
        &copy; ${year} Teknova. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
`


    const subject = `Order Update - ${orderId}`

    this.sendEmail(subject, email, html)
}


exports.hashPassword = (pwd) => {
    const salt = bcrypt.genSaltSync()
    return bcrypt.hashSync(pwd, salt)
}

exports.checkPassword = (pwd, hash) => {
    return bcrypt.compareSync(pwd, hash)
}

exports.generateToken = (payload, expiryTme = 1 * 10 * 60) => {
    return jwt.sign(payload, process.env.AUTH_SECRET, { expiresIn: expiryTme })
}

exports.verifytoken = (token, secret = process.env.AUTH_SECRET) => {

    let err, err_status
    let success = false;
    try {
        const payload = jwt.verify(token, secret)
        success = true
        return { d: payload, success }
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            err = "Session Expired.";
            err_status = 403;

        } else if (error.name === "JsonWebTokenError") {
            err = "Invalid Token";
            err_status = 498;
        }

        return { err, success, err_status }
    }
}

exports.createUUID = (len) => {
    return randToken.uid(len ?? 15)
}

exports.initializePayment = async (ref, amount, email, meta) => {
    try {
        const url = "https://api.paystack.co/transaction/initialize"

        const resp = await axios.post(
            url,
            {
                reference: ref,
                amount: `${amount * 100}`,
                email: email,
                channels: ["card", "bank", "apple_pay", "ussd", "qr", "mobile_money", "bank_transfer", "eft"],
                // callback_url:"https://deestar.netlify.app/",
                callback_url: process.env.WEB_BASE_URL,
                metadata: meta,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET}`
                }
            }
        );

        // Check the response status
        if (resp.status === 200) {
            const jsn = resp.data;
            return { url: jsn?.data?.authorization_url, success: true };
        } else {
            console.log("status::error::paystack request:::", resp.data)
            return { url: "", success: false, "msg": "Unable to initialize transaction" };
        }

    } catch (error) {
        console.log("error::::Catch:::", error)
        return { success: false, msg: `Error while initializing transaction: ${error.message}` }
    }

}

exports.processFile = async (buffer, fileName) => {
    const stream = Readable.from(buffer)
    const url = await uploadToBunny(stream, fileName)

    if (!url) {
        return null
    }

    return url

}

const uploadToBunny = async (stream, fileName) => {

    // const REGION = 'YOUR_REGION'; // If German region, set this to an empty string: ''
    // const HOSTNAME = REGION ? `${REGION}.${BASE_HOSTNAME}` : BASE_HOSTNAME;

    // console.log("credentials::::",BUNNY)

    const url = `${BUNNY.BUNNY_BASE_HOSTNAME}/${BUNNY.BUNNY_STORAGE_ZONE_NAME}/${fileName}`

    const response = await fetch(url, {
        method: "PUT",
        body: stream,
        duplex: "half",
        headers: {
            AccessKey: BUNNY.BUNNY_ACCESS_KEY,
            'Content-Type': 'application/octet-stream',
        }
    })

    if (!response.ok) {
        const txt = await response.text()
        console.log("error on file upload:::", txt)
        // return {success: false, url:null, msg: txt }
        null
    }

    console.log("body::::here:::", await response.json())


    return `${BUNNY.BUNNY_CUSTOM_FILE_UPLOAD_HOSTNAME}/${fileName}`
}

exports.processAllImages = async (files, name) => {
    const promises = files.map((item, index) => {
        const splitted = item.originalname.split(".");
        const ext = splitted[splitted.length - 1];
        const file_name = `${this.createUUID()}.${ext}`;

        return this.processFile(item.buffer, file_name).then((url) => {
            return { "img_url": url, name: `${name}_${index}`};
        });
    });

    const img_list = await Promise.all(promises);
    return img_list;
};

exports.deleteImageFromBunny = async (file) => {
    const url = `${BUNNY.BUNNY_BASE_HOSTNAME}/${BUNNY.BUNNY_STORAGE_ZONE_NAME}/${BUNNY.BUNNY_UPlOAD_PATH}/${file}`

    // const response = await axios.delete(url, {
    //     headers: JSON.stringify({
    //         "AccessKey": BUNNY.BUNNY_ACCESS_KEY,
    //     })
    // })

    // console.log("url ===>", url)

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            AccessKey: BUNNY.BUNNY_ACCESS_KEY
            // 'Content-Type': 'application/octet-stream',
        }
    })
    // console.log ("headers ==>", response.)

    console.log("Image delete response Data ===>", await response.json())

    return response.ok ? true : false
}

exports.baseValidator = (fn, body, res) => {
    const valid_ = fn.validate(body)

    if (valid_.error) {
        // console.log(valid_.error)
        return generalError(res, valid_.error.message, valid_.error.details[0].context)
    }
    return
}

