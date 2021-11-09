import crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

export const decrypt = (text: string, decKey: string) => {
  let textParts: string[] = text.split(':') || ''
  let textPartsShift: string = textParts.shift() || ''
  let iv: Buffer = Buffer.from(textPartsShift, 'hex');
  let encryptedText: Buffer = Buffer.from(textParts.join(':'), 'hex')
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(decKey), iv)
  let decrypted = decipher.update(encryptedText)

  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}

