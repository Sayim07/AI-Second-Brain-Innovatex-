require('dotenv').config();

const connectDB = require('../config/db');
const firebaseAdmin = require('../config/firebase');
const Document = require('../models/Document');
const Task = require('../models/Task');

const DEMO_EMAIL = 'demo@secondbrain.ai';
const DEMO_PASSWORD = 'Demo@2026';

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function getOrCreateDemoUser() {
  try {
    return await firebaseAdmin.auth().getUserByEmail(DEMO_EMAIL);
  } catch (error) {
    return firebaseAdmin.auth().createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      displayName: 'Demo User',
      emailVerified: true,
    });
  }
}

async function createDocumentWithTasks(userId, config, offsetDays, completedTaskIndexes = []) {
  const document = await Document.create({
    userId,
    name: config.name,
    type: config.type,
    rawText: config.summary,
    summary: config.summary,
    insights: config.insights,
    taskCount: config.tasks.length,
    createdAt: daysFromNow(offsetDays),
  });

  const tasks = [];
  for (let index = 0; index < config.tasks.length; index += 1) {
    const task = config.tasks[index];
    tasks.push(
      Task.create({
        userId,
        sourceDocId: document._id,
        task: task.task,
        deadline: task.deadline,
        priority: task.priority,
        tags: task.tags || [],
        status: completedTaskIndexes.includes(index) ? 'completed' : 'pending',
        createdAt: daysFromNow(offsetDays + index * 0.1),
        updatedAt: daysFromNow(offsetDays + index * 0.1),
      })
    );
  }

  return Promise.all(tasks);
}

async function run() {
  await connectDB();
  const demoUser = await getOrCreateDemoUser();

  await Task.deleteMany({ userId: demoUser.uid });
  await Document.deleteMany({ userId: demoUser.uid });

  const docs = [
    {
      name: 'Internship Offer - TechCorp',
      type: 'email',
      summary: 'TechCorp has extended a software engineering internship offer starting June 15 with a monthly stipend of Rs 25,000.',
      insights: ['Internship starts June 15, 2026', 'Stipend: Rs 25,000/month', 'Reporting to: Priya Sharma, Engineering Lead'],
      tasks: [
        { task: 'Reply to TechCorp offer acceptance', deadline: daysFromNow(2), priority: 'high', tags: ['internship', 'reply'] },
        { task: 'Submit signed offer letter', deadline: daysFromNow(5), priority: 'high', tags: ['documents'] },
        { task: 'Arrange accommodation in Bangalore', deadline: daysFromNow(14), priority: 'medium', tags: ['relocation'] },
      ],
    },
    {
      name: 'Assignment Brief - DSA Project',
      type: 'pdf',
      summary: 'DSA assignment requiring BST implementation with a complexity analysis report, due in 3 days for 30% of final grade.',
      insights: ['Assignment worth 30% of final grade', 'Late submissions penalized 10% per day', 'Must use Python or Java only'],
      tasks: [
        { task: 'Implement binary search tree with insert/delete/search', deadline: daysFromNow(3), priority: 'high', tags: ['dsa', 'bst'] },
        { task: 'Write complexity analysis report (2 pages)', deadline: daysFromNow(3), priority: 'high', tags: ['report'] },
        { task: 'Submit on university portal before 11:59 PM', deadline: daysFromNow(3), priority: 'high', tags: ['submission'] },
        { task: 'Pair review code with lab partner', deadline: daysFromNow(2), priority: 'medium', tags: ['review'] },
      ],
    },
    {
      name: 'Flipkart Delivery Notification',
      type: 'email',
      summary: 'Flipkart delivery of a mechanical keyboard scheduled for tomorrow between 10AM-6PM, requires OTP verification.',
      insights: ['Order: Mechanical Keyboard (Cherry MX Red)', 'Order value: Rs 4,499', 'Delivery partner: Ekart Logistics'],
      tasks: [
        { task: 'Be available to receive delivery between 10AM-6PM', deadline: daysFromNow(1), priority: 'high', tags: ['delivery'] },
        { task: 'Verify package seal before accepting', deadline: daysFromNow(1), priority: 'medium', tags: ['delivery'] },
        { task: 'Keep delivery OTP ready: check SMS', deadline: daysFromNow(1), priority: 'high', tags: ['otp'] },
      ],
    },
    {
      name: 'Weekly Goals - Personal Notes',
      type: 'text',
      summary: 'Personal weekly goals covering LeetCode practice, reading, job applications, and GitHub updates.',
      insights: ['Target: 2 DSA problems per day', 'Reading goal: 1 chapter per week'],
      tasks: [
        { task: 'Complete LeetCode 150 problem 23-27', deadline: daysFromNow(7), priority: 'medium', tags: ['leetcode'] },
        { task: 'Read 20 pages of Clean Code', deadline: daysFromNow(7), priority: 'low', tags: ['reading'] },
        { task: 'Apply to 5 more companies on LinkedIn', deadline: daysFromNow(5), priority: 'medium', tags: ['career'] },
        { task: 'Update GitHub with DSA solutions', deadline: daysFromNow(7), priority: 'low', tags: ['github'] },
      ],
    },
  ];

  for (let index = 0; index < docs.length; index += 1) {
    const completedIndexes = index === 0 ? [0] : index === 1 ? [0] : index === 2 ? [0, 2] : [1];
    await createDocumentWithTasks(demoUser.uid, docs[index], -index - 1, completedIndexes);
  }

  const allTasks = await Task.find({ userId: demoUser.uid });
  const pendingCount = allTasks.filter((task) => task.status === 'pending').length;
  const completedCount = allTasks.filter((task) => task.status === 'completed').length;

  console.log(`✅ Demo seeded: 4 documents, ${allTasks.length} tasks (${pendingCount} pending, ${completedCount} completed)`);
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
