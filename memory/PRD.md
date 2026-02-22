# TAMBVRINI - PRD Ecommerce Lujo

## Problema
Ecommerce de moda de lujo para la marca TAMBVRINI con estética editorial europea y narrativa clásica romana. Experiencia completa en español.

## Arquitectura
- **Frontend**: React + TailwindCSS + Framer Motion
- **Backend**: FastAPI + MongoDB
- **Auth**: JWT + Emergent Google OAuth
- **Pagos**: Stripe (pendiente de integrar, test mode)
- **Tipografías**: Cinzel (títulos), Playfair Display (editorial), Montserrat (cuerpo)
- **Paleta**: Marfil #F5F2EA (global), Marfil claro #F8F6F1 (Home), Obsidian #0A0A0A, Dorado #C5A059

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
- **22 Feb 2026**: miniatura de “Americana UMBRA” actualizada.
- **22 Feb 2026**: miniatura de “Polo Aureus” actualizada.
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
