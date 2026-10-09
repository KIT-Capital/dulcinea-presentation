import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRESENTATION_PDFS } from '../shared/presentation-downloads.mjs';
import { presentationPdfSources, PRESENTATION_SOURCE_ALGORITHM } from './presentation-pdf-sources.mjs';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const requiredPageCount = 21;

function pdfPageCount(pdf, locale) {
  assert.equal(pdf.subarray(0, 5).toString('ascii'), '%PDF-', `Invalid presentation PDF: ${locale}`);
  assert.match(pdf.subarray(-2048).toString('latin1'), /%%EOF\s*$/, `Incomplete presentation PDF: ${locale}`);
  // The screenshot-to-PDF exporter writes ordinary page objects (ReportLab).
  // Do not silently report zero or trust metadata for an unsupported exporter
  // using compressed object streams: require structural verification instead.
  const structural = pdf.toString('latin1').replace(/\bstream(?:\r\n|\r|\n)[\s\S]*?endstream\b/g, 'stream\nendstream');
  assert.doesNotMatch(structural, /\/Type\s*\/ObjStm\b/, `Compressed PDF object streams require a page-tree parser: ${locale}`);
  const objects = [...structural.matchAll(/(?:^|[\r\n])\d+\s+\d+\s+obj\b([\s\S]*?)\bendobj\b/g)].map(match => match[1]);
  const pageObjects = objects.filter(object => /\/Type\s*\/Page\b/.test(object));
  const pageTrees = objects.filter(object => /\/Type\s*\/Pages\b/.test(object));
  const counts = pageTrees.map(object => Number(object.match(/\/Count\s+(\d+)\b/)?.[1]));
  assert.ok(counts.length && counts.every(Number.isInteger), `Missing or invalid PDF page tree: ${locale}`);
  assert.equal(Math.max(...counts), pageObjects.length, `PDF page tree and page objects disagree: ${locale}`);
  return pageObjects.length;
}

export async function verifyPresentationPdfs(repositoryRoot = defaultRoot, { builtDirectory } = {}) {
  const root = path.resolve(repositoryRoot);
  const manifest = JSON.parse(await readFile(path.join(root, 'content/presentation-pdfs.json'), 'utf8'));
  assert.equal(manifest.version, 1, 'Unsupported presentation PDF manifest');
  assert.equal(manifest.sourceAlgorithm, PRESENTATION_SOURCE_ALGORITHM, 'Presentation PDF fingerprint algorithm changed');
  assert.ok(typeof manifest.exportedAt === 'string' && Number.isFinite(Date.parse(manifest.exportedAt)), 'Presentation PDF export timestamp is required');
  assert.equal(manifest.slideCount, requiredPageCount, 'Presentation PDF manifest must include 20 main slides and the owner-use appendix');
  const story = JSON.parse(await readFile(path.join(root, 'content/presentation-story.json'), 'utf8'));
  assert.equal(story.main.length + story.appendices.length, requiredPageCount, 'Presentation story changed; update the PDF export contract and regenerate every locale');
  const sources = await presentationPdfSources(root);
  assert.equal(manifest.sourceSha256, sources.sourceSha256, 'Presentation PDFs are stale: source copy, layout, translations or media changed. Regenerate all three PDFs before release.');
  if (manifest.sourceFiles) assert.deepEqual(manifest.sourceFiles, sources.files, 'Presentation PDF source inventory differs from the current fingerprint');
  assert.deepEqual(Object.keys(manifest.locales || {}).sort(), Object.keys(PRESENTATION_PDFS).sort(), 'Presentation PDF provenance must contain exactly EN, ES and FR');
  const results = {};
  for (const [locale, asset] of Object.entries(PRESENTATION_PDFS)) {
    const entry = manifest.locales[locale];
    const relative = asset.slice(1);
    assert.equal(entry.path, relative, `Unexpected presentation PDF source: ${locale}`);
    assert.match(entry.sha256 || '', /^[a-f\d]{64}$/, `Missing presentation PDF checksum: ${locale}`);
    assert.equal(entry.pageCount, requiredPageCount, `Incomplete presentation PDF manifest: ${locale}`);
    const pdf = await readFile(path.join(root, relative));
    assert.ok(pdf.length > 1024 && pdf.length <= 25 * 1024 * 1024, `Presentation PDF size is invalid: ${locale}`);
    assert.equal(digest(pdf), entry.sha256, `Presentation PDF checksum differs from export provenance: ${locale}`);
    assert.equal(pdfPageCount(pdf, locale), entry.pageCount, `Presentation PDF page count differs from export provenance: ${locale}`);
    if (builtDirectory) {
      const built = await readFile(path.join(path.resolve(builtDirectory), relative));
      assert.ok(pdf.equals(built), `Built presentation PDF differs from the verified source: ${locale}`);
    }
    results[locale] = { path: relative, sha256: entry.sha256, pageCount: entry.pageCount, bytes: pdf.length };
  }
  return { sourceSha256: sources.sourceSha256, sourceFileCount: sources.files.length, slideCount: requiredPageCount, locales: results };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await verifyPresentationPdfs(defaultRoot, { builtDirectory: process.argv.includes('--built') ? path.join(defaultRoot, 'dist/private-site') : undefined });
  console.log(`Verified EN/ES/FR presentation PDFs: ${result.slideCount} pages each, ${result.sourceFileCount} current source files; PDF hashes, page trees and source freshness passed${process.argv.includes('--built') ? ', including built-file parity' : ''}.`);
}
