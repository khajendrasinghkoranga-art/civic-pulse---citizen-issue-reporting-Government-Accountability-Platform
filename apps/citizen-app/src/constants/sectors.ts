export interface SectorDefinition {
  id: string;
  name: string;
  zone: string;
  center: { lat: number; lng: number };
  keywords: string[];
  dispatchUnit: string;
  office: string;
  helpline: string;
}

export const DEHRADUN_SECTORS: SectorDefinition[] = [
  {
    id: 'SECTOR-1',
    name: 'Sector 1 (Central: Clock Tower, Paltan Bazar)',
    zone: 'Central Commercial & Heritage Core',
    center: { lat: 30.3244, lng: 78.0417 },
    keywords: ['clock tower', 'ghanta ghar', 'paltan bazar', 'astley hall', 'prince chowk', 'gandhi park', 'railway station', 'parade ground'],
    dispatchUnit: 'Central Dehradun Rapid Response Division',
    office: 'Clock Tower Civic Control Depot',
    helpline: '+91 135 271 2001',
  },
  {
    id: 'SECTOR-2',
    name: 'Sector 2 (North: Rajpur Road, Jakhan, Malsi)',
    zone: 'North Foothills & Residential Corridor',
    center: { lat: 30.365, lng: 78.072 },
    keywords: ['rajpur', 'jakhan', 'malsi', 'hathibarkala', 'dilaram', 'mussoorie', 'pacific mall', 'kishanpur'],
    dispatchUnit: 'North Dehradun Foothills Zonal Unit',
    office: 'Rajpur Road Zonal Maintenance Center',
    helpline: '+91 135 271 2002',
  },
  {
    id: 'SECTOR-3',
    name: 'Sector 3 (West: Chakrata Road, Ballupur, FRI)',
    zone: 'West Educational & Institutional Belt',
    center: { lat: 30.342, lng: 77.992 },
    keywords: ['chakrata', 'ballupur', 'fri', 'prem nagar', 'kaulagarh', 'vasant vihar', 'ima', 'panditwari'],
    dispatchUnit: 'West Dehradun Civic Division',
    office: 'Ballupur Junction Sector Depot',
    helpline: '+91 135 271 2003',
  },
  {
    id: 'SECTOR-4',
    name: 'Sector 4 (South: ISBT, Clement Town, Majra)',
    zone: 'South Transport & Suburban Hub',
    center: { lat: 30.285, lng: 78.005 },
    keywords: ['isbt', 'clement town', 'majra', 'saharanpur', 'niranjanpur', 'kargi', 'patel nagar', 'subhash nagar'],
    dispatchUnit: 'South Dehradun Transit & Ward Division',
    office: 'ISBT Regional Operations Center',
    helpline: '+91 135 271 2004',
  },
  {
    id: 'SECTOR-5',
    name: 'Sector 5 (East: Raipur, IT Park, Sahastradhara)',
    zone: 'East Tech & Infrastructure Corridor',
    center: { lat: 30.338, lng: 78.082 },
    keywords: ['raipur', 'it park', 'sahastradhara', 'dalanwala', 'nehru colony', 'ring road', 'shastri nagar', 'ladpur'],
    dispatchUnit: 'East Dehradun Infrastructure & Tech Division',
    office: 'Sahastradhara IT Park Municipal Depot',
    helpline: '+91 135 271 2005',
  },
  {
    id: 'SECTOR-6',
    name: 'Sector 6 (Outer Suburbs: Harrawala, Selaqui)',
    zone: 'Outer Periphery & Industrial Zone',
    center: { lat: 30.25, lng: 78.1 },
    keywords: ['harrawala', 'doiwala', 'selaqui', 'vikasnagar', 'industrial', 'rishikesh'],
    dispatchUnit: 'Suburban & Industrial Zonal Unit',
    office: 'Harrawala Peripheral Station',
    helpline: '+91 135 271 2006',
  },
];

function getGeoDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function resolveSectorClient(lat: number, lng: number, address?: string): SectorDefinition {
  if (address) {
    const lower = address.toLowerCase();
    const keywordMatch = DEHRADUN_SECTORS.find((s) => s.keywords.some((k) => lower.includes(k)));
    if (keywordMatch) return keywordMatch;
  }
  let closest = DEHRADUN_SECTORS[0];
  let minDistance = Infinity;
  for (const sector of DEHRADUN_SECTORS) {
    const dist = getGeoDistance(lat, lng, sector.center.lat, sector.center.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = sector;
    }
  }
  return closest;
}
