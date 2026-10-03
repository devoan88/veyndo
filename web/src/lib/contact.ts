// Personal sales: orders are taken personally (WhatsApp, phone, contact form)
// until online payments are live.
export const CONTACT = {
  whatsapp: "436643568802",
  phone: "+43 664 4390540",
  phoneHref: "tel:+436644390540",
  form: "https://veyndo.at/#kontakt",
};

export function whatsappHref(text: string) {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}
