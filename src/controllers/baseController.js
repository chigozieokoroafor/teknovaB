require("dotenv").config()

const { checkUserExists, createUserAccount, verifyUser, getUserByEmail } = require("../db/querys/users");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, newError, notFound } = require("../errorHandler/statusCodes");
const { sendAccountVerificationMail, hashPassword, generateToken, createUUID, verifytoken, checkPassword, baseValidator, sendEmail } = require("../util/base");
const { createAccountSchema, loginValidator, contactUsValidator } = require("../util/validators/accountValidator");


exports.createAccount = catchAsync(async (req, res) => {

    const error = baseValidator(createAccountSchema, req.body, res)
    if (error) {
        return error
    }


    // use express sesion for this. and not normal bearer jwts

    const { email, name, username, password } = req.body

    const user = await checkUserExists(email)
    if (user) {
        return generalError(res, "Account exists with email provided")
    }

    req.body.password = hashPassword(password)
    const uid = createUUID()
    req.body.uid = uid


    try {
        await createUserAccount(req.body)
    } catch (error) {
        console.log("error:::createAccount", error)
        return generalError(res, "Unable to create account at this time.")
    }



    const token = generateToken({ id: uid })
    const baseUrl = process.env.WEB_BASE_URL + `?token=${token}`

    console.log("ur:::, base:::", baseUrl)

    success(res, {}, "Verification mail sent to Mail")

    sendAccountVerificationMail(email, baseUrl, username)
})

exports.verify = catchAsync(async (req, res) => {
    const { token } = req.query

    const payload = verifytoken(token)
    if (!payload.success) {
        return newError(res, payload.err, payload.err_status)
    }

    console.log("payload:::", payload)

    const uid = payload.d.id

    const update = await verifyUser(uid)

    if (update[0] < 1) {
        return generalError(res, "Unable to verify mail")
    }

    return success(res, {}, "Account Verified")

})

exports.login = catchAsync(async (req, res) => {

    const error = baseValidator(loginValidator, req.body, res)
    if (error) {
        return error
    }

    const user = await getUserByEmail(req.body?.email)

    if (!user) {
        return notFound(res, "account with email provided not found")
    }

    const passwordMatch = checkPassword(req.body?.password, user.password)
    if (!passwordMatch) {
        return generalError(res, "Invalid Credentials")
    }
    // put email verification here to check if userIsn't verified

    const token = generateToken({ id: user.uid, userType: "user" }, 14 * 60 * 60000)

    // do a set session here instead of returning authorization token.

    return success(res, { token }, "Login successful")

})

exports.fetchProfile = catchAsync(async (req, res) => {
    return success(res, req.user, "Profile fetched")
})

exports.contactUs = catchAsync(async (req, res) => {
    const valid_ = contactUsValidator.validate(req.body)

    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }
    const submittedAt = new Date().toISOString()
    const html = `
    <!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>New Contact Form Submission</title>
  <style>
    /* CLIENT-SAFE MINIMAL STYLES */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #111827; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 18px rgba(15,23,42,0.06); }
    .header { padding: 20px 24px; background: linear-gradient(90deg,#0ea5e9,#6366f1); color: #fff; }
    .header h1 { margin: 0; font-size: 18px; font-weight: 600; }
    .body { padding: 20px 24px; }
    .label { font-size: 13px; color: #6b7280; margin-bottom: 4px; display:block; }
    .value { font-size: 15px; color: #111827; margin-bottom: 12px; word-break: break-word; }
    .message-box { background: #f8fafc; border: 1px solid #e6eef8; padding: 12px; border-radius: 6px; white-space: pre-wrap; }
    .meta { font-size: 12px; color: #6b7280; margin-top: 12px; }
    .footer { padding: 16px 24px; font-size: 12px; color: #9ca3af; background: #fbfdff; text-align:center; }
    a.button { display:inline-block; padding: 10px 14px; border-radius: 6px; text-decoration:none; font-weight:600; background:#0ea5e9; color:#fff; margin-top:12px; }
    @media (max-width:480px){ .container{ margin:12px; } .header h1{ font-size:16px } }
  </style>
</head>
<body>
  <!--
  Plain-text fallback:
  New contact form submission
  Name: {{name}}
  Email: {{email}}
  Submitted at: {{submittedAt}}
  Message:
  {{message}}
  -->
  <center>
    <table role="presentation" width="100%" style="max-width:680px;">
      <tr>
        <td align="center">
          <div class="container" style="width:100%;">
            <!-- Header -->
            <div class="header" style="padding:20px 24px;background:linear-gradient(90deg,#0ea5e9,#6366f1);color:#fff;">
              <h1 style="margin:0;font-size:18px;">New contact form submission</h1>
            </div>

            <!-- Body -->
            <div class="body" style="padding:20px 24px;">
              <p style="margin:0 0 12px 0;font-size:14px;color:#374151;">
                You have received a new message via the contact form. Details are below.
              </p>

              <!-- Details -->
              <div>
                <label class="label">Name</label>
                <div class="value">${req.body.name}</div>

                <label class="label">Email</label>
                <div class="value"><a href="mailto:${req.body.email}" style="color:#0ea5e9;text-decoration:none;">${req.body.email}</a></div>

                <label class="label">Submitted at</label>
                <div class="value">${submittedAt}</div>

                <label class="label">Message</label>
                <div class="message-box" style="background:#f8fafc;border:1px solid #e6eef8;padding:12px;border-radius:6px;">
                  ${req.body.message}
                </div>
              </div>

              <!-- Optional action -->
              <div style="margin-top:16px;">
                <a class="button" href="mailto:${req.body.email}?subject=Re:%20Your%20message" style="display:inline-block;padding:10px 14px;border-radius:6px;text-decoration:none;font-weight:600;background:#0ea5e9;color:#fff;">Reply to sender</a>
              </div>

              <p class="meta" style="margin:12px 0 0 0;color:#6b7280;">Tip: you can copy the message or click Reply to open your mail client.</p>
            </div>

            <!-- Footer -->
            <div class="footer" style="padding:16px 24px;font-size:12px;color:#9ca3af;background:#fbfdff;text-align:center;">
              This message was sent from your website's contact form on Teknova.
            </div>
          </div>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
`

    success(res, {}, "Added.")

    sendEmail("New contact form submission", process.env.MAIL_USER, html)
})