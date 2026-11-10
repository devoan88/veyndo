// Unsplash photos (Unsplash License, hotlinked from images.unsplash.com).
// Used for the landing page and the demo profiles only, never as a real business's cover.
const U = (id: string, w = 1200, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=75`;

export const BRANCH_PHOTO: Record<string, string> = {
  friseur: "1695527081848-1e46c06e6458",
  nagelstudio: "1632345031435-8727f6897d53",
  kosmetik: "1552693673-1bf958298935",
  massage: "1600334089648-b0d9d3028eb2",
  physiotherapie: "1649751361457-01d3a696c7e6",
  psychotherapie: "1637245048732-adf1a547835e",
  elektriker: "1621905251189-08b45d6a269e",
  installateur: "1676210134188-4c05dd172f89",
  reinigung: "1581578731548-c64695cc6952",
};

// Extra photos for the demo profiles' galleries.
export const DEMO_GALLERY: Record<string, string[]> = {
  friseur: ["1560869713-7d0a29430803", "1706629505300-168aa1604912", "1635273051839-003bf06a8751", "1605497788044-5a32c7078486", "1634449862841-8c6e970117e5"],
  nagelstudio: ["1619607146034-5a05296c8f9a", "1696342003838-4a8f9f36588c", "1659391542239-9648f307c0b1", "1658492055212-e1acbccfca5a"],
  kosmetik: ["1570172619644-dfd03ed5d881", "1616394584738-fc6e612e71b9", "1761718209835-c8586b7dcac0", "1731514771613-991a02407132"],
  massage: ["1544161515-4ab6ce6db874", "1519823551278-64ac92734fb1", "1639162906614-0603b0ae95fd", "1598901986949-f593ff2a31a6"],
  physiotherapie: ["1645005512968-0c1fe99f0093", "1586401100295-7a8096fd231a", "1540205895360-4ad4cffb3aa8", "1519824145371-296894a0daa9"],
  psychotherapie: ["1714976694810-85add1a29c96", "1573495804664-b1c0849525af", "1758273240360-76b908e7582a"],
  elektriker: ["1660330589693-99889d60181e", "1555963966-b7ae5404b6ed", "1758101755915-462eddc23f57", "1682345262055-8f95f3c513ea"],
  installateur: ["1749532125405-70950966b0e5", "1676210134190-3f2c0d5cf58d", "1542013936693-884638332954", "1620653713380-7a34b773fef8"],
  reinigung: ["1646980241033-cd7abda2ee88", "1563453392212-326f5e854473", "1740657254989-42fe9c3b8cce", "1528740561666-dc2479dc08ab"],
};

export const PEOPLE = {
  owner: "1761839256840-7780a45b85dc", // salon owner, cheerful
  craftsman: "1687422808248-f807f4ea2a2e", // man in apron with phone
  customer: "1790749871439-a1762c75af2a", // woman with phone in a café
  shop: "1687293233211-6b0cc3beba70", // woman in her shop
};

export function branchPhoto(key: string, w = 1200, h?: number) {
  const id = BRANCH_PHOTO[key];
  return id ? U(id, w, h) : null;
}

export const photo = U;
