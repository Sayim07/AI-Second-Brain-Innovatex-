const path = require('path');
const { Readable } = require('stream');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const { parse } = require('csv-parse/sync');
const { getCloudinary } = require('../config/cloudinary');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getUploadType(file) {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const mimetype = String(file.mimetype || '').toLowerCase();

  if (extension === '.pdf' || mimetype === 'application/pdf') return 'pdf';
  if (extension === '.docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (extension === '.xlsx' || mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xlsx';
  if (extension === '.csv' || mimetype === 'text/csv' || mimetype === 'application/csv' || mimetype === 'application/vnd.ms-excel') return 'csv';
  return null;
}

function isSupportedUpload(file) {
  return Boolean(getUploadType(file));
}

function uploadBufferToCloudinary(file) {
  const cloudinary = getCloudinary();
  const folder = process.env.CLOUDINARY_FOLDER || 'innovatex';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    Readable.from([file.buffer]).pipe(uploadStream);
  });
}

function buildFileMetadata(file, uploadResult) {
  return {
    url: uploadResult.secure_url || uploadResult.url || '',
    secureUrl: uploadResult.secure_url || '',
    publicId: uploadResult.public_id || '',
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    format: uploadResult.format || path.extname(file.originalname || '').replace('.', ''),
    resourceType: uploadResult.resource_type || 'raw',
    cloudinaryFolder: process.env.CLOUDINARY_FOLDER || 'innovatex',
  };
}

async function extractTextFromUpload(file) {
  const uploadType = getUploadType(file);

  if (!uploadType) {
    throw createError('Supported file types are PDF, DOCX, XLSX, and CSV.', 400);
  }

  if (uploadType === 'pdf') {
    const extracted = await pdfParse(file.buffer);
    return extracted.text || '';
  }

  if (uploadType === 'docx') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value || '';
  }

  if (uploadType === 'xlsx') {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    return workbook.SheetNames
      .map((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        return `Sheet: ${sheetName}\n${csv}`;
      })
      .join('\n\n');
  }

  if (uploadType === 'csv') {
    const rows = parse(file.buffer.toString('utf8'), { skip_empty_lines: true });
    return rows.map((row) => row.join(', ')).join('\n');
  }

  throw createError('Unsupported file type.', 400);
}

async function storeAndExtractUpload(file) {
  if (!file) {
    throw createError('File is required.', 400);
  }

  if (!isSupportedUpload(file)) {
    throw createError('Supported file types are PDF, DOCX, XLSX, and CSV.', 400);
  }

  const uploadResult = await uploadBufferToCloudinary(file);
  const text = await extractTextFromUpload(file);

  return {
    text,
    fileMeta: buildFileMetadata(file, uploadResult),
    uploadResult,
    type: getUploadType(file),
  };
}

async function deleteCloudinaryFile(file) {
  if (!file?.publicId) {
    return null;
  }

  const cloudinary = getCloudinary();
  return cloudinary.uploader.destroy(file.publicId, { resource_type: file.resourceType || 'raw' });
}

module.exports = {
  storeAndExtractUpload,
  deleteCloudinaryFile,
  getUploadType,
};
