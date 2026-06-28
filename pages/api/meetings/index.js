import { createMeeting } from '../../../lib/store';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ fehler: 'Methode nicht erlaubt' });
  try {
    const meeting = await createMeeting(req.body);
    res.status(201).json(meeting);
  } catch (e) {
    res.status(500).json({ fehler: e.message });
  }
}
