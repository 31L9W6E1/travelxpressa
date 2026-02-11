import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types';
import { logger } from '../utils/logger';

const router = Router();

const uploadsRootDir = path.join(process.cwd(), 'uploads');
const imageUploadsDir = path.join(uploadsRootDir, 'images');
const fileUploadsDir = path.join(uploadsRootDir, 'files');

// Create upload directories if they don't exist.
[uploadsRootDir, imageUploadsDir, fileUploadsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const isImageMime = (mimeType: string) => mimeType.startsWith('image/');

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isDocumentUpload = req.originalUrl.includes('/document');
    if (isDocumentUpload) {
      cb(null, fileUploadsDir);
      return;
    }

    cb(null, isImageMime(file.mimetype) ? imageUploadsDir : fileUploadsDir);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept images + common supporting document formats.
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX.'));
    }
  },
});

const listGalleryImages = () => {
  // Read all files from uploads directory
  const files = fs.readdirSync(imageUploadsDir);

  // Get file stats for each file
  const images = files
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    })
    .map((filename) => {
      const filePath = path.join(imageUploadsDir, filename);
      const stats = fs.statSync(filePath);
      const ext = path.extname(filename).toLowerCase().slice(1);

      return {
        filename,
        url: `/uploads/images/${filename}`,
        size: stats.size,
        type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        uploadedAt: stats.mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  // Calculate stats
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const stats = {
    totalImages: images.length,
    totalSize: images.reduce((acc, img) => acc + img.size, 0),
    recentUploads: images.filter((img) => new Date(img.uploadedAt) > oneWeekAgo).length,
  };

  return { images, stats };
};

// POST /api/upload/image - Upload image locally (admin only)
const handleFileUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    // Build the URL for the uploaded file.
    const filename = req.file.filename;
    const uploadPath = req.originalUrl.includes('/document')
      ? 'files'
      : isImageMime(req.file.mimetype)
        ? 'images'
        : 'files';
    const fileUrl = `/uploads/${uploadPath}/${filename}`;

    logger.info('File uploaded locally', {
      filename,
      mimeType: req.file.mimetype,
      path: uploadPath,
    });

    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: filename,
      },
      message: 'File uploaded successfully',
    });
  } catch (error) {
    logger.error('Error uploading file', error as Error);

    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.',
        });
      }
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload file',
    });
  }
};

router.post(
  '/image',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  upload.single('image'),
  handleFileUpload
);

// POST /api/upload/document - Upload application documents (authenticated users)
router.post(
  '/document',
  authenticateToken,
  upload.single('image'),
  handleFileUpload
);

// GET /api/upload/public-gallery - Get uploaded images (public read-only)
router.get('/public-gallery', async (_req: Request, res: Response) => {
  try {
    const { images, stats } = listGalleryImages();

    res.json({
      success: true,
      data: {
        images,
        stats,
      },
    });
  } catch (error) {
    logger.error('Error fetching public gallery', error as Error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery',
    });
  }
});

// GET /api/upload/gallery - Get all uploaded images (admin only)
router.get(
  '/gallery',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { images, stats } = listGalleryImages();

      res.json({
        success: true,
        data: {
          images,
          stats,
        },
      });
    } catch (error) {
      logger.error('Error fetching gallery', error as Error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gallery',
      });
    }
  }
);

// DELETE /api/upload/image/:filename - Delete image (admin only)
router.delete(
  '/image/:filename',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const filename = req.params.filename as string;

      // Sanitize filename to prevent directory traversal
      const sanitizedFilename = path.basename(filename);
      const imagePath = path.join(imageUploadsDir, sanitizedFilename);
      const filePath = path.join(fileUploadsDir, sanitizedFilename);
      const targetPath = fs.existsSync(imagePath) ? imagePath : filePath;

      // Check if file exists
      if (!fs.existsSync(targetPath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      // Delete the file
      fs.unlinkSync(targetPath);

      logger.info('Image deleted', { filename: sanitizedFilename });

      res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting image', error as Error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image',
      });
    }
  }
);

export default router;
