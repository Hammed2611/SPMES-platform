import prisma from '../config/prisma.js';

/**
 * Get peer review assignments for the student
 */
export const getMyPeerAssignments = async (req, res) => {
  try {
    const assignments = await prisma.peerReview.findMany({
      where: { reviewerId: req.user.id },
      include: {
        project: {
          select: { title: true, category: true, description: true }
        }
      }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching peer assignments' });
  }
};

/**
 * Submit a peer review score
 */
export const submitPeerReview = async (req, res) => {
  try {
    const { projectId, score, comment } = req.body;

    if (!projectId || score === undefined) {
      return res.status(400).json({ error: 'Project ID and score are required' });
    }

    const review = await prisma.peerReview.create({
      data: {
        score,
        comment,
        reviewerId: req.user.id,
        projectId
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'PEER_REVIEW_SUBMITTED',
        target: projectId,
        userId: req.user.id,
        details: `Gave a score of ${score} to project ${projectId}`
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Peer review error:', error);
    res.status(500).json({ error: 'Internal server error submitting peer review' });
  }
};
