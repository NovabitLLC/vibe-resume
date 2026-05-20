import type { ResumeData } from "./resumeSchema";
import type { WebsiteConfig } from "./types";

/**
 * Sample data used as a fallback in the preview when no parsed resume
 * exists in localStorage. Matches the canonical ResumeData shape exactly.
 */

export const MOCK_RESUME: ResumeData = {
  name: "Avery Chen",
  title: "Senior Product Engineer",
  location: "San Francisco, CA",
  email: "avery@example.com",
  phone: "+1 (415) 555-0182",
  linkedin: "https://linkedin.com/in/averychen",
  github: "https://github.com/averychen",
  portfolio: "https://averychen.dev",
  summary:
    "Product engineer focused on the seams between design and infrastructure. I've shipped checkout, onboarding, and developer-platform work for companies between Series A and IPO, and I care most about turning quiet complexity into obvious products.",
  skills: {
    languages: ["TypeScript", "Python", "Swift", "Go"],
    frameworks: ["React", "Next.js", "Tailwind", "Framer Motion"],
    tools: ["Figma", "Linear", "Vercel", "Cloudflare"],
    other: ["Design systems", "Mentoring"],
  },
  experience: [
    {
      company: "Lumen Labs",
      role: "Senior Product Engineer",
      location: "Remote",
      startDate: "Feb 2023",
      endDate: "Present",
      bullets: [
        "Founding product engineer on the developer-platform team — owned billing, SDK ergonomics, and the public dashboard.",
        "Rewrote the onboarding funnel; activation up 34% over a quarter.",
        "Designed and shipped the usage-based billing engine end-to-end.",
        "Built an internal feature-flag system now used by ~40 engineers.",
      ],
    },
    {
      company: "Northwind",
      role: "Product Engineer",
      location: "San Francisco, CA",
      startDate: "Aug 2020",
      endDate: "Jan 2023",
      bullets: [
        "Worked across web and mobile on the consumer marketplace.",
        "Led the redesign of search and discovery for the iOS app.",
        "Cut p95 page-load on the listing page from 3.1s to 1.4s.",
        "Mentored two new grads through their first six months.",
      ],
    },
    {
      company: "Foundry Studio",
      role: "Software Engineer",
      location: "Brooklyn, NY",
      startDate: "Jun 2018",
      endDate: "Jul 2020",
      bullets: [
        "Boutique agency — shipped product for early-stage clients in fintech and consumer.",
        "Took three pre-launch products from prototype to first paying customers.",
        "Set up the firm's first design-system + component library.",
      ],
    },
  ],
  projects: [
    {
      name: "Quiet Garden",
      description: "A small daily-journaling app for people who don't like journaling apps.",
      techStack: ["SwiftUI", "CloudKit", "Supabase"],
      bullets: [
        "~12k MAUs, fully bootstrapped.",
        "Featured by Apple under Mindful Mondays.",
      ],
      link: "https://quietgarden.app",
    },
    {
      name: "Forecast Kit",
      description: "TypeScript library for revenue forecasting with prediction intervals.",
      techStack: ["TypeScript", "D3", "Vitest"],
      bullets: ["1.4k stars on GitHub.", "Used in two YC company internal tools."],
      link: "https://github.com/averychen/forecast-kit",
    },
  ],
  education: [
    {
      school: "Carnegie Mellon University",
      degree: "B.S. Information Systems",
      location: "Pittsburgh, PA",
      startDate: "2014",
      endDate: "2018",
      details: ["Minor in Human-Computer Interaction", "Dean's List, 2016 & 2017"],
    },
  ],
  certifications: [],
  awards: ["Internal Craft Award — Lumen Labs, 2024"],
  publications: [],
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
    { id: "experience", title: "Experience", enabled: true },
    { id: "projects", title: "Projects", enabled: true },
    { id: "skills", title: "Skills", enabled: true },
    { id: "education", title: "Education", enabled: true },
    { id: "awards", title: "Recognition", enabled: true },
    { id: "certifications", title: "Certifications", enabled: true },
    { id: "publications", title: "Publications", enabled: true },
    { id: "contact", title: "Contact", enabled: true },
  ],
  tagline: "I turn quiet complexity into obvious products.",
};
