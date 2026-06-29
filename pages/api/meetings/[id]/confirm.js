import { getSupabase } from '../../../../lib/supabase';
import { getMeeting } from '../../../../lib/store';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ fehler: 'Methode nicht erlaubt' });
  const { id } = req.query;
  const { tag } = req.body;
  if (!tag) return res.status(400).json({ fehler: 'Tag erforderlich' });

  const supabase = getSupabase();
  const { error } = await supabase
    .from('meetings')
    .update({ bestaetigter_tag: tag })
    .eq('id', id);
  if (error) return res.status(500).json({ fehler: error.message });

  const meeting = await getMeeting(id);
  res.json(meeting);
}
