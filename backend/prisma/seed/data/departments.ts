export const DEPARTMENTS = [
  { slug: 'fashion', name: 'Fashion', tagline: 'Dressed for every chapter.', accentHex: '#FF4F8B', accent2Hex: '#FFC2D6', sortOrder: 1 },
  { slug: 'beauty', name: 'Beauty', tagline: 'Glow, on your terms.', accentHex: '#FF8A65', accent2Hex: '#F5C26B', sortOrder: 2 },
  { slug: 'electronics', name: 'Electronics', tagline: 'Plugged into tomorrow.', accentHex: '#22D3EE', accent2Hex: '#6366F1', sortOrder: 3 },
  { slug: 'home', name: 'Home & Living', tagline: 'Make it feel like yours.', accentHex: '#D97757', accent2Hex: '#84A98C', sortOrder: 4 },
  { slug: 'grocery', name: 'Grocery', tagline: 'Fresh, fast, every day.', accentHex: '#84CC16', accent2Hex: '#22C55E', sortOrder: 5 },
  { slug: 'kids', name: 'Kids & Toys', tagline: 'Big fun for little people.', accentHex: '#FACC15', accent2Hex: '#A78BFA', sortOrder: 6 },
] as const;

/** department → [parentSlug, parentName, [childSlug, childName][]] */
export const CATEGORIES: Record<string, [string, string, [string, string][]][]> = {
  fashion: [
    ['women', 'Women', [['kurtas', 'Kurtas'], ['sarees', 'Sarees'], ['dresses', 'Dresses'], ['palazzos', 'Palazzos']]],
    ['men', 'Men', [['shirts', 'Shirts'], ['jeans', 'Jeans'], ['chinos', 'Chinos'], ['hoodies', 'Hoodies']]],
    ['footwear', 'Footwear', [['sneakers', 'Sneakers'], ['juttis', 'Juttis']]],
    ['accessories', 'Accessories', [['bags', 'Bags'], ['jewellery', 'Jewellery'], ['sunglasses', 'Sunglasses']]],
  ],
  beauty: [
    ['makeup', 'Makeup', [['lipstick', 'Lipstick'], ['eyes', 'Eyes'], ['face', 'Face'], ['nails', 'Nails']]],
    ['skincare', 'Skincare', [['serums', 'Serums'], ['sunscreen', 'Sunscreen'], ['cleansers', 'Cleansers'], ['masks', 'Masks'], ['baby-care', 'Baby Care']]],
    ['haircare', 'Haircare', [['shampoo', 'Shampoo'], ['hair-masks', 'Hair Masks']]],
    ['fragrance', 'Fragrance', []],
    ['mens-grooming', "Men's Grooming", []],
  ],
  electronics: [
    ['audio', 'Audio', [['earbuds', 'Earbuds'], ['speakers', 'Speakers']]],
    ['wearables', 'Wearables', [['smartwatches', 'Smartwatches']]],
    ['mobile-accessories', 'Mobile Accessories', [['chargers', 'Chargers'], ['power-banks', 'Power Banks'], ['phone-cases', 'Phone Cases']]],
    ['computing', 'Computing', [['tablets', 'Tablets'], ['keyboards', 'Keyboards'], ['mice', 'Mice'], ['webcams', 'Webcams'], ['laptop-sleeves', 'Laptop Sleeves']]],
    ['smart-home', 'Smart Home', []],
  ],
  home: [
    ['lighting', 'Lighting', []],
    ['bedding', 'Bedding', [['bedsheets', 'Bedsheets'], ['cushions', 'Cushions']]],
    ['kitchen', 'Kitchen', [['cookware', 'Cookware'], ['mugs', 'Mugs'], ['storage', 'Storage']]],
    ['decor', 'Decor', [['clocks', 'Clocks'], ['planters', 'Planters'], ['candles', 'Candles'], ['rugs', 'Rugs']]],
    ['bath', 'Bath', []],
    ['furnishing', 'Furnishing', [['curtains', 'Curtains']]],
  ],
  grocery: [
    ['staples', 'Staples', [['atta', 'Atta & Flours'], ['rice', 'Rice'], ['dal', 'Dals & Pulses'], ['oil', 'Oils'], ['ghee', 'Ghee']]],
    ['dry-fruits', 'Dry Fruits', []],
    ['beverages', 'Beverages', [['tea', 'Tea'], ['juice', 'Juices']]],
    ['breakfast', 'Breakfast', []],
    ['snacks', 'Snacks', [['chocolate', 'Chocolate']]],
    ['sweeteners', 'Sweeteners', []],
  ],
  kids: [
    ['toys', 'Toys', [['infant-toys', 'Infant Toys'], ['rc-toys', 'RC Toys'], ['puzzles', 'Puzzles'], ['plush', 'Plush'], ['building', 'Building Sets']]],
    ['kids-fashion', 'Kids Fashion', []],
    ['school', 'School', [['school-bags', 'School Bags'], ['art', 'Art & Craft'], ['bottles', 'Bottles']]],
    ['books', 'Books', []],
    ['games', 'Games', []],
  ],
};
