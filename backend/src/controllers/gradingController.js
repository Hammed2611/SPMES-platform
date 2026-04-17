import prisma from '../config/prisma.js';
import { generateFeedback } from '../services/aiService.js';
import { sendSSEToUser } from './systemController.js';

/**
 * Generate AI-suggested feedback for a project
 */
export const getAIFeedback = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { scores } = req.body; // Array of { name, score, comment }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { student: { select: { name: true } } }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    const feedback = await generateFeedback(project, scores);
    res.json({ feedback });
  } catch (error) {
    console.error('AI Controller Error:', error);
    res.status(500).json({ error: 'Failed to generate AI feedback' });
  }
};
export const getRubric = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // In a real app, projects map to templates. 
    // Here we'll just fetch the first available template or mock one.
    const rubric = await prisma.rubricTemplate.findFirst({
      include: { criteria: true }
    });
    
    res.json(rubric);
  } catch (error) {
    console.error('Fetch rubric error:', error);
    res.status(500).json({ error: 'Internal server error fetching rubric' });
  }
};

/**
 * Submit grades for a project
 */
export const submitGrade = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { scores } = req.body; // Array of { criterionId, score, comment }

    if (!Array.isArray(scores)) {
      return res.status(400).json({ error: 'Scores must be an array' });
    }

    // 1. Resolve IDs and save individual scores
    const scorePromises = scores.map(async (s) => {
      let critId = s.criterionId;

      // Fallback: If no ID, find by name (for easier developer experience)
      if (!critId && s.name) {
        const crit = await prisma.rubricCriterion.findFirst({
          where: { name: s.name }
        });
        if (crit) critId = crit.id;
      }

      if (!critId) return null; // Skip if still no ID

      return prisma.projectScore.upsert({
        where: { id: `score_${projectId}_${critId}` },
        create: {
          id: `score_${projectId}_${critId}`,
          projectId,
          criterionId: critId,
          score: s.score,
          comment: s.comment,
          evaluatorId: req.user.id
        },
        update: {
          score: s.score,
          comment: s.comment,
          evaluatorId: req.user.id
        }
      });
    });

    await Promise.all(scorePromises);

    // 2. Fetch all scores for this project to calculate total
    const allScores = await prisma.projectScore.findMany({
      where: { projectId },
      include: { criterion: true }
    });

    const finalScore = allScores.reduce((acc, curr) => {
      return acc + (curr.score * curr.criterion.weight);
    }, 0);

    // 3. Update project status and final score
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'GRADED',
        finalScore
      }
    });

    // 4. Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'GRADE_FINALIZED',
        target: projectId,
        userId: req.user.id,
        details: `Final score of ${finalScore.toFixed(2)} calculated via rubric.`
      }
    });

    // 5. Notify Student
    const dbNotif = await prisma.notification.create({
      data: {
        userId: updatedProject.studentId,
        type: 'GRADE',
        message: `Your project "${updatedProject.title}" has been graded.`,
        linkUrl: `/projects/${projectId}`
      }
    });
    
    // Push via SSE
    sendSSEToUser(updatedProject.studentId, 'NEW_NOTIFICATION', dbNotif);

    res.json({ success: true, finalScore, project: updatedProject });
  } catch (error) {
    console.error('Submit grade error:', error);
    res.status(500).json({ error: 'Internal server error submitting grade' });
  }
};
