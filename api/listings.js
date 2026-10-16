// Vercel serverless function — CREA DDF RESO Web API via OAuth2
// Serves ONLY manufactured home listings across Kelowna, West Kelowna, Lake Country, Peachland.
// Env vars required: CREA_USERNAME, CREA_PASSWORD
// Pattern mirrors kelownalistings.com/api/listings.js — same proven auth/pagination/
// caching approach. StructureType is filtered CLIENT-SIDE (after fetch), not via
// server-side OData $filter, since StructureType is a RESO collection field and an
// unproven $filter expression against it is exactly the kind of mistake that broke
// listings network-wide before — see kelownalistings' incident notes.

const TOKEN_URL = 'https://identity.crea.ca/connect/token';
const RESO_BASE = 'https://ddfapi.realtor.ca/odata/v1/Property';
const OFFICE_URL = 'https://ddfapi.realtor.ca/odata/v1/Office';

let _cachedToken    = null;
let _tokenExpiresAt = 0;

const CITIES = ['Kelowna', 'West Kelowna', 'Lake Country', 'Peachland'];

async function getBearerToken(clientId, clientSecret) {
  const now = Date.now();
  if (_cachedToken && now < _tokenExpiresAt - 30000) return _cachedToken;

  const res = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }).toString()
  });

  if (!res.ok) throw new Error(`Token request failed ${res.status}`);

  const data      = await res.json();
  _cachedToken    = data.access_token;
  _tokenExpiresAt = now + (data.expires_in || 3600) * 1000;
  return _cachedToken;
}

const $select = [
  'ListingKey', 'ListingId', 'ListPrice',
  'StreetNumber', 'UnitNumber', 'StreetName', 'StreetSuffix',
  'City', 'PostalCode', 'StateOrProvince',
  'PropertySubType', 'StructureType',
  'BedroomsTotal', 'BathroomsTotalInteger', 'LivingArea',
  'PublicRemarks', 'StandardStatus', 'PhotosCount',
  'OriginalEntryTimestamp', 'ModificationTimestamp',
  'ListOfficeKey', 'ListAgentKey', 'ListingURL',
  'CityRegion', 'AssociationFee', 'YearBuilt',
  'Media'
].join(',');

async function queryRESO(token, filter, skip = 0) {
  const url = `${RESO_BASE}?$filter=${encodeURIComponent(filter)}&$select=${encodeURIComponent($select)}&$orderby=${encodeURIComponent('OriginalEntryTimestamp desc')}&$top=100&$skip=${skip}`;

  return fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept':        'application/json',
      'User-Agent':    'KelownaManufactured/1.0 (kelownamanufactured.com)'
    }
  });
}

async function queryAllRESO(token, filter) {
  let allListings = [];
  let skip = 0;
  while (true) {
    const res = await queryRESO(token, filter, skip);
    if (!res.ok) return { ok: false, status: res.status, body: await res.text().catch(() => '') };
    const data = await res.json();
    const page = data.value || [];
    allListings = allListings.concat(page);
    if (page.length < 100) break;
    skip += 100;
    if (skip >= 5000) break; // safety cap
  }
  return { ok: true, listings: allListings };
}

async function fetchOfficeNames(token, officeKeys) {
  if (!officeKeys.length) return {};
  const filter = officeKeys.map(k => `OfficeKey eq '${k}'`).join(' or ');
  const url = `${OFFICE_URL}?$filter=${encodeURIComponent(filter)}&$select=OfficeKey,OfficeName`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'User-Agent': 'KelownaManufactured/1.0 (kelownamanufactured.com)' }
  });
  if (!res.ok) return {};
  const data = await res.json();
  const map = {};
  for (const office of (data.value || [])) map[office.OfficeKey] = office.OfficeName;
  return map;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const clientId     = process.env.CREA_USERNAME;
  const clientSecret = process.env.CREA_PASSWORD;

  if (!clientId || !clientSecret) {
    return res.status(200).json({ configured: false, listings: [], count: 0 });
  }

  const cityFilter = '(' + CITIES.map(c => `City eq '${c.replace(/'/g, "''")}'`).join(' or ') + ')';
  const baseFilter = `${cityFilter} and StateOrProvince eq 'British Columbia'`;

  // Narrow server-side using the OData collection-lambda syntax (StructureType is a
  // RESO collection field — `eq` alone does NOT work on it, you must use any()).
  // Verified directly against the live DDF API to return the exact same result set
  // as the old "fetch everything, filter client-side" approach, but ~25x fewer
  // records to paginate through (131 vs 3,251 for this city set) — this is what
  // was making /listings take 10-15s to load. Client-side whitelist below is kept
  // as a safety net in case this ever returns something unexpected.
  const narrowFilter = `${baseFilter} and StructureType/any(s: s eq 'Manufactured Home')`;

  try {
    let token = await getBearerToken(clientId, clientSecret);
    let result = await queryAllRESO(token, narrowFilter);

    if (!result.ok && result.status === 401) {
      _cachedToken = null;
      token  = await getBearerToken(clientId, clientSecret);
      result = await queryAllRESO(token, narrowFilter);
    }

    // If the narrow server-side filter ever misbehaves for any other reason,
    // fall back to the proven broad-fetch + client-side-filter approach rather
    // than breaking the page — slower, but never down.
    if (!result.ok) {
      console.error(`DDF narrow filter ${result.status}, falling back to broad fetch:`, result.body.slice(0, 300));
      result = await queryAllRESO(token, baseFilter);
    }

    if (!result.ok) {
      console.error(`DDF ${result.status}:`, result.body.slice(0, 500));
      return res.status(502).json({ configured: true, error: `DDF returned ${result.status}`, listings: [], count: 0 });
    }

    // Whitelist: ONLY manufactured homes — this site covers nothing else.
    const manufacturedOnly = result.listings.filter(l => {
      const struct = (Array.isArray(l.StructureType) ? l.StructureType[0] : l.StructureType) || '';
      return struct === 'Manufactured Home';
    });

    const uniqueKeys = [...new Set(manufacturedOnly.map(l => l.ListOfficeKey).filter(Boolean))];
    const officeMap  = await fetchOfficeNames(token, uniqueKeys);

    for (const l of manufacturedOnly) {
      if (l.ListOfficeKey && officeMap[l.ListOfficeKey]) l.ListOfficeName = officeMap[l.ListOfficeKey];
      if (l.ListingURL && !l.ListingURL.startsWith('http')) l.ListingURL = 'https://' + l.ListingURL;
      if (Array.isArray(l.Media) && l.Media.length) {
        const sorted = l.Media.slice().sort((a, b) => (a.Order || 0) - (b.Order || 0));
        const first = sorted.find(m => m.MediaURL);
        l.Media = first ? [first] : [];
      }
    }

    return res.status(200).json({ configured: true, listings: manufacturedOnly, count: manufacturedOnly.length });

  } catch (err) {
    console.error('DDF error:', err.message);
    return res.status(502).json({ configured: true, error: err.message, listings: [], count: 0 });
  }
};
