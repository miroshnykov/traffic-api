import crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

export const decrypt = (text: string, decKey: string): string => {
  const textParts: string[] = text.split(':') || '';
  const textPartsShift: string = textParts.shift() || '';
  const iv: Buffer = Buffer.from(textPartsShift, 'hex');
  const encryptedText: Buffer = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(decKey), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};
