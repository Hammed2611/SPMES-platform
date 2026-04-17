import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const lecturerPassword = await bcrypt.hash('lecturer123', salt);
  const studentPassword = await bcrypt.hash('student123', salt);
  const adminPassword = await bcrypt.hash('admin123', salt);

  console.log('Seeding database...');

  // 1. Create Users
  const drSarah = await prisma.user.upsert({
    where: { email: 'sarah.jenkins@university.edu' },
    update: {},
    create: {
      email: 'sarah.jenkins@university.edu',
      password: lecturerPassword,
      name: 'Dr. Sarah Jenkins',
      role: 'lecturer',
      avatar: 'SJ',
      department: 'Computer Science',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      email: 'admin@university.edu',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      avatar: 'AU',
      department: 'Admin Office',
    },
  });

  const james = await prisma.user.upsert({
    where: { email: 'james.wilson@student.edu' },
    update: {},
    create: {
      email: 'james.wilson@student.edu',
      password: studentPassword,
      name: 'James Wilson',
      role: 'student',
      avatar: 'JW',
      department: 'Computer Science',
    },
  });

  const amara = await prisma.user.upsert({
    where: { email: 'amara.okafor@student.edu' },
    update: {},
    create: {
      email: 'amara.okafor@student.edu',
      password: studentPassword,
      name: 'Amara Okafor',
      role: 'student',
      avatar: 'AO',
      department: 'Software Engineering',
    },
  });

  // 2. Create Rubric Template (find or create to avoid duplicates on re-seed)
  let template = await prisma.rubricTemplate.findFirst({
    where: { title: 'Standard CS Project Rubric' },
    include: { criteria: true }
  });

  if (!template) {
    template = await prisma.rubricTemplate.create({
      data: {
        title: 'Standard CS Project Rubric',
        department: 'Computer Science',
        criteria: {
          create: [
            { name: 'Innovation',    weight: 0.25, description: 'Originality and creativity' },
            { name: 'Technical',     weight: 0.40, description: 'Code quality and architecture' },
            { name: 'Presentation',  weight: 0.20, description: 'Clarity and delivery' },
            { name: 'Documentation', weight: 0.15, description: 'Report completeness' },
          ]
        }
      },
      include: { criteria: true }
    });
  }

  const criteria = template.criteria;
  const scoreMap = { Innovation: 85, Technical: 90, Presentation: 88, Documentation: 85 };

  // 3. Create Projects with per-criterion scores for graded ones
  const gradedProject = await prisma.project.create({
    data: {
      title: 'AI-Driven Traffic Optimization System',
      description: 'A machine learning pipeline for city traffic.',
      category: 'Artificial Intelligence',
      semester: '2024/2025 Sem 1',
      status: 'GRADED',
      finalScore: 88.05,
      submittedAt: new Date('2025-03-10'),
      studentId: james.id,
      lecturerId: drSarah.id,
      tags: 'ML,IoT,Python',
    }
  });

  // Seed per-criterion scores for the graded project
  for (const criterion of criteria) {
    await prisma.projectScore.create({
      data: {
        id: `seed_score_${gradedProject.id}_${criterion.id}`,
        projectId: gradedProject.id,
        criterionId: criterion.id,
        score: scoreMap[criterion.name] ?? 80,
        comment: 'Seeded evaluation score.',
        evaluatorId: drSarah.id,
      }
    });
  }

  await prisma.project.create({
    data: {
      title: 'Decentralized Identity Framework',
      description: 'Blockchain-based digital identity.',
      category: 'Cybersecurity',
      semester: '2024/2025 Sem 1',
      status: 'PENDING',
      studentId: amara.id,
      lecturerId: drSarah.id,
      tags: 'Blockchain,Web3',
    }
  });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
