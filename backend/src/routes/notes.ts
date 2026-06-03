import { Router, Response } from 'express';
import { pool } from '../db/index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id=$1 ORDER BY pinned DESC, created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { title, body, category, pinned } = req.body;
  if (!title) {
    res.status(400).json({ error: 'title required' });
    return;
  }
  try {
    const result = await pool.query(
      'INSERT INTO notes (user_id, title, body, category, pinned) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [userId, title, body || null, category || null, pinned || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { title, body, category, pinned } = req.body;
  try {
    const check = await pool.query('SELECT id FROM notes WHERE id=$1 AND user_id=$2', [id, userId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    const result = await pool.query(
      'UPDATE notes SET title=$1, body=$2, category=$3, pinned=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
      [title, body || null, category || null, pinned || false, id, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM notes WHERE id=$1 AND user_id=$2 RETURNING id', [id, userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
