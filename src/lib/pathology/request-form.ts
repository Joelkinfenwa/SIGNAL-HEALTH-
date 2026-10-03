import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { code128Widths } from "./code128";

/**
 * Pathology request form PDF (A4). Lab-agnostic layout with the fields a
 * collector and laboratory expect: patient identity, requested tests,
 * requesting practitioner and provider number, billing instruction, a
 * scannable request number, and collection instructions.
 */
export interface RequestFormInput {
  reference: string;
  issuedAt: Date;
  draft: boolean;
  patient: { firstName: string; lastName: string; dob: string; sex: string; phone?: string; email?: string; address?: string };
  /** Grouped tests: the base panel then each add-on. */
  tests: { group: string; items: string[] }[];
  collectionMethod: string;
  practice: { name: string; tradingAs: string; address: string; phone: string; email: string };
  requester: { name: string; qualifications: string; providerNumber: string; authorisation: string };
  lab: { name: string; billing: string; accountNumber: string };
  clinicalNotes: string;
  fasting: { required: boolean; instruction: string; bring: string };
}

const A4 = { w: 595.28, h: 841.89 };
const INK = rgb(0.07, 0.086, 0.078), MUTED = rgb(0.37, 0.4, 0.38), LINE = rgb(0.87, 0.86, 0.835), BRAND = rgb(0.11, 0.29, 0.235);
const M = 40;

/** Standard fonts are WinAnsi; swap anything outside it so encoding never throws. */
const safe = (s: string) => s.replace(/[–—]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/·/g, "-").replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");

export async function buildRequestFormPdf(i: RequestFormInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Pathology request ${i.reference}`);
  doc.setAuthor(i.practice.tradingAs);
  const page = doc.addPage([A4.w, A4.h]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fmtDate = (d: Date) => new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Australia/Sydney" }).format(d);
  let y = A4.h - M;

  const text = (s: string, x: number, yy: number, size = 9.5, f: PDFFont = font, color = INK) => page.drawText(safe(s), { x, y: yy, size, font: f, color });
  const rule = (yy: number) => page.drawLine({ start: { x: M, y: yy }, end: { x: A4.w - M, y: yy }, thickness: 0.6, color: LINE });
  const label = (s: string, x: number, yy: number) => text(s.toUpperCase(), x, yy, 7, bold, MUTED);
  const wrap = (s: string, maxWidth: number, size: number, f: PDFFont = font): string[] => {
    const words = safe(s).split(" "); const lines: string[] = []; let cur = "";
    for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (f.widthOfTextAtSize(t, size) > maxWidth && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur); return lines;
  };

  // Header
  text(i.practice.name, M, y - 14, 15, bold, BRAND);
  text(i.practice.tradingAs, M, y - 28, 9, font, MUTED);
  text(`${i.practice.address}  |  ${i.practice.phone}  |  ${i.practice.email}`, M, y - 41, 8, font, MUTED);
  const title = "PATHOLOGY REQUEST";
  text(title, A4.w - M - bold.widthOfTextAtSize(title, 14), y - 14, 14, bold, INK);
  const priv = "Private request - not Medicare";
  text(priv, A4.w - M - font.widthOfTextAtSize(priv, 9), y - 28, 9, font, MUTED);
  y -= 56; rule(y); y -= 14;

  // Request number + barcode
  label("Request number", M, y); text(i.reference, M, y - 16, 13, bold);
  label("Issued", M + 150, y); text(fmtDate(i.issuedAt), M + 150, y - 16, 10.5, bold);
  label("Collection", M + 240, y); text(i.collectionMethod, M + 240, y - 16, 10.5, bold);
  drawBarcode(page, i.reference, A4.w - M - 150, y - 22, 150, 28);
  text(i.reference, A4.w - M - 150 + (150 - font.widthOfTextAtSize(i.reference, 7)) / 2, y - 31, 7, font, MUTED);
  y -= 50; rule(y); y -= 14;

  // Patient
  label("Patient", M, y); y -= 14;
  const p = i.patient;
  const col2 = M + 260;
  text(`${p.lastName.toUpperCase()}, ${p.firstName}`, M, y, 12, bold); y -= 15;
  label("Date of birth", M, y); text(p.dob, M + 70, y - 1, 9.5, bold);
  label("Sex", col2, y); text(p.sex, col2 + 30, y - 1, 9.5, bold); y -= 13;
  label("Phone", M, y); text(p.phone ?? "-", M + 70, y - 1);
  label("Email", col2, y); text(p.email ?? "-", col2 + 30, y - 1); y -= 13;
  label("Address", M, y); text(p.address ?? "-", M + 70, y - 1); y -= 10;
  rule(y); y -= 14;

  // Tests requested
  label("Tests requested", M, y); y -= 14;
  const colW = (A4.w - 2 * M - 16) / 2;
  let xCol = M, yCol = y, colStartY = y;
  const place = (line: string, f: PDFFont, size: number) => {
    if (yCol < 300 && xCol === M) { xCol = M + colW + 16; yCol = colStartY; }
    text(line, xCol, yCol, size, f); yCol -= size + 3.5;
  };
  for (const g of i.tests) {
    place(g.group, bold, 9.5);
    for (const line of wrap(g.items.join(", "), colW, 8.5)) place(line, font, 8.5);
    yCol -= 4;
  }
  y = (xCol === M ? yCol : Math.min(yCol, colStartY)) - 4;
  rule(y); y -= 14;

  // Clinical notes + billing
  label("Clinical notes", M, y); y -= 12;
  for (const l of wrap(i.clinicalNotes, A4.w - 2 * M, 9)) { text(l, M, y, 9); y -= 11.5; }
  y -= 2; label("Billing", M, y); y -= 12;
  for (const l of wrap(`${i.lab.billing} Account: ${i.lab.accountNumber}.`, A4.w - 2 * M, 9)) { text(l, M, y, 9); y -= 11.5; }
  y -= 2; label("Collection instructions", M, y); y -= 12;
  const instr = `${i.fasting.required ? i.fasting.instruction + " " : ""}${i.fasting.bring}`;
  for (const l of wrap(instr, A4.w - 2 * M, 9)) { text(l, M, y, 9); y -= 11.5; }
  y -= 6; rule(y); y -= 14;

  // Requesting practitioner
  label("Requesting practitioner", M, y); y -= 15;
  text(`${i.requester.name}  ${i.requester.qualifications}`, M, y, 10.5, bold); y -= 13;
  label("Provider number", M, y); text(i.requester.providerNumber, M + 90, y - 1, 9.5, bold);
  label("Laboratory", col2, y); text(i.lab.name, col2 + 60, y - 1, 9.5, bold); y -= 13;
  text(`${i.practice.name}, ${i.practice.address}`, M, y, 9, font, MUTED); y -= 20;
  page.drawLine({ start: { x: M, y }, end: { x: M + 220, y }, thickness: 0.8, color: INK });
  text("Signature of requesting practitioner", M, y - 10, 7, bold, MUTED);
  text(`Date ${fmtDate(i.issuedAt)}`, M + 240, y + 3, 9);
  y -= 24;
  for (const l of wrap(i.requester.authorisation, A4.w - 2 * M, 8)) { text(l, M, y, 8, font, MUTED); y -= 10; }

  // Footer
  text(`Patient copy. Please present this form at collection with photo ID. Results are released to ${i.practice.tradingAs} for doctor review.`, M, M - 4, 7.5, font, MUTED);

  if (i.draft) {
    page.drawText("DRAFT - practice details not yet set", { x: 120, y: 420, size: 34, font: bold, color: rgb(0.94, 0.42, 0.28), opacity: 0.25, rotate: { type: "degrees", angle: 30 } as never });
  }
  return doc.save();
}

function drawBarcode(page: PDFPage, value: string, x: number, y: number, maxWidth: number, height: number) {
  const widths = code128Widths(value);
  const total = widths.reduce((a, b) => a + b, 0) + 20; // quiet zones
  const unit = Math.min(1.1, maxWidth / total);
  let cx = x + 10 * unit;
  widths.forEach((w, idx) => {
    if (idx % 2 === 0) page.drawRectangle({ x: cx, y: y, width: w * unit, height, color: INK });
    cx += w * unit;
  });
}
