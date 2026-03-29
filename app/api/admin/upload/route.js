export const dynamic = 'force-dynamic';
import { put } from '@vercel/blob';
import { verifyAdminAuth } from '../../../../lib/adminAuth';

const ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'ppt',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
};

const MAX_SIZE = 200 * 1024 * 1024; // 200MB

export async function POST(req) {
  await verifyAdminAuth();

  const formData = await req.formData();
  const file = formData.get('file');

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  const mimeType = file.type;
  const fileType = ALLOWED_TYPES[mimeType];
  if (!fileType) {
    return Response.json({ error: 'File type not allowed. Use PDF, PPT, Word, or video.' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'File too large. Maximum size is 200MB.' }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const pathname = `course-materials/${Date.now()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: 'public',
    contentType: mimeType,
  });

  return Response.json({ url: blob.url, type: fileType, name: file.name });
}
