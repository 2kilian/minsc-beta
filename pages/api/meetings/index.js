import { createMeeting } from '../../../lib/store';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ fehler: 'Methode nicht erlaubt' });
  try {
    const meeting = createMeeting(req.body);
    res.status(201).json(meeting);
  } catch (e) {
    res.status(500).json({ fehler: e.message });
  }
}
