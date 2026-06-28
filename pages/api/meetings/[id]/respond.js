import { addResponse } from '../../../../lib/store';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ fehler: 'Methode nicht erlaubt' });
  const { id } = req.query;
  const { name, slots } = req.body;
  if (!name || !Array.isArray(slots)) return res.status(400).json({ fehler: 'Name und Slots erforderlich' });
  try {
    const meeting = await addResponse(id, name, slots);
    if (!meeting) return res.status(404).json({ fehler: 'Nicht gefunden' });
    res.json(meeting);
  } catch (e) {
    res.status(500).json({ fehler: e.message });
  }
}
