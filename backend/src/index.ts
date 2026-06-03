import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { runMigrations } from './db/migrate';
import authRoutes from './routes/auth';
import eventsRoutes from './routes/events';
import mealsRoutes from './routes/meals';
import notesRoutes from './routes/notes';
import goalsRoutes from './routes/goals';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/goals', goalsRoutes);

const PORT = process.env.PORT || 3001;

runMigrations().then(() => {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}).catch((err) => {
  console.error('Failed to run migrations:', err);
  process.exit(1);
});
