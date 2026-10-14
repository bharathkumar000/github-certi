import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/auth';
import AdminLoginForm from './AdminLoginForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Portal Access | Certify',
  description: 'Enter your admin access key to manage workshop sessions, layouts, and certificates.'
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (token) {
    const admin = await verifyAdminToken(token);
    if (admin) {
      redirect('/admin/dashboard');
    }
  }

  return <AdminLoginForm />;
}
