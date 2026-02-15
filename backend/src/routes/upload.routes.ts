import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types';
import { logger } from '../utils/logger';
import { config } from '../config';

const router = Router();

const uploadsRootDir = path.isAbsolute(config.upload.uploadDir)
  ? config.upload.uploadDir
  : path.join(process.cwd(), config.upload.uploadDir);
const imageUploadsDir = path.join(uploadsRootDir, 'images');
const fileUploadsDir = path.join(uploadsRootDir, 'files');
const galleryMetadataPath = path.join(uploadsRootDir, 'gallery-metadata.json');

type GalleryMetadataRecord = {
  title?: string;
  category?: string;
  tags?: string[];
  description?: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
type GalleryMetadataMap = Record<string, GalleryMetadataRecord>;

const parseTagInput = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, 20);
    return normalized.length ? normalized : [];
  }

  if (typeof value === 'string') {
    const normalized = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20);
    return normalized.length ? normalized : [];
  }

  return undefined;
};

const normalizeMetadataPatch = (payload: Record<string, unknown>): Partial<GalleryMetadataRecord> => {
  const patch: Partial<GalleryMetadataRecord> = {};

  if (typeof payload.title === 'string') {
    patch.title = payload.title.trim().slice(0, 160);
  }
  if (typeof payload.category === 'string') {
    patch.category = payload.category.trim().toLowerCase().slice(0, 80);
  }
  if (typeof payload.description === 'string') {
    patch.description = payload.description.trim().slice(0, 400);
  }
  if (typeof payload.published === 'boolean') {
    patch.published = payload.published;
  }
  const tags = parseTagInput(payload.tags);
  if (tags !== undefined) {
    patch.tags = tags;
  }

  return patch;
};

const readGalleryMetadata = (): GalleryMetadataMap => {
  try {
    if (!fs.existsSync(galleryMetadataPath)) {
      return {};
    }
    const raw = fs.readFileSync(galleryMetadataPath, 'utf-8');
    if (!raw.trim()) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return parsed as GalleryMetadataMap;
  } catch (error) {
    logger.warn('Failed to read gallery metadata file', { error: (error as Error).message });
    return {};
  }
};

const writeGalleryMetadata = (data: GalleryMetadataMap): void => {
  const tempPath = `${galleryMetadataPath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, galleryMetadataPath);
};

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

const listGalleryImages = (options?: { includeUnpublished?: boolean }) => {
  const includeUnpublished = options?.includeUnpublished ?? false;
  const metadataMap = readGalleryMetadata();
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
      const metadata = metadataMap[filename] || {};
      const basename = filename.replace(/\.[^/.]+$/, '');
      const normalizedCategory = metadata.category?.trim().toLowerCase() || 'general';
      const published = metadata.published !== false;

      return {
        filename,
        url: `/uploads/images/${filename}`,
        size: stats.size,
        type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        uploadedAt: stats.mtime.toISOString(),
        title: metadata.title?.trim() || basename,
        category: normalizedCategory,
        tags: Array.isArray(metadata.tags) ? metadata.tags : [],
        description: metadata.description?.trim() || '',
        published,
      };
    })
    .filter((image) => includeUnpublished || image.published)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  // Calculate stats
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const stats = {
    totalImages: images.length,
    totalSize: images.reduce((acc, img) => acc + img.size, 0),
    recentUploads: images.filter((img) => new Date(img.uploadedAt) > oneWeekAgo).length,
    publishedImages: images.filter((img) => img.published).length,
    draftImages: images.filter((img) => !img.published).length,
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

    if (uploadPath === 'images') {
      const metadataPatch = normalizeMetadataPatch((req.body || {}) as Record<string, unknown>);
      if (Object.keys(metadataPatch).length > 0) {
        const metadataMap = readGalleryMetadata();
        const existing = metadataMap[filename] || {};
        const now = new Date().toISOString();
        metadataMap[filename] = {
          ...existing,
          ...metadataPatch,
          createdAt: existing.createdAt || now,
          updatedAt: now,
        };
        writeGalleryMetadata(metadataMap);
      }
    }

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
    const { images, stats } = listGalleryImages({ includeUnpublished: false });

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
      const { images, stats } = listGalleryImages({ includeUnpublished: true });

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

// PUT /api/upload/image/:filename/meta - Update image metadata (admin only)
router.put(
  '/image/:filename/meta',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const filename = path.basename((req.params.filename as string) || '');
      if (!filename) {
        return res.status(400).json({
          success: false,
          message: 'Filename is required',
        });
      }

      const imagePath = path.join(imageUploadsDir, filename);
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({
          success: false,
          message: 'Image not found',
        });
      }

      const metadataPatch = normalizeMetadataPatch((req.body || {}) as Record<string, unknown>);
      if (Object.keys(metadataPatch).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No metadata fields to update',
        });
      }

      const metadataMap = readGalleryMetadata();
      const existing = metadataMap[filename] || {};
      const now = new Date().toISOString();
      metadataMap[filename] = {
        ...existing,
        ...metadataPatch,
        createdAt: existing.createdAt || now,
        updatedAt: now,
      };
      writeGalleryMetadata(metadataMap);

      const { images } = listGalleryImages({ includeUnpublished: true });
      const updatedImage = images.find((item) => item.filename === filename);

      res.json({
        success: true,
        data: updatedImage || null,
        message: 'Image metadata updated successfully',
      });
    } catch (error) {
      logger.error('Error updating image metadata', error as Error);
      res.status(500).json({
        success: false,
        message: 'Failed to update image metadata',
      });
    }
  }
);

// PATCH /api/upload/image/:filename/publish - Toggle publish state (admin only)
router.patch(
  '/image/:filename/publish',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const filename = path.basename((req.params.filename as string) || '');
      const published = req.body?.published;
      if (typeof published !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'published boolean is required',
        });
      }

      const imagePath = path.join(imageUploadsDir, filename);
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({
          success: false,
          message: 'Image not found',
        });
      }

      const metadataMap = readGalleryMetadata();
      const existing = metadataMap[filename] || {};
      const now = new Date().toISOString();
      metadataMap[filename] = {
        ...existing,
        published,
        createdAt: existing.createdAt || now,
        updatedAt: now,
      };
      writeGalleryMetadata(metadataMap);

      const { images } = listGalleryImages({ includeUnpublished: true });
      const updatedImage = images.find((item) => item.filename === filename);

      res.json({
        success: true,
        data: updatedImage || null,
        message: `Image ${published ? 'published' : 'moved to draft'} successfully`,
      });
    } catch (error) {
      logger.error('Error updating image publish state', error as Error);
      res.status(500).json({
        success: false,
        message: 'Failed to update image publish state',
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

      const metadataMap = readGalleryMetadata();
      if (metadataMap[sanitizedFilename]) {
        delete metadataMap[sanitizedFilename];
        writeGalleryMetadata(metadataMap);
      }

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
