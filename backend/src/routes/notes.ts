import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { pool } from '../db/index';

const router = Router();
router.use(authMiddleware);

// GET /api/notes
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { category } = req.query;

  try {
    let result;
    if (category) {
      result = await pool.query(
        'SELECT * FROM notes WHERE user_id = $1 AND category = $2 ORDER BY pinned DESC, created_at DESC',
        [userId, category]
      );
    } else {
      result = await pool.query(
        'SELECT * FROM notes WHERE user_id = $1 ORDER BY pinned DESC, created_at DESC',
        [userId]
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notes
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { title, body, category, pinned } = req.body;

  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  try {
    const result = await pool.query(
      'INSERT INTO notes (user_id, title, body, category, pinned) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, body || null, category || null, pinned || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/notes/:id
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { title, body, category, pinned } = req.body;

  try {
    const check = await pool.query('SELECT id FROM notes WHERE id = $1 AND user_id = $2', [id, userId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    const result = await pool.query(
      'UPDATE notes SET title = $1, body = $2, category = $3, pinned = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [title, body || null, category || null, pinned || false, id, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
