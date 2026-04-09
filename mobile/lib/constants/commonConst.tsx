export const category = [
  "All",
  "Clothing",
  "Electronics",
  "Furniture",
  "Books",
  "Home & Garden",
  "Sports",
  "Others",
];

export const penangLocations = [
  "Air Itam",
  "Balik Pulau",
  "Batu Ferringhi",
  "Batu Lanchang",
  "Batu Maung",
  "Bayan Baru",
  "Bayan Lepas",
  "Bertam",
  "Bukit Jambul",
  "Bukit Mertajam",
  "Butterworth",
  "Gelugor",
  "George Town",
  "Gurney Drive",
  "Jelutong",
  "Juru",
  "Nibong Tebal",
  "Paya Terubong",
  "Perai",
  "Pulau Tikus",
  "Relau",
  "Sungai Ara",
  "Sungai Bakap",
  "Sungai Dua",
  "Tanjong Tokong",
  "Teluk Kumbar",
];

export const wasteTypes = [
  "General Waste (Non-Recyclable)",
  "Plastic (Recyclable)",
  "Paper & Cardboard",
  "Glass",
  "Metal / Aluminium Cans",
  "E-Waste (Electronics)",
  "Hazardous / Chemical Waste",
  "Green / Garden Waste",
  "Construction & Demolition Debris",
  "Bulky Items (Furniture, Mattresses)",
  "Textiles / Clothing",
];

export interface WasteTypeManualItem {
  type: string;
  icon: string;
  visualCue: string;
  examples: string[];
  avoid: string[];
  sampleImageUrls?: string[];
}

export const wasteTypeManual: WasteTypeManualItem[] = [
  {
    type: "General Waste (Non-Recyclable)",
    icon: "delete-outline",
    visualCue: "Mixed, dirty, and non-recyclable items",
    examples: ["Used tissue", "Disposable diaper", "Styrofoam food box"],
    avoid: ["Clean bottles", "Paper", "Cans"],
    sampleImageUrls: [
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772546036873.jpeg",
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772546492680.jpeg",
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772546586047.jpeg",
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772548539033.jpeg",
    ],
  },
  {
    type: "Plastic (Recyclable)",
    icon: "recycling",
    visualCue: "Clean plastic containers and bottles",
    examples: ["PET bottle", "Plastic detergent bottle", "Food container lid"],
    avoid: ["Oily plastic", "Mixed plastic with food residue"],
    sampleImageUrls: [
      "https://scx2.b-cdn.net/gfx/news/hires/2023/plastic.jpg",
      "https://blog.cuyahogarecycles.org/wp-content/uploads/2017/07/bottles_mainpost.jpg",
    ],
  },
  {
    type: "Paper & Cardboard",
    icon: "description",
    visualCue: "Dry paper-based materials",
    examples: ["Cardboard box", "Newspaper", "Paper packaging"],
    avoid: ["Wet paper", "Greasy pizza box"],
    sampleImageUrls: [
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772545538696.jpeg",
      "https://cdn.shopify.com/s/files/1/0593/4235/6578/files/tips-for-cardboard-recycling_800x800.jpg?v=1734092578",
      "https://img.freepik.com/premium-photo/cardboard-box-full-paper-packaging-waste-concepts-paper-recycling-waste-sorting_144962-23639.jpg?semt=ais_hybrid&w=740&q=80",
    ],
  },
  {
    type: "Glass",
    icon: "wine-bar",
    visualCue: "Glass bottles and jars",
    examples: ["Glass drink bottle", "Jam jar", "Sauce bottle"],
    avoid: ["Ceramics", "Broken mirror"],
    sampleImageUrls: [
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772544735753.jpeg",
      "https://cdn.hswstatic.com/gif/glass-recycling.jpg",
      "https://www.pelmfg.com/wp-content/uploads/2022/04/pel_news_0000_glass_bottles.jpg",
    ],
  },
  {
    type: "Metal / Aluminium Cans",
    icon: "local-drink",
    visualCue: "Metal cans and tins",
    examples: ["Soft drink can", "Food tin", "Metal container"],
    avoid: ["Battery", "Electronics"],
    sampleImageUrls: [
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/dd78265a-291f-493b-bee3-d80e21afb4b8-1772519008338.jpeg",
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/dd78265a-291f-493b-bee3-d80e21afb4b8-1772519008746.jpeg",
    ],
  },
  {
    type: "E-Waste (Electronics)",
    icon: "devices",
    visualCue: "Electronic devices and accessories",
    examples: ["Old phone", "Broken charger", "Computer keyboard"],
    avoid: ["Regular batteries", "Food waste"],
    sampleImageUrls: [
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772447046717.jpeg",
      "https://media.generalkinematics.com/wp-content/uploads/2024/05/e-waste-pile.jpg",
      "https://blog-assets.3ds.com/uploads/2022/04/ewaste-global-recycling-day-1024x612-1.jpeg",
    ],
  },
  {
    type: "Hazardous / Chemical Waste",
    icon: "warning-amber",
    visualCue: "Toxic, flammable, or corrosive waste",
    examples: ["Paint can", "Pesticide bottle", "Solvent container"],
    avoid: ["Normal household trash"],
    sampleImageUrls: [
      "https://www.cleanway.com.au/wp-content/uploads/Chemical-Waste-Disposal-Ensuring-a-Sustainable-Future.png",
      "https://www.weclearjunk.co.uk/wp-content/uploads/2025/11/How-to-Dispose-of-Chemical-Waste-Safely-and-Responsibly.webp",
    ],
  },
  {
    type: "Green / Garden Waste",
    icon: "grass",
    visualCue: "Natural plant-based waste",
    examples: ["Grass clippings", "Dry leaves", "Small branches"],
    avoid: ["Plastic flower pots", "Construction material"],
    sampleImageUrls: [
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772545591144.jpeg",
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/dd78265a-291f-493b-bee3-d80e21afb4b8-1772518928097.jpeg",
    ],
  },
  {
    type: "Construction & Demolition Debris",
    icon: "construction",
    visualCue: "Heavy building and renovation waste",
    examples: ["Broken tiles", "Concrete chunks", "Wood planks"],
    avoid: ["Household recyclable items"],
    sampleImageUrls: [
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772544528295.jpeg",
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772544529010.png",
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772545124606.jpeg",
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772547113687.jpeg",
    ],
  },
  {
    type: "Bulky Items (Furniture, Mattresses)",
    icon: "chair-alt",
    visualCue: "Large items that need special collection",
    examples: ["Old mattress", "Sofa", "Large cabinet"],
    avoid: ["Small household waste bags"],
    sampleImageUrls: [
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772445891308.jpeg",
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772445891779.jpeg",
    ],
  },
  {
    type: "Textiles / Clothing",
    icon: "checkroom",
    visualCue: "Fabric and wearable items",
    examples: ["Old shirt", "Used shoes", "Curtains"],
    avoid: ["Wet textile with chemical contamination"],
    sampleImageUrls: [
      "https://hhcdlkedyawipsefnvoh.supabase.co/storage/v1/object/public/report-images/9f5852f4-94dd-450c-ba4d-badff68391d0-1772545786422.jpeg",
    ],
  },
];

/**
 * Format a date string or Date object to local time in "YYYY-MM-DD HH:MM" format
 * @param dateInput - Date object or date string
 * @returns formatted string
 */
export const formatLocalDateTime = (dateInput: string | Date): string => {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}, ${hours}:${minutes}`;
};

export const formatPrice = (price: number) => {
  if (price === 0) return "Free";
  return price % 1 === 0 ? `RM ${price}` : `RM ${price.toFixed(2)}`;
};
