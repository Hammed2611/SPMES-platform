import prisma from '../config/prisma.js';

/**
 * Get aggregated analytics for the whole class
 */
export const getClassAnalytics = async (req, res) => {
  try {
    // 1. Grade Distribution (Histogram)
    const projects = await prisma.project.findMany({
      where: { status: 'GRADED' },
      select: { finalScore: true }
    });

    const distribution = [
      { name: '0-20', count: 0 },
      { name: '21-40', count: 0 },
      { name: '41-60', count: 0 },
      { name: '61-80', count: 0 },
      { name: '81-100', count: 0 },
    ];

    projects.forEach(p => {
      const s = p.finalScore;
      if (s <= 20) distribution[0].count++;
      else if (s <= 40) distribution[1].count++;
      else if (s <= 60) distribution[2].count++;
      else if (s <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    // 2. Performance by category
    const categoryScores = await prisma.projectScore.findMany({
      include: { criterion: { select: { name: true } } }
    });

    const categoryMap = {};
    categoryScores.forEach(s => {
      const name = s.criterion.name;
      if (!categoryMap[name]) categoryMap[name] = { total: 0, count: 0 };
      categoryMap[name].total += s.score;
      categoryMap[name].count++;
    });

    const categoryStats = Object.keys(categoryMap).map(name => ({
      name,
      avg: parseFloat((categoryMap[name].total / categoryMap[name].count).toFixed(1))
    }));

    // 3. Identification of At-Risk Students
    // Defined as: finalScore < 50 OR (status is PENDING and deadline is passed/near)
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    const atRiskProjects = await prisma.project.findMany({
      where: {
        OR: [
          { finalScore: { lt: 50 }, status: 'GRADED' },
          { status: 'PENDING', deadline: { lt: threeDaysFromNow } }
        ]
      },
      include: { student: { select: { name: true, avatar: true } } }
    });

    const atRisk = atRiskProjects.map(p => ({
      id: p.id,
      title: p.title,
      student: p.student.name,
      avatar: p.student.avatar,
      reason: p.finalScore < 50 ? 'Low Score' : 'Upcoming Deadline',
      urgency: p.deadline && p.deadline < now ? 'CRITICAL' : 'HIGH'
    }));

    // 4. Performance Trends (Weekly Averages)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const gradedProjectsRecent = await prisma.project.findMany({
      where: { 
        status: 'GRADED',
        updatedAt: { gte: thirtyDaysAgo }
      },
      select: { finalScore: true, updatedAt: true },
      orderBy: { updatedAt: 'asc' }
    });

    const trendMap = {};
    gradedProjectsRecent.forEach(p => {
      const diffTime = Math.abs(now - p.updatedAt);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weekNum = Math.ceil(diffDays / 7);
      const weekLabel = `W${5 - weekNum}`;
      
      if (!trendMap[weekLabel]) trendMap[weekLabel] = { total: 0, count: 0 };
      trendMap[weekLabel].total += p.finalScore;
      trendMap[weekLabel].count++;
    });

    const trends = Object.keys(trendMap).sort().map(week => ({
      week,
      score: parseFloat((trendMap[week].total / trendMap[week].count).toFixed(1))
    }));

    res.json({
      distribution,
      categoryStats,
      atRisk,
      trends: trends.length > 0 ? trends : [{ week: 'W1', score: 0 }],
      totalProjects: await prisma.project.count(),
      averageScore: projects.length > 0 
        ? parseFloat((projects.reduce((acc, p) => acc + p.finalScore, 0) / projects.length).toFixed(1))
        : 0
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};
