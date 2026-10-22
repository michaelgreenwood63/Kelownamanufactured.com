// Single listing detail — GET /api/listing?key=LISTINGKEY
// Env vars required: CREA_USERNAME, CREA_PASSWORD
// Pattern mirrors kelownalistings.com/api/listing.js — same proven auth approach.

const TOKEN_URL  = 'https://identity.crea.ca/connect/token';
const RESO_BASE  = 'https://ddfapi.realtor.ca/odata/v1/Property';
const OFFICE_URL = 'https://ddfapi.realtor.ca/odata/v1/Office';

let _cachedToken    = null;
let _tokenExpiresAt = 0;

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

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const clientId     = process.env.CREA_USERNAME;
  const clientSecret = process.env.CREA_PASSWORD;
  if (!clientId || !clientSecret) return res.status(200).json({ configured: false });

  const { key } = req.query;
  if (!key) return res.status(400).json({ error: 'key param required' });

  const $select = [
    'ListingKey', 'ListingId', 'ListPrice',
    'StreetNumber', 'UnitNumber', 'StreetName', 'StreetSuffix',
    'City', 'PostalCode', 'StateOrProvince', 'CityRegion',
    'PropertySubType', 'StructureType',
    'BedroomsTotal', 'BedroomsAboveGrade', 'BedroomsBelowGrade',
    'BathroomsTotalInteger', 'BathroomsPartial',
    'LivingArea',
    'YearBuilt', 'Stories',
    'ParkingTotal', 'ParkingFeatures',
    'AssociationFee', 'AssociationFeeFrequency', 'AssociationFeeIncludes',
    'TaxAnnualAmount', 'TaxYear',
    'Basement', 'Heating', 'Cooling',
    'FireplaceYN', 'FireplacesTotal',
    'PublicRemarks', 'StandardStatus', 'PhotosCount',
    'OriginalEntryTimestamp', 'ModificationTimestamp',
    'ListOfficeKey', 'ListingURL',
    'Media'
  ].join(',');

  const filter = `ListingKey eq '${key.replace(/'/g, "''")}'`;
  const url    = `${RESO_BASE}?$filter=${encodeURIComponent(filter)}&$select=${encodeURIComponent($select)}&$top=1`;

  try {
    let token  = await getBearerToken(clientId, clientSecret);
    let apiRes = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'User-Agent': 'KelownaManufactured/1.0 (kelownamanufactured.com)' }
    });

    if (apiRes.status === 401) {
      _cachedToken = null;
      token  = await getBearerToken(clientId, clientSecret);
      apiRes = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'User-Agent': 'KelownaManufactured/1.0 (kelownamanufactured.com)' }
      });
    }

    if (!apiRes.ok) {
      const body = await apiRes.text().catch(() => '');
      console.error(`DDF ${apiRes.status}:`, body.slice(0, 300));
      return res.status(502).json({ error: `DDF returned ${apiRes.status}` });
    }

    const data    = await apiRes.json();
    const listing = (data.value || [])[0];
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    if (listing.ListOfficeKey) {
      const officeRes = await fetch(
        `${OFFICE_URL}?$filter=OfficeKey%20eq%20'${listing.ListOfficeKey}'&$select=OfficeKey,OfficeName`,
        { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
      );
      if (officeRes.ok) {
        const od = await officeRes.json();
        const o  = (od.value || [])[0];
        if (o) listing.ListOfficeName = o.OfficeName;
      }
    }

    if (listing.ListingURL && !listing.ListingURL.startsWith('http')) {
      listing.ListingURL = 'https://' + listing.ListingURL;
    }

    return res.status(200).json({ configured: true, listing });

  } catch (err) {
    console.error('DDF error:', err.message);
    return res.status(502).json({ error: err.message });
  }
};
