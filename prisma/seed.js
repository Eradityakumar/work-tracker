const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function getPastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

async function main() {
  console.log("🌱 Seeding WorkTrail AI Database...");

  // Clean old data if any
  await prisma.attachment.deleteMany();
  await prisma.workLog.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.report.deleteMany();
  await prisma.aIInsight.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Primary Employee User
  const employee = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "employee@worktrail.ai",
      password: hashedPassword,
      role: "EMPLOYEE",
      department: "Core Engineering",
      designation: "Senior Full Stack Engineer",
    },
  });

  // 2. Create Admin / Manager User
  const admin = await prisma.user.create({
    data: {
      name: "Sarah Chen",
      email: "admin@worktrail.ai",
      password: hashedPassword,
      role: "ADMIN",
      department: "Engineering Leadership",
      designation: "VP of Engineering",
    },
  });

  // 3. Create Additional Team Members for Team Analytics
  const teamMember1 = await prisma.user.create({
    data: {
      name: "Marcus Vance",
      email: "marcus@worktrail.ai",
      password: hashedPassword,
      role: "EMPLOYEE",
      department: "Product Design",
      designation: "Lead UI/UX Designer",
    },
  });

  const teamMember2 = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "priya@worktrail.ai",
      password: hashedPassword,
      role: "EMPLOYEE",
      department: "Platform & DevOps",
      designation: "DevOps Architect",
    },
  });

  const today = getPastDate(0);
  const yesterday = getPastDate(1);
  const twoDaysAgo = getPastDate(2);
  const threeDaysAgo = getPastDate(3);
  const fourDaysAgo = getPastDate(4);

  // 4. Create Work Logs for Alex (Today)
  const task1 = await prisma.workLog.create({
    data: {
      userId: employee.id,
      title: "Daily Engineering Sync & Sprint Planning",
      description: "Reviewed weekly sprint goals, discussed cross-service latency benchmarks, and coordinated deployment windows.",
      category: "Meeting",
      date: today,
      startTime: "09:00",
      endTime: "09:45",
      durationMinutes: 45,
      priority: "MEDIUM",
      status: "COMPLETED",
      notes: "Sprint velocity tracking on schedule. Need to verify database connection pool sizing.",
      learnings: "Agile retrospective highlighted the benefit of short, focused 15-minute async standups.",
      tags: "standup,sprint,planning",
    },
  });

  const task2 = await prisma.workLog.create({
    data: {
      userId: employee.id,
      title: "Architect Next-Gen Search Indexing Pipeline",
      description: "Designed resilient inverted index caching using Redis and Prisma, reducing lookup latency by 42%.",
      category: "Development",
      date: today,
      startTime: "10:00",
      endTime: "12:30",
      durationMinutes: 150,
      priority: "HIGH",
      status: "COMPLETED",
      notes: "Implemented batch ingestion with debounce. Added telemetry metrics for cache hit ratio.",
      learnings: "Atomic pipeline transactions avoid dirty reads during simultaneous writes.",
      tags: "backend,redis,indexing,architecture",
    },
  });

  const task3 = await prisma.workLog.create({
    data: {
      userId: employee.id,
      title: "Cross-Functional UX Alignment on Analytics Charts",
      description: "Reviewed responsive visualization mocks with Marcus Vance. Agreed on color accessibility for colorblind modes.",
      category: "Design",
      date: today,
      startTime: "13:30",
      endTime: "14:30",
      durationMinutes: 60,
      priority: "MEDIUM",
      status: "COMPLETED",
      notes: "Recharts tooltip styling finalized with dark mode support.",
      learnings: "CSS variables mapped to HSL make dynamic dark/light chart theme switching seamless.",
      tags: "design,recharts,ui",
    },
  });

  const task4 = await prisma.workLog.create({
    data: {
      userId: employee.id,
      title: "Implement AI Evidence OCR & Summarizer Service",
      description: "Built the unified evidence extraction pipeline that parses uploads, analyzes file metadata, and generates auto-tagging summaries.",
      category: "Development",
      date: today,
      startTime: "14:45",
      endTime: "17:15",
      durationMinutes: 150,
      priority: "HIGH",
      status: "COMPLETED",
      notes: "Integrated OpenAI fallback heuristics to ensure 100% test reliability offline.",
      learnings: "Multi-modal vision payloads require proper MIME type validation before base64 transmission.",
      tags: "ai,ocr,evidence,vision",
    },
  });

  const task5 = await prisma.workLog.create({
    data: {
      userId: employee.id,
      title: "API Documentation & End-to-End Test Suite",
      description: "Authored OpenAPI specification and created automated test scenarios for report generation endpoints.",
      category: "Documentation",
      date: today,
      startTime: "17:30",
      endTime: "18:30",
      durationMinutes: 60,
      priority: "LOW",
      status: "IN_PROGRESS",
      notes: "8 out of 10 test suites passing. Remaining test verifies edge cases for leap years.",
      learnings: "Comprehensive contract testing catches breaking schema changes before client delivery.",
      tags: "docs,openapi,testing",
    },
  });

  // Attachments for Alex's tasks
  await prisma.attachment.create({
    data: {
      userId: employee.id,
      workLogId: task2.id,
      fileName: "indexing_benchmark_results.png",
      fileType: "image/png",
      fileSize: 482100,
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
      extractedText: "[OCR Log] Benchmark p99 latency: 18ms. Redis cache hit rate: 94.2%. Max memory consumption: 142MB. CPU utilization stable at 12%.",
      aiSummary: "Visual graph proof proving a 42% reduction in search indexing latency after Redis pipeline deployment.",
      suggestedCategory: "Development",
    },
  });

  await prisma.attachment.create({
    data: {
      userId: employee.id,
      workLogId: task4.id,
      fileName: "ai_evidence_pipeline_architecture.pdf",
      fileType: "application/pdf",
      fileSize: 1240000,
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
      extractedText: "[Document Analysis: Architecture Diagram] Ingestion Worker -> Vision OCR Parser -> Context Vector Store -> Executive Report Generator. Verified with 99.8% precision.",
      aiSummary: "Technical architecture blueprint illustrating asynchronous evidence processing and LLM summarization pipeline.",
      suggestedCategory: "Development",
    },
  });

  // Logs for previous days (for analytics trends)
  await prisma.workLog.createMany({
    data: [
      {
        userId: employee.id,
        title: "Auth Refactoring with NextAuth & JWT Session tokens",
        description: "Hardened authentication flow, added role verification middleware, and eliminated token re-hydration lag.",
        category: "Development",
        date: yesterday,
        startTime: "09:30",
        endTime: "13:00",
        durationMinutes: 210,
        priority: "HIGH",
        status: "COMPLETED",
        tags: "auth,security,nextjs",
      },
      {
        userId: employee.id,
        title: "Security Audit & Vulnerability Assessment",
        description: "Scanned all npm dependencies, audited SQL/Prisma query bounds, and tested session revocation.",
        category: "Review",
        date: yesterday,
        startTime: "14:00",
        endTime: "17:30",
        durationMinutes: 210,
        priority: "HIGH",
        status: "COMPLETED",
        tags: "security,audit,compliance",
      },
      {
        userId: employee.id,
        title: "Cloud Infrastructure Cost Optimization",
        description: "Reduced unattached EBS volumes and optimized container auto-scaling thresholds.",
        category: "Operations",
        date: twoDaysAgo,
        startTime: "10:00",
        endTime: "13:30",
        durationMinutes: 210,
        priority: "MEDIUM",
        status: "COMPLETED",
        tags: "devops,cloud,aws",
      },
      {
        userId: employee.id,
        title: "Client Stakeholder Demonstration & Q&A",
        description: "Presented the new reporting module prototype to enterprise stakeholders. Received unanimous positive feedback.",
        category: "Meeting",
        date: twoDaysAgo,
        startTime: "14:30",
        endTime: "16:00",
        durationMinutes: 90,
        priority: "HIGH",
        status: "COMPLETED",
        tags: "client,presentation,demo",
      },
      {
        userId: employee.id,
        title: "Research on WebAssembly OCR Performance",
        description: "Conducted benchmark tests comparing client-side Tesseract.js with cloud LLM vision models.",
        category: "Research",
        date: threeDaysAgo,
        startTime: "09:00",
        endTime: "12:00",
        durationMinutes: 180,
        priority: "MEDIUM",
        status: "COMPLETED",
        tags: "research,wasm,ocr",
      },
      {
        userId: employee.id,
        title: "Database Schema Normalization & Migration",
        description: "Normalized work log attachments and added composite indexes for lightning-fast chronological lookups.",
        category: "Development",
        date: fourDaysAgo,
        startTime: "11:00",
        endTime: "16:00",
        durationMinutes: 300,
        priority: "HIGH",
        status: "COMPLETED",
        tags: "database,prisma,migration",
      },
    ],
  });

  // Seed Journal Entry for Alex
  await prisma.journal.create({
    data: {
      userId: employee.id,
      date: today,
      reflection: "Today was exceptionally productive. The focus on backend search indexing without mid-morning meeting disruptions allowed us to hit our target latency in half the estimated time.",
      learnings: "Learned that client-side image downsampling before upload drastically cuts network payload times by 80% without degrading OCR accuracy.",
      actionItems: "1. Finalize OpenAPI endpoint specifications.\n2. Review Marcus's mobile sheet designs.\n3. Prep Friday demo deck.",
      isPrivate: false,
    },
  });

  // Seed AI Report for Alex
  await prisma.report.create({
    data: {
      userId: employee.id,
      type: "DAILY",
      title: `Daily Work Report – ${today}`,
      periodStart: today,
      periodEnd: today,
      hoursWorked: 7.8,
      tasksCompleted: 4,
      productivityScore: 94,
      content: `## 📋 Daily Productivity & Work Report
*Generated by WorkTrail AI Engine*

### 🚀 Executive Overview
Today saw a total of **7.8 hours** logged across **5 total activities**, with **4 tasks completed** and **1 items continuing in progress**.

### ⏱️ Category & Time Allocation
* **Development**: 5h 0m (64%)
* **Design**: 1h 0m (13%)
* **Meeting**: 0h 45m (10%)
* **Documentation**: 1h 0m (13%)

### 🏆 Key Accomplishments Today
- **Architect Next-Gen Search Indexing Pipeline**: Designed resilient inverted index caching using Redis and Prisma, reducing lookup latency by 42%.
- **Implement AI Evidence OCR & Summarizer Service**: Built unified evidence extraction pipeline with fallback heuristics.
- **Cross-Functional UX Alignment**: Finalized HSL color tokens with Marcus for high-contrast accessibility.

### 🎯 AI Recommendations
- Outstanding focus ratio today (>75% deep work).
- Keep protecting the 10:00 AM - 12:30 PM morning block from ad-hoc syncs.`,
    },
  });

  // Seed some logs for other team members (for Admin view)
  await prisma.workLog.createMany({
    data: [
      {
        userId: teamMember1.id,
        title: "Design System Dark Mode Tokens & Components",
        description: "Created complete Figma UI kit with accessible contrast variants and mobile bottom sheets.",
        category: "Design",
        date: today,
        startTime: "10:00",
        endTime: "16:00",
        durationMinutes: 360,
        priority: "HIGH",
        status: "COMPLETED",
      },
      {
        userId: teamMember2.id,
        title: "Kubernetes Cluster Ingress & SSL Renewal Automation",
        description: "Configured cert-manager and automated ingress rules across multi-region clusters.",
        category: "Operations",
        date: today,
        startTime: "09:00",
        endTime: "15:30",
        durationMinutes: 390,
        priority: "HIGH",
        status: "COMPLETED",
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
  console.log("   👉 Employee: employee@worktrail.ai / password123");
  console.log("   👉 Admin:    admin@worktrail.ai / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
