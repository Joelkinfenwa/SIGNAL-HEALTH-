import { privacy } from "./privacy";
import { retestingTerms } from "./retesting-terms";
import { terms } from "./terms";
import type { LegalDocument } from "./types";

export const legalDocuments: LegalDocument[] = [terms, privacy, retestingTerms];
export const getLegalDocument = (slug: string) => legalDocuments.find((d) => d.slug === slug);
export type { LegalDocument, LegalSection } from "./types";
