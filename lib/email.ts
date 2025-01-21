import { render } from "@react-email/render";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { ReactNode, isValidElement } from "react";

type SendEmailProps = {
  to: string;
  from: string;
  template: ReactNode;
  subject: string;
};
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || "",
});
export const sendEmail = async ({
  to,
  from,
  template,
  subject,
}: SendEmailProps) => {
  if (!isValidElement(template)) {
    return {};
  }
  const emailHtml = await render(template);
  const sentFrom = new Sender(from, "e-Market");
  const recipients = [new Recipient(to)];
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(subject)
    .setHtml(emailHtml);

  const result = await mailerSend.email.send(emailParams);
  return {
    ...result,
  };
};
