import crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

const encKey: string = process.env.ENCRIPTION_KEY || ''

export const decrypt = (text: string) => {
  let textParts = text.split(':')
  // @ts-ignore
  let iv = Buffer.from(textParts.shift(), 'hex')
  let encryptedText = Buffer.from(textParts.join(':'), 'hex')
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encKey), iv)
  let decrypted = decipher.update(encryptedText)

  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}

