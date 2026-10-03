export interface LegalSection {
  id: string;
  title: string;
  /** Paragraphs. A string starting with "- " is a bullet; consecutive bullets form one list. */
  body: string[];
}
export interface LegalDocument {
  slug: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}
