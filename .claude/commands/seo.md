# SEO Optimization

Perform a full SEO audit and optimization pass on this site. Work through every item below — research, implement, and verify each one.

## 1. Meta & Document Head
- Set a unique, keyword-rich `<title>` tag (50–60 chars): include primary keyword + brand name
- Write a compelling `<meta name="description">` (150–160 chars) that includes the primary keyword and a CTA
- Add `<meta name="keywords">` with 8–12 relevant terms
- Ensure `<html lang="en">` is set
- Add canonical `<link rel="canonical" href="...">` pointing to the production URL
- Add `<meta name="robots" content="index, follow">`

## 2. Open Graph & Twitter Cards
- `og:title`, `og:description`, `og:image` (1200×630px), `og:url`, `og:type`, `og:site_name`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Verify OG image exists in `/public` or is a fully-qualified URL

## 3. Structured Data (JSON-LD)
Add a `<script type="application/ld+json">` block in `<head>` with:
- `@type: "BreweryOrRestaurant"` (or `LocalBusiness`) schema
- name, description, url, logo, image, telephone, address (streetAddress, city, state, postalCode, country)
- openingHoursSpecification for each day/time
- servesCuisine, menu, priceRange
- sameAs array linking to all social profiles (Instagram, Facebook, Untappd, etc.)

## 4. Heading Hierarchy
- Exactly one `<h1>` per page containing the primary keyword
- Logical `h2` → `h3` structure (no skipped levels)
- Section headings should include secondary keywords naturally

## 5. Image Alt Text
- Every `<img>` must have a descriptive `alt` attribute
- Format: `[what's in image] - [brand name]` for key images
- Decorative images: `alt=""`

## 6. Performance (Core Web Vitals)
- Audit all images: convert any `.png`/`.jpg` to `.webp` where not already done
- Add `loading="lazy"` to all below-the-fold images
- Add `width` and `height` attributes to images to prevent layout shift (CLS)
- Check for render-blocking resources

## 7. Semantic HTML
- Wrap main content in `<main>`
- Use `<header>`, `<nav>`, `<section>`, `<article>`, `<footer>` appropriately
- Nav links should be in a `<nav>` with `aria-label="Main navigation"`

## 8. Local SEO
- Embed a Google Maps iframe or link for the physical address
- Ensure NAP (Name, Address, Phone) is consistent and visible in plain text in the footer
- Add `<address>` tag wrapping the footer NAP block

## 9. sitemap.xml & robots.txt
- Generate or update `/public/sitemap.xml` with all page URLs and `<lastmod>` dates
- Ensure `/public/robots.txt` allows crawling and references the sitemap URL

## 10. Verify & Report
After all changes, output a checklist summary:
```
✅ Title tag
✅ Meta description
✅ OG tags
✅ JSON-LD structured data
✅ H1 present
✅ Alt text complete
✅ Images lazy-loaded
✅ sitemap.xml
✅ robots.txt
```
Flag anything that couldn't be completed with a ⚠️ and explain why.
