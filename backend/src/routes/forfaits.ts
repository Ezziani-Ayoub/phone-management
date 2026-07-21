import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

// GET /api/forfaits - Paginated list of plans
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, operator, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    if (operator) {
      where.operator = operator;
    }

    const [forfaits, total] = await Promise.all([
      prisma.forfait.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { phoneNumbers: { where: { deletedAt: null } } },
          },
        },
      }),
      prisma.forfait.count({ where }),
    ]);

    res.json({
      data: forfaits,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des forfaits', details: error.message });
  }
});

// GET /api/forfaits/all - Unpaginated list for dropdowns
router.get('/all', async (req: Request, res: Response) => {
  try {
    const forfaits = await prisma.forfait.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    res.json(forfaits);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la liste des forfaits', details: error.message });
  }
});

// POST /api/forfaits - Create a new plan
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, price, operator, description } = req.body;

    if (!name || price === undefined || !operator) {
      return res.status(400).json({ error: 'Nom, prix et opérateur sont obligatoires' });
    }

    const forfait = await prisma.forfait.create({
      data: {
        name,
        price: parseFloat(price),
        operator,
        description: description || null,
      },
    });

    res.status(201).json(forfait);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la création du forfait', details: error.message });
  }
});

// PUT /api/forfaits/:id - Update an existing plan
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, price, operator, description } = req.body;
    const id = parseInt(req.params.id);

    const exists = await prisma.forfait.findFirst({
      where: { id, deletedAt: null },
    });

    if (!exists) {
      return res.status(404).json({ error: 'Forfait non trouvé' });
    }

    const updated = await prisma.forfait.update({
      where: { id },
      data: {
        name: name || exists.name,
        price: price !== undefined ? parseFloat(price) : exists.price,
        operator: operator || exists.operator,
        description: description !== undefined ? description : exists.description,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du forfait', details: error.message });
  }
});

// DELETE /api/forfaits/:id (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const exists = await prisma.forfait.findFirst({
      where: { id, deletedAt: null },
    });

    if (!exists) {
      return res.status(404).json({ error: 'Forfait non trouvé' });
    }

    // Check if any active phone numbers are using this forfait
    const usedCount = await prisma.phoneNumber.count({
      where: { forfaitId: id, deletedAt: null },
    });

    if (usedCount > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer ce forfait car il est attribué à des numéros de téléphone actifs.',
      });
    }

    await prisma.forfait.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'Forfait supprimé avec succès' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la suppression du forfait', details: error.message });
  }
});

export default router;
