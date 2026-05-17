import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TARGET_EMAIL = 'ayomideoluwadamilare588@gmail.com';

async function promote() {
  console.log(`🚀 Starting Promotion for: ${TARGET_EMAIL}...`);
  
  try {
    const user = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });

    if (!user) {
        console.log('-----------------------------------------');
        console.log('❌ ERROR: Could not find that email.');
        
        // Debug: List all users to see where we are connected
        const allUsers = await prisma.user.findMany({ select: { email: true, role: true } });
        console.log(`\nI am currently connected to a database that has ${allUsers.length} users:`);
        if (allUsers.length === 0) {
            console.log(' (Database is completely empty)');
        } else {
            allUsers.forEach(u => console.log(` - ${u.email} (${u.role})`));
        }
        
        console.log('\nVerify that your email is in this list. If the list is empty, you haven\'t registered on the LIVE site yet!');
        console.log('-----------------------------------------');
        return;
    }

    const updatedUser = await prisma.user.update({
      where: { email: TARGET_EMAIL },
      data: { role: 'admin' }
    });

    console.log('-----------------------------------------');
    console.log('✅ SUCCESS! Account Promoted to ADMIN.');
    console.log(`👤 Name: ${updatedUser.name}`);
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`🔑 New Role: ${updatedUser.role.toUpperCase()}`);
    console.log('-----------------------------------------');
    console.log('You can now log in to the /admin portal.');
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

promote();
