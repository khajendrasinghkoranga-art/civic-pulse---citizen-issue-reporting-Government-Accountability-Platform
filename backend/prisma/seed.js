// ============================================================
// CivicPulse – Database Seed Script
// ============================================================

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CivicPulse database...\n");

  // ──────────────────────────────────────────────────────────
  // 1. USERS
  // ──────────────────────────────────────────────────────────

  const passwordHash = await bcrypt.hash("CivicPulse@123", 12);

  const superAdmin = await prisma.user.create({
    data: {
      name: "Rajesh Kumar",
      email: "admin@civicpulse.in",
      passwordHash,
      phone: "+919876543210",
      role: "SUPER_ADMIN",
      isVerified: true,
      isActive: true,
      identityVerified: true,
    },
  });
  console.log("✅ Super Admin created:", superAdmin.email);

  const deptStaff = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya.staff@civicpulse.in",
      passwordHash,
      phone: "+919876543211",
      role: "DEPARTMENT_STAFF",
      isVerified: true,
      isActive: true,
    },
  });
  console.log("✅ Department Staff created:", deptStaff.email);

  const deptAdmin = await prisma.user.create({
    data: {
      name: "Suresh Patel",
      email: "suresh.deptadmin@civicpulse.in",
      passwordHash,
      phone: "+919876543212",
      role: "DEPARTMENT_ADMIN",
      isVerified: true,
      isActive: true,
    },
  });
  console.log("✅ Department Admin created:", deptAdmin.email);

  const citizen1 = await prisma.user.create({
    data: {
      name: "Ananya Gupta",
      email: "ananya@example.com",
      passwordHash,
      phone: "+919876543213",
      role: "CITIZEN",
      isVerified: true,
      isActive: true,
    },
  });
  console.log("✅ Citizen 1 created:", citizen1.email);

  const citizen2 = await prisma.user.create({
    data: {
      name: "Vikram Singh",
      email: "vikram@example.com",
      passwordHash,
      phone: "+919876543214",
      role: "CITIZEN",
      isVerified: true,
      isActive: true,
    },
  });
  console.log("✅ Citizen 2 created:", citizen2.email);

  // ──────────────────────────────────────────────────────────
  // 2. DEPARTMENTS
  // ──────────────────────────────────────────────────────────

  const deptMunicipal = await prisma.department.create({
    data: {
      name: "Municipal Corporation",
      code: "MUNI_CORP",
      description: "Main municipal body for city administration",
      phone: "+911234567890",
      email: "municipal@civicpulse.in",
      city: "Lucknow",
      state: "Uttar Pradesh",
    },
  });

  const deptSanitation = await prisma.department.create({
    data: {
      name: "Sanitation Department",
      code: "SANITATION",
      description: "Waste management and cleanliness",
      phone: "+911234567891",
      email: "sanitation@civicpulse.in",
      city: "Lucknow",
      state: "Uttar Pradesh",
    },
  });

  const deptPWD = await prisma.department.create({
    data: {
      name: "Public Works Department",
      code: "PWD",
      description: "Roads, bridges, and public infrastructure",
      phone: "+911234567892",
      email: "pwd@civicpulse.in",
      city: "Lucknow",
      state: "Uttar Pradesh",
    },
  });

  const deptWater = await prisma.department.create({
    data: {
      name: "Water Supply Department",
      code: "WATER_SUPPLY",
      description: "Drinking water and water infrastructure",
      phone: "+911234567893",
      email: "water@civicpulse.in",
      city: "Lucknow",
      state: "Uttar Pradesh",
    },
  });

  const deptElectricity = await prisma.department.create({
    data: {
      name: "Electricity Department",
      code: "ELECTRICITY",
      description: "Power supply and electrical infrastructure",
      phone: "+911234567894",
      email: "electricity@civicpulse.in",
      city: "Lucknow",
      state: "Uttar Pradesh",
    },
  });

  const deptTraffic = await prisma.department.create({
    data: {
      name: "Traffic Department",
      code: "TRAFFIC",
      description: "Traffic management and road safety",
      phone: "+911234567895",
      email: "traffic@civicpulse.in",
      city: "Lucknow",
      state: "Uttar Pradesh",
    },
  });

  console.log("✅ 6 Departments created");

  // ──────────────────────────────────────────────────────────
  // 3. ISSUE CATEGORIES (17 categories)
  // ──────────────────────────────────────────────────────────

  const categories = await Promise.all([
    prisma.issueCategory.create({
      data: {
        name: "GARBAGE_WASTE",
        description: "Garbage collection, waste dumping, overflowing bins",
        icon: "🗑️",
        defaultPriority: "MEDIUM",
        defaultSlaHours: 24,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "STREET_CLEANLINESS",
        description: "Dirty streets, littering, unclean public areas",
        icon: "🧹",
        defaultPriority: "MEDIUM",
        defaultSlaHours: 48,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "POTHOLE_ROAD_DAMAGE",
        description: "Potholes, road cracks, damaged roads",
        icon: "🕳️",
        defaultPriority: "HIGH",
        defaultSlaHours: 72,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "STREET_LIGHT",
        description: "Non-functioning, damaged, or missing street lights",
        icon: "💡",
        defaultPriority: "MEDIUM",
        defaultSlaHours: 48,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "WATER_SUPPLY",
        description: "Water shortage, contaminated water, pipe leakage",
        icon: "💧",
        defaultPriority: "HIGH",
        defaultSlaHours: 24,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "DRAINAGE_SEWER",
        description: "Blocked drains, sewage overflow, drainage issues",
        icon: "🚿",
        defaultPriority: "HIGH",
        defaultSlaHours: 24,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "FLOODING",
        description: "Waterlogging, flood-prone areas, stagnant water",
        icon: "🌊",
        defaultPriority: "URGENT",
        defaultSlaHours: 12,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "ELECTRICITY",
        description: "Power outage, exposed wires, transformer issues",
        icon: "⚡",
        defaultPriority: "HIGH",
        defaultSlaHours: 24,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "TRAFFIC",
        description: "Traffic signal issues, congestion, road safety",
        icon: "🚦",
        defaultPriority: "MEDIUM",
        defaultSlaHours: 48,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "PUBLIC_SAFETY",
        description: "Unsafe areas, security concerns, crime-prone zones",
        icon: "🛡️",
        defaultPriority: "URGENT",
        defaultSlaHours: 12,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "FIRE_HAZARD",
        description: "Fire risks, inflammable materials, unsafe buildings",
        icon: "🔥",
        defaultPriority: "URGENT",
        defaultSlaHours: 6,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "STRAY_ANIMALS",
        description: "Stray dogs, cattle on roads, animal-related issues",
        icon: "🐕",
        defaultPriority: "MEDIUM",
        defaultSlaHours: 48,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "PARK_PUBLIC_SPACE",
        description: "Park maintenance, playground issues, public spaces",
        icon: "🌳",
        defaultPriority: "LOW",
        defaultSlaHours: 96,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "NOISE_POLLUTION",
        description: "Excessive noise, loudspeakers, construction noise",
        icon: "🔊",
        defaultPriority: "LOW",
        defaultSlaHours: 72,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "ENCROACHMENT",
        description: "Illegal encroachment, unauthorized construction",
        icon: "🚧",
        defaultPriority: "MEDIUM",
        defaultSlaHours: 72,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "GOVERNMENT_SERVICE",
        description: "Government office issues, delayed services, corruption",
        icon: "🏛️",
        defaultPriority: "MEDIUM",
        defaultSlaHours: 72,
      },
    }),
    prisma.issueCategory.create({
      data: {
        name: "OTHER",
        description: "Other civic issues not covered above",
        icon: "📋",
        defaultPriority: "MEDIUM",
        defaultSlaHours: 72,
      },
    }),
  ]);

  console.log("✅ 17 Issue Categories created");

  // Map for easy lookup
  const catMap = {};
  categories.forEach((c) => (catMap[c.name] = c));

  // ──────────────────────────────────────────────────────────
  // 4. SAMPLE ISSUES (5 issues with different data)
  // ──────────────────────────────────────────────────────────

  const now = new Date();

  const issue1 = await prisma.issue.create({
    data: {
      title: "Large pothole on Hazratganj main road",
      description:
        "There is a large pothole near Hazratganj crossing that has been causing accidents. Multiple vehicles have been damaged. The pothole is approximately 3 feet wide and 1 foot deep.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      latitude: 26.8467,
      longitude: 80.9462,
      address: "Hazratganj Crossing, MG Road",
      ward: "Ward 12",
      locality: "Hazratganj",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
      reporterId: citizen1.id,
      categoryId: catMap["POTHOLE_ROAD_DAMAGE"].id,
      slaDueAt: new Date(now.getTime() + 72 * 60 * 60 * 1000),
    },
  });

  const issue2 = await prisma.issue.create({
    data: {
      title: "Overflowing garbage bin near Aminabad market",
      description:
        "The community garbage bin near Aminabad market entrance has not been cleared for 3 days. It is overflowing and causing a foul smell. Stray dogs are spreading the garbage around.",
      status: "SUBMITTED",
      priority: "MEDIUM",
      latitude: 26.8393,
      longitude: 80.9231,
      address: "Gate No. 2, Aminabad Market",
      ward: "Ward 8",
      locality: "Aminabad",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226018",
      reporterId: citizen2.id,
      categoryId: catMap["GARBAGE_WASTE"].id,
      slaDueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  const issue3 = await prisma.issue.create({
    data: {
      title: "Street lights not working on Gomti Nagar main road",
      description:
        "A stretch of approximately 500 meters on Gomti Nagar main road has been without street lights for the past week. The area becomes completely dark after 7 PM making it unsafe.",
      status: "UNDER_REVIEW",
      priority: "HIGH",
      latitude: 26.8563,
      longitude: 81.0127,
      address: "Sector 10, Gomti Nagar Main Road",
      ward: "Ward 22",
      locality: "Gomti Nagar",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226010",
      reporterId: citizen1.id,
      categoryId: catMap["STREET_LIGHT"].id,
      slaDueAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
    },
  });

  const issue4 = await prisma.issue.create({
    data: {
      title: "Water supply disrupted in Aliganj",
      description:
        "Our entire colony in Aliganj Sector C has been without water supply for 2 days. No prior notice was given. Residents are having to buy water tankers at their own expense.",
      status: "RESOLVED",
      priority: "URGENT",
      latitude: 26.8887,
      longitude: 80.9426,
      address: "Sector C, Aliganj Colony",
      ward: "Ward 35",
      locality: "Aliganj",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226024",
      reporterId: citizen2.id,
      categoryId: catMap["WATER_SUPPLY"].id,
      slaDueAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // past due
      resolvedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    },
  });

  const issue5 = await prisma.issue.create({
    data: {
      title: "Stray dogs menace near Indira Nagar park",
      description:
        "A pack of about 15 stray dogs has been terrorizing residents near Indira Nagar C-Block park. Multiple children have been chased. One elderly person was bitten last week.",
      status: "SUBMITTED",
      priority: "HIGH",
      latitude: 26.8729,
      longitude: 81.0048,
      address: "C-Block Park, Indira Nagar",
      ward: "Ward 18",
      locality: "Indira Nagar",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226016",
      isAnonymous: true,
      reporterId: citizen1.id,
      categoryId: catMap["STRAY_ANIMALS"].id,
      slaDueAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
    },
  });

  console.log("✅ 5 Sample Issues created");

  // ──────────────────────────────────────────────────────────
  // 5. ISSUE EVIDENCE
  // ──────────────────────────────────────────────────────────

  await prisma.issueEvidence.createMany({
    data: [
      {
        issueId: issue1.id,
        uploadedBy: citizen1.id,
        fileUrl: "/uploads/issues/pothole_hazratganj_1.jpg",
        fileType: "image/jpeg",
        fileSize: 245000,
      },
      {
        issueId: issue1.id,
        uploadedBy: citizen1.id,
        fileUrl: "/uploads/issues/pothole_hazratganj_2.jpg",
        fileType: "image/jpeg",
        fileSize: 312000,
      },
      {
        issueId: issue2.id,
        uploadedBy: citizen2.id,
        fileUrl: "/uploads/issues/garbage_aminabad_1.jpg",
        fileType: "image/jpeg",
        fileSize: 198000,
      },
      {
        issueId: issue4.id,
        uploadedBy: citizen2.id,
        fileUrl: "/uploads/issues/water_aliganj_1.jpg",
        fileType: "image/jpeg",
        fileSize: 156000,
      },
    ],
  });

  console.log("✅ Issue Evidence created");

  // ──────────────────────────────────────────────────────────
  // 6. ISSUE STATUS HISTORY
  // ──────────────────────────────────────────────────────────

  await prisma.issueStatusHistory.createMany({
    data: [
      // Issue 1: SUBMITTED → UNDER_REVIEW → IN_PROGRESS
      {
        issueId: issue1.id,
        oldStatus: "SUBMITTED",
        newStatus: "UNDER_REVIEW",
        changedBy: deptAdmin.id,
        remarks: "Issue received and forwarded to PWD",
        changedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      },
      {
        issueId: issue1.id,
        oldStatus: "UNDER_REVIEW",
        newStatus: "IN_PROGRESS",
        changedBy: deptStaff.id,
        remarks: "Road repair crew dispatched to Hazratganj",
        changedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      // Issue 3: SUBMITTED → UNDER_REVIEW
      {
        issueId: issue3.id,
        oldStatus: "SUBMITTED",
        newStatus: "UNDER_REVIEW",
        changedBy: deptAdmin.id,
        remarks: "Forwarded to Electricity Department for inspection",
        changedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
      // Issue 4: SUBMITTED → UNDER_REVIEW → IN_PROGRESS → RESOLVED
      {
        issueId: issue4.id,
        oldStatus: "SUBMITTED",
        newStatus: "UNDER_REVIEW",
        changedBy: deptAdmin.id,
        remarks: "Urgent case — Water Department notified immediately",
        changedAt: new Date(now.getTime() - 36 * 60 * 60 * 1000),
      },
      {
        issueId: issue4.id,
        oldStatus: "UNDER_REVIEW",
        newStatus: "IN_PROGRESS",
        changedBy: deptStaff.id,
        remarks: "Repair team sent to fix main pipeline",
        changedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      {
        issueId: issue4.id,
        oldStatus: "IN_PROGRESS",
        newStatus: "RESOLVED",
        changedBy: deptStaff.id,
        remarks: "Pipeline repaired. Water supply restored to all blocks.",
        changedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Issue Status History created");

  // ──────────────────────────────────────────────────────────
  // 7. ISSUE ASSIGNMENTS
  // ──────────────────────────────────────────────────────────

  await prisma.issueAssignment.createMany({
    data: [
      {
        issueId: issue1.id,
        departmentId: deptPWD.id,
        assignedTo: deptStaff.id,
        assignedBy: deptAdmin.id,
        remarks: "Assign pothole repair to PWD crew",
        assignedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        acceptedAt: new Date(now.getTime() - 46 * 60 * 60 * 1000),
      },
      {
        issueId: issue3.id,
        departmentId: deptElectricity.id,
        assignedTo: deptStaff.id,
        assignedBy: deptAdmin.id,
        remarks: "Inspect and fix street light issue",
        assignedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
      {
        issueId: issue4.id,
        departmentId: deptWater.id,
        assignedTo: deptStaff.id,
        assignedBy: deptAdmin.id,
        remarks: "Emergency water supply restoration",
        assignedAt: new Date(now.getTime() - 36 * 60 * 60 * 1000),
        acceptedAt: new Date(now.getTime() - 35 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Issue Assignments created");

  // ──────────────────────────────────────────────────────────
  // 8. COMMENTS (with threaded reply)
  // ──────────────────────────────────────────────────────────

  const comment1 = await prisma.comment.create({
    data: {
      issueId: issue1.id,
      userId: citizen1.id,
      comment:
        "This pothole has been here for over a month now. Please fix it urgently.",
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      issueId: issue1.id,
      userId: deptStaff.id,
      comment:
        "We have dispatched a repair crew. The pothole will be fixed within 48 hours.",
      parentId: comment1.id,
    },
  });

  await prisma.comment.create({
    data: {
      issueId: issue1.id,
      userId: citizen1.id,
      comment: "Thank you for the update. Looking forward to the repair.",
      parentId: comment2.id,
    },
  });

  await prisma.comment.create({
    data: {
      issueId: issue2.id,
      userId: citizen2.id,
      comment:
        "The smell is unbearable. Children in the area are falling sick. Please prioritize this.",
    },
  });

  await prisma.comment.create({
    data: {
      issueId: issue4.id,
      userId: citizen2.id,
      comment:
        "Water supply has been restored. Thank you for the quick response!",
    },
  });

  console.log("✅ Comments created (with threaded replies)");

  // ──────────────────────────────────────────────────────────
  // 9. NOTIFICATIONS
  // ──────────────────────────────────────────────────────────

  await prisma.notification.createMany({
    data: [
      {
        userId: citizen1.id,
        issueId: issue1.id,
        type: "ISSUE_CREATED",
        title: "Issue Reported",
        message: "Your issue 'Large pothole on Hazratganj main road' has been submitted successfully.",
        isRead: true,
        readAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      },
      {
        userId: citizen1.id,
        issueId: issue1.id,
        type: "STATUS_CHANGED",
        title: "Issue Status Updated",
        message: "Your issue is now UNDER REVIEW by the Public Works Department.",
        isRead: true,
        readAt: new Date(now.getTime() - 47 * 60 * 60 * 1000),
      },
      {
        userId: citizen1.id,
        issueId: issue1.id,
        type: "STATUS_CHANGED",
        title: "Issue In Progress",
        message: "A repair crew has been dispatched for your pothole issue.",
        isRead: false,
      },
      {
        userId: deptStaff.id,
        issueId: issue1.id,
        type: "ISSUE_ASSIGNED",
        title: "New Issue Assigned",
        message: "You have been assigned: 'Large pothole on Hazratganj main road'.",
        isRead: true,
        readAt: new Date(now.getTime() - 46 * 60 * 60 * 1000),
      },
      {
        userId: citizen2.id,
        issueId: issue4.id,
        type: "ISSUE_RESOLVED",
        title: "Issue Resolved",
        message: "Your issue 'Water supply disrupted in Aliganj' has been resolved.",
        isRead: true,
        readAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        userId: superAdmin.id,
        type: "SYSTEM",
        title: "System Notification",
        message: "CivicPulse database seeded successfully. Platform is ready for use.",
        isRead: false,
      },
    ],
  });

  console.log("✅ Notifications created");

  // ──────────────────────────────────────────────────────────
  // 10. SLA RECORDS
  // ──────────────────────────────────────────────────────────

  await prisma.issueSLA.createMany({
    data: [
      {
        issueId: issue1.id,
        priority: "HIGH",
        targetHours: 72,
        dueAt: new Date(now.getTime() + 72 * 60 * 60 * 1000),
        isBreached: false,
      },
      {
        issueId: issue2.id,
        priority: "MEDIUM",
        targetHours: 24,
        dueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        isBreached: false,
      },
      {
        issueId: issue3.id,
        priority: "HIGH",
        targetHours: 48,
        dueAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        isBreached: false,
      },
      {
        issueId: issue4.id,
        priority: "URGENT",
        targetHours: 24,
        dueAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        isBreached: true,
        breachedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
      {
        issueId: issue5.id,
        priority: "HIGH",
        targetHours: 48,
        dueAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        isBreached: false,
      },
    ],
  });

  console.log("✅ SLA records created (including 1 breached)");

  // ──────────────────────────────────────────────────────────
  // 11. CITIZEN FEEDBACK (only for resolved issue)
  // ──────────────────────────────────────────────────────────

  await prisma.issueFeedback.create({
    data: {
      issueId: issue4.id,
      userId: citizen2.id,
      rating: 4,
      comment:
        "Water supply was restored within reasonable time. Good work by the water department team!",
    },
  });

  console.log("✅ Citizen Feedback created");

  // ──────────────────────────────────────────────────────────
  // 12. COMMUNITY POSTS & COMMENTS
  // ──────────────────────────────────────────────────────────

  const post1 = await prisma.communityPost.create({
    data: {
      userId: citizen1.id,
      title: "Tree plantation drive this Sunday at Lohia Park",
      content:
        "Our neighbourhood RWA is organizing a tree plantation drive this Sunday from 7 AM to 10 AM at Lohia Park. Everyone is welcome to participate. Saplings will be provided free of cost. Let us make our city greener!",
      locality: "Gomti Nagar",
      city: "Lucknow",
      isPublished: true,
    },
  });

  const post2 = await prisma.communityPost.create({
    data: {
      userId: citizen2.id,
      title: "Monthly cleanliness drive — volunteers needed",
      content:
        "We are organizing our monthly cleanliness drive in Aminabad area. We need at least 20 volunteers. Cleaning supplies will be provided. Please join us in keeping our market area clean!",
      locality: "Aminabad",
      city: "Lucknow",
      isPublished: true,
    },
  });

  await prisma.communityPostComment.createMany({
    data: [
      {
        postId: post1.id,
        userId: citizen2.id,
        comment: "Great initiative! I will be there with my family.",
      },
      {
        postId: post1.id,
        userId: deptStaff.id,
        comment:
          "The Municipal Corporation will provide additional saplings. Count us in!",
      },
      {
        postId: post2.id,
        userId: citizen1.id,
        comment:
          "I can bring 5 more volunteers from my colony. What time should we assemble?",
      },
    ],
  });

  console.log("✅ Community Posts & Comments created");

  // ──────────────────────────────────────────────────────────
  // DONE
  // ──────────────────────────────────────────────────────────

  console.log("\n🎉 CivicPulse database seeded successfully!");
  console.log("──────────────────────────────────────────");
  console.log("📊 Summary:");
  console.log("   Users:              5");
  console.log("   Departments:        6");
  console.log("   Issue Categories:   17");
  console.log("   Issues:             5");
  console.log("   Evidence:           4");
  console.log("   Status History:     6");
  console.log("   Assignments:        3");
  console.log("   Comments:           5");
  console.log("   Notifications:      6");
  console.log("   SLA Records:        5");
  console.log("   Feedback:           1");
  console.log("   Community Posts:    2");
  console.log("   Post Comments:      3");
  console.log("──────────────────────────────────────────");
  console.log("\n🔑 Login Credentials (all users):");
  console.log("   Password: CivicPulse@123");
  console.log("   Admin:    admin@civicpulse.in");
  console.log("   Staff:    priya.staff@civicpulse.in");
  console.log("   Citizen:  ananya@example.com");
  console.log("   Citizen:  vikram@example.com");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
