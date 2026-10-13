import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/auth';
import { updateSession, getSessionById } from '@/lib/db';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

export async function POST(request, { params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const session = await getSessionById(id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No template file uploaded.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload a high-quality PNG, JPEG, or PDF certificate template.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 15MB limit. Please upload a compressed or optimized file.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize extension
    const ext = file.type === 'application/pdf'
      ? '.pdf'
      : file.type === 'image/png'
        ? '.png'
        : '.jpg';

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `template-${id}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    const publicPath = `/uploads/${filename}`;
    await updateSession(id, { certificate_template_path: publicPath });

    return NextResponse.json({
      success: true,
      template_path: publicPath,
      message: 'Certificate template uploaded successfully'
    });
  } catch (error) {
    console.error('Template upload error:', error);
    return NextResponse.json({ error: 'Failed to upload certificate template' }, { status: 500 });
  }
}
