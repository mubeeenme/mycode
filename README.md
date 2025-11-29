# Product Catalog E-commerce Application

A modern, full-featured e-commerce catalog application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- **Home Page**: Hero section with featured products and search
- **Product Catalog**: Responsive grid with filtering and search
- **Product Details**: Image gallery with lightbox, specifications, and reviews
- **Search**: Full-text server-side search functionality
- **Filters**: Price range and brand filtering
- **Reviews**: Display and submission with star ratings

### Content Pages
- About Us
- Contact
- Store Locations
- Terms & Conditions
- Privacy Policy
- Returns Policy

### Technical Features
- **i18n**: Full bilingual support (English/Chinese)
- **SEO**: Metadata, structured data (JSON-LD), and breadcrumbs
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
- **Responsive**: Mobile-first design with Tailwind CSS
- **Performance**: Image optimization with Next.js Image component

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   │   ├── page.tsx       # Home page
│   │   ├── products/      # Product pages
│   │   ├── about/         # Static content pages
│   │   └── ...
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── content/               # Static content (JSON)
├── lib/                   # Utilities and API functions
│   ├── api.ts            # API/data fetching
│   ├── mock-data.ts      # Mock product data
│   └── utils.ts          # Helper functions
├── messages/              # i18n translations
│   ├── en.json           # English translations
│   └── zh.json           # Chinese translations
├── types/                 # TypeScript type definitions
└── public/                # Static assets

## Key Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **next-intl**: Internationalization
- **React Hook Form**: Form handling
- **Sharp**: Image optimization

## Features Implementation

### Internationalization (i18n)
- Two locales: English (en) and Chinese (zh)
- URL-based locale detection: `/en/...` and `/zh/...`
- Automatic language switching
- Localized content for all pages

### SEO Optimization
- Dynamic metadata generation
- Open Graph tags
- Structured data (JSON-LD) for products and breadcrumbs
- Semantic HTML
- Optimized images

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Proper heading hierarchy

### Responsive Design
- Mobile-first approach
- Breakpoints: mobile, tablet, desktop
- Touch-friendly interactions
- Responsive images

## Data Management

Currently using mock data in `lib/mock-data.ts`. To integrate with a real backend:

1. Replace mock functions in `lib/api.ts` with actual API calls
2. Set up Supabase or your preferred database
3. Update environment variables
4. Implement authentication if needed

## Environment Variables

Create a `.env.local` file (optional for future backend integration):

```env
NEXT_PUBLIC_API_URL=your-api-url
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
