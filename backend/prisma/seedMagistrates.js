// ============================================================
// Seed Sector Magistrates for Dehradun Municipal Administration
// ============================================================
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const SECTOR_MAGISTRATES = [
  {
    name: "Shri Ajay Rawat (IAS)",
    email: "magistrate.sector1@civicpulse.gov.in",
    phone: "+911352712001",
    role: "DEPARTMENT_ADMIN",
    organization: "Central Dehradun Rapid Response Division",
    sector: "Sector 1 (Central: Clock Tower, Paltan Bazar)",
    designation: "Zonal Sub-Divisional Magistrate (Central)",
  },
  {
    name: "Smt. Neha Khanduri (PCS)",
    email: "magistrate.sector2@civicpulse.gov.in",
    phone: "+911352712002",
    role: "DEPARTMENT_ADMIN",
    organization: "North Dehradun Foothills Zonal Unit",
    sector: "Sector 2 (North: Rajpur Road, Jakhan, Malsi)",
    designation: "Zonal Sub-Divisional Magistrate (North)",
  },
  {
    name: "Shri Rakesh Semwal (PCS)",
    email: "magistrate.sector3@civicpulse.gov.in",
    phone: "+911352712003",
    role: "DEPARTMENT_ADMIN",
    organization: "West Dehradun Civic Division",
    sector: "Sector 3 (West: Chakrata Road, Ballupur, FRI)",
    designation: "Zonal Sub-Divisional Magistrate (West)",
  },
  {
    name: "Shri Deepak Joshi (PCS)",
    email: "magistrate.sector4@civicpulse.gov.in",
    phone: "+911352712004",
    role: "DEPARTMENT_ADMIN",
    organization: "South Dehradun Transit & Ward Division",
    sector: "Sector 4 (South: ISBT, Clement Town, Majra)",
    designation: "Zonal Sub-Divisional Magistrate (South)",
  },
  {
    name: "Dr. Sunita Negi (PCS)",
    email: "magistrate.sector5@civicpulse.gov.in",
    phone: "+911352712005",
    role: "DEPARTMENT_ADMIN",
    organization: "East Dehradun Infrastructure & Tech Division",
    sector: "Sector 5 (East: Raipur, IT Park, Sahastradhara)",
    designation: "Zonal Sub-Divisional Magistrate (East)",
  },
  {
    name: "Shri Virendra Bhatt (PCS)",
    email: "magistrate.sector6@civicpulse.gov.in",
    phone: "+911352712006",
    role: "DEPARTMENT_ADMIN",
    organization: "Suburban & Industrial Zonal Unit",
    sector: "Sector 6 (Outer Suburbs: Harrawala, Selaqui)",
    designation: "Zonal Sub-Divisional Magistrate (Outer Suburbs)",
  },
];

async function seed() {
  console.log("Seeding Dehradun Sector Magistrates...");
  const passwordHash = await bcrypt.hash("CivicPulse@123", 10);

  for (const mag of SECTOR_MAGISTRATES) {
    const user = await prisma.user.upsert({
      where: { email: mag.email },
      update: {
        name: mag.name,
        role: mag.role,
        organization: mag.organization,
        sector: mag.sector,
        designation: mag.designation,
        isVerified: true,
        isActive: true,
        identityVerified: true,
      },
      create: {
        name: mag.name,
        email: mag.email,
        passwordHash,
        phone: mag.phone,
        role: mag.role,
        organization: mag.organization,
        sector: mag.sector,
        designation: mag.designation,
        isVerified: true,
        isActive: true,
        identityVerified: true,
      },
    });
    console.log(`✓ Magistrate configured for ${mag.sector}: ${user.email}`);
  }

  console.log("All Sector Magistrates successfully seeded!");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
