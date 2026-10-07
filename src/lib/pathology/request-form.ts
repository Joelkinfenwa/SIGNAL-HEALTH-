import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { create as createQr } from "qrcode";
import type { ParticipatingLab } from "@/config/pathology";
import { labLogos } from "./logos";

/**
 * Express Pathology Commercial Pathology Request Form (A4, two pages),
 * laid out to match the printed Express Pathology template.
 *
 * Page 1 (laboratory copy): header, participating-lab logos, billing notice,
 * compliance lines, patient identity grid, ticked tests, notes, laboratory
 * account codes, referrer with collection date/time, collector certification
 * and the do-not-bill footer. Page 2: collection-centre QR, note to the
 * phlebotomist, participating laboratories and the note to the customer.
 * All wording comes from config/pathology.ts.
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
  collection: { fastingInstruction: string; bring: string; instructions: { title: string; thanks: string; commercialNote: string; validAt: string; footer: string; findTitle: string; findBody: string; qrCaption: string; collectorTitle: string; collectorBody: string[]; closing: string[]; customerTitle: string; customerBody: string } };
}

const A4 = { w: 595.28, h: 841.89 };
const INK = rgb(0.1, 0.1, 0.11), MUTED = rgb(0.5, 0.5, 0.52), LINE = rgb(0.8, 0.8, 0.82), SOFT = rgb(0.965, 0.965, 0.97), WHITE = rgb(1, 1, 1);
/** Express Pathology red as printed on the template. */
const RED = rgb(0.8, 0.19, 0.29);
/** Page frame and content margins. */
const F = 30, M = 40;
const W = A4.w - 2 * M;

/** Standard fonts are WinAnsi; swap anything outside it so encoding never throws. */
const safe = (s: string) => s.replace(/[–—]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");

export async function buildRequestFormPdf(i: RequestFormInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${i.referrer.name} request ${i.reference}`);
  doc.setAuthor(i.referrer.legalName);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const logos = new Map<string, PDFImage>();
  for (const lab of i.labs) { const l = labLogos[lab.name]; if (l) logos.set(lab.name, await doc.embedPng(Buffer.from(l.png, "base64"))); }

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
    const right = (s: string, xr: number, y: number, size: number, f: PDFFont, color = INK) => text(s, xr - f.widthOfTextAtSize(safe(s), size), y, size, f, color);
    const centred = (s: string, cx: number, y: number, size: number, f: PDFFont, color = INK) => text(s, cx - f.widthOfTextAtSize(safe(s), size) / 2, y, size, f, color);
    const box = (x: number, y: number, w: number, h: number, fill?: ReturnType<typeof rgb>, border = LINE, bw = 0.7) => page.drawRectangle({ x, y, width: w, height: h, color: fill, borderColor: border, borderWidth: bw });
    const hline = (x1: number, x2: number, y: number, color = LINE, thickness = 0.7) => page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness, color });
    const para = (s: string, x: number, y: number, maxW: number, size: number, f: PDFFont = font, color = INK, lead = size + 3) => {
      for (const l of wrap(s, maxW, size, f)) { text(l, x, y, size, f, color); y -= lead; }
      return y;
    };
    /** Small caps-style field label, as on the template. */
    const label = (s: string, x: number, y: number, color = MUTED, size = 6.2) => text(s.toUpperCase(), x, y, size, bold, color);
    const tick = (x: number, y: number, size = 8) => {
      box(x, y, size, size, WHITE, INK, 0.6);
      page.drawLine({ start: { x: x + size * 0.22, y: y + size * 0.5 }, end: { x: x + size * 0.42, y: y + size * 0.22 }, thickness: 1.2, color: INK });
      page.drawLine({ start: { x: x + size * 0.42, y: y + size * 0.22 }, end: { x: x + size * 0.82, y: y + size * 0.82 }, thickness: 1.2, color: INK });
    };
    const frame = () => box(F, F, A4.w - 2 * F, A4.h - 2 * F, undefined, RED, 1.4);
    return { text, right, centred, box, hline, para, label, tick, frame };
  };

  // ───────────────────────── Page 1: laboratory copy ─────────────────────────
  const p1 = doc.addPage([A4.w, A4.h]);
  const d = painter(p1);
  d.frame();
  let y = A4.h - M - 4;

  // Header: name, form title, contact
  d.text(i.referrer.name, M, y - 16, 19, bold, RED);
  d.text(i.formTitle.toUpperCase(), M, y - 27, 7, font, MUTED);
  d.right(i.referrer.email, A4.w - M, y - 9, 8, font, MUTED);
  d.right(i.referrer.phone, A4.w - M, y - 20, 8, font, MUTED);
  y -= 34;
  d.hline(M, A4.w - M, y);

  // Participating labs: logos
  const labRowH = 30;
  d.label("Participating", M, y - 12, RED, 6.5); d.label("labs", M, y - 20, RED, 6.5);
  let lx = M + 86;
  for (const lab of i.labs) {
    const img = logos.get(lab.name);
    const h = lab.name === "4Cyte Pathology" ? 20 : 15;
    if (img) { const w = (img.width / img.height) * h; p1.drawImage(img, { x: lx, y: y - labRowH / 2 - h / 2, width: w, height: h }); lx += w + 46; }
    else { d.text(lab.name, lx, y - 18, 9, bold, INK); lx += bold.widthOfTextAtSize(lab.name, 9) + 46; }
  }
  y -= labRowH;
  d.hline(M, A4.w - M, y); y -= 8;

  // Billing notice (red border, red headline)
  const billH = 40;
  d.box(M, y - billH, W, billH, undefined, RED, 1.6);
  d.text(i.billing.headline, M + 14, y - 17, 10.5, bold, RED);
  d.text(i.billing.body, M + 14, y - 31, 8, font, INK);
  y -= billH + 10;

  // Compliance lines
  d.label(i.compliance[0] ?? "", M + 8, y - 8, MUTED, 7);
  d.right((i.compliance[1] ?? "").toUpperCase(), A4.w - M - 8, y - 8, 6.3, font, MUTED);
  y -= 16;
  d.box(M, y - 16, W, 16, undefined, LINE);
  d.text(i.compliance[2] ?? "", M + 8, y - 11, 7.5, italic, INK);
  y -= 16;

  // Patient identity grid
  const pat = i.patient;
  const rowH = 30;
  const cell = (lab: string, val: string, x: number, yy: number, w: number, valSize = 9.5) => {
    d.box(x, yy - rowH, w, rowH, undefined, LINE);
    d.label(lab, x + 8, yy - 10);
    d.text(val, x + 8, yy - 23, valSize, bold, INK);
  };
  const cA = M, cB = M + W * 0.2, cC = M + W * 0.5, cD = M + W * 0.8;
  cell("Order #", i.reference, cA, y, cB - cA);
  cell("Patient surname", pat.lastName.toUpperCase(), cB, y, cC - cB);
  cell("Patient first name", pat.firstName, cC, y, cD - cC);
  cell("D.O.B", pat.dob, cD, y, M + W - cD);
  y -= rowH;
  cell("Patient address", pat.address || "-", cA, y, cC - cA, 8.5);
  cell("Phone", pat.phone || "-", cC, y, cD - cC);
  const sexW = (M + W - cD) * 0.36;
  cell("Sex", pat.sex, cD, y, sexW);
  d.box(cD + sexW, y - rowH, M + W - cD - sexW, rowH, undefined, LINE);
  d.label("Fasting", cD + sexW + 8, y - 10);
  if (i.fasting) d.tick(cD + sexW + 8, y - 25, 9); else d.box(cD + sexW + 8, y - 25, 9, 9, WHITE, INK, 0.6);
  d.text("YES", cD + sexW + 21, y - 23, 8, font, INK);
  y -= rowH + 8;

  // Tests requested: section header row, then ticked items in three columns
  const sectionRow = (title: string) => { d.box(M, y - 16, W, 16, undefined, LINE); d.text(title.toUpperCase(), M + 8, y - 11.5, 8, bold, RED); y -= 16; };
  sectionRow("Tests requested");
  const flat: { kind: "head" | "item"; s: string }[] = [];
  for (const g of i.tests) { flat.push({ kind: "head", s: g.group }); for (const it of g.items) flat.push({ kind: "item", s: it }); }
  const cols = 3, colW = W / cols;
  const perCol = Math.ceil(flat.length / cols);
  const lineH = flat.length > 60 ? 10 : 11.5;
  const testsH = perCol * lineH + 14;
  d.box(M, y - testsH, W, testsH, undefined, LINE);
  for (let c = 0; c < cols; c++) {
    let ly = y - 13;
    const x = M + c * colW + 8;
    for (const row of flat.slice(c * perCol, (c + 1) * perCol)) {
      if (row.kind === "head") d.text(row.s, x, ly, 7.4, bold, RED);
      else { d.tick(x, ly - 1.5, 8); d.text(row.s, x + 12, ly, 8, font, INK); }
      ly -= lineH;
    }
  }
  y -= testsH + 8;

  // Fixed bottom stack: codes + referrer row, collector signature box, footer line.
  const footerY = F + 14;
  const sigH = 92, codesH = Math.max(100, 24 + 24 * i.labs.length + 10);
  const bottomH = codesH;
  const sigTop = footerY + 18 + sigH;
  const bottomTop = sigTop + 8 + bottomH;

  // Notes absorbs the slack
  sectionRow("Notes");
  const notesH = Math.max(y - bottomTop - 8, 28);
  d.box(M, y - notesH, W, notesH, undefined, LINE);
  d.para(i.notes, M + 8, y - 13, W - 16, 8, font, INK, 10.5);
  y -= notesH + 8;

  // Laboratory account codes (red border) | Referrer + collection date/time
  const codesW = W * 0.49, refX = M + codesW + 12, refW = W - codesW - 12;
  const by = bottomTop - bottomH;
  d.box(M, by, codesW, bottomH, undefined, RED, 1.2);
  const tcol = [M + 8, M + codesW * 0.5, M + codesW * 0.75];
  let ty = bottomTop - 13;
  d.label("Laboratory", tcol[0]!, ty); d.label("Dr code", tcol[1]!, ty); d.label("Billing code", tcol[2]!, ty);
  ty -= 6; d.hline(M + 1, M + codesW - 1, ty, LINE); ty -= 15;
  for (const l of i.labs) {
    d.text(l.name, tcol[0]!, ty, 8.5, bold, RED); d.text(l.drCode, tcol[1]!, ty, 8.5, font, INK); d.text(l.billingCode, tcol[2]!, ty, 8.5, font, INK);
    ty -= 9; d.hline(M + 1, M + codesW - 1, ty, LINE); ty -= 15;
  }
  d.box(refX, by, refW, bottomH, undefined, LINE);
  d.label("Referrer", refX + 8, bottomTop - 13, RED, 6.8);
  d.text(i.referrer.legalName, refX + 8, bottomTop - 27, 10, bold, INK);
  d.text(`${i.referrer.email} · ${i.referrer.phone} · Issued ${fmtDate(i.issuedAt)}`, refX + 8, bottomTop - 38, 7.2, font, INK);
  d.hline(refX + 1, refX + refW - 1, bottomTop - 46, LINE);
  const cdY = bottomTop - 62, ctY = bottomTop - 86;
  d.label("Collection date", refX + 8, cdY); d.hline(refX + 90, refX + refW - 8, cdY - 5, LINE);
  d.label("Collection time", refX + 8, ctY); d.hline(refX + 90, refX + refW - 8, ctY - 5, LINE);

  // Collector signature (red border)
  d.box(M, sigTop - sigH, W, sigH, undefined, RED, 1.2);
  d.text("COLLECTOR SIGNATURE", M + 10, sigTop - 15, 9, bold, RED);
  d.para(i.collectorCertification, M + 10, sigTop - 28, W - 20, 7.5, font, INK, 9.5);
  const sigY = sigTop - sigH + 14;
  const sx = [M + 10, M + W * 0.5, M + W * 0.8];
  d.label("Sign", sx[0]!, sigY + 20); d.hline(sx[0]!, M + W * 0.47, sigY, INK, 0.7);
  d.label("Print name", sx[1]!, sigY + 20); d.hline(sx[1]!, M + W * 0.77, sigY, INK, 0.7);
  d.label("Date", sx[2]!, sigY + 20); d.hline(sx[2]!, M + W - 10, sigY, INK, 0.7);

  // Footer line and page number
  d.centred(i.billing.footer, A4.w / 2, footerY, 7.5, bold, MUTED);
  d.right("1 / 2", A4.w - F, F - 10, 7, font, MUTED);

  // ───────────────────────── Page 2: collector and customer notes ─────────────────────────
  const p2 = doc.addPage([A4.w, A4.h]);
  const e = painter(p2);
  e.frame();
  const ins = i.collection.instructions;
  y = A4.h - M - 4;
  e.text(i.formTitle.toUpperCase(), M, y - 10, 7.5, bold, MUTED);
  e.right(i.referrer.name.toUpperCase(), A4.w - M, y - 10, 7.5, bold, MUTED);
  e.right(`Order ${i.reference}`, A4.w - M, y - 21, 7.5, font, MUTED);
  y -= 36;

  // Find your nearest collection centre + QR
  e.text(ins.findTitle.toUpperCase(), M, y, 10.5, bold, RED); y -= 15;
  e.text(`${ins.findBody} ${i.referrer.locationsUrl}`, M, y, 8.5, font, INK); y -= 8;
  e.hline(M, A4.w - M, y, LINE); y -= 12;
  const qr = createQr(`https://${i.referrer.locationsUrl}`, { errorCorrectionLevel: "M" });
  const n = qr.modules.size, qrSize = 104, unit = qrSize / n, qx = A4.w / 2 - qrSize / 2, qy = y - qrSize;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.modules.get(r, c)) p2.drawRectangle({ x: qx + c * unit, y: qy + (n - 1 - r) * unit, width: unit + 0.2, height: unit + 0.2, color: INK });
  y = qy - 12;
  e.centred(ins.qrCaption, A4.w / 2, y, 7.5, font, MUTED); y -= 30;

  // For the attention of the phlebotomist / collector
  e.text(ins.collectorTitle.toUpperCase(), M, y, 10.5, bold, RED); y -= 16;
  for (const pgh of ins.collectorBody) { y = e.para(pgh.replace("{phone}", i.referrer.phone), M, y, W, 8.5, font, INK, 11.5); y -= 6; }
  y -= 2;
  const half = W / 2;
  i.labs.forEach((l, idx) => {
    const x = M + (idx % 2) * half, ly = y - Math.floor(idx / 2) * 18;
    p2.drawCircle({ x: x + 3, y: ly + 3, size: 1.6, color: RED });
    e.text(l.legalName, x + 10, ly, 9, bold, INK);
  });
  y -= Math.ceil(i.labs.length / 2) * 18 + 30;

  // Closing lines
  for (const l of ins.closing) { e.centred(l, A4.w / 2, y, 7.5, bold, MUTED); y -= 13; }
  y -= 6; e.hline(M, A4.w - M, y, LINE); y -= 16;

  // Note to customer (left) and contact (right)
  e.text(ins.customerTitle.toUpperCase(), M, y, 7.5, bold, RED);
  e.right(i.referrer.email, A4.w - M, y, 7.5, bold, INK);
  e.right(i.referrer.phone, A4.w - M, y - 11, 7.5, bold, INK);
  y -= 11;
  y = e.para(ins.customerBody.replace("{locationsUrl}", i.referrer.locationsUrl), M, y, W * 0.68, 7.5, font, INK, 10);
  y = e.para(`${i.fasting ? i.collection.fastingInstruction + " " : ""}${i.collection.bring}`, M, y - 2, W * 0.68, 7.5, font, INK, 10);
  e.right("2 / 2", A4.w - F, F - 10, 7, font, MUTED);

  return doc.save();

  function fmtDate(dt: Date) { return new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Australia/Sydney" }).format(dt); }
}
