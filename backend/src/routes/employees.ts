import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../db';

const router = Router();

// GET /api/employees
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search as string } },
        { department: { contains: search as string } },
        { position: { contains: search as string } },
        { email: { contains: search as string } },
        { site: { contains: search as string } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          assignments: {
            where: { returnedAt: null },
            include: {
              phoneNumber: {
                include: {
                  forfait: true,
                },
              },
            },
          },
        },
      }),
      prisma.employee.count({ where }),
    ]);

    res.json({
      data: employees,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des employés', details: error.message });
  }
});

// GET /api/employees/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const employee = await prisma.employee.findFirst({
      where: { id: parseInt(req.params.id), deletedAt: null },
      include: {
        assignments: {
          include: {
            phoneNumber: {
              include: {
                forfait: true,
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'employé', details: error.message });
  }
});

// POST /api/employees
router.post('/', async (req: Request, res: Response) => {
  try {
    const { fullName, department, position, email, status, site } = req.body;

    if (!fullName || !department || !position) {
      return res.status(400).json({ error: 'Nom complet, département et poste sont obligatoires' });
    }

    const employee = await prisma.employee.create({
      data: {
        fullName,
        department,
        position,
        email: email || null,
        status: status || 'Actif',
        site: site || null,
      },
    });

    res.status(201).json(employee);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'employé', details: error.message });
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { fullName, department, position, email, status, site } = req.body;

    const exists = await prisma.employee.findFirst({
      where: { id: parseInt(req.params.id), deletedAt: null },
    });

    if (!exists) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    const employee = await prisma.employee.update({
      where: { id: parseInt(req.params.id) },
      data: {
        fullName,
        department,
        position,
        email: email || null,
        status,
        site: site !== undefined ? site : exists.site,
      },
    });

    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'employé', details: error.message });
  }
});

// DELETE /api/employees/:id (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const exists = await prisma.employee.findFirst({
      where: { id: parseInt(req.params.id), deletedAt: null },
    });

    if (!exists) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    // Return all active assignments before deleting
    await prisma.assignment.updateMany({
      where: {
        employeeId: parseInt(req.params.id),
        returnedAt: null,
      },
      data: {
        returnedAt: new Date(),
      },
    });

    // Update phone numbers that had active assignments
    const activeAssignments = await prisma.assignment.findMany({
      where: {
        employeeId: parseInt(req.params.id),
        returnedAt: { not: null },
      },
    });

    for (const assignment of activeAssignments) {
      const hasOtherActive = await prisma.assignment.findFirst({
        where: {
          phoneNumberId: assignment.phoneNumberId,
          returnedAt: null,
        },
      });
      if (!hasOtherActive) {
        await prisma.phoneNumber.update({
          where: { id: assignment.phoneNumberId },
          data: { status: 'Disponible' },
        });
      }
    }

    await prisma.employee.update({
      where: { id: parseInt(req.params.id) },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'Employé supprimé avec succès' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'employé', details: error.message });
  }
});

export default router;
