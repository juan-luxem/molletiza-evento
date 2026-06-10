import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { votingIsClosed } from '../../lib/config';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  if (votingIsClosed()) {
    return Response.json({ error: 'Las votaciones ya cerraron.' }, { status: 403 });
  }

  let dateId: string;
  try {
    const body = await request.json();
    dateId = body.dateId;
  } catch {
    return Response.json({ error: 'Body inválido' }, { status: 400 });
  }

  if (!dateId) {
    return Response.json({ error: 'dateId requerido' }, { status: 400 });
  }

  const admin = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Upsert: permite votar o cambiar voto
  const { error } = await admin
    .from('votes')
    .upsert(
      { date_id: dateId, user_id: user.id },
      { onConflict: 'user_id' }
    );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Devolver conteos actualizados
  const [{ data: allDates }, { data: allVotes }] = await Promise.all([
    admin.from('dates').select('id, label').order('created_at'),
    admin.from('votes').select('date_id'),
  ]);

  const dates = (allDates ?? []).map((d) => ({
    id: d.id,
    label: d.label,
    votes: allVotes?.filter((v) => v.date_id === d.id).length ?? 0,
  }));

  return Response.json({ dates });
};
