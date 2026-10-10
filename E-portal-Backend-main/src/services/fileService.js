const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

const createFileName = (originalName) => {
  const ext = path.extname(originalName || 'file');
  return `${crypto.randomUUID()}${ext}`;
};

const UPLOAD_DIR = process.env.UPLOAD_PATH || 'uploads';

const ensureDirectory = async (directory) => {
  const dirPath = path.join(UPLOAD_DIR, directory);
  await fs.ensureDir(dirPath);
  return dirPath;
};

const uploadFile = async (file, directory) => {
  try {
    const dirPath = await ensureDirectory(directory);
    const fileName = createFileName(file.originalname);
    const filePath = path.join(dirPath, fileName);

    // Save file
    await fs.writeFile(filePath, file.buffer);

    // Generate URL
    const url = `/uploads/${directory}/${fileName}`;

    return {
      fileName,
      filePath,
      url,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

const deleteFile = async (fileUrl) => {
  try {
    const filePath = path.join(__dirname, '../..', fileUrl);
    await fs.remove(filePath);
    return true;
  } catch (error) {
    console.error('File delete error:', error);
    return false;
  }
};

const getFileStream = (filePath) => {
  return fs.createReadStream(filePath);
};

const fileExists = async (filePath) => {
  return await fs.pathExists(filePath);
};

const getFileInfo = async (fileUrl) => {
  const filePath = path.join(__dirname, '../..', fileUrl);
  if (await fileExists(filePath)) {
    const stat = await fs.stat(filePath);
    return {
      size: stat.size,
      createdAt: stat.birthtime,
      modifiedAt: stat.mtime
    };
  }
  return null;
};

module.exports = {
  uploadFile,
  deleteFile,
  getFileStream,
  fileExists,
  getFileInfo
};