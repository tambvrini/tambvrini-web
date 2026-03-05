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
    price: 200.0,
    currency: "EUR",
    images: [
      "/products/traje-monograma-tambvrini/01.jpeg",
      "/products/traje-monograma-tambvrini/02.png",
      "/products/traje-monograma-tambvrini/03.jpeg",
      "/products/traje-monograma-tambvrini/04.jpeg",
      "/products/traje-monograma-tambvrini/05.png",
      `${ASSET}/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/13w6alad_hf_20260208_221349_74b1b08f-1ec5-41f5-bf8f-915f5855630a.jpeg`,
      `${ASSET}/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/m52og20p_hf_20260208_234900_3f14961d-1c72-4047-86f4-58b0ebda6f0c%20%282%29.png`,
    ],
    thumbnail_image: `${ASSET}/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/m52og20p_hf_20260208_234900_3f14961d-1c72-4047-86f4-58b0ebda6f0c%20%282%29.png`,
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
    price: 260.0,
    currency: "EUR",
    images: [
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/u6zqjmsq_3.png`,
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/y7v5nwm1_2.png`,
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/q6ej9bx3_hf_20260209_005423_81aed519-78ff-4ad0-a98c-31ded5afb2f1.png`,
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/xyu4i868_1.jpeg`,
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/qt1e9qlx_hf_20260210_013900_45cb2e8a-fe02-498b-826c-fa5c03b904e1.png`,
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/gfxx8pdm_4.png`,
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/ahyaof7a_5.png`,
    ],
    thumbnail_image: `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/xyu4i868_1.jpeg`,
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
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/79qq3jhd_hf_20260212_010716_e54abf26-8fbd-407b-a1a1-d841e2e3946d.png`,
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/4qb570r6_hf_20260212_010024_44d8a05a-42ab-47b3-8108-336617ff9a07.jpeg`,
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/fj5208jf_hf_20260212_010238_58178657-ba5a-4aea-a92b-7d3895ba334b.png`,
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/6nqsv06s_hf_20260212_005309_5351456d-b40e-4e56-a6ba-4aefda582ec8.png`,
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/kuf48n49_hf_20260212_005319_45c4a329-ec62-4e20-848f-4fe0d03812b2.jpeg`,
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/fhe2l2xc_hf_20260212_010115_9a4c25de-deef-4847-892e-b4dc16d78ba0.png`,
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/qjdgn1uj_hf_20260212_001854_d4114cf5-7dca-411a-a8b3-046e68c293e6.png`,
      `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/7bb8vczl_hf_20260212_000927_165fb028-8aab-48b4-80af-974531a1f414.jpeg`,
    ],
    thumbnail_image: `${ASSET}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/79qq3jhd_hf_20260212_010716_e54abf26-8fbd-407b-a1a1-d841e2e3946d.png`,
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
      "/products/polo-golf/polo-golf-look-01.jpg",
      "/products/polo-golf/polo-golf-look-02.jpg",
      "/products/polo-golf/polo-golf-look-03.jpg",
      "/products/polo-golf/polo-golf-look-04.jpg",
      "/products/polo-golf/polo-golf-look-05.jpg",
    ],
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
    images: [],
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
    images: [],
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
      "/products/camiseta-imperium/camiseta-imperium-look-01.jpg",
      "/products/camiseta-imperium/camiseta-imperium-look-02.jpg",
      "/products/camiseta-imperium/camiseta-imperium-look-03.jpg",
      "/products/camiseta-imperium/camiseta-imperium-look-04.jpg",
      "/products/camiseta-imperium/camiseta-imperium-look-05.jpg",
      "/products/camiseta-imperium/camiseta-imperium-look-06.jpg",
      "/products/camiseta-imperium/camiseta-imperium-look-07.jpg",
      "/products/camiseta-imperium/camiseta-imperium-look-08.jpg",
      "/products/camiseta-imperium/camiseta-imperium-look-09.jpg",
    ],
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
    images: [],
    model_url: "/models/umbra.glb",
    model_poster: "/thumbnails/americana-umbra.jpg",
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
    images: [],
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
    images: [],
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
    images: [],
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
    images: [],
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
    description:
      "El Suéter Ignatius reinterpreta el knitwear clásico con un carácter deliberadamente imperfecto. Confeccionado en algodón de tacto suave, presenta un acabado desgastado artesanal que revela capas interiores en contraste rojo, creando una estética cruda y contemporánea.\n\nCada pieza expresa una elegancia desestructurada, donde el desgaste controlado y los cortes irregulares evocan la tradición del trabajo manual y la individualidad de la prenda. Un equilibrio entre sofisticación clásica y rebeldía moderna.",
    price: 300.0,
    currency: "EUR",
    images: [],
    model_url: "/models/ignatius.glb",
    thumbnail_image: "/thumbnails/ignatius-sweater-thumb.jpg",
    category: ["knitwear", "apparel"],
    gender: "hombre",
    sizes: ["S", "M"],
    colors: [{ name: "Magma", hex: "#0A0A0A" }],
    composition:
      "100% algodón de alta calidad.\n\nTejido de gramaje medio con acabado suavizado para mayor confort. Detalles desgastados realizados manualmente que hacen que cada pieza sea única.",
    care: "Lavado a mano. Secar en plano.",
    is_new: true,
    is_featured: true,
    collections: ["roma"],
    created_at: "2026-03-04T00:00:00+00:00",
  },
];

export default products;
