import {promises as fs} from "fs";
import consola from "consola";

export const getFileSize = async (filename: string) => {
  try {
    let stats = await fs.stat(filename)
    return Number(stats?.size) | 0
  } catch (e) {
    consola.error('File Stream:', e);
  }
}
