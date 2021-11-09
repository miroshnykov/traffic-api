import crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();
const encLength: number = Number(process.env.ENCRIPTION_IV_LENGTH)

export const encrypt = (text: string, encKey: string) => {
  let iv = crypto.randomBytes(encLength)
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encKey), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}