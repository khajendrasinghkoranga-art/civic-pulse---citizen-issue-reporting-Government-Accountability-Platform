export interface SectorDefinition {
  id: string;
  name: string;
  zone: string;
  center: { lat: number; lng: number };
  keywords: string[];
  dispatchUnit: string;
  office: string;
  helpline: string;
  capacityThreshold: number;
}

export const DEHRADUN_SECTORS: SectorDefinition[] = [
  {
    id: 'SECTOR-1',
    name: 'Sector 1 (Central: Clock Tower, Paltan Bazar)',
    zone: 'Central Commercial & Heritage Core',
    center: { lat: 30.3244, lng: 78.0417 },
    keywords: ['clock tower', 'ghanta ghar', 'paltan bazar', 'astley hall', 'prince chowk', 'gandhi park', 'railway station', 'parade ground', 'lakhi bagh', 'bindal'],
    dispatchUnit: 'Central Dehradun Rapid Response Division',
    office: 'Clock Tower Civic Control Depot',
    helpline: '+91 135 271 2001',
    capacityThreshold: 25,
  },
  {
    id: 'SECTOR-2',
    name: 'Sector 2 (North: Rajpur Road, Jakhan, Malsi)',
    zone: 'North Foothills & Residential Corridor',
    center: { lat: 30.3650, lng: 78.0720 },
    keywords: ['rajpur', 'jakhan', 'malsi', 'hathibarkala', 'dilaram', 'mussoorie', 'pacific mall', 'kishanpur', 'diversion'],
    dispatchUnit: 'North Dehradun Foothills Zonal Unit',
    office: 'Rajpur Road Zonal Maintenance Center',
    helpline: '+91 135 271 2002',
    capacityThreshold: 20,
  },
  {
    id: 'SECTOR-3',
    name: 'Sector 3 (West: Chakrata Road, Ballupur, FRI)',
    zone: 'West Educational & Institutional Belt',
    center: { lat: 30.3420, lng: 77.9920 },
    keywords: ['chakrata', 'ballupur', 'fri', 'forest research', 'prem nagar', 'kaulagarh', 'vasant vihar', 'ima', 'panditwari', 'kishan nagar', 'manduwala'],
    dispatchUnit: 'West Dehradun Civic Division',
    office: 'Ballupur Junction Sector Depot',
    helpline: '+91 135 271 2003',
    capacityThreshold: 20,
  },
  {
    id: 'SECTOR-4',
    name: 'Sector 4 (South: ISBT, Clement Town, Majra)',
    zone: 'South Transport & Suburban Hub',
    center: { lat: 30.2850, lng: 78.0050 },
    keywords: ['isbt', 'clement town', 'majra', 'saharanpur', 'niranjanpur', 'mandi', 'kargi', 'patel nagar', 'turner road', 'subhash nagar'],
    dispatchUnit: 'South Dehradun Transit & Ward Division',
    office: 'ISBT Regional Operations Center',
    helpline: '+91 135 271 2004',
    capacityThreshold: 30,
  },
  {
    id: 'SECTOR-5',
    name: 'Sector 5 (East: Raipur, IT Park, Sahastradhara)',
    zone: 'East Tech & Infrastructure Corridor',
    center: { lat: 30.3380, lng: 78.0820 },
    keywords: ['raipur', 'it park', 'sahastradhara', 'dalanwala', 'nehru colony', 'ring road', 'shastri nagar', 'ladpur', 'balawala'],
    dispatchUnit: 'East Dehradun Infrastructure & Tech Division',
    office: 'Sahastradhara IT Park Municipal Depot',
    helpline: '+91 135 271 2005',
    capacityThreshold: 25,
  },
  {
    id: 'SECTOR-6',
    name: 'Sector 6 (Outer Suburbs: Harrawala, Selaqui)',
    zone: 'Outer Periphery & Industrial Zone',
    center: { lat: 30.2500, lng: 78.1000 },
    keywords: ['harrawala', 'doiwala', 'selaqui', 'vikasnagar', 'industrial', 'outer', 'rishikesh'],
    dispatchUnit: 'Suburban & Industrial Zonal Unit',
    office: 'Harrawala Peripheral Station',
    helpline: '+91 135 271 2006',
    capacityThreshold: 15,
  },
];

function getGeoDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c; // KM
}

export function resolveSectorClient(
  lat: number,
  lng: number,
  address?: string,
  preferredSectorName?: string
): SectorDefinition {
  if (preferredSectorName) {
    const found = DEHRADUN_SECTORS.find((s) => s.name === preferredSectorName || s.id === preferredSectorName);
    if (found) return found;
  }

  // 1. Coordinate check
  if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
    let closest = DEHRADUN_SECTORS[0];
    let minDist = Infinity;
    for (const sec of DEHRADUN_SECTORS) {
      const dist = getGeoDistance(lat, lng, sec.center.lat, sec.center.lng);
      if (dist < minDist) {
        minDist = dist;
        closest = sec;
      }
    }
    return closest;
  }

  // 2. Keyword fallback
  const text = (address || '').toLowerCase();
  for (const sec of DEHRADUN_SECTORS) {
    for (const kw of sec.keywords) {
      if (text.includes(kw)) {
        return sec;
      }
    }
  }

  return DEHRADUN_SECTORS[0];
}
