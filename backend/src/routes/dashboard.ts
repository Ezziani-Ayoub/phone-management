import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

// GET /api/dashboard
router.get('/', async (req: Request, res: Response) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      totalPhoneNumbers,
      assignedNumbers,
      availableNumbers,
      unavailableNumbers,
      recentAssignments,
    ] = await Promise.all([
      prisma.employee.count({ where: { deletedAt: null } }),
      prisma.employee.count({ where: { deletedAt: null, status: 'Actif' } }),
      prisma.phoneNumber.count({ where: { deletedAt: null } }),
      prisma.phoneNumber.count({ where: { deletedAt: null, status: 'Attribué' } }),
      prisma.phoneNumber.count({ where: { deletedAt: null, status: 'Disponible' } }),
      prisma.phoneNumber.count({ where: { deletedAt: null, status: 'Indisponible' } }),
      prisma.assignment.findMany({
        where: { returnedAt: null },
        include: {
          employee: true,
          phoneNumber: true,
        },
        orderBy: { assignedAt: 'desc' },
        take: 5,
      }),
    ]);

    res.json({
      stats: {
        totalEmployees,
        activeEmployees,
        totalPhoneNumbers,
        assignedNumbers,
        availableNumbers,
        unavailableNumbers,
      },
      recentAssignments,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques', details: error.message });
  }
});

export default router;
