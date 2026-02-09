import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types';
import { logger } from '../utils/logger';

const router = Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
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
    // Accept only images
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

// POST /api/upload/image - Upload image locally (admin only)
router.post(
  '/image',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
      }

      // Build the URL for the uploaded image
      const filename = req.file.filename;
      const imageUrl = `/uploads/images/${filename}`;

      logger.info('Image uploaded locally', { filename });

      res.json({
        success: true,
        data: {
          url: imageUrl,
          filename: filename,
        },
        message: 'Image uploaded successfully',
      });
    } catch (error) {
      logger.error('Error uploading image', error as Error);

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
        message: error instanceof Error ? error.message : 'Failed to upload image',
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
      const filePath = path.join(uploadsDir, sanitizedFilename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Image not found',
        });
      }

      // Delete the file
      fs.unlinkSync(filePath);

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
