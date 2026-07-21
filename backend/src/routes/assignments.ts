import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

// GET /api/assignments - all active assignments with search
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '10', active } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (active === 'true') {
      where.returnedAt = null;
    }

    if (search) {
      where.OR = [
        { employee: { fullName: { contains: search as string } } },
        { phoneNumber: { phoneNumber: { contains: search as string } } },
        { employee: { department: { contains: search as string } } },
      ];
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { assignedAt: 'desc' },
        include: {
          employee: true,
          phoneNumber: true,
        },
      }),
      prisma.assignment.count({ where }),
    ]);

    res.json({
      data: assignments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des attributions', details: error.message });
  }
});

// POST /api/assignments - assign a phone number to an employee
router.post('/', async (req: Request, res: Response) => {
  try {
    const { employeeId, phoneNumberId, assignedBy } = req.body;

    if (!employeeId || !phoneNumberId || !assignedBy) {
      return res.status(400).json({ error: 'Employé, numéro de téléphone et attribué par sont obligatoires' });
    }

    // Check employee exists and is active
    const employee = await prisma.employee.findFirst({
      where: { id: parseInt(employeeId), deletedAt: null },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    if (employee.status === 'Inactif') {
      return res.status(400).json({ error: 'Impossible d\'attribuer un numéro à un employé inactif' });
    }

    // Check phone number exists and is available
    const phoneNumber = await prisma.phoneNumber.findFirst({
      where: { id: parseInt(phoneNumberId), deletedAt: null },
    });

    if (!phoneNumber) {
      return res.status(404).json({ error: 'Numéro de téléphone non trouvé' });
    }

    if (phoneNumber.status === 'Indisponible') {
      return res.status(400).json({ error: 'Ce numéro est indisponible' });
    }

    // Close any existing active assignment for this phone number
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        phoneNumberId: parseInt(phoneNumberId),
        returnedAt: null,
      },
    });

    if (existingAssignment) {
      await prisma.assignment.update({
        where: { id: existingAssignment.id },
        data: { returnedAt: new Date() },
      });
    }

    // Create new assignment
    const assignment = await prisma.assignment.create({
      data: {
        employeeId: parseInt(employeeId),
        phoneNumberId: parseInt(phoneNumberId),
        assignedBy,
        assignedAt: new Date(),
      },
      include: {
        employee: true,
        phoneNumber: true,
      },
    });

    // Update phone number status to Attribué
    await prisma.phoneNumber.update({
      where: { id: parseInt(phoneNumberId) },
      data: { status: 'Attribué' },
    });

    res.status(201).json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'attribution', details: error.message });
  }
});

// PUT /api/assignments/:id/return - return a phone number
router.put('/:id/return', async (req: Request, res: Response) => {
  try {
    const assignment = await prisma.assignment.findFirst({
      where: { id: parseInt(req.params.id), returnedAt: null },
      include: { phoneNumber: true },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Attribution active non trouvée' });
    }

    const updated = await prisma.assignment.update({
      where: { id: parseInt(req.params.id) },
      data: { returnedAt: new Date() },
      include: { employee: true, phoneNumber: true },
    });

    // Update phone number status back to Disponible
    await prisma.phoneNumber.update({
      where: { id: assignment.phoneNumberId },
      data: { status: 'Disponible' },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors du retour du numéro', details: error.message });
  }
});

export default router;
