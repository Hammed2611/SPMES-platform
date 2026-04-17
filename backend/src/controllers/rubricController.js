import prisma from '../config/prisma.js';

/**
 * Get all available rubric templates
 */
export const getRubricTemplates = async (req, res) => {
  try {
    const templates = await prisma.rubricTemplate.findMany({
      include: { criteria: true }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

/**
 * Create a new rubric template with criteria
 */
export const createRubricTemplate = async (req, res) => {
  try {
    const { title, department, criteria } = req.body; // criteria: [{ name, weight, description, maxPoints }]

    if (criteria.reduce((acc, c) => acc + c.weight, 0) !== 1) {
      return res.status(400).json({ error: 'Total weight must equal 100%' });
    }

    const template = await prisma.rubricTemplate.create({
      data: {
        title,
        department,
        criteria: {
          create: criteria.map(c => ({
            name: c.name,
            weight: c.weight,
            description: c.description,
            maxPoints: c.maxPoints || 100
          }))
        }
      },
      include: { criteria: true }
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Rubric creation error:', error);
    res.status(500).json({ error: 'Failed to create rubric template' });
  }
};

/**
 * Delete a template
 */
export const deleteRubricTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete criteria (Prisma cascade or delete manually)
    await prisma.rubricCriterion.deleteMany({ where: { templateId: id } });
    await prisma.rubricTemplate.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
};
