"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

import type { ResumeData } from "@/lib/resumeSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  addItem,
  parseCsv,
  parseLines,
  removeAt,
  toCsv,
  toLines,
  updateAt,
} from "./editorUtils";

interface ContentEditorProps {
  resume: ResumeData;
  onChange: (resume: ResumeData) => void;
}

export function ContentEditor({ resume, onChange }: ContentEditorProps) {
  function patch<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    onChange({ ...resume, [key]: value });
  }

  return (
    <div className="space-y-3">
      <Disclosure title="Basics" defaultOpen>
        <Basics resume={resume} onChange={onChange} />
      </Disclosure>

      <Disclosure title="Skills">
        <Skills resume={resume} onChange={onChange} />
      </Disclosure>

      <Disclosure
        title="Experience"
        rightSlot={<Badge variant="muted">{resume.experience.length}</Badge>}
      >
        <Experience
          items={resume.experience}
          onChange={(next) => patch("experience", next)}
        />
      </Disclosure>

      <Disclosure
        title="Projects"
        rightSlot={<Badge variant="muted">{resume.projects.length}</Badge>}
      >
        <Projects items={resume.projects} onChange={(next) => patch("projects", next)} />
      </Disclosure>

      <Disclosure
        title="Education"
        rightSlot={<Badge variant="muted">{resume.education.length}</Badge>}
      >
        <Education
          items={resume.education}
          onChange={(next) => patch("education", next)}
        />
      </Disclosure>

      <Disclosure
        title="Certifications · Awards · Publications"
        rightSlot={
          <Badge variant="muted">
            {resume.certifications.length + resume.awards.length + resume.publications.length}
          </Badge>
        }
      >
        <div className="space-y-4">
          <ListSection
            label="Certifications"
            items={resume.certifications}
            onChange={(next) => patch("certifications", next)}
          />
          <ListSection
            label="Awards"
            items={resume.awards}
            onChange={(next) => patch("awards", next)}
          />
          <ListSection
            label="Publications"
            items={resume.publications}
            onChange={(next) => patch("publications", next)}
          />
        </div>
      </Disclosure>
    </div>
  );
}

// ---------- Sub-sections ----------

function Basics({ resume, onChange }: ContentEditorProps) {
  function set<K extends keyof ResumeData>(key: K, value: string) {
    onChange({ ...resume, [key]: value as ResumeData[K] });
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Name">
        <Input value={resume.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="Title">
        <Input value={resume.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Location" className="sm:col-span-2">
        <Input value={resume.location} onChange={(e) => set("location", e.target.value)} />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          value={resume.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </Field>
      <Field label="Phone">
        <Input value={resume.phone} onChange={(e) => set("phone", e.target.value)} />
      </Field>
      <Field label="LinkedIn">
        <Input
          value={resume.linkedin}
          placeholder="https://linkedin.com/in/..."
          onChange={(e) => set("linkedin", e.target.value)}
        />
      </Field>
      <Field label="GitHub">
        <Input
          value={resume.github}
          placeholder="https://github.com/..."
          onChange={(e) => set("github", e.target.value)}
        />
      </Field>
      <Field label="Portfolio" className="sm:col-span-2">
        <Input
          value={resume.portfolio}
          placeholder="https://..."
          onChange={(e) => set("portfolio", e.target.value)}
        />
      </Field>
      <Field label="Summary" className="sm:col-span-2">
        <Textarea
          rows={4}
          value={resume.summary}
          onChange={(e) => set("summary", e.target.value)}
          placeholder="1–3 sentence professional summary."
        />
      </Field>
    </div>
  );
}

function Skills({ resume, onChange }: ContentEditorProps) {
  function setGroup(key: keyof ResumeData["skills"], csv: string) {
    onChange({
      ...resume,
      skills: { ...resume.skills, [key]: parseCsv(csv) },
    });
  }
  return (
    <div className="space-y-3">
      <SkillRow
        label="Languages"
        value={resume.skills.languages}
        onChange={(csv) => setGroup("languages", csv)}
        placeholder="TypeScript, Python, Go"
      />
      <SkillRow
        label="Frameworks"
        value={resume.skills.frameworks}
        onChange={(csv) => setGroup("frameworks", csv)}
        placeholder="React, Next.js, Tailwind"
      />
      <SkillRow
        label="Tools"
        value={resume.skills.tools}
        onChange={(csv) => setGroup("tools", csv)}
        placeholder="Figma, Vercel, Linear"
      />
      <SkillRow
        label="Other"
        value={resume.skills.other}
        onChange={(csv) => setGroup("other", csv)}
        placeholder="Design systems, mentoring"
      />
      <p className="text-xs text-muted-foreground">Separate items with commas.</p>
    </div>
  );
}

function SkillRow({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (csv: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <Input
        value={toCsv(value)}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

function Experience({
  items,
  onChange,
}: {
  items: ResumeData["experience"];
  onChange: (next: ResumeData["experience"]) => void;
}) {
  function patch(index: number, key: keyof ResumeData["experience"][number], value: unknown) {
    onChange(updateAt(items, index, (it) => ({ ...it, [key]: value })));
  }
  function remove(index: number) {
    onChange(removeAt(items, index));
  }
  function add() {
    onChange(
      addItem(items, {
        company: "",
        role: "",
        location: "",
        startDate: "",
        endDate: "",
        bullets: [],
      })
    );
  }
  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyHint label="experience" />}
      {items.map((it, i) => (
        <ItemCard key={i} title={it.role || it.company || `Experience ${i + 1}`} onRemove={() => remove(i)}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field label="Company">
              <Input value={it.company} onChange={(e) => patch(i, "company", e.target.value)} />
            </Field>
            <Field label="Role">
              <Input value={it.role} onChange={(e) => patch(i, "role", e.target.value)} />
            </Field>
            <Field label="Location" className="sm:col-span-2">
              <Input value={it.location} onChange={(e) => patch(i, "location", e.target.value)} />
            </Field>
            <Field label="Start date">
              <Input
                value={it.startDate}
                placeholder="Feb 2023"
                onChange={(e) => patch(i, "startDate", e.target.value)}
              />
            </Field>
            <Field label="End date">
              <Input
                value={it.endDate}
                placeholder="Present"
                onChange={(e) => patch(i, "endDate", e.target.value)}
              />
            </Field>
            <Field label="Bullets" className="sm:col-span-2" hint="One per line.">
              <Textarea
                rows={4}
                value={toLines(it.bullets)}
                onChange={(e) => patch(i, "bullets", parseLines(e.target.value))}
              />
            </Field>
          </div>
        </ItemCard>
      ))}
      <AddButton label="Add experience" onClick={add} />
    </div>
  );
}

function Projects({
  items,
  onChange,
}: {
  items: ResumeData["projects"];
  onChange: (next: ResumeData["projects"]) => void;
}) {
  function patch(index: number, key: keyof ResumeData["projects"][number], value: unknown) {
    onChange(updateAt(items, index, (it) => ({ ...it, [key]: value })));
  }
  function remove(index: number) {
    onChange(removeAt(items, index));
  }
  function add() {
    onChange(
      addItem(items, {
        name: "",
        description: "",
        techStack: [],
        bullets: [],
        link: "",
      })
    );
  }
  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyHint label="projects" />}
      {items.map((it, i) => (
        <ItemCard key={i} title={it.name || `Project ${i + 1}`} onRemove={() => remove(i)}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field label="Name">
              <Input value={it.name} onChange={(e) => patch(i, "name", e.target.value)} />
            </Field>
            <Field label="Link">
              <Input
                value={it.link}
                placeholder="https://..."
                onChange={(e) => patch(i, "link", e.target.value)}
              />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea
                rows={2}
                value={it.description}
                onChange={(e) => patch(i, "description", e.target.value)}
              />
            </Field>
            <Field
              label="Tech stack"
              className="sm:col-span-2"
              hint="Comma-separated."
            >
              <Input
                value={toCsv(it.techStack)}
                onChange={(e) => patch(i, "techStack", parseCsv(e.target.value))}
              />
            </Field>
            <Field label="Bullets" className="sm:col-span-2" hint="One per line.">
              <Textarea
                rows={3}
                value={toLines(it.bullets)}
                onChange={(e) => patch(i, "bullets", parseLines(e.target.value))}
              />
            </Field>
          </div>
        </ItemCard>
      ))}
      <AddButton label="Add project" onClick={add} />
    </div>
  );
}

function Education({
  items,
  onChange,
}: {
  items: ResumeData["education"];
  onChange: (next: ResumeData["education"]) => void;
}) {
  function patch(index: number, key: keyof ResumeData["education"][number], value: unknown) {
    onChange(updateAt(items, index, (it) => ({ ...it, [key]: value })));
  }
  function remove(index: number) {
    onChange(removeAt(items, index));
  }
  function add() {
    onChange(
      addItem(items, {
        school: "",
        degree: "",
        location: "",
        startDate: "",
        endDate: "",
        details: [],
      })
    );
  }
  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyHint label="education" />}
      {items.map((it, i) => (
        <ItemCard key={i} title={it.school || `Education ${i + 1}`} onRemove={() => remove(i)}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field label="School">
              <Input value={it.school} onChange={(e) => patch(i, "school", e.target.value)} />
            </Field>
            <Field label="Degree">
              <Input value={it.degree} onChange={(e) => patch(i, "degree", e.target.value)} />
            </Field>
            <Field label="Location" className="sm:col-span-2">
              <Input value={it.location} onChange={(e) => patch(i, "location", e.target.value)} />
            </Field>
            <Field label="Start date">
              <Input value={it.startDate} onChange={(e) => patch(i, "startDate", e.target.value)} />
            </Field>
            <Field label="End date">
              <Input value={it.endDate} onChange={(e) => patch(i, "endDate", e.target.value)} />
            </Field>
            <Field label="Details" className="sm:col-span-2" hint="One per line.">
              <Textarea
                rows={3}
                value={toLines(it.details)}
                onChange={(e) => patch(i, "details", parseLines(e.target.value))}
              />
            </Field>
          </div>
        </ItemCard>
      ))}
      <AddButton label="Add education" onClick={add} />
    </div>
  );
}

function ListSection({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <Field label={label} hint="One per line.">
      <Textarea
        rows={3}
        value={toLines(items)}
        onChange={(e) => onChange(parseLines(e.target.value))}
      />
    </Field>
  );
}

// ---------- Small UI primitives (local to ContentEditor) ----------

function Disclosure({
  title,
  rightSlot,
  defaultOpen,
  children,
}: {
  title: string;
  rightSlot?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40"
      >
        <span className="text-sm font-medium">{title}</span>
        <span className="flex items-center gap-2">
          {rightSlot}
          <ChevronDown
            className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </span>
      </button>
      {open && <div className="border-t border-border p-4">{children}</div>}
    </div>
  );
}

function ItemCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">{title}</p>
        <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Plus className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

function EmptyHint({ label }: { label: string }) {
  return (
    <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      No {label} yet.
    </p>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        props.className
      )}
    />
  );
}
