You are a senior full-stack engineer and product architect.

Your task is to build a FULLY LOCAL desktop POS system for a grocery store (single computer, single cashier setup).

This is NOT a demo project — build it as a real production-ready MVP that can be used in an actual store.

====================
TECH STACK (MANDATORY)
====================
- Electron (desktop app)
- React (frontend UI)
- SQLite (local database)
- Node.js (backend logic)

====================
CORE REQUIREMENTS
====================
- Fully offline (no internet required)
- Fast and responsive (optimized for cashier speed)
- Clean, modern UI (similar to real POS systems)
- Keyboard-friendly workflow
- Minimal clicks

====================
HARDWARE SUPPORT
====================
1. Barcode scanner:
- Works as keyboard input
- When barcode is scanned, product must instantly be found and added to cart

2. Receipt printer:
- Implement basic receipt printing (even simple template is fine)

====================
FEATURES
====================

1. POS (Cashier Screen)
- Scan barcode to add product
- Search products manually
- Add/remove items
- Change quantity
- Apply discounts
- Show total
- Accept cash payment
- Calculate change
- Complete sale

2. INVENTORY MANAGEMENT
- Add/edit/delete products
- Fields: name, category, price, cost, barcode, stock
- Auto decrease stock after sale
- Low stock warning

3. PURCHASE MANAGEMENT
- Add supplier purchases
- Increase stock

4. RETURNS
- Ability to return items
- Restore stock

5. REPORTS
- Daily sales
- Revenue
- Profit (based on cost)
- Top-selling products

6. USER ROLES
- Admin (full access)
- Cashier (limited access)

7. SETTINGS
- Store name
- Currency
- Basic config

====================
DATABASE
====================
Design proper SQLite schema with tables:
- products
- categories
- sales
- sale_items
- purchases
- users

====================
UI/UX
====================
- Large buttons for cashier
- Clean dashboard
- Fast navigation
- Modern POS style (dark/light theme optional)

====================
GITHUB INTEGRATION
====================
- Find and reuse relevant open-source POS or inventory projects from GitHub
- Adapt and improve them instead of building everything from scratch
- Clearly explain which repositories are used and why

====================
DELIVERABLES
====================
1. Architecture overview
2. Folder structure
3. Database schema
4. Step-by-step implementation
5. Full working code (modular)
6. Instructions to run locally
7. Instructions to build .exe / .app
8. Suggestions for future improvements

====================
IMPORTANT
====================
- Do not over-engineer
- Focus on working MVP first
- Code must be clean and extendable
- Make it realistic for business usage