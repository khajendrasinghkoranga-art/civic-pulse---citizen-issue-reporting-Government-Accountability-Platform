/**
 * Municipal Sector Resolver & Geo-Routing Engine for Dehradun
 * Balances civic issue load across decentralized zonal units.
 */

const DEHRADUN_SECTORS = [
    {
        id: "SECTOR-1",
        name: "Sector 1 (Central: Clock Tower, Paltan Bazar)",
        zone: "Central Commercial & Heritage Core",
        center: { lat: 30.3244, lng: 78.0417 },
        keywords: ["clock tower", "ghanta ghar", "paltan bazar", "astley hall", "prince chowk", "gandhi park", "railway station", "parade ground", "lakhi bagh", "bindal"],
        dispatchUnit: "Central Dehradun Rapid Response Division",
        office: "Clock Tower Civic Control Depot",
        helpline: "+91 135 271 2001",
        capacityThreshold: 25, // max recommended concurrent load
    },
    {
        id: "SECTOR-2",
        name: "Sector 2 (North: Rajpur Road, Jakhan, Malsi)",
        zone: "North Foothills & Residential Corridor",
        center: { lat: 30.3650, lng: 78.0720 },
        keywords: ["rajpur", "jakhan", "malsi", "hathibarkala", "dilaram", "mussoorie", "pacific mall", "kishanpur", "diversion"],
        dispatchUnit: "North Dehradun Foothills Zonal Unit",
        office: "Rajpur Road Zonal Maintenance Center",
        helpline: "+91 135 271 2002",
        capacityThreshold: 20,
    },
    {
        id: "SECTOR-3",
        name: "Sector 3 (West: Chakrata Road, Ballupur, FRI)",
        zone: "West Educational & Institutional Belt",
        center: { lat: 30.3420, lng: 77.9920 },
        keywords: ["chakrata", "ballupur", "fri", "forest research", "prem nagar", "kaulagarh", "vasant vihar", "ima", "panditwari", "kishan nagar"],
        dispatchUnit: "West Dehradun Civic Division",
        office: "Ballupur Junction Sector Depot",
        helpline: "+91 135 271 2003",
        capacityThreshold: 20,
    },
    {
        id: "SECTOR-4",
        name: "Sector 4 (South: ISBT, Clement Town, Majra)",
        zone: "South Transport & Suburban Hub",
        center: { lat: 30.2850, lng: 78.0050 },
        keywords: ["isbt", "clement town", "majra", "saharanpur", "niranjanpur", "mandi", "kargi", "patel nagar", "turner road", "subhash nagar"],
        dispatchUnit: "South Dehradun Transit & Ward Division",
        office: "ISBT Regional Operations Center",
        helpline: "+91 135 271 2004",
        capacityThreshold: 30,
    },
    {
        id: "SECTOR-5",
        name: "Sector 5 (East: Raipur, IT Park, Sahastradhara)",
        zone: "East Tech & Infrastructure Corridor",
        center: { lat: 30.3380, lng: 78.0820 },
        keywords: ["raipur", "it park", "sahastradhara", "dalanwala", "nehru colony", "ring road", "shastri nagar", "ladpur", "balawala"],
        dispatchUnit: "East Dehradun Infrastructure & Tech Division",
        office: "Sahastradhara IT Park Municipal Depot",
        helpline: "+91 135 271 2005",
        capacityThreshold: 25,
    },
    {
        id: "SECTOR-6",
        name: "Sector 6 (Outer Suburbs: Harrawala, Selaqui)",
        zone: "Outer Periphery & Industrial Zone",
        center: { lat: 30.2500, lng: 78.1000 },
        keywords: ["harrawala", "doiwala", "selaqui", "vikasnagar", "industrial", "outer", "rishikesh"],
        dispatchUnit: "Suburban & Industrial Zonal Unit",
        office: "Harrawala Peripheral Station",
        helpline: "+91 135 271 2006",
        capacityThreshold: 15,
    },
];

/**
 * Calculates distance between two GPS coordinates using equirectangular approximation
 */
function getGeoDistance(lat1, lon1, lat2, lon2) {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c; // Earth radius in KM
}

/**
 * Automatically resolves the appropriate municipal sector based on GPS coordinates or address keywords
 */
function resolveSector({ latitude, longitude, address, locality, sectorPreference }) {
    // 1. If explicit sector preference provided and valid, prioritize it
    if (sectorPreference) {
        const found = DEHRADUN_SECTORS.find(
            s => s.id === sectorPreference || s.name.toLowerCase().includes(sectorPreference.toLowerCase())
        );
        if (found) return found;
    }

    // 2. If valid GPS coordinates are present, resolve to nearest sector center
    if (typeof latitude === "number" && typeof longitude === "number" && !isNaN(latitude) && !isNaN(longitude)) {
        let closestSector = DEHRADUN_SECTORS[0];
        let minDistance = Infinity;

        for (const sec of DEHRADUN_SECTORS) {
            const dist = getGeoDistance(latitude, longitude, sec.center.lat, sec.center.lng);
            if (dist < minDistance) {
                minDistance = dist;
                closestSector = sec;
            }
        }
        return closestSector;
    }

    // 3. Fallback to address / locality keyword matching
    const searchContext = `${address || ""} ${locality || ""}`.toLowerCase();
    for (const sec of DEHRADUN_SECTORS) {
        for (const kw of sec.keywords) {
            if (searchContext.includes(kw)) {
                return sec;
            }
        }
    }

    // 4. Default to Sector 1 (Central Civic Division)
    return DEHRADUN_SECTORS[0];
}

/**
 * Helper to get all sector definitions
 */
function getAllSectors() {
    return DEHRADUN_SECTORS;
}

module.exports = {
    DEHRADUN_SECTORS,
    resolveSector,
    getAllSectors,
    getGeoDistance,
};
