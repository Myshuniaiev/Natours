import nodemailer from "nodemailer";
// import path from "path";

const sendEmail = async (options: {
  email: string;
  subject: string;
  resetURL: string; // Added reset URL
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT as string, 10),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Oleksii Myshuniaiev <oleksii.myshuniaiev@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.resetURL,
    // html: `
    // <div
    //     class="container"
    //     style="
    //     text-align: center;
    //     max-width: 400px;
    //     margin: 40px auto;
    //     padding: 20px;
    //     background-color: white;
    //     box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    //     border-radius: 8px;
    //     font-family: Montserrat, sans-serif;
    //     font-optical-sizing: auto;
    //     "
    // >
    //     <h1 style="font-size: 24px; color: #333">Mitravel</h1>
    //     <div class="illustration" style="margin-bottom: 20px">
    //     <img
    //         src="cid:unique-image-id"
    //         alt="Forgot Password Illustration"
    //         style="max-width: 100%; height: auto"
    //     />
    //     </div>
    //     <h1 style="font-size: 24px; color: #333">Forgot password?</h1>
    //     <p style="font-size: 16px; color: #666; margin-bottom: 20px">
    //     That's okay, it happens! Click on the button below to reset your password.
    //     </p>
    //     <a
    //     href="#"
    //     class="reset-button"
    //     style="
    //         display: inline-block;
    //         padding: 12px 24px;
    //         background-color: #4c6ef5;
    //         color: white;
    //         border: none;
    //         border-radius: 5px;
    //         font-size: 16px;
    //         text-decoration: none;
    //         cursor: pointer;
    //         margin-bottom: 20px;
    //     "
    //     >
    //     Reset Password
    //     </a>
    //     <div class="footer" style="font-size: 14px; color: #999">
    //     <p>
    //         We hope you enjoy this journey as much as we enjoy creating it for you.
    //     </p>
    //     </div>
    // </div>`,
    // attachments: [
    //   {
    //     filename: "forgot-password.png",
    //     path: path.join(__dirname, "../../public/images/forgot-password.png"),
    //     cid: "unique-image-id",
    //   },
    // ],
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
