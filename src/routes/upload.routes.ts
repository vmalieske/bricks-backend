import { Elysia, t } from 'elysia';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { unlink } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'products');
mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadRoutes = new Elysia({ prefix: '/uploads' })
  .post(
    '/images',
    async ({ body, status }) => {
      const files = Array.isArray(body.images) ? body.images : [body.images];

      for (const file of files) {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          return status(400, { message: `Invalid file type: ${file.type}` });
        }
        if (file.size > MAX_FILE_SIZE) {
          return status(400, { message: `File too large: ${file.name}` });
        }
      }

      const images = await Promise.all(
        files.map(async (file) => {
          const ext = path.extname(file.name).toLowerCase();
          const filename = `${randomUUID()}${ext}`;
          await Bun.write(path.join(UPLOAD_DIR, filename), file);

          return {
            type: 'local' as const,
            url: `/uploads/products/${filename}`,
            isPrimary: false,
          };
        }),
      );

      return { images };
    },
    {
      body: t.Object({
        images: t.Files(),
      }),
    },
  )

  .delete(
    '/images',
    async ({ body, status }) => {
      const { url } = body;

      if (!url.startsWith('/uploads/products/')) {
        return status(400, { message: 'Invalid url' });
      }

      const filename = path.basename(url);
      const filePath = path.join(UPLOAD_DIR, filename);

      try {
        await unlink(filePath);
      } catch (err) {}

      return { message: 'Deleted' };
    },
    {
      body: t.Object({
        url: t.String(),
      }),
    },
  );
