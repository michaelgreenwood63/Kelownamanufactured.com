// Live manufactured home listings loader — kelownamanufactured.com
function toggleMenu(){var m=document.getElementById('mobile-menu');m.style.display=m.style.display==='flex'?'none':'flex';}

var allListings=[],filteredListings=[],currentPage=1,PAGE_SIZE=12;

function formatPrice(p){if(!p)return'Price on Request';return'$'+Number(p).toLocaleString('en-CA');}
function getPhoto(l){if(l.Media&&l.Media.length){var m=l.Media.find(function(x){return x.MediaURL;});if(m)return m.MediaURL;}return null;}
function buildAddress(l){var parts=[];if(l.UnitNumber)parts.push('#'+l.UnitNumber);if(l.StreetNumber)parts.push(l.StreetNumber);if(l.StreetName)parts.push(l.StreetName);if(l.StreetSuffix)parts.push(l.StreetSuffix);return parts.join(' ')||'Address on Request';}

function renderCard(l){
  var photo=getPhoto(l);
  var photoStyle=photo?'background-image:url(\''+photo+'\')':'background:linear-gradient(135deg,#e8e8e8,#d0d0d0)';
  var beds=l.BedroomsTotal?l.BedroomsTotal+' bd':null;
  var baths=l.BathroomsTotalInteger?l.BathroomsTotalInteger+' ba':null;
  var sqft=l.LivingArea?Math.round(l.LivingArea).toLocaleString('en-CA')+' sqft':null;
  var details=[beds,baths,sqft].filter(Boolean).map(function(d){return'<span class="listing-detail">'+d+'</span>';}).join('');
  var office=l.ListOfficeName?'<div class="listing-office">'+l.ListOfficeName+'</div>':'';
  var url=l.ListingURL||('https://www.realtor.ca');
  return'<a href="'+url+'" target="_blank" rel="noopener" class="listing-card">'+
    '<div class="listing-photo" style="'+photoStyle+'"><span class="listing-badge">Active</span></div>'+
    '<div class="listing-body">'+
    '<div class="listing-price">'+formatPrice(l.ListPrice)+'</div>'+
    '<div class="listing-address">'+buildAddress(l)+', '+(l.City||'')+' BC</div>'+
    '<div class="listing-details">'+details+'</div>'+
    office+'<span class="listing-cta">View on REALTOR.ca →</span>'+
    '</div></a>';
}

function getActiveFilters(){
  var priceVal=document.getElementById('f-price').value;
  var minPrice=0,maxPrice=Infinity;
  if(priceVal){var parts=priceVal.split('-');minPrice=parseInt(parts[0])||0;maxPrice=parseInt(parts[1])||Infinity;}
  return{minPrice:minPrice,maxPrice:maxPrice,minBeds:parseInt(document.getElementById('f-beds').value)||0,city:document.getElementById('f-city').value};
}

function matchesFilters(l,f){
  var price=l.ListPrice||0;
  if(price<f.minPrice||price>f.maxPrice)return false;
  if(f.minBeds>0&&(l.BedroomsTotal||0)<f.minBeds)return false;
  if(f.city&&l.City!==f.city)return false;
  return true;
}

function renderListings(listings,resetPage){
  if(resetPage)currentPage=1;
  filteredListings=listings;
  var grid=document.getElementById('listings-grid');
  var count=document.getElementById('listings-count');
  if(!listings.length){grid.innerHTML='<div class="listings-status"><div style="font-size:32px">🔍</div><p>No active manufactured home listings currently match these filters. Try widening your search, or check back soon — new listings are added daily.</p></div>';count.textContent='0 listings';return;}
  var totalPages=Math.ceil(listings.length/PAGE_SIZE);
  var start=(currentPage-1)*PAGE_SIZE;
  var page=listings.slice(start,start+PAGE_SIZE);
  count.textContent='Showing '+(start+1)+'–'+Math.min(start+PAGE_SIZE,listings.length)+' of '+listings.length+' active listings';
  var pagination=totalPages>1?'<div class="pagination"><button class="pagination-btn" onclick="goPage('+(currentPage-1)+')" '+(currentPage<=1?'disabled':'')+'>← Previous</button><span class="pagination-info">Page '+currentPage+' of '+totalPages+'</span><button class="pagination-btn" onclick="goPage('+(currentPage+1)+')" '+(currentPage>=totalPages?'disabled':'')+'>Next →</button></div>':'';
  grid.innerHTML=page.map(renderCard).join('')+pagination;
}

function goPage(n){var totalPages=Math.ceil(filteredListings.length/PAGE_SIZE);if(n<1||n>totalPages)return;currentPage=n;renderListings(filteredListings,false);document.getElementById('listings-grid').scrollIntoView({behavior:'smooth'});}
function applyFilters(){renderListings(allListings.filter(function(l){return matchesFilters(l,getActiveFilters());}),true);}
function resetFilters(){document.getElementById('f-price').value='';document.getElementById('f-beds').value='0';document.getElementById('f-city').value='';renderListings(allListings,true);}

async function loadListings(){
  var grid=document.getElementById('listings-grid');
  var count=document.getElementById('listings-count');
  try{
    var res=await fetch('/api/listings');
    var data=await res.json();
    if(!data.configured){grid.innerHTML='<div class="listings-status"><p>Live listings are being connected — check back shortly, or <a href="/#help" style="color:var(--red);font-weight:700">contact us</a> and we\'ll send you current matches directly.</p></div>';count.textContent='';return;}
    if(data.error){grid.innerHTML='<div class="listings-status"><p>Unable to load listings right now. Please try again shortly.</p></div>';count.textContent='';return;}
    allListings=data.listings||[];
    renderListings(allListings,true);
  }catch(e){
    grid.innerHTML='<div class="listings-status"><p>Unable to load listings right now. Please try again shortly.</p></div>';
    count.textContent='';
  }
}
loadListings();
