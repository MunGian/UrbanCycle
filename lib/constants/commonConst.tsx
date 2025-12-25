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
