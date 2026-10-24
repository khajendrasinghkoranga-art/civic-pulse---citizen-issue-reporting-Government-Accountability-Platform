export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface SectorDefinition {
  id: string;
  name: string;
  zone: string;
  dispatchUnit: string;
  office: string;
  helpline: string;
  magistrateName: string;
  magistrateEmail: string;
  capacityThreshold: number;
}

export const DEHRADUN_SECTORS: SectorDefinition[] = [
  {
    id: "SECTOR-1",
    name: "Sector 1 (Central: Clock Tower, Paltan Bazar)",
    zone: "Central Commercial & Heritage Core",
    dispatchUnit: "Central Dehradun Rapid Response Division",
    office: "Clock Tower Civic Control Depot",
    helpline: "+91 135 271 2001",
    magistrateName: "Shri Ajay Rawat (IAS)",
    magistrateEmail: "magistrate.sector1@civicpulse.gov.in",
    capacityThreshold: 25,
  },
  {
    id: "SECTOR-2",
    name: "Sector 2 (North: Rajpur Road, Jakhan, Malsi)",
    zone: "North Foothills & Residential Corridor",
    dispatchUnit: "North Dehradun Foothills Zonal Unit",
    office: "Rajpur Road Zonal Maintenance Center",
    helpline: "+91 135 271 2002",
    magistrateName: "Smt. Neha Khanduri (PCS)",
    magistrateEmail: "magistrate.sector2@civicpulse.gov.in",
    capacityThreshold: 20,
  },
  {
    id: "SECTOR-3",
    name: "Sector 3 (West: Chakrata Road, Ballupur, FRI)",
    zone: "West Educational & Institutional Belt",
    dispatchUnit: "West Dehradun Civic Division",
    office: "Ballupur Junction Sector Depot",
    helpline: "+91 135 271 2003",
    magistrateName: "Shri Rakesh Semwal (PCS)",
    magistrateEmail: "magistrate.sector3@civicpulse.gov.in",
    capacityThreshold: 20,
  },
  {
    id: "SECTOR-4",
    name: "Sector 4 (South: ISBT, Clement Town, Majra)",
    zone: "South Transport & Suburban Hub",
    dispatchUnit: "South Dehradun Transit & Ward Division",
    office: "ISBT Regional Operations Center",
    helpline: "+91 135 271 2004",
    magistrateName: "Shri Deepak Joshi (PCS)",
    magistrateEmail: "magistrate.sector4@civicpulse.gov.in",
    capacityThreshold: 30,
  },
  {
    id: "SECTOR-5",
    name: "Sector 5 (East: Raipur, IT Park, Sahastradhara)",
    zone: "East Tech & Infrastructure Corridor",
    dispatchUnit: "East Dehradun Infrastructure & Tech Division",
    office: "Sahastradhara IT Park Municipal Depot",
    helpline: "+91 135 271 2005",
    magistrateName: "Dr. Sunita Negi (PCS)",
    magistrateEmail: "magistrate.sector5@civicpulse.gov.in",
    capacityThreshold: 25,
  },
  {
    id: "SECTOR-6",
    name: "Sector 6 (Outer Suburbs: Harrawala, Selaqui)",
    zone: "Outer Periphery & Industrial Zone",
    dispatchUnit: "Suburban & Industrial Zonal Unit",
    office: "Harrawala Peripheral Station",
    helpline: "+91 135 271 2006",
    magistrateName: "Shri Virendra Bhatt (PCS)",
    magistrateEmail: "magistrate.sector6@civicpulse.gov.in",
    capacityThreshold: 15,
  },
];

export const DEMO_MAGISTRATES = [
  {
    name: "Shri Ajay Rawat (IAS)",
    role: "DEPARTMENT_ADMIN",
    designation: "Zonal Sub-Divisional Magistrate (Central)",
    organization: "Central Dehradun Rapid Response Division",
    sector: "Sector 1 (Central: Clock Tower, Paltan Bazar)",
    email: "magistrate.sector1@civicpulse.gov.in",
    password: "CivicPulse@123",
    badge: "Sector 1 (Central)",
    icon: "🏛️",
  },
  {
    name: "Smt. Neha Khanduri (PCS)",
    role: "DEPARTMENT_ADMIN",
    designation: "Zonal Sub-Divisional Magistrate (North)",
    organization: "North Dehradun Foothills Zonal Unit",
    sector: "Sector 2 (North: Rajpur Road, Jakhan, Malsi)",
    email: "magistrate.sector2@civicpulse.gov.in",
    password: "CivicPulse@123",
    badge: "Sector 2 (North)",
    icon: "🏔️",
  },
  {
    name: "Shri Rakesh Semwal (PCS)",
    role: "DEPARTMENT_ADMIN",
    designation: "Zonal Sub-Divisional Magistrate (West)",
    organization: "West Dehradun Civic Division",
    sector: "Sector 3 (West: Chakrata Road, Ballupur, FRI)",
    email: "magistrate.sector3@civicpulse.gov.in",
    password: "CivicPulse@123",
    badge: "Sector 3 (West)",
    icon: "🎓",
  },
  {
    name: "Shri Deepak Joshi (PCS)",
    role: "DEPARTMENT_ADMIN",
    designation: "Zonal Sub-Divisional Magistrate (South)",
    organization: "South Dehradun Transit & Ward Division",
    sector: "Sector 4 (South: ISBT, Clement Town, Majra)",
    email: "magistrate.sector4@civicpulse.gov.in",
    password: "CivicPulse@123",
    badge: "Sector 4 (South)",
    icon: "🚌",
  },
  {
    name: "Dr. Sunita Negi (PCS)",
    role: "DEPARTMENT_ADMIN",
    designation: "Zonal Sub-Divisional Magistrate (East)",
    organization: "East Dehradun Infrastructure & Tech Division",
    sector: "Sector 5 (East: Raipur, IT Park, Sahastradhara)",
    email: "magistrate.sector5@civicpulse.gov.in",
    password: "CivicPulse@123",
    badge: "Sector 5 (East)",
    icon: "💻",
  },
  {
    name: "Shri Virendra Bhatt (PCS)",
    role: "DEPARTMENT_ADMIN",
    designation: "Zonal Sub-Divisional Magistrate (Outer Suburbs)",
    organization: "Suburban & Industrial Zonal Unit",
    sector: "Sector 6 (Outer Suburbs: Harrawala, Selaqui)",
    email: "magistrate.sector6@civicpulse.gov.in",
    password: "CivicPulse@123",
    badge: "Sector 6 (Outer)",
    icon: "🏭",
  },
  {
    name: "Rajesh Kumar (IAS)",
    role: "SUPER_ADMIN",
    designation: "Municipal Commissioner & District Magistrate",
    organization: "Dehradun Municipal Corporation (Headquarters)",
    sector: "All Municipal Sectors (Central Command)",
    email: "admin@civicpulse.in",
    password: "CivicPulse@123",
    badge: "Super Admin (All Sectors)",
    icon: "🛡️",
  },
];
