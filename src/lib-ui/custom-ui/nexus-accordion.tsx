/**
 * Module: nexus-accordion
 * Purpose: Provide a minimal accordion composition for help/faq/spec sections.
 * Responsibilities: normalize accordion spacing and tracking for app-wide consistency.
 * Constraints: deterministic logic, respect module boundaries
 */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shadcn-ui/accordion"

interface AccordionEntry {
  id: string
  title: string
  content: string
}

interface NexusAccordionProps {
  items: AccordionEntry[]
}

export function NexusAccordion({ items }: NexusAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full rounded-2xl bg-background/55 px-4 ring-1 ring-zinc-300/50 dark:ring-white/10">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger className="text-sm tracking-tight">{item.title}</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
