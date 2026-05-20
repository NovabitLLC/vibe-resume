"use client";

import { motion } from "framer-motion";
import { SECTION_DISPLAY_TITLES } from "@/types/pageBlueprint";
import { cn } from "@/lib/utils";
import type { SectionComponentProps } from "@/components/renderer/types";

export function SectionWrapper({
  title,
  children,
  props,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  props: SectionComponentProps;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      viewport={{ once: true, margin: "-80px" }}
      className={cn(props.theme.section, className)}
    >
      {title && <h2 className={props.theme.sectionTitle}>{title}</h2>}
      {children}
    </motion.section>
  );
}

export function sectionTitle(props: SectionComponentProps) {
  return SECTION_DISPLAY_TITLES[props.section.id];
}
