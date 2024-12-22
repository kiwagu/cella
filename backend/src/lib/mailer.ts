import { createTransport, type SendMailOptions, type SentMessageInfo } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { MailService } from '@sendgrid/mail';
import { config } from 'config';
import { env } from '../../env';

let sendFnRef: ((mailOptions: SendMailOptions) => Promise<SentMessageInfo>) | MailService['send'];

if (env.NODEMAILER_ON) {
  const transportOptions: SMTPTransport.Options = {
    host: env.NODEMAILER_HOST || config.nodemailer.host,
    port: Number(env.NODEMAILER_PORT) || config.nodemailer.port,
    secure: env.NODEMAILER_SECURE || config.nodemailer.secure,
    auth: {
      user: env.NODEMAILER_AUTH_USER || config.nodemailer.auth.user,
      pass: env.NODEMAILER_AUTH_PASS || config.nodemailer.auth.pass,
    },
  };
  const transporter = createTransport(transportOptions);

  sendFnRef = transporter.sendMail.bind(transporter);

  if (env.NODEMAILER_STARTED_MSG) {
    sendFnRef({
      to: env.SEND_ALL_TO_EMAIL,
      replyTo: config.supportEmail,
      from: config.notificationsEmail,
      subject: 'Nodemon is running',
      html: '<h1>Nodemon started</h1>',
    });
  }
} else {
  const sendgrid = new MailService();

  sendgrid.setApiKey(env.SENDGRID_API_KEY ?? '');
  sendFnRef = sendgrid.send.bind(sendgrid);
}

export const emailSender = {
  send: async (to: string, subject: string, html: string, replyTo?: string) => {
    await sendFnRef({
      to: env.SEND_ALL_TO_EMAIL || to,
      replyTo: replyTo ? replyTo : config.supportEmail,
      from: config.notificationsEmail,
      subject,
      html,
    });
  },
};
