import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import employeeRoutes from './routes/employees';
import phoneNumberRoutes from './routes/phoneNumbers';
import assignmentRoutes from './routes/assignments';
import dashboardRoutes from './routes/dashboard';
import forfaitRoutes from './routes/forfaits';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/phone-numbers', phoneNumberRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/forfaits', forfaitRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SOS Villages d\'Enfants - API en ligne' });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur:', err.message);
  res.status(500).json({ error: 'Erreur interne du serveur', details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📱 SOS Villages d'Enfants - Système de gestion des numéros`);
});

export default app;
