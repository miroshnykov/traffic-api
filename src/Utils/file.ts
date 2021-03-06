import { promises as fs } from 'node:fs';

export const getFileSize = async (filename: string) => {
  const stats = await fs.stat(filename);
  return Number(stats?.size) || 0;
};
