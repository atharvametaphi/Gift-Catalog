const toCatalogImage = (url) => `${url}&w=1200&h=900&fit=crop&auto=compress`;

const pexelsImagePool = {
  hamperPremium: toCatalogImage(
    "https://images.pexels.com/photos/27393960/pexels-photo-27393960.jpeg?cs=srgb&dl=pexels-denislav-581353-27393960.jpg&fm=jpg",
  ),
  hamperClose: toCatalogImage(
    "https://images.pexels.com/photos/16762643/pexels-photo-16762643.jpeg?cs=srgb&dl=pexels-kristina-chuprina-132621985-16762643.jpg&fm=jpg",
  ),
  gourmetBasket: toCatalogImage(
    "https://images.pexels.com/photos/17878238/pexels-photo-17878238.jpeg?cs=srgb&dl=pexels-adil-khan-marwat-407278438-17878238.jpg&fm=jpg",
  ),
  festiveTray: toCatalogImage(
    "https://images.pexels.com/photos/20699855/pexels-photo-20699855.jpeg?cs=srgb&dl=pexels-yahya-gopalani-505469508-20699855.jpg&fm=jpg",
  ),
  chocolateHamper: toCatalogImage(
    "https://images.pexels.com/photos/6487761/pexels-photo-6487761.png?cs=srgb&dl=pexels-mths-6487761.jpg&fm=jpg",
  ),
  cookieGiftBox: toCatalogImage(
    "https://images.pexels.com/photos/28769885/pexels-photo-28769885.jpeg?cs=srgb&dl=pexels-shanks-emperor-1524379304-28769885.jpg&fm=jpg",
  ),
  whiteFloralGift: toCatalogImage(
    "https://images.pexels.com/photos/30727980/pexels-photo-30727980.jpeg?cs=srgb&dl=pexels-sumcig-30727980.jpg&fm=jpg",
  ),
  purpleFloralGift: toCatalogImage(
    "https://images.pexels.com/photos/30770345/pexels-photo-30770345.jpeg?cs=srgb&dl=pexels-ravi-roshan-2875998-30770345.jpg&fm=jpg",
  ),
  floralBasket: toCatalogImage(
    "https://images.pexels.com/photos/5714455/pexels-photo-5714455.jpeg?cs=srgb&dl=pexels-marcelo-joaquim-3414006-5714455.jpg&fm=jpg",
  ),
  diwaliGifts: toCatalogImage(
    "https://images.pexels.com/photos/8819840/pexels-photo-8819840.jpeg?cs=srgb&dl=pexels-yankrukov-8819840.jpg&fm=jpg",
  ),
  lilacBasket: toCatalogImage(
    "https://images.pexels.com/photos/30770348/pexels-photo-30770348.jpeg?cs=srgb&dl=pexels-ravi-roshan-2875998-30770348.jpg&fm=jpg",
  ),
  luxuryGiftBox: toCatalogImage(
    "https://images.pexels.com/photos/17555293/pexels-photo-17555293.jpeg?cs=srgb&dl=pexels-rahibyaqubov-17555293.jpg&fm=jpg",
  ),
  holidayHamper: toCatalogImage(
    "https://images.pexels.com/photos/6130153/pexels-photo-6130153.jpeg?cs=srgb&dl=pexels-arifsyd15-6130153.jpg&fm=jpg",
  ),
  teddyGift: toCatalogImage(
    "https://images.pexels.com/photos/10819195/pexels-photo-10819195.jpeg?cs=srgb&dl=pexels-anagarcia-10819195.jpg&fm=jpg",
  ),
};

const imageSetBySeed = {
  301: [pexelsImagePool.cookieGiftBox, pexelsImagePool.gourmetBasket, pexelsImagePool.hamperPremium],
  304: [pexelsImagePool.whiteFloralGift, pexelsImagePool.floralBasket, pexelsImagePool.lilacBasket],
  307: [pexelsImagePool.purpleFloralGift, pexelsImagePool.lilacBasket, pexelsImagePool.whiteFloralGift],
  310: [pexelsImagePool.floralBasket, pexelsImagePool.whiteFloralGift, pexelsImagePool.purpleFloralGift],
  313: [pexelsImagePool.chocolateHamper, pexelsImagePool.cookieGiftBox, pexelsImagePool.gourmetBasket],
  316: [pexelsImagePool.gourmetBasket, pexelsImagePool.luxuryGiftBox, pexelsImagePool.cookieGiftBox],
  319: [pexelsImagePool.hamperPremium, pexelsImagePool.hamperClose, pexelsImagePool.festiveTray],
  322: [pexelsImagePool.diwaliGifts, pexelsImagePool.holidayHamper, pexelsImagePool.festiveTray],
  325: [pexelsImagePool.holidayHamper, pexelsImagePool.diwaliGifts, pexelsImagePool.luxuryGiftBox],
  328: [pexelsImagePool.hamperPremium, pexelsImagePool.gourmetBasket, pexelsImagePool.cookieGiftBox],
  331: [pexelsImagePool.chocolateHamper, pexelsImagePool.luxuryGiftBox, pexelsImagePool.cookieGiftBox],
  334: [pexelsImagePool.purpleFloralGift, pexelsImagePool.whiteFloralGift, pexelsImagePool.lilacBasket],
};

const buildImages = (_, seed) => imageSetBySeed[seed] || [pexelsImagePool.hamperPremium];

export const categories = [
  { id: "cat-hampers", name: "Signature Hampers", description: "Premium curated hampers for executive gifting.", status: "active" },
  { id: "cat-floral", name: "Floral Collections", description: "Elegant floral gifting arrangements.", status: "active" },
  { id: "cat-gourmet", name: "Gourmet Gifts", description: "Artisan edible and beverage gift selections.", status: "active" },
  { id: "cat-festive", name: "Festive Editions", description: "Seasonal and celebration-focused gift sets.", status: "active" },
];

export const subCategories = [
  { id: "sub-luxe", categoryId: "cat-hampers", name: "Luxe Tray Boxes", description: "Premium tray-style hamper compositions.", status: "active" },
  { id: "sub-classic", categoryId: "cat-hampers", name: "Classic Basket Sets", description: "Classic wicker and keepsake basket arrangements.", status: "active" },
  { id: "sub-roses", categoryId: "cat-floral", name: "Rose Arrangements", description: "Rose-forward floral gift curation.", status: "active" },
  { id: "sub-purple", categoryId: "cat-floral", name: "Orchid & Purple Blooms", description: "Orchid and purple floral blends.", status: "active" },
  { id: "sub-artisan", categoryId: "cat-gourmet", name: "Artisan Treats", description: "Chef-curated artisan desserts and snacks.", status: "active" },
  { id: "sub-coffee", categoryId: "cat-gourmet", name: "Coffee & Cocoa Pairings", description: "Coffee-forward gourmet gift pairings.", status: "active" },
  { id: "sub-diwali", categoryId: "cat-festive", name: "Diwali Premiums", description: "Festive Diwali gifting combinations.", status: "active" },
  { id: "sub-yearend", categoryId: "cat-festive", name: "Year-End Celebrations", description: "Year-end celebration packs for teams and clients.", status: "active" },
];

export const catalogItems = [
  {
    id: "item-101",
    categoryId: "cat-hampers",
    subCategoryId: "sub-luxe",
    name: "Blush & Brew Luxe Tray",
    brand: "THE GIFT STUDIO",
    description: "A premium assortment with brew essentials, indulgent bites, and keepsake packaging.",
    status: "active",
    price: 2486,
    deliveryLabel: "Earliest delivery: Today",
    createdAt: "2026-05-16T09:00:00.000Z",
    images: buildImages(
      [
        "luxury gift hamper tray",
        "premium corporate gift box",
        "gourmet hamper packaging",
      ],
      301,
    ),
  },
  {
    id: "item-102",
    categoryId: "cat-floral",
    subCategoryId: "sub-roses",
    name: "White Rose Charm",
    brand: "THE GIFT STUDIO",
    description: "Elegant white roses paired with soft accents in a handcrafted presentation basket.",
    status: "active",
    price: 2199,
    deliveryLabel: "Earliest delivery: Today",
    createdAt: "2026-05-16T08:20:00.000Z",
    images: buildImages(
      [
        "white roses basket bouquet",
        "premium white floral arrangement",
        "luxury rose gift flowers",
      ],
      304,
    ),
  },
  {
    id: "item-103",
    categoryId: "cat-floral",
    subCategoryId: "sub-purple",
    name: "Blooming Grace",
    brand: "THE GIFT STUDIO",
    description: "Vibrant purple floral arrangement curated for premium gifting and celebrations.",
    status: "active",
    price: 5499,
    deliveryLabel: "Earliest delivery: Today",
    createdAt: "2026-05-16T07:15:00.000Z",
    images: buildImages(
      [
        "purple flower arrangement luxury",
        "orchid bouquet vase premium",
        "lavender floral centerpiece",
      ],
      307,
    ),
  },
  {
    id: "item-104",
    categoryId: "cat-floral",
    subCategoryId: "sub-roses",
    name: "Aster & Rose Symphony",
    brand: "THE GIFT STUDIO",
    description: "Designer floral vase with roses and asters for premium corporate gifting.",
    status: "active",
    price: 2499,
    originalPrice: 2840,
    deliveryLabel: "Earliest delivery: Today",
    createdAt: "2026-05-15T18:10:00.000Z",
    images: buildImages(
      [
        "rose bouquet luxury vase",
        "pink floral gift arrangement",
        "designer flower box bouquet",
      ],
      310,
    ),
  },
  {
    id: "item-105",
    categoryId: "cat-gourmet",
    subCategoryId: "sub-artisan",
    name: "Noir Chocolate Edit",
    brand: "THE GIFT STUDIO",
    description: "Dark chocolate curation with artisan pralines and premium festive presentation.",
    status: "active",
    price: 3199,
    deliveryLabel: "Earliest delivery: Today",
    createdAt: "2026-05-15T15:45:00.000Z",
    images: buildImages(
      [
        "artisan chocolate gift box",
        "premium sweets gift hamper",
        "gourmet dessert gift tray",
      ],
      313,
    ),
  },
  {
    id: "item-106",
    categoryId: "cat-gourmet",
    subCategoryId: "sub-coffee",
    name: "Velvet Mocha Celebration",
    brand: "THE GIFT STUDIO",
    description: "Coffee, cocoa, and gourmet snacks in a signature studio hamper box.",
    status: "active",
    price: 2999,
    deliveryLabel: "Earliest delivery: Today",
    createdAt: "2026-05-15T13:20:00.000Z",
    images: buildImages(
      [
        "coffee gift hamper luxury",
        "cocoa treats gift box",
        "premium coffee hamper set",
      ],
      316,
    ),
  },
  {
    id: "item-107",
    categoryId: "cat-hampers",
    subCategoryId: "sub-classic",
    name: "Regal Basket Reserve",
    brand: "THE GIFT STUDIO",
    description: "Classic wicker hamper with curated treats, tea blends, and festive accents.",
    status: "active",
    price: 2699,
    deliveryLabel: "Earliest delivery: Today",
    createdAt: "2026-05-15T11:10:00.000Z",
    images: buildImages(
      [
        "corporate gift basket premium",
        "classic wicker hamper gifts",
        "luxury basket gift arrangement",
      ],
      319,
    ),
  },
  {
    id: "item-108",
    categoryId: "cat-festive",
    subCategoryId: "sub-diwali",
    name: "Diwali Luxe Curation",
    brand: "THE GIFT STUDIO",
    description: "Festive sweets, dry fruits, and luxury candles in premium branded packaging.",
    status: "active",
    price: 4299,
    deliveryLabel: "Earliest delivery: Today",
    createdAt: "2026-05-15T09:05:00.000Z",
    images: buildImages(
      [
        "diwali gift hamper premium",
        "festive sweets dry fruits hamper",
        "luxury indian festival gift box",
      ],
      322,
    ),
  },
  {
    id: "item-109",
    categoryId: "cat-festive",
    subCategoryId: "sub-yearend",
    name: "Year-End Grandeur Kit",
    brand: "THE GIFT STUDIO",
    description: "A year-end gifting kit with premium planners, gourmet delights, and greeting cards.",
    status: "active",
    price: 3899,
    deliveryLabel: "Earliest delivery: Today",
    createdAt: "2026-05-14T18:00:00.000Z",
    images: buildImages(
      [
        "year end corporate gift set",
        "new year gift hamper premium",
        "executive festive gift box",
      ],
      325,
    ),
  },
  {
    id: "item-110",
    categoryId: "cat-hampers",
    subCategoryId: "sub-luxe",
    name: "Golden Harvest Hamper",
    brand: "THE GIFT STUDIO",
    description: "Handpicked premium snacks, preserves, and artisanal drinks in a luxury tray box.",
    status: "active",
    price: 3599,
    originalPrice: 3999,
    deliveryLabel: "Earliest delivery: Today",
    createdAt: "2026-05-14T14:30:00.000Z",
    images: buildImages(
      [
        "luxury gourmet hamper box",
        "premium snack hamper tray",
        "artisan food gift box",
      ],
      328,
    ),
  },
  {
    id: "item-111",
    categoryId: "cat-gourmet",
    subCategoryId: "sub-artisan",
    name: "Ruby Treat Ensemble",
    brand: "THE GIFT STUDIO",
    description: "Curated gourmet nibbles and celebration treats in premium ruby-toned packaging.",
    status: "active",
    price: 2799,
    deliveryLabel: "Earliest delivery: Today",
    createdAt: "2026-05-14T11:20:00.000Z",
    images: buildImages(
      [
        "gourmet treats gift box luxury",
        "premium confectionery hamper",
        "dessert assortment gift box",
      ],
      331,
    ),
  },
  {
    id: "item-112",
    categoryId: "cat-floral",
    subCategoryId: "sub-purple",
    name: "Lavender Aura Bouquet",
    brand: "THE GIFT STUDIO",
    description: "Premium lavender and orchid bouquet with modern vase styling.",
    status: "active",
    price: 3299,
    deliveryLabel: "Earliest delivery: Today",
    createdAt: "2026-05-14T09:10:00.000Z",
    images: buildImages(
      [
        "lavender bouquet premium gift",
        "orchid flower bouquet luxury",
        "purple floral gift arrangement",
      ],
      334,
    ),
  },
];
