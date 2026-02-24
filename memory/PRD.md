# TAMBVRINI - PRD Ecommerce Lujo

## Problema
Ecommerce de moda de lujo para la marca TAMBVRINI con estética editorial europea y narrativa clásica romana. Experiencia completa en español.

## Arquitectura
- **Frontend**: React + TailwindCSS + Framer Motion
- **Backend**: FastAPI + MongoDB
- **Auth**: JWT + Emergent Google OAuth
- **Pagos**: Stripe Checkout (test mode) con dirección de envío obligatoria
- **Tipografías**: Cinzel (títulos), Playfair Display (editorial), Montserrat (cuerpo)
- **Paleta**: Blanco puro #FFFFFF (global), Marfil claro #F8F6F1 (Home), Obsidian #0A0A0A, Dorado #C5A059

## Estado actual (Feb 2026)
- [x] Rediseño completo a estética marfil/luxury editorial
- [x] Auth email/contraseña + Google OAuth
- [x] Wishlist (guest con localStorage + sync backend en login)
- [x] Carrito sincronizado con backend para usuarios autenticados
- [x] Stripe Checkout con login obligatorio
- [x] Homepage con grid de productos + tiles Novedades + sección cinemática
- [x] Hover-videos en tarjetas seleccionadas
- [x] Product page con lógica genérica de tallas agotadas (`sold_out_sizes`)
- [x] Backend listo para newsletter (endpoint + DB)
- [x] Contenidos en español

## Última actualización
- **24 Feb 2026**: nuevo producto “Polo Regius” añadido (galería 10 imágenes + miniatura) y ubicado a la derecha de Polo Patricius en Home.
- **24 Feb 2026**: nuevo producto “Suéter Sylva” añadido (galería 9 imágenes + miniatura).
- **24 Feb 2026**: nuevo producto “Polo Patricius” añadido (galería 7 imágenes + miniatura).
- **24 Feb 2026**: fila destacada Home ahora muestra Polo Domus + Suéter Sylva + Polo Patricius + Polo Regius.
- **22 Feb 2026**: imagen hero full-width añadida al inicio de la subcategoría Suéteres.
- **22 Feb 2026**: títulos “POLOS” y “SUÉTERES” movidos fuera de las imágenes (estilo Gucci minimal).
- **22 Feb 2026**: sección editorial Polos/Suéteres movida debajo de la imagen horizontal y encima de los últimos 4 artículos.
- **22 Feb 2026**: nueva sección editorial doble (Polos/Suéteres) bajo los 4 primeros productos en Home.
- **22 Feb 2026**: subcategoría “Suéteres” añadida en filtros de Tienda.
- **22 Feb 2026**: subcategoría “Polos” añadida en filtros de Tienda.
- **22 Feb 2026**: overlay editorial “Sport Club 2026” + CTA con transición suave en la imagen de campaña Home.
- **22 Feb 2026**: nueva subcategoría “2026” en Tienda con Sport Club, Polo Golf y Suéter Captain.
- **22 Feb 2026**: imagen hero superior en “Sobre TAMBVRINI” reemplazada.
- **22 Feb 2026**: navegación a Tienda Hombre/Mujer ahora inicia en la parte superior (scroll reset).
- **22 Feb 2026**: Novedades Hombre/Mujer y menú lateral enlazan a subcategorías Hombre/Mujer.
- **22 Feb 2026**: imagen Hombre reemplazada por versión final en la sección Tienda Hombre.
- **22 Feb 2026**: imagen full-width añadida en Tienda Hombre entre los primeros 4 y los últimos 2 artículos.
- **22 Feb 2026**: imagen “campaña 2” actualizada debajo de los últimos 4 artículos en Home.
- **22 Feb 2026**: tarifas de envío España (estándar 4,99€ / exprés 7,99€) + envío gratis > 75€.
- **22 Feb 2026**: Stripe Checkout exige dirección de envío y muestra tarifas de envío.
- **22 Feb 2026**: miniatura de “Americana UMBRA” actualizada.
- **22 Feb 2026**: miniatura de “Traje Monograma Tambvrini” actualizada.
- **22 Feb 2026**: miniatura de “Bolso Monograma Tambvrini” actualizada.
- **22 Feb 2026**: miniatura de “Camiseta Sport Club” actualizada.
- **22 Feb 2026**: miniatura de “Polo Golf” actualizada.
- **22 Feb 2026**: hover loop de “Polo Golf” actualizado.
- **22 Feb 2026**: hover loop de “Camiseta Sport Club” actualizado.
- **22 Feb 2026**: hover loop de “Bolso Monograma Tambvrini” actualizado.
- **22 Feb 2026**: imagen editorial bajo los primeros 4 artículos en Home actualizada (altura fija).
- **22 Feb 2026**: imagen editorial bajo los primeros 4 artículos ahora a tamaño real sin recorte.
- **22 Feb 2026**: galería de “Polo Domus” ampliada y reordenada (nuevas fotos y #2/#6/#7 al final).
- **22 Feb 2026**: miniatura de “Polo Aureus” actualizada.
- **22 Feb 2026**: miniatura de “Americana UMBRA” actualizada.
- **22 Feb 2026**: miniatura de “Traje Monograma Tambvrini” actualizada.
- **22 Feb 2026**: miniatura de “Bolso Monograma Tambvrini” actualizada.
- **22 Feb 2026**: miniatura de “Polo Golf” actualizada.
- **22 Feb 2026**: miniatura de “Camiseta Sport Club” actualizada.
- **22 Feb 2026**: hover video de “Suéter Captain” actualizado.
- **22 Feb 2026**: hover video de “Americana UMBRA” actualizado.
- **22 Feb 2026**: hover video de “Americana UMBRA” actualizado (v2).
- **22 Feb 2026**: hover video de “Camiseta Imperium” actualizado.
- **22 Feb 2026**: hover video de “Camiseta Imperium” actualizado (v2).
- **22 Feb 2026**: hover video de “Polo Aureus” actualizado.
- **22 Feb 2026**: eliminado overlay de opacidad/color en hovers con video.
- **22 Feb 2026**: imagen editorial full-width insertada entre los drops en Home.
- **22 Feb 2026**: sincronización de carrito con backend verificada para usuarios autenticados.
- **22 Feb 2026**: Stripe Checkout con login obligatorio implementado.
- **22 Feb 2026**: título del navegador ajustado a “TAMBVRINI”.
- **22 Feb 2026**: imagen campaign full-width añadida entre drops y novedades.
- **22 Feb 2026**: sección editorial hero con CTA “Descubrir” añadida en Home.
- **22 Feb 2026**: CTA “Descubrir” redirige a /tienda?category=novedades (H/M/Accesorios).
- **22 Feb 2026**: imagen campaign previa reubicada debajo del nuevo hero editorial.
- **22 Feb 2026**: orden invertido (campaign arriba, hero abajo) y márgenes reducidos entre imágenes.
- **22 Feb 2026**: video “WEB 1” movido a Marca entre Artesanía y Valores; tarjetas añadidas debajo.
- **22 Feb 2026**: margen entre tarjetas y “Nuestros valores” reducido.
- **22 Feb 2026**: color base global del fondo actualizado a #FFFFFF.
- **22 Feb 2026**: verificación de tono base global #FFFFFF (blanco puro neutro).
- **22 Feb 2026**: fondos, tarjetas y overlays neutralizados a blanco puro + sombras frías rgba(0,0,0,0.04).
- **22 Feb 2026**: miniatura de “Suéter Captain” actualizada.
- **22 Feb 2026**: miniatura de “Suéter Captain” actualizada (v2).
- **22 Feb 2026**: miniatura de “Polo Aureus” actualizada.

## Backlog
### P0
- Conectar newsletter al endpoint

### P1
- Expandir i18n al resto del sitio

### P2
- Refactor de hover-videos (data-driven en lugar de hardcoded)
- Mejoras en catálogo (reemplazar mocks con fotos reales)

### P3
- Reviews/ratings y guía de tallas
- Páginas de colección editoriales
- Integración email marketing profesional
