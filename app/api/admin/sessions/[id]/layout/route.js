import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/auth';
import { getCertificateLayout, saveCertificateLayout, getSessionById } from '@/lib/db';

export async function GET(request, { params }) {
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

  const layout = await getCertificateLayout(id);
  return NextResponse.json({
    session,
    layout: layout || {
      name_x: 50,
      name_y: 49.5,
      name_font_family: 'Helvetica-Bold',
      name_font_size: 40,
      name_color: '#1a1f2c',
      name_alignment: 'center',
      name_max_width: 75,
      date_x: 27.5,
      date_y: 78.5,
      date_font_family: 'Helvetica',
      date_font_size: 15,
      date_color: '#475569',
      date_alignment: 'center'
    }
  });
}

export async function PUT(request, { params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const layoutData = await request.json();
    const saved = await saveCertificateLayout(id, layoutData);
    return NextResponse.json({ success: true, layout: saved });
  } catch (error) {
    console.error('Failed to save layout:', error);
    return NextResponse.json({ error: 'Failed to save certificate layout' }, { status: 500 });
  }
}
