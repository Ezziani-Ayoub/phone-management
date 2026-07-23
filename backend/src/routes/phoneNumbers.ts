import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/phone-numbers
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, status, lineStatus, provider, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { phoneNumber: { contains: search as string } },
        { provider: { contains: search as string } },
        { notes: { contains: search as string } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (lineStatus) {
      where.lineStatus = lineStatus;
    }

    if (provider) {
      where.provider = provider;
    }

    const [phoneNumbers, total] = await Promise.all([
      prisma.phoneNumber.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          forfait: true,
          assignments: {
            where: { returnedAt: null },
            include: {
              employee: true,
            },
          },
        },
      }),
      prisma.phoneNumber.count({ where }),
    ]);

    res.json({
      data: phoneNumbers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des numéros', details: error.message });
  }
});

// GET /api/phone-numbers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const phoneNumber = await prisma.phoneNumber.findFirst({
      where: { id: parseInt(req.params.id), deletedAt: null },
      include: {
        forfait: true,
        assignments: {
          include: { employee: true },
          orderBy: { assignedAt: 'desc' },
        },
      },
    });

    if (!phoneNumber) {
      return res.status(404).json({ error: 'Numéro de téléphone non trouvé' });
    }

    res.json(phoneNumber);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération du numéro', details: error.message });
  }
});

// GET /api/phone-numbers/:id/history
router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const phoneNumber = await prisma.phoneNumber.findFirst({
      where: { id: parseInt(req.params.id), deletedAt: null },
      include: { forfait: true }
    });

    if (!phoneNumber) {
      return res.status(404).json({ error: 'Numéro de téléphone non trouvé' });
    }

    const history = await prisma.assignment.findMany({
      where: { phoneNumberId: parseInt(req.params.id) },
      include: {
        employee: true,
        phoneNumber: {
          include: {
            forfait: true
          }
        },
      },
      orderBy: { assignedAt: 'asc' },
    });

    res.json({ phoneNumber, history });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique', details: error.message });
  }
});

// POST /api/phone-numbers
router.post('/', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, provider, status, lineStatus, notes, forfaitId } = req.body;

    if (!phoneNumber || !provider) {
      return res.status(400).json({ error: 'Numéro et opérateur sont obligatoires' });
    }

    // Check uniqueness
    const existing = await prisma.phoneNumber.findFirst({
      where: { phoneNumber, deletedAt: null },
    });

    if (existing) {
      return res.status(409).json({ error: 'Ce numéro de téléphone existe déjà' });
    }

    const created = await prisma.phoneNumber.create({
      data: {
        phoneNumber,
        provider,
        status: status || 'Disponible',
        lineStatus: lineStatus || 'Actif',
        notes: notes || null,
        forfaitId: forfaitId ? parseInt(forfaitId) : null,
      },
    });

    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la création du numéro', details: error.message });
  }
});

// PUT /api/phone-numbers/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, provider, status, lineStatus, notes, forfaitId } = req.body;

    const exists = await prisma.phoneNumber.findFirst({
      where: { id: parseInt(req.params.id), deletedAt: null },
    });

    if (!exists) {
      return res.status(404).json({ error: 'Numéro de téléphone non trouvé' });
    }

    // Check uniqueness if changing number
    if (phoneNumber && phoneNumber !== exists.phoneNumber) {
      const duplicate = await prisma.phoneNumber.findFirst({
        where: { phoneNumber, deletedAt: null, id: { not: parseInt(req.params.id) } },
      });
      if (duplicate) {
        return res.status(409).json({ error: 'Ce numéro de téléphone existe déjà' });
      }
    }

    const updated = await prisma.phoneNumber.update({
      where: { id: parseInt(req.params.id) },
      data: {
        phoneNumber: phoneNumber || exists.phoneNumber,
        provider: provider || exists.provider,
        status: status || exists.status,
        lineStatus: lineStatus || exists.lineStatus,
        notes: notes !== undefined ? notes : exists.notes,
        forfaitId: forfaitId !== undefined ? (forfaitId ? parseInt(forfaitId) : null) : exists.forfaitId,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du numéro', details: error.message });
  }
});

// DELETE /api/phone-numbers/:id (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const exists = await prisma.phoneNumber.findFirst({
      where: { id: parseInt(req.params.id), deletedAt: null },
    });

    if (!exists) {
      return res.status(404).json({ error: 'Numéro de téléphone non trouvé' });
    }

    // Close any active assignments
    await prisma.assignment.updateMany({
      where: {
        phoneNumberId: parseInt(req.params.id),
        returnedAt: null,
      },
      data: { returnedAt: new Date() },
    });

    await prisma.phoneNumber.update({
      where: { id: parseInt(req.params.id) },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'Numéro supprimé avec succès' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la suppression du numéro', details: error.message });
  }
});

export default router;
