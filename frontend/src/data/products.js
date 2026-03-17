/**
 * TAMBVRINI — Real product catalog restored from the Emergent export.
 *
 * Sources used to recover this dataset:
 *   • backend/server.py  SEED_PRODUCTS  (bolso-monograma, camiseta-sport-club, traje-monograma)
 *   • tmp/traje_product_replace_payload.json  (traje latest images + thumbnail)
 *   • tmp/traje_imgs/  (5 locally-recovered product images)
 *   • frontend/src/components/ProductCard.js   (hover-video URLs)
 *   • frontend/src/pages/ProductPage.js        (sold-out-size rules)
 *   • frontend/src/pages/HomePage.js           (layout / spotlight references)
 *   • frontend/src/pages/ShopPage.js           (category-2026 mapping, gender filters)
 *   • memory/PRD.md + .emergent/summary.txt    (product names, gallery sizes, dates)
 *   • test_result.md                           (Polo Aureus price, colors, sizes)
 *
 * Products whose image URLs existed ONLY in the live MongoDB (never committed)
 * still reference the original CDN so they display correctly when the CDN is
 * reachable (e.g. in production).  Products with locally-recovered images use
 * paths under /products/{product_id}/.
 */

const ASSET = "https://customer-assets.emergentagent.com";

const products = [
  // ──────────────────────────────────────────────────
  // 1. Traje Monograma Tambvrini
  //    5 images recovered locally from tmp/traje_imgs/;
  //    remaining 2 from CDN (replace-payload latest version).
  // ──────────────────────────────────────────────────
  {
    product_id: "traje-monograma-tambvrini",
    slug: "traje-monograma-tambvrini",
    name: "Traje Monograma Tambvrini",
    description:
      "Set de traje Tambvrini con bordado monograma romano integral. Sastrería contemporánea de inspiración italiana con silueta elegante y estructura ligera.",
    price: 210.0,
    currency: "EUR",
    images: [
      "/products/traje-monograma-tambvrini/01.jpeg",
      "/products/traje-monograma-tambvrini/02.png",
      "/products/traje-monograma-tambvrini/03.jpeg",
      "/products/traje-monograma-tambvrini/04.jpeg",
      "/products/traje-monograma-tambvrini/05.png",
      "/products/traje-monograma-tambvrini/1.jpg",
      "/products/traje-monograma-tambvrini/10.jpg",
      "/products/traje-monograma-tambvrini/11.jpg",
      "/products/traje-monograma-tambvrini/2.jpg",
      "/products/traje-monograma-tambvrini/3.jpg",
      "/products/traje-monograma-tambvrini/4.jpg",
      "/products/traje-monograma-tambvrini/5.jpg",
      "/products/traje-monograma-tambvrini/6.jpg",
      "/products/traje-monograma-tambvrini/7.jpg",
      "/products/traje-monograma-tambvrini/8.jpg",
      "/products/traje-monograma-tambvrini/9.jpg",
    ],
    thumbnail_image: "/products/traje-monograma-tambvrini/01.jpeg",
    category: ["sastrería", "set"],
    gender: "unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Blanco", hex: "#FFFFFF" }],
    composition:
      "Algodón premium jacquard con monograma bordado. Forro interior de viscosa suave. Botones nacarados tono marfil.",
    care: "Limpieza en seco. Planchar a baja temperatura con paño.",
    is_new: true,
    is_featured: true,
    is_sold_out: true,
    collections: ["drop"],
    created_at: "2026-02-08T00:00:00+00:00",
  },

  // ──────────────────────────────────────────────────
  // 2. Bolso Monograma Tambvrini
  // ──────────────────────────────────────────────────
  {
    product_id: "bolso-monograma-tambvrini",
    slug: "bolso-monograma-tambvrini",
    name: "Bolso Monograma Tambvrini",
    description:
      "El Bolso Monograma Tambvrini representa la visión contemporánea del lujo clásico de la casa.\nUna pieza diseñada para viajes elegantes y uso diario refinado, donde el equilibrio entre estructura, textura y detalles define su carácter.\n\nSu silueta arquitectónica se combina con un lienzo monograma exclusivo y bandas centrales en tonos pastel que aportan identidad visual distintiva. Cada elemento ha sido pensado para transmitir presencia, sofisticación y durabilidad.\n\nDiseñado para acompañar movimiento, viajes y estilo con una estética limpia y atemporal.",
    price: 290.0,
    currency: "EUR",
    images: [
      "/products/bolso-monograma-tambvrini/1.jpg",
      "/products/bolso-monograma-tambvrini/10.jpg",
      "/products/bolso-monograma-tambvrini/11.jpg",
      "/products/bolso-monograma-tambvrini/2.jpg",
      "/products/bolso-monograma-tambvrini/3.jpg",
      "/products/bolso-monograma-tambvrini/4.jpg",
      "/products/bolso-monograma-tambvrini/5.jpg",
      "/products/bolso-monograma-tambvrini/6.jpg",
      "/products/bolso-monograma-tambvrini/7.jpg",
      "/products/bolso-monograma-tambvrini/8.jpg",
      "/products/bolso-monograma-tambvrini/9.jpg",
    ],
    thumbnail_image: "/products/bolso-monograma-tambvrini/1.jpg",
    category: ["accesorios", "marroquineria"],
    gender: "unisex",
    sizes: ["Única"],
    colors: [{ name: "Beige / Blanco", hex: "#E7DDCF" }],
    composition:
      "Canvas premium monogramado de alta resistencia\nDetalles en piel tratada\nHerrajes metálicos dorados\nCremalleras reforzadas\nInterior textil de alta durabilidad\n\nHecho para mantener estructura y elegancia con el uso.",
    care: "Limpiar con paño suave. Almacenar en bolsa de algodón.",
    is_new: true,
    is_featured: false,
    is_sold_out: true,
    collections: ["roma", "limited"],
    created_at: "2026-02-09T00:00:00+00:00",
  },

  // ──────────────────────────────────────────────────
  // 3. Camiseta Sport Club
  // ──────────────────────────────────────────────────
  {
    product_id: "camiseta-sport-club",
    slug: "camiseta-sport-club",
    name: "Camiseta Sport Club",
    description:
      "Camiseta Sport Club de inspiración europea clásica.\nAlgodón premium de alto gramaje con caída estructurada y tacto suave.\n\nDiseño minimalista frontal con emblema romano y gráfica trasera de gran formato estilo sport club europeo.\nPensada para un equilibrio entre lujo relajado, estética deportiva y cultura contemporánea.\n\nAjuste regular elegante.\nFabricación premium.\nUso diario o editorial.\n\nComposición:\n100% algodón premium pesado.\n\nFit: regular luxury fit.",
    price: 20.0,
    currency: "EUR",
    images: [
      "/products/camiseta-sport-club/1.jpg",
      "/products/camiseta-sport-club/10.jpg",
      "/products/camiseta-sport-club/11.jpg",
      "/products/camiseta-sport-club/12.jpg",
      "/products/camiseta-sport-club/13.jpg",
      "/products/camiseta-sport-club/14.jpg",
      "/products/camiseta-sport-club/2.jpg",
      "/products/camiseta-sport-club/3.jpg",
      "/products/camiseta-sport-club/4.jpg",
      "/products/camiseta-sport-club/5.jpg",
      "/products/camiseta-sport-club/6.jpg",
      "/products/camiseta-sport-club/7.jpg",
      "/products/camiseta-sport-club/8.jpg",
      "/products/camiseta-sport-club/9.jpg",
    ],
    thumbnail_image: "/products/camiseta-sport-club/1.jpg",
    category: ["camisetas", "apparel"],
    gender: "unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Azul marino", hex: "#0B1B3A" }],
    composition: "100% algodón premium pesado.",
    care: "Lavado a máquina 30° del revés. No usar secadora.",
    is_new: true,
    is_featured: true,
    collections: ["sport-club"],
    seo_title: "Camiseta Sport Club Azul Marino | Tamburini",
    created_at: "2026-02-12T00:00:00+00:00",
  },

  // ──────────────────────────────────────────────────
  // 4. Polo Golf  (recovered from backend category mapping + frontend refs)
  //    Images only existed in MongoDB — URLs pending re-import.
  // ──────────────────────────────────────────────────
  {
    product_id: "polo-golf",
    slug: "polo-golf",
    name: "Polo Golf",
    description:
      "Polo Golf de la colección Sport Club 2026. Algodón premium con bordado del escudo Sport Club. Estética deportiva europea con acabado de lujo.",
    price: 30.0,
    currency: "EUR",
    images: [
      "/products/polo-golf/1.jpg",
      "/products/polo-golf/10.jpg",
      "/products/polo-golf/11.jpg",
      "/products/polo-golf/12.jpg",
      "/products/polo-golf/13.jpg",
      "/products/polo-golf/2.jpg",
      "/products/polo-golf/3.jpg",
      "/products/polo-golf/4.jpg",
      "/products/polo-golf/5.jpg",
      "/products/polo-golf/6.jpg",
      "/products/polo-golf/7.jpg",
      "/products/polo-golf/8.jpg",
      "/products/polo-golf/9.jpg",
    ],
    thumbnail_image: "/products/polo-golf/1.jpg",
    category: ["polos", "apparel"],
    gender: "hombre",
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Blanco", hex: "#FFFFFF" }],
    composition: "100% Algodón Piqué Premium",
    care: "Lavado a máquina 30°. No usar secadora.",
    is_new: true,
    is_featured: true,
    sold_out_sizes: ["L"],
    collections: ["sport-club"],
    created_at: "2026-02-12T00:00:00+00:00",
  },

  // ──────────────────────────────────────────────────
  // 5. Suéter Captain  (recovered from category-2026 mapping + frontend refs)
  //    Images only existed in MongoDB — URLs pending re-import.
  // ──────────────────────────────────────────────────
  {
    product_id: "sueter-captain",
    slug: "sueter-captain",
    name: "Suéter Captain",
    description:
      "Suéter Captain de la colección Sport Club 2026. Punto fino premium con bordado del escudo Sport Club. Diseñado para el rendimiento con estética de club privado europeo.",
    price: 50.0,
    currency: "EUR",
    images: [
      "/products/sueter-captain/1.jpg",
      "/products/sueter-captain/10.jpg",
      "/products/sueter-captain/11.jpg",
      "/products/sueter-captain/12.jpg",
      "/products/sueter-captain/2.jpg",
      "/products/sueter-captain/3.jpg",
      "/products/sueter-captain/4.jpg",
      "/products/sueter-captain/5.jpg",
      "/products/sueter-captain/6.jpg",
      "/products/sueter-captain/7.jpg",
      "/products/sueter-captain/8.jpg",
      "/products/sueter-captain/9.jpg",
    ],
    thumbnail_image: "/products/sueter-captain/1.jpg",
    category: ["knitwear", "apparel"],
    gender: "hombre",
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Azul marino", hex: "#0B1B3A" }],
    composition: "100% Algodón Premium",
    care: "Lavado a máquina 30° del revés. No usar secadora.",
    is_new: true,
    is_featured: true,
    collections: ["sport-club"],
    created_at: "2026-02-12T00:00:00+00:00",
  },

  // ──────────────────────────────────────────────────
  // 6. Polo Aureus  (recovered from test_result.md verification data)
  //    Images only existed in MongoDB — URLs pending re-import.
  // ──────────────────────────────────────────────────
  {
    product_id: "polo-aureus",
    slug: "polo-aureus",
    name: "Polo Aureus",
    description:
      "Polo Aureus de algodón premium con acabado de lujo. Una pieza atemporal que combina la elegancia deportiva con el refinamiento mediterráneo.",
    price: 30.0,
    currency: "EUR",
    images: [
      "/products/polo-aureus/1.jpg",
      "/products/polo-aureus/10.jpg",
      "/products/polo-aureus/2.jpg",
      "/products/polo-aureus/3.jpg",
      "/products/polo-aureus/4.jpg",
      "/products/polo-aureus/5.jpg",
      "/products/polo-aureus/6.jpg",
      "/products/polo-aureus/7.jpg",
      "/products/polo-aureus/8.jpg",
      "/products/polo-aureus/9.jpg",
    ],
    thumbnail_image: "/products/polo-aureus/1.jpg",
    category: ["polos", "apparel"],
    gender: "hombre",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Blanco", hex: "#FFFFFF" }],
    composition: "100% Algodón Premium",
    care: "Lavado a máquina 30°. No usar secadora.",
    is_new: true,
    is_featured: true,
    sold_out_sizes: ["XS", "S", "L", "XL"],
    collections: ["roma"],
    created_at: "2026-02-14T00:00:00+00:00",
  },

  // ──────────────────────────────────────────────────
  // 7. Camiseta Imperium  (recovered from frontend women's section refs)
  //    Images only existed in MongoDB — URLs pending re-import.
  // ──────────────────────────────────────────────────
  {
    product_id: "camiseta-imperium",
    slug: "camiseta-imperium",
    name: "Camiseta Imperium",
    description:
      "Camiseta Imperium de algodón premium con diseño editorial. Inspiración clásica romana con acabado contemporáneo de lujo.",
    price: 20.0,
    currency: "EUR",
    images: [
      "/products/camiseta-imperium/1.jpg",
      "/products/camiseta-imperium/10.jpg",
      "/products/camiseta-imperium/11.jpg",
      "/products/camiseta-imperium/12.jpg",
      "/products/camiseta-imperium/13.jpg",
      "/products/camiseta-imperium/14.jpg",
      "/products/camiseta-imperium/15.jpg",
      "/products/camiseta-imperium/16.jpg",
      "/products/camiseta-imperium/2.jpg",
      "/products/camiseta-imperium/3.jpg",
      "/products/camiseta-imperium/4.jpg",
      "/products/camiseta-imperium/5.jpg",
      "/products/camiseta-imperium/6.jpg",
      "/products/camiseta-imperium/7.jpg",
      "/products/camiseta-imperium/8.jpg",
      "/products/camiseta-imperium/9.jpg",
    ],
    thumbnail_image: "/products/camiseta-imperium/1.jpg",
    category: ["camisetas", "apparel"],
    gender: "mujer",
    sizes: ["XS", "S", "M", "L"],
    colors: [{ name: "Negro", hex: "#0A0A0A" }],
    composition: "100% Algodón Premium",
    care: "Lavado a máquina 30° del revés. No usar secadora.",
    is_new: true,
    is_featured: true,
    collections: ["roma"],
    created_at: "2026-02-14T00:00:00+00:00",
  },

  // ──────────────────────────────────────────────────
  // 8. Americana UMBRA  (recovered from frontend refs + sold-out sizes)
  //    Images only existed in MongoDB — URLs pending re-import.
  // ──────────────────────────────────────────────────
  {
    product_id: "americana-umbra",
    slug: "americana-umbra",
    name: "Americana UMBRA",
    description:
      "Americana UMBRA de sastrería contemporánea. Silueta elegante con estructura ligera e inspiración clásica mediterránea.",
    price: 150.0,
    currency: "EUR",
    images: [
      "/products/americana-umbra/1.jpg",
      "/products/americana-umbra/10.jpg",
      "/products/americana-umbra/11.jpg",
      "/products/americana-umbra/12.jpg",
      "/products/americana-umbra/2.jpg",
      "/products/americana-umbra/3.jpg",
      "/products/americana-umbra/4.jpg",
      "/products/americana-umbra/5.jpg",
      "/products/americana-umbra/6.jpg",
      "/products/americana-umbra/7.jpg",
      "/products/americana-umbra/8.jpg",
      "/products/americana-umbra/9.jpg",
    ],
    thumbnail_image: "/products/americana-umbra/1.jpg",
    category: ["sastrería", "apparel"],
    gender: "mujer",
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Negro", hex: "#0A0A0A" }],
    composition: "Lana premium. Forro: Viscosa",
    care: "Solo limpieza en seco",
    is_new: true,
    is_featured: true,
    sold_out_sizes: ["M", "L", "XL"],
    collections: ["roma"],
    created_at: "2026-02-14T00:00:00+00:00",
  },

  // ──────────────────────────────────────────────────
  // 9. Polo Domus  (recovered from PRD + homepage spotlight refs)
  //    Images only existed in MongoDB — URLs pending re-import.
  // ──────────────────────────────────────────────────
  {
    product_id: "polo-domus",
    slug: "polo-domus",
    name: "Polo Domus",
    description:
      "Polo Domus de algodón premium con bordado exclusivo. Estética de club privado europeo con acabado de lujo contemporáneo.",
    price: 25.0,
    currency: "EUR",
    images: [
      "/products/polo-domus/1.jpg",
      "/products/polo-domus/10.jpg",
      "/products/polo-domus/11.jpg",
      "/products/polo-domus/12.jpg",
      "/products/polo-domus/13.jpg",
      "/products/polo-domus/14.jpg",
      "/products/polo-domus/15.jpg",
      "/products/polo-domus/16.jpg",
      "/products/polo-domus/17.jpg",
      "/products/polo-domus/2.jpg",
      "/products/polo-domus/3.jpg",
      "/products/polo-domus/4.jpg",
      "/products/polo-domus/5.jpg",
      "/products/polo-domus/6.jpg",
      "/products/polo-domus/7.jpg",
      "/products/polo-domus/8.jpg",
      "/products/polo-domus/9.jpg",
    ],
    thumbnail_image: "/products/polo-domus/1.jpg",
    category: ["polos", "apparel"],
    gender: "hombre",
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Blanco", hex: "#FFFFFF" }],
    composition: "100% Algodón Piqué Premium",
    care: "Lavado a máquina 30°. No usar secadora.",
    is_new: true,
    is_featured: true,
    collections: ["roma"],
    created_at: "2026-02-22T00:00:00+00:00",
  },

  // ──────────────────────────────────────────────────
  // 10. Suéter Sylva  (recovered from PRD — 9 images + thumbnail noted)
  //     Images only existed in MongoDB — URLs pending re-import.
  // ──────────────────────────────────────────────────
  {
    product_id: "sueter-sylva",
    slug: "sueter-sylva",
    name: "Suéter Sylva",
    description:
      "Suéter Sylva de punto fino premium. Diseño elegante con acabado de lujo y estética de club privado europeo.",
    price: 40.0,
    currency: "EUR",
    images: [
      "/products/sueter-sylva/1.jpg",
      "/products/sueter-sylva/10.jpg",
      "/products/sueter-sylva/11.jpg",
      "/products/sueter-sylva/12.jpg",
      "/products/sueter-sylva/13.jpg",
      "/products/sueter-sylva/14.jpg",
      "/products/sueter-sylva/15.jpg",
      "/products/sueter-sylva/2.jpg",
      "/products/sueter-sylva/3.jpg",
      "/products/sueter-sylva/4.jpg",
      "/products/sueter-sylva/5.jpg",
      "/products/sueter-sylva/6.jpg",
      "/products/sueter-sylva/7.jpg",
      "/products/sueter-sylva/8.jpg",
      "/products/sueter-sylva/9.jpg",
    ],
    thumbnail_image: "/products/sueter-sylva/1.jpg",
    category: ["knitwear", "apparel"],
    gender: "hombre",
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Beige", hex: "#D2B48C" }],
    composition: "100% Lana Merino Premium",
    care: "Lavado a mano. Secar en plano.",
    is_new: true,
    is_featured: true,
    collections: ["roma"],
    created_at: "2026-02-24T00:00:00+00:00",
  },

  // ──────────────────────────────────────────────────
  // 11. Polo Patricius  (recovered from PRD — 7 images + thumbnail noted)
  //     Images only existed in MongoDB — URLs pending re-import.
  // ──────────────────────────────────────────────────
  {
    product_id: "polo-patricius",
    slug: "polo-patricius",
    name: "Polo Patricius",
    description:
      "Polo Patricius de algodón premium con bordado exclusivo. Inspiración clásica romana con estética de lujo contemporáneo.",
    price: 25.0,
    currency: "EUR",
    images: [
      "/products/polo-patricius/1.jpg",
      "/products/polo-patricius/10.jpg",
      "/products/polo-patricius/11.jpg",
      "/products/polo-patricius/12.jpg",
      "/products/polo-patricius/13.jpg",
      "/products/polo-patricius/14.jpg",
      "/products/polo-patricius/15.jpg",
      "/products/polo-patricius/2.jpg",
      "/products/polo-patricius/3.jpg",
      "/products/polo-patricius/4.jpg",
      "/products/polo-patricius/5.jpg",
      "/products/polo-patricius/6.jpg",
      "/products/polo-patricius/7.jpg",
      "/products/polo-patricius/8.jpg",
      "/products/polo-patricius/9.jpg",
    ],
    thumbnail_image: "/products/polo-patricius/1.jpg",
    category: ["polos", "apparel"],
    gender: "hombre",
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Blanco", hex: "#FFFFFF" }],
    composition: "100% Algodón Piqué Premium",
    care: "Lavado a máquina 30°. No usar secadora.",
    is_new: true,
    is_featured: true,
    collections: ["roma"],
    created_at: "2026-02-24T00:00:00+00:00",
  },

  // ──────────────────────────────────────────────────
  // 12. Polo Regius  (recovered from PRD — 10 images + thumbnail noted)
  //     Images only existed in MongoDB — URLs pending re-import.
  // ──────────────────────────────────────────────────
  {
    product_id: "polo-regius",
    slug: "polo-regius",
    name: "Polo Regius",
    description:
      "Polo Regius de algodón premium con bordado exclusivo. La máxima expresión de la elegancia deportiva mediterránea.",
    price: 30.0,
    currency: "EUR",
    images: [
      "/products/polo-regius/1.jpg",
      "/products/polo-regius/10.jpg",
      "/products/polo-regius/11.jpg",
      "/products/polo-regius/12.jpg",
      "/products/polo-regius/13.jpg",
      "/products/polo-regius/14.jpg",
      "/products/polo-regius/15.jpg",
      "/products/polo-regius/16.jpg",
      "/products/polo-regius/17.jpg",
      "/products/polo-regius/18.jpg",
      "/products/polo-regius/2.jpg",
      "/products/polo-regius/3.jpg",
      "/products/polo-regius/4.jpg",
      "/products/polo-regius/5.jpg",
      "/products/polo-regius/6.jpg",
      "/products/polo-regius/7.jpg",
      "/products/polo-regius/8.jpg",
      "/products/polo-regius/9.jpg",
    ],
    thumbnail_image: "/products/polo-regius/1.jpg",
    category: ["polos", "apparel"],
    gender: "hombre",
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Blanco", hex: "#FFFFFF" }],
    composition: "100% Algodón Piqué Premium",
    care: "Lavado a máquina 30°. No usar secadora.",
    is_new: true,
    is_featured: true,
    collections: ["roma"],
    created_at: "2026-02-24T00:00:00+00:00",
  },

  // ──────────────────────────────────────────────────
  // 13. Suéter Ignatius
  // ──────────────────────────────────────────────────
  {
    product_id: "sueter-ignatius",
    slug: "ignatius-sweater-thumb",
    name: "Suéter Ignatius",
    description: "Suéter Ignatius, echo a mano, pieza única",
    price: 390.0,
    currency: "EUR",
    images: [],
    thumbnail_image: "/thumbnails/ignatius-sweater-thumb.jpg",
    category: ["knitwear", "apparel"],
    gender: "hombre",
    sizes: ["S", "M"],
    colors: [{ name: "Beige", hex: "#D2B48C" }],
    composition: "materiales de la mejor calidad, cosido a mano",
    care: "",
    is_new: true,
    is_featured: true,
    collections: ["roma"],
    created_at: "2026-03-04T00:00:00+00:00",
  },
];

export default products;
