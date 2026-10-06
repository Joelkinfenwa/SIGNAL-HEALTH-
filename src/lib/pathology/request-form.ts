import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ParticipatingLab } from "@/config/pathology";
import { code128Widths } from "./code128";

/**
 * Express Pathology Commercial Pathology Request Form (A4, two pages).
 *
 * Page 1 is the laboratory copy: billing notice, patient identity, ticked
 * tests, notes, account codes per laboratory, referrer, collection date/time
 * and collector certification. Page 2 is the patient's collection
 * instructions. Layout mirrors the Express Pathology template; all wording
 * comes from config/pathology.ts so nothing here is business copy.
 */
export interface RequestFormInput {
  reference: string;
  issuedAt: Date;
  patient: { firstName: string; lastName: string; dob: string; sex: string; phone?: string; email?: string; address?: string };
  /** Grouped tests: the base panel then each add-on. Every item is ticked. */
  tests: { group: string; items: string[] }[];
  fasting: boolean;
  /** Order-specific notes appended to the standard notes line. */
  notes: string;
  formTitle: string;
  referrer: { legalName: string; name: string; tradingAs: string; email: string; phone: string; website: string; locationsUrl: string };
  labs: ParticipatingLab[];
  billing: { headline: string; body: string; footer: string };
  compliance: string[];
  collectorCertification: string;
  collection: { fastingInstruction: string; bring: string; instructions: { title: string; thanks: string; commercialNote: string; validAt: string; footer: string } };
}

const A4 = { w: 595.28, h: 841.89 };
const INK = rgb(0.09, 0.09, 0.1), MUTED = rgb(0.4, 0.4, 0.42), LINE = rgb(0.72, 0.72, 0.74), SOFT = rgb(0.955, 0.955, 0.96), WHITE = rgb(1, 1, 1);
/** Express Pathology red, #C8102E. */
const RED = rgb(0.784, 0.063, 0.18), RED_SOFT = rgb(0.99, 0.94, 0.945);
const M = 34;
const W = A4.w - 2 * M;

/** Standard fonts are WinAnsi; swap anything outside it so encoding never throws. */
const safe = (s: string) => s.replace(/[–—]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");

export async function buildRequestFormPdf(i: RequestFormInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${i.referrer.name} request ${i.reference}`);
  doc.setAuthor(i.referrer.legalName);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fmtDate = (d: Date) => new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Australia/Sydney" }).format(d);

  const wrap = (s: string, maxWidth: number, size: number, f: PDFFont = font): string[] => {
    const lines: string[] = [];
    for (const para of safe(s).split("\n")) {
      let cur = "";
      for (const w of para.split(" ")) { const t = cur ? `${cur} ${w}` : w; if (f.widthOfTextAtSize(t, size) > maxWidth && cur) { lines.push(cur); cur = w; } else cur = t; }
      lines.push(cur);
    }
    return lines;
  };

  const painter = (page: PDFPage) => {
    const text = (s: string, x: number, y: number, size = 9, f: PDFFont = font, color = INK) => page.drawText(safe(s), { x, y, size, font: f, color });
    const centred = (s: string, cx: number, y: number, size: number, f: PDFFont, color = INK) => text(s, cx - f.widthOfTextAtSize(safe(s), size) / 2, y, size, f, color);
    const box = (x: number, y: number, w: number, h: number, fill?: ReturnType<typeof rgb>, border = LINE) => page.drawRectangle({ x, y, width: w, height: h, color: fill, borderColor: border, borderWidth: 0.7 });
    const hline = (x1: number, x2: number, y: number, color = LINE, thickness = 0.7) => page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness, color });
    const para = (s: string, x: number, y: number, maxW: number, size: number, f: PDFFont = font, color = INK, lead = size + 2.6) => {
      for (const l of wrap(s, maxW, size, f)) { text(l, x, y, size, f, color); y -= lead; }
      return y;
    };
    const banner = (y: number, h: number, s: string) => { box(M, y, W, h, RED, RED); centred(s, A4.w / 2, y + (h - 8) / 2 + 1, 8.5, bold, WHITE); };
    const sectionHead = (y: number, s: string) => { box(M, y - 15, W, 15, SOFT); text(s.toUpperCase(), M + 7, y - 10.5, 7.5, bold, INK); return y - 15; };
    const tick = (x: number, y: number) => {
      box(x, y, 8, 8, WHITE, INK);
      page.drawLine({ start: { x: x + 1.8, y: y + 4 }, end: { x: x + 3.4, y: y + 1.8 }, thickness: 1.3, color: INK });
      page.drawLine({ start: { x: x + 3.4, y: y + 1.8 }, end: { x: x + 6.6, y: y + 6.6 }, thickness: 1.3, color: INK });
    };
    return { text, centred, box, hline, para, banner, sectionHead, tick };
  };

  // ───────────────────────── Page 1: laboratory copy ─────────────────────────
  const p1 = doc.addPage([A4.w, A4.h]);
  const d = painter(p1);
  let y = A4.h - M;

  // Header
  d.text(i.referrer.name, M, y - 17, 19, bold, RED);
  d.text(i.formTitle, M, y - 32, 10.5, bold, INK);
  const contact = `${i.referrer.email}   |   ${i.referrer.phone}`;
  d.text(contact, A4.w - M - font.widthOfTextAtSize(safe(contact), 8.5), y - 10, 8.5, font, MUTED);
  drawBarcode(p1, i.reference, A4.w - M - 140, y - 38, 140, 22);
  d.text(i.reference, A4.w - M - 140 + (140 - bold.widthOfTextAtSize(i.reference, 8)) / 2, y - 47, 8, bold, INK);
  y -= 52;
  d.hline(M, A4.w - M, y, RED, 1.6); y -= 6;

  // Participating labs strip
  d.box(M, y - 16, W, 16, SOFT);
  d.text("PARTICIPATING LABS", M + 7, y - 11, 7, bold, MUTED);
  d.text(i.labs.map((l) => l.name).join("   ·   "), M + 100, y - 11.3, 8.5, bold, INK);
  y -= 22;

  // Billing notice
  d.box(M, y - 36, W, 36, RED_SOFT, RED);
  d.centred(i.billing.headline, A4.w / 2, y - 14, 9.5, bold, RED);
  d.centred(i.billing.body, A4.w / 2, y - 28, 8.5, font, INK);
  y -= 42;

  // Compliance strip
  const cw = W / i.compliance.length;
  const compH = 24;
  i.compliance.forEach((c, idx) => {
    const x = M + idx * cw;
    d.box(x, y - compH, cw, compH, undefined, LINE);
    const lines = wrap(c, cw - 12, 7, idx === 0 ? bold : font);
    let ly = y - (compH - lines.length * 8.6) / 2 - 7;
    for (const l of lines) { d.centred(l, x + cw / 2, ly, 7, idx === 0 ? bold : font, INK); ly -= 8.6; }
  });
  y -= compH + 8;

  // Patient details
  y = d.sectionHead(y, "Patient details");
  const pat = i.patient;
  const rowH = 18;
  const field = (lab: string, val: string, x: number, yy: number, w: number) => {
    d.box(x, yy - rowH, w, rowH, undefined, LINE);
    d.text(lab.toUpperCase(), x + 5, yy - 7, 5.8, bold, MUTED);
    d.text(val || "-", x + 5, yy - 14.5, 8.8, bold, INK);
  };
  const c1 = M, c2 = M + W * 0.26, c3 = M + W * 0.56, c4 = M + W * 0.80;
  field("Order #", i.reference, c1, y, c2 - c1);
  field("Surname", pat.lastName.toUpperCase(), c2, y, c3 - c2);
  field("First name", pat.firstName, c3, y, c4 - c3);
  field("Date of birth", pat.dob, c4, y, M + W - c4);
  y -= rowH;
  field("Address", pat.address ?? "-", c1, y, c3 - c1);
  field("Phone", pat.phone ?? "-", c3, y, c4 - c3);
  const sexW = (M + W - c4) * 0.52;
  field("Sex", pat.sex, c4, y, sexW);
  d.box(c4 + sexW, y - rowH, M + W - c4 - sexW, rowH, undefined, LINE);
  d.text("FASTING", c4 + sexW + 5, y - 7, 5.8, bold, MUTED);
  if (i.fasting) d.tick(c4 + sexW + 5, y - 15.5); else d.box(c4 + sexW + 5, y - 15.5, 8, 8, WHITE, INK);
  d.text(i.fasting ? "Yes" : "No", c4 + sexW + 17, y - 14.5, 8.8, bold, INK);
  y -= rowH + 8;

  // Tests requested: ticked items flowed into three columns, grouped.
  y = d.sectionHead(y, "Tests requested");
  const flat: { kind: "head" | "item"; s: string }[] = [];
  for (const g of i.tests) { flat.push({ kind: "head", s: g.group }); for (const it of g.items) flat.push({ kind: "item", s: it }); }
  const cols = 3, colW = W / cols;
  const perCol = Math.ceil(flat.length / cols);
  const lineH = flat.length > 60 ? 10 : 11.5;
  const testsH = perCol * lineH + 12;
  d.box(M, y - testsH, W, testsH, undefined, LINE);
  for (let c = 0; c < cols; c++) {
    let ly = y - 11;
    const x = M + c * colW + 7;
    for (const row of flat.slice(c * perCol, (c + 1) * perCol)) {
      if (row.kind === "head") d.text(row.s, x, ly, 7.6, bold, RED);
      else { d.tick(x, ly - 1.2); d.text(row.s, x + 12, ly, 8.2, font, INK); }
      ly -= lineH;
    }
  }
  y -= testsH + 8;

  // Bottom row is a fixed height; the Notes box above it absorbs whatever is left.
  const footerH = 20, footerY = M;
  const bottomH = 128;
  const bottomTop = footerY + footerH + 8 + bottomH;

  // Notes
  y = d.sectionHead(y, "Notes");
  const notesLines = wrap(i.notes, W - 14, 8.5);
  const notesH = Math.max(y - bottomTop - 8, notesLines.length * 11 + 10);
  d.box(M, y - notesH, W, notesH, undefined, LINE);
  d.para(i.notes, M + 7, y - 12, W - 14, 8.5, font, INK, 11);
  y -= notesH + 8;
  const bw1 = W * 0.36, bw2 = W * 0.28, bw3 = W - bw1 - bw2;
  const bx1 = M, bx2 = M + bw1, bx3 = bx2 + bw2;
  const by = bottomTop - bottomH;

  // Codes table
  d.box(bx1, by, bw1, bottomH, undefined, LINE);
  d.text("LABORATORY ACCOUNT CODES", bx1 + 7, bottomTop - 10, 6.5, bold, MUTED);
  const tcol = [bx1 + 7, bx1 + bw1 * 0.56, bx1 + bw1 * 0.78];
  let ty = bottomTop - 24;
  d.text("Laboratory", tcol[0]!, ty, 7, bold); d.text("Dr Code", tcol[1]!, ty, 7, bold); d.text("Billing Code", tcol[2]!, ty, 7, bold);
  ty -= 5; d.hline(bx1 + 7, bx1 + bw1 - 7, ty, LINE); ty -= 11;
  for (const l of i.labs) {
    d.text(l.name, tcol[0]!, ty, 7.8, bold, INK); d.text(l.drCode, tcol[1]!, ty, 7.8, bold, RED); d.text(l.billingCode, tcol[2]!, ty, 7.8, bold, RED);
    ty -= 4.5; d.hline(bx1 + 7, bx1 + bw1 - 7, ty, SOFT); ty -= 10.5;
  }
  d.para("Key the request to the Dr Code and invoice the Billing Code for your laboratory. Never bill the patient or Medicare.", bx1 + 7, ty - 2, bw1 - 14, 6.8, font, MUTED, 8.6);

  // Referrer + collection
  d.box(bx2, by, bw2, bottomH, undefined, LINE);
  d.text("REFERRER", bx2 + 7, bottomTop - 10, 6.5, bold, MUTED);
  d.text(i.referrer.legalName, bx2 + 7, bottomTop - 22, 9, bold, INK);
  d.text(i.referrer.email, bx2 + 7, bottomTop - 33, 7.6, font, INK);
  d.text(i.referrer.phone, bx2 + 7, bottomTop - 43, 7.6, font, INK);
  d.text(`Issued ${fmtDate(i.issuedAt)}`, bx2 + 7, bottomTop - 53, 7.6, font, MUTED);
  const lineY1 = by + 30, lineY2 = by + 12;
  d.text("Collection date", bx2 + 7, lineY1 + 3, 6.8, bold, MUTED); d.hline(bx2 + 62, bx2 + bw2 - 7, lineY1, INK, 0.7);
  d.text("Collection time", bx2 + 7, lineY2 + 3, 6.8, bold, MUTED); d.hline(bx2 + 62, bx2 + bw2 - 7, lineY2, INK, 0.7);

  // Collector signature
  d.box(bx3, by, bw3, bottomH, undefined, LINE);
  d.text("COLLECTOR SIGNATURE", bx3 + 7, bottomTop - 10, 6.5, bold, MUTED);
  const afterCert = d.para(i.collectorCertification, bx3 + 7, bottomTop - 21, bw3 - 14, 6.9, font, INK, 8.6);
  const sigLines = [["Sign", by + 44], ["Print name", by + 27], ["Date", by + 10]] as const;
  for (const [lab, ly] of sigLines) {
    if (ly + 6 < afterCert) { d.text(lab, bx3 + 7, ly + 3, 6.8, bold, MUTED); d.hline(bx3 + 48, bx3 + bw3 - 7, ly, INK, 0.7); }
  }

  // Footer banner
  d.banner(footerY, footerH, i.billing.footer);

  // ───────────────────────── Page 2: patient instructions ─────────────────────────
  const p2 = doc.addPage([A4.w, A4.h]);
  const e = painter(p2);
  y = A4.h - M;
  e.text(i.referrer.name, M, y - 17, 19, bold, RED);
  e.text(i.collection.instructions.title, M, y - 32, 10.5, bold, INK);
  e.text(contact, A4.w - M - font.widthOfTextAtSize(safe(contact), 8.5), y - 10, 8.5, font, MUTED);
  const ref2 = `Order ${i.reference}`;
  e.text(ref2, A4.w - M - bold.widthOfTextAtSize(ref2, 8.5), y - 24, 8.5, bold, INK);
  y -= 52; e.hline(M, A4.w - M, y, RED, 1.6); y -= 26;

  e.text(`Hi ${i.patient.firstName},`, M, y, 11, bold, INK); y -= 18;
  y = e.para(i.collection.instructions.thanks, M, y, W, 10, font, INK, 14.5); y -= 10;

  const step = (n: number, title: string, body: string) => {
    p2.drawCircle({ x: M + 9, y: y - 4, size: 9, color: RED });
    e.centred(String(n), M + 9, y - 7.3, 9, bold, WHITE);
    e.text(title, M + 26, y - 7, 10.5, bold, INK); y -= 22;
    y = e.para(body, M + 26, y, W - 26, 9.5, font, INK, 13.5); y -= 10;
  };
  step(1, "Find your nearest collection centre", `Go to ${i.referrer.locationsUrl} for the centre finders of the two participating laboratories below. ${i.collection.instructions.footer}`);
  step(2, "Prepare for your collection", `${i.fasting ? i.collection.fastingInstruction + " " : ""}${i.collection.bring}`);
  step(3, "At the centre", `Hand over this form (page 1) and your photo ID. The collector will confirm your name and date of birth, take your sample and sign the form. ${i.collection.instructions.commercialNote.replace("{phone}", i.referrer.phone)}`);
  step(4, "Your results", `The laboratory returns your results to ${i.referrer.legalName}. Your SIGNAL report, with a doctor's review, is released to you by email. Questions: ${i.referrer.email} or ${i.referrer.phone}.`);

  y -= 4;
  e.box(M, y - 14 - 20 * i.labs.length - 10, W, 14 + 20 * i.labs.length + 10, SOFT);
  e.text(i.collection.instructions.validAt, M + 10, y - 12, 8.5, bold, INK); y -= 14;
  for (const l of i.labs) { e.tick(M + 10, y - 16); e.text(l.legalName, M + 24, y - 15, 10, bold, INK); y -= 20; }
  y -= 28;
  y = e.para(i.collection.instructions.footer, M, y, W, 8.5, bold, RED, 11.5);

  e.banner(M, footerH, i.billing.footer);
  e.text(`${i.referrer.legalName} · ${i.referrer.tradingAs} · ${i.referrer.website}`, M, M + footerH + 6, 7, font, MUTED);

  return doc.save();
}

function drawBarcode(page: PDFPage, value: string, x: number, y: number, maxWidth: number, height: number) {
  const widths = code128Widths(value);
  const total = widths.reduce((a, b) => a + b, 0) + 20; // quiet zones
  const unit = Math.min(1.1, maxWidth / total);
  let cx = x + 10 * unit + (maxWidth - total * unit) / 2;
  widths.forEach((w, idx) => {
    if (idx % 2 === 0) page.drawRectangle({ x: cx, y, width: w * unit, height, color: INK });
    cx += w * unit;
  });
}
