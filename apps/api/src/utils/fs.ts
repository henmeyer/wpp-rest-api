import fs, { PathLike } from 'fs';
import logger from './logger';

export const deleteFolder = (path: PathLike) => {
  try {
    if (fs.existsSync(path)) {
      fs.rmSync(path, { recursive: true, force: true });
    }
  } catch (error) {
    logger.error(error);
  }
};

export const createFolder = (path: PathLike) => {
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  } catch (error) {
    logger.error(error);
  }
};
