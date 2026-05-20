import type { ResumeData, WebsiteConfig } from "./types";

/**
 * Sample data used in Phase 1 to drive the mock preview page.
 * Replaced in later phases by AI-generated output.
 */

export const MOCK_RESUME: ResumeData = {
  basics: {
    name: "Avery Chen",
    headline: "Senior Product Engineer",
    email: "avery@example.com",
    phone: "+1 (415) 555-0182",
    location: "San Francisco, CA",
    website: "https://averychen.dev",
    summary:
      "Product engineer focused on the seams between design and infrastructure. I've shipped checkout, onboarding, and developer-platform work for companies between Series A and IPO, and I care most about turning quiet complexity into obvious products.",
    socials: [
      { label: "GitHub", url: "https://github.com/averychen", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/averychen", icon: "linkedin" },
      { label: "X", url: "https://x.com/averychen", icon: "twitter" },
    ],
  },
  work: [
    {
      company: "Lumen Labs",
      role: "Senior Product Engineer",
      startDate: "2023-02",
      endDate: "Present",
      location: "Remote",
      summary:
        "Founding product engineer on the developer-platform team. Owned billing, SDK ergonomics, and the public dashboard.",
      highlights: [
        "Rewrote the onboarding funnel — activation up 34% over a quarter",
        "Designed and shipped the usage-based billing engine end-to-end",
        "Built an internal feature-flag system now used by ~40 engineers",
      ],
    },
    {
      company: "Northwind",
      role: "Product Engineer",
      startDate: "2020-08",
      endDate: "2023-01",
      location: "San Francisco, CA",
      summary: "Worked across web and mobile on the consumer marketplace.",
      highlights: [
        "Led the redesign of search and discovery for the iOS app",
        "Cut p95 page-load on the listing page from 3.1s to 1.4s",
        "Mentored two new grads through their first six months",
      ],
    },
    {
      company: "Foundry Studio",
      role: "Software Engineer",
      startDate: "2018-06",
      endDate: "2020-07",
      location: "Brooklyn, NY",
      summary: "Boutique agency. Shipped product for early-stage clients in fintech and consumer.",
      highlights: [
        "Took three pre-launch products from prototype to first paying customers",
        "Set up the firm's first design-system + component library",
      ],
    },
  ],
  education: [
    {
      institution: "Carnegie Mellon University",
      degree: "B.S.",
      field: "Information Systems",
      startDate: "2014",
      endDate: "2018",
      location: "Pittsburgh, PA",
      highlights: ["Minor in Human-Computer Interaction", "Dean's List, 2016 & 2017"],
    },
  ],
  projects: [
    {
      name: "Quiet Garden",
      role: "Creator",
      url: "https://quietgarden.app",
      summary: "A small daily-journaling app for people who don't like journaling apps.",
      technologies: ["SwiftUI", "CloudKit", "Supabase"],
      highlights: ["~12k MAUs, fully bootstrapped", "Featured by Apple under Mindful Mondays"],
    },
    {
      name: "Forecast Kit",
      role: "Open-source maintainer",
      url: "https://github.com/averychen/forecast-kit",
      summary: "A small TypeScript library for revenue forecasting with prediction intervals.",
      technologies: ["TypeScript", "D3", "Vitest"],
      highlights: ["1.4k stars, used in two YC company internal tools"],
    },
  ],
  skills: [
    { category: "Languages", items: ["TypeScript", "Python", "Swift", "Go"] },
    { category: "Frontend", items: ["React", "Next.js", "Tailwind", "Framer Motion"] },
    { category: "Backend", items: ["Node", "Postgres", "Redis", "Temporal"] },
    { category: "Tools", items: ["Figma", "Linear", "Vercel", "Cloudflare"] },
  ],
  awards: [
    {
      title: "Internal Craft Award",
      issuer: "Lumen Labs",
      date: "2024",
      summary: "For the onboarding rewrite and the activation lift it produced.",
    },
  ],
};

export const MOCK_WEBSITE_CONFIG: WebsiteConfig = {
  templateId: "split",
  style: "modern",
  direction: "software-engineer",
  theme: {
    primary: "#4f46e5",
    background: "#ffffff",
    foreground: "#0f172a",
    accent: "#ec4899",
    muted: "#f1f5f9",
    fontHeading: "sans",
    fontBody: "sans",
    radius: "soft",
  },
  sections: [
    { id: "hero", title: "Hello", enabled: true },
    { id: "about", title: "About", enabled: true },
    { id: "work", title: "Experience", enabled: true },
    { id: "projects", title: "Projects", enabled: true },
    { id: "skills", title: "Skills", enabled: true },
    { id: "education", title: "Education", enabled: true },
    { id: "awards", title: "Recognition", enabled: true },
    { id: "contact", title: "Contact", enabled: true },
  ],
  tagline: "I turn quiet complexity into obvious products.",
};
