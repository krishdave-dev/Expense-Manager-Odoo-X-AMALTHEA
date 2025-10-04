const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugApprovalFlows() {
  try {
    console.log('=== APPROVAL FLOWS ===');
    const flows = await prisma.approvalFlow.findMany({
      include: {
        company: true,
        specific_user: true,
      },
    });
    console.log('Approval Flows:', JSON.stringify(flows, null, 2));

    console.log('\n=== MANAGER RELATIONS ===');
    const relations = await prisma.managerRelation.findMany({
      include: {
        employee: { select: { id: true, name: true, email: true, role: true } },
        manager: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    console.log('Manager Relations:', JSON.stringify(relations, null, 2));

    console.log('\n=== USERS ===');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company_id: true,
        is_active: true,
      },
      orderBy: { id: 'asc' },
    });
    console.log('Users:', JSON.stringify(users, null, 2));

    console.log('\n=== RECENT EXPENSES WITH APPROVALS ===');
    const expenses = await prisma.expense.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        employee: { select: { id: true, name: true, email: true, role: true } },
        approvals: {
          include: {
            approver: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });
    console.log('Recent Expenses with Approvals:', JSON.stringify(expenses, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugApprovalFlows();