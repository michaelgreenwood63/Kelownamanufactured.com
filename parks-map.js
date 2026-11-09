// Shared data + renderer for the Central Okanagan manufactured home park map.
// Coordinates are real, geocoded via the BC government's public address
// geocoder (geocoder.api.gov.bc.ca) against each park's own verified civic
// address. Jurisdiction is drawn from each park's own page content.
var PARKS_MAP_DATA = [
  {slug:"antler-beach-estates", name:"Antler Beach Estates", address:"6711 Highway 97, Peachland, BC", jur:"BC", lat:49.7404751, lng:-119.7636357},
  {slug:"belaire-estates", name:"Belaire Estates", address:"9020 Jim Bailey Road, Lake Country, BC", jur:"DuckLake", lat:50.0153314, lng:-119.3934139},
  {slug:"berkley-estates", name:"Berkley Estates", address:"2001 Highway 97 South, West Kelowna, BC", jur:"WFN", lat:49.84722, lng:-119.598452},
  {slug:"central-mhp", name:"Central MHP", address:"3535 Casorso Road, Kelowna, BC", jur:"BC", lat:49.855951, lng:-119.4829347},
  {slug:"crystal-springs", name:"Crystal Springs", address:"1850 Shannon Lake Road, West Kelowna, BC", jur:"BC", lat:49.8651027, lng:-119.5929979},
  {slug:"deer-meadows-estates", name:"Deer Meadows Estates", address:"8900 Jim Bailey Road, Lake Country, BC", jur:"DuckLake", lat:50.0114628, lng:-119.4002392},
  {slug:"duck-lake-estates", name:"Duck Lake Estates (Creek Run)", address:"8945 Highway 97 North, Lake Country, BC", jur:"DuckLake", lat:50.0134338, lng:-119.401929},
  {slug:"edgewater-pines", name:"The Edgewater Pines", address:"6663 Highway 97 South, Peachland, BC", jur:"BC", lat:49.7427193, lng:-119.7610465},
  {slug:"golden-homes", name:"Golden Homes", address:"2098 Boucherie Road, West Kelowna, BC", jur:"WFN", lat:49.825434, lng:-119.6086475},
  {slug:"green-acres", name:"Green Acres", address:"3225 Shannon Lake Road, West Kelowna, BC", jur:"WFN", lat:49.8469755, lng:-119.6215728},
  {slug:"holiday-park-resort", name:"Holiday Park Resort", address:"415 Commonwealth Road, Lake Country, BC", jur:"DuckLake", lat:50.0072726, lng:-119.3963356},
  {slug:"jubilee", name:"Jubilee Park", address:"2005 Boucherie Road, West Kelowna, BC", jur:"WFN", lat:49.8271926, lng:-119.6004488},
  {slug:"kelowna-west-estates", name:"Kelowna West Estates", address:"610 Highway 97 South, West Kelowna, BC", jur:"WFN", lat:49.8780507, lng:-119.5388963},
  {slug:"lakecity", name:"Lakecity Mobile Home Park", address:"3535 McCulloch Road, Kelowna, BC", jur:"BC", lat:49.8379959, lng:-119.4017608},
  {slug:"mcculloch-heights", name:"McCulloch Heights", address:"4075 McClain Road, Kelowna, BC", jur:"BC", lat:49.8356798, lng:-119.390803},
  {slug:"mcdougall-creek-estates", name:"McDougall Creek Estates", address:"1929 Highway 97 South, West Kelowna, BC", jur:"WFN", lat:49.853666, lng:-119.5933602},
  {slug:"meadowbrook-estates", name:"Meadowbrook Estates", address:"720 Commonwealth Road, Lake Country, BC", jur:"DuckLake", lat:50.0082904, lng:-119.4009377},
  {slug:"nancee-way-village", name:"Nancee Way Village", address:"1835 Westside Road, West Kelowna, BC", jur:"WFN", lat:49.8832434, lng:-119.5393323},
  {slug:"okanagan-mobile-villa", name:"Okanagan Mobile Villa", address:"1132 Findlay Road, Kelowna, BC", jur:"BC", lat:49.9034341, lng:-119.3996316},
  {slug:"okanagan-villa", name:"Okanagan Villa Park", address:"670 McCurdy Road, Kelowna, BC", jur:"BC", lat:49.9019915, lng:-119.3990716},
  {slug:"paradise", name:"Paradise Park", address:"2035 Boucherie Road, West Kelowna, BC", jur:"WFN", lat:49.8263822, lng:-119.6024877},
  {slug:"park-lake-estates", name:"Park Lake Estates", address:"3270 Shannon Lake Road, West Kelowna, BC", jur:"WFN", lat:49.8451916, lng:-119.6242645},
  {slug:"pine-hills", name:"Pine Hills Park", address:"5371 Princeton Avenue, Peachland, BC", jur:"BC", lat:49.7519597, lng:-119.788127},
  {slug:"pine-villa", name:"Pine Villa Park", address:"3585 Elk Road, West Kelowna, BC", jur:"WFN", lat:49.8352081, lng:-119.5930184},
  {slug:"pinecrest", name:"Pinecrest MHP", address:"12022 Pretty Road, Lake Country, BC", jur:"BC", lat:50.0565245, lng:-119.4100908},
  {slug:"pineridge-estates", name:"Pineridge Estates", address:"1860 Boucherie Road, West Kelowna, BC", jur:"WFN", lat:49.834581, lng:-119.5951018},
  {slug:"pinewoods-villa", name:"Pinewoods Villa", address:"1750 Lenz Road, West Kelowna, BC", jur:"Freehold", lat:49.8729748, lng:-119.5842113},
  {slug:"princess-mobile-home-park", name:"Princess Mobile Home Park", address:"2065 Boucherie Road, West Kelowna, BC", jur:"WFN", lat:49.8254964, lng:-119.6064763},
  {slug:"ranch-park", name:"Ranch Park", address:"3591 Old Vernon Road, Kelowna, BC", jur:"BC", lat:49.9368092, lng:-119.3639359},
  {slug:"sage-creek", name:"Sage Creek", address:"2084 Elk Road, West Kelowna, BC", jur:"WFN", lat:49.8404108, lng:-119.6047272},
  {slug:"scenic-valley", name:"Scenic Valley Mobile Home Park", address:"580 Highway 97 South, West Kelowna, BC", jur:"WFN", lat:49.8789046, lng:-119.5383566},
  {slug:"shady-rest", name:"Shady Rest Park", address:"2095 Boucherie Road, West Kelowna, BC", jur:"WFN", lat:49.8254026, lng:-119.607187},
  {slug:"shannon-lake", name:"Shannon Lake", address:"3206 Shannon Lake Road, West Kelowna, BC", jur:"WFN", lat:49.847398, lng:-119.6216953},
  {slug:"shasta", name:"Shasta Mobile Home Park", address:"3745 Lakeshore Road, Kelowna, BC", jur:"BC", lat:49.8495913, lng:-119.4850151},
  {slug:"sierras-westside", name:"Sierra's Westside Park", address:"2440 Old Okanagan Highway, West Kelowna, BC", jur:"WFN", lat:49.8437189, lng:-119.6169892},
  {slug:"the-vintage", name:"The Vintage at Westbank", address:"2026 Boucherie Road, West Kelowna, BC", jur:"WFN", lat:49.8280691, lng:-119.5991416},
  {slug:"trail-park-mobile-villas", name:"Trail Park Mobile Villas", address:"1699 Ross Road, West Kelowna, BC", jur:"BC", lat:49.8598839, lng:-119.5862325},
  {slug:"trepanier-creek", name:"Trepanier Creek Park", address:"5432 Chidley Road, Peachland, BC", jur:"BC", lat:49.78451, lng:-119.7143444},
  {slug:"village-green", name:"Village Green Community", address:"3381 Village Green Way, West Kelowna, BC", jur:"WFN", lat:49.8407262, lng:-119.623869},
  {slug:"westgate", name:"Westgate Park", address:"1880 Old Boucherie Road, West Kelowna, BC", jur:"WFN", lat:49.827941, lng:-119.5938142},
  {slug:"westpoint", name:"Westpoint Mobile Home Park", address:"1525 Westside Road, West Kelowna, BC", jur:"WFN", lat:49.8816256, lng:-119.5449981},
  {slug:"westview-village", name:"Westview Village", address:"1999 Highway 97 South, West Kelowna, BC", jur:"WFN", lat:49.8526121, lng:-119.5970958},
  {slug:"winfield-mobile-home-park", name:"Winfield Mobile Home Park", address:"715 Beaver Lake Road, Lake Country, BC", jur:"DuckLake", lat:50.0198082, lng:-119.3992244}
];

var PARKS_MAP_COLORS = {
  WFN: "#B8872F",
  DuckLake: "#9C5B3C",
  BC: "#3D5A6B",
  Freehold: "#5C7566"
};

var PARKS_MAP_LABELS = {
  WFN: "Westbank First Nation",
  DuckLake: "Duck Lake IR#7",
  BC: "Regular BC Land",
  Freehold: "Freehold"
};

function initParksMap(elementId) {
  var mapEl = document.getElementById(elementId);
  if (!mapEl || typeof L === "undefined") return;

  function pinIcon(color) {
    return L.divIcon({
      className: "",
      html: '<div style="background:' + color + ';width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(27,58,75,.35)"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 18],
      popupAnchor: [0, -18]
    });
  }

  var map = L.map(elementId, { scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
  }).addTo(map);

  var bounds = [];
  PARKS_MAP_DATA.forEach(function (p) {
    var color = PARKS_MAP_COLORS[p.jur] || "#3D5A6B";
    var marker = L.marker([p.lat, p.lng], { icon: pinIcon(color) }).addTo(map);
    marker.bindPopup(
      '<div style="font-family:\'Lato\',sans-serif;min-width:180px">' +
      '<strong style="font-family:\'Montserrat\',sans-serif;font-size:14px;color:#1A1A1A">' + p.name + '</strong><br>' +
      '<span style="font-size:12.5px;color:#4A4A4A">' + p.address + '</span><br>' +
      '<span style="font-size:11px;color:' + color + ';font-weight:700;text-transform:uppercase;letter-spacing:.4px">' + (PARKS_MAP_LABELS[p.jur] || p.jur) + '</span><br>' +
      '<a href="/parks/' + p.slug + '" style="font-size:13px;font-weight:700;color:#B8872F;text-decoration:none">View Park Details &rarr;</a>' +
      '</div>'
    );
    bounds.push([p.lat, p.lng]);
  });
  map.fitBounds(bounds, { padding: [30, 30] });

  var legendId = elementId + "-legend";
  var legendEl = document.getElementById(legendId);
  if (legendEl) {
    var html = "";
    Object.keys(PARKS_MAP_LABELS).forEach(function (k) {
      html += '<span style="display:inline-flex;align-items:center;gap:6px;margin-right:18px;font-size:12.5px;color:#4A4A4A">' +
        '<span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:' + PARKS_MAP_COLORS[k] + '"></span>' +
        PARKS_MAP_LABELS[k] + '</span>';
    });
    legendEl.innerHTML = html;
  }
}
