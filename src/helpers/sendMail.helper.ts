import * as nodemailer from 'nodemailer';

const sendMailHelper = ({
  email,
  subject,
  html,
}: {
  email: string;
  subject: string;
  html: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tin38618@gmail.com',
      pass: 'broy xlao isdb sbxl',
    },
  });

  const mailOptions = {
    from: 'tin38618@gmail.com',
    to: email,
    subject: subject,
    html: html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

export default sendMailHelper;
