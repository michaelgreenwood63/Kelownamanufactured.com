(function () {
  var BASE = 'https://kelownamanufactured.com';
  var path = window.location.pathname.replace(/\/$/, '') || '/';

  function inject(data) {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(data);
    (document.head || document.body).appendChild(s);
  }

  inject({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['RealEstateAgent', 'LocalBusiness'],
        '@id': BASE + '#business',
        'name': 'Mark Jontz & Associates',
        'alternateName': 'Kelowna Manufactured',
        'url': BASE,
        'telephone': '+12507176330',
        'email': 'info@markjontz.com',
        'description': 'Mark Jontz & Associates at Royal LePage Kelowna — manufactured and mobile home real estate specialists across Kelowna, West Kelowna, Lake Country, and Peachland, including parks on Westbank First Nation land.',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Kelowna',
          'addressRegion': 'BC',
          'addressCountry': 'CA'
        },
        'areaServed': [
          { '@type': 'City', 'name': 'Kelowna' },
          { '@type': 'City', 'name': 'West Kelowna' },
          { '@type': 'City', 'name': 'Lake Country' },
          { '@type': 'City', 'name': 'Peachland' },
          { '@type': 'AdministrativeArea', 'name': 'Okanagan, British Columbia' }
        ],
        'parentOrganization': {
          '@type': 'RealEstateAgent',
          'name': 'Mark Jontz & Associates',
          'url': 'https://www.markjontz.com'
        },
        'sameAs': [
          'https://www.markjontz.com',
          'https://kelownalistings.com',
          'https://kelownadownsizing.com',
          'https://incareofkelowna.com'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': BASE + '#website',
        'name': 'Kelowna Manufactured',
        'url': BASE,
        'description': 'A park-by-park guide to buying and selling manufactured and mobile homes across the Central Okanagan, including Westbank First Nation leasehold communities.',
        'publisher': { '@id': BASE + '#business' },
        'inLanguage': 'en-CA'
      }
    ]
  });

  var PAGES = {
    '/parks': 'Park Directory',
    '/wfn-land-vs-bc-land': 'WFN Land vs. BC Land',
    '/selling-a-manufactured-home': 'Selling a Manufactured Home',
    '/buying-a-manufactured-home': 'Buying a Manufactured Home',
    '/pad-rent-rules-bc': 'Pad Rent Rules in BC',
    '/team': 'Our Team',
    '/contact': 'Contact'
  };

  var HOMEPAGE_FAQS = [
    ["Is a manufactured home park in West Kelowna governed by BC law or something else?", "It depends entirely on who owns the underlying land. Many West Kelowna parks sit on Westbank First Nation (WFN) reserve land, leased long-term to the park operator — those are governed by WFN's own Residential Premises Law, not BC's Manufactured Home Park Tenancy Act. Other parks sit on regular provincial land and fall under BC's Act as normal. We identify which applies before you list or make an offer."],
    ["Can I just buy the home, or do I also need the park's approval?", "In almost every leasehold park — WFN or BC — selling a manufactured home means assigning the site's tenancy or sublease to the buyer, which requires the park operator's consent. That consent generally can't be unreasonably withheld, but it's a real step with its own paperwork and timeline, not a formality to skip."],
    ["What's the difference between a leasehold park and owning the land?", "Most manufactured home parks are leasehold — you own the home, but pay pad rent for land owned by someone else (WFN, a private landholder, or a corporate park owner). A small number of communities are bare-land strata, where you actually own your parcel outright. The difference matters enormously for financing, resale, and long-term security."],
    ["Why do some parks say 'no financing' or 'cash only'?", "It usually comes down to the land tenure. Lenders are far more cautious — sometimes unwilling — to mortgage a home on leased land, especially with a shorter remaining lease term or no formal headlease at all. Several parks in our area only accept specific lenders, or cash purchases only. We flag this per park before you fall in love with a listing you can't finance."],
    ["Do you only work in Kelowna, or the wider area too?", "We cover manufactured and mobile home communities across Kelowna, West Kelowna, Lake Country, and Peachland — including the Westbank First Nation leasehold parks most other agents don't dig into. For a property elsewhere in BC, we'll connect you with a trusted local specialist we know."]
  ];

  if (path === '/') {
    inject({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': BASE + '/#faq',
      'mainEntity': HOMEPAGE_FAQS.map(function (qa) {
        return { '@type': 'Question', 'name': qa[0], 'acceptedAnswer': { '@type': 'Answer', 'text': qa[1] } };
      })
    });
  }

  var breadcrumbItems = [{ '@type': 'ListItem', 'position': 1, 'name': 'Kelowna Manufactured', 'item': BASE + '/' }];
  if (PAGES[path]) {
    breadcrumbItems.push({ '@type': 'ListItem', 'position': 2, 'name': PAGES[path], 'item': BASE + path });
  }
  inject({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems
  });
})();
