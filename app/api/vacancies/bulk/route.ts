
import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const adminSupabase = getAdminClient();
    const data = await req.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Очистка и маппинг данных
    const vacanciesToInsert = data.map(v => ({
      title: v.title,
      company_name: v.company_name || 'ЦЕХ Контракт',
      salary: v.salary,
      region: v.region,
      description: v.description || '',
      contact: v.contact,
      is_vahta: !!v.is_vahta,
      housing: v.housing !== undefined ? v.housing : true,
      is_active: true
    }));

    const { data: inserted, error } = await adminSupabase
      .from('vacancies')
      .insert(vacanciesToInsert)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, count: inserted?.length });
  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
