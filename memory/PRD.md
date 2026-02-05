# TAMBVRINI - Luxury Fashion Ecommerce PRD

## Problem Statement
High-end luxury fashion ecommerce for TAMBVRINI brand. European luxury house aesthetic (Gucci/Casablanca/Loro Piana) with Roman classical identity and elite tennis club aesthetic. Full functional ecommerce in Spanish.

## Architecture
- **Frontend**: React + Tailwind + Shadcn UI + Framer Motion
- **Backend**: FastAPI + MongoDB
- **Auth**: JWT + Emergent Google OAuth
- **Payments**: Stripe (test mode)
- **Fonts**: Cinzel (headings), Playfair Display (editorial), Montserrat (body)
- **Colors**: Obsidian #0A0A0A, Marble #F5F5F0, Gold #C5A059, Emerald #1B4D3E

## User Personas
- High-net-worth luxury fashion consumers (25-55)
- Mediterranean/European aesthetic lovers
- Tennis/Riviera lifestyle enthusiasts

## What's Implemented (Feb 2026)
- [x] Fullscreen hero with TAMBVRINI/HISPANIA logo animation on scroll
- [x] Transparent→solid header with search, menu, account, wishlist, cart
- [x] Full navigation menu (Tienda, Colecciones, Marca, Atención al Cliente)
- [x] Product catalog with 16 luxury products, filters, sorting
- [x] Product detail pages with gallery, sizes, colors, composition, shipping
- [x] Shopping cart (drawer + full page) with quantity management
- [x] Stripe checkout (test mode) with order tracking
- [x] User auth: email/password registration + Google OAuth
- [x] Wishlist with localStorage persistence
- [x] Newsletter subscription (DB storage)
- [x] Homepage sections: Campaign, Categories, Featured, Story, Tennis Club, Newsletter
- [x] Brand/About page with philosophy, craftsmanship, values
- [x] Luxury footer with all links
- [x] All content in Spanish
- [x] Custom SVG logos (provided by client)

## Backlog
### P0 (Next)
- Replace mock product images with real TAMBVRINI product photography
- Add order history to user account page
- Implement multi-language support (EN, FR, IT)

### P1
- Add product reviews/ratings
- Size guide interactive overlay
- Product zoom lightbox on click
- Collection landing pages with editorial content
- Email integration for newsletter (SendGrid/Resend)

### P2
- Inventory management system
- Admin dashboard for products/orders
- Customer address book
- Gift wrapping option
- Loyalty program
