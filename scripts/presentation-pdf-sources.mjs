import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PRESENTATION_SOURCE_ALGORITHM = 'sha256-path-content-v1';
const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectories = ['src/investor', 'content/locales'];
const fixedSources = [
  'content/presentation-story.json',
  'shared/investor-disclosures.mjs',
  'shared/investor-typography.mjs',
  'shared/locales.mjs',
  'shared/team.mjs',
];
const textExtension = /\.(?:css|html|js|json|mjs|svg)$/i;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

// See presentation-pdfs.README.md for the complete, portable hash contract.
// Generated PDFs, their provenance manifest, build scripts and generated
// deployment allowlists are deliberately outside this dependency graph.
export async function presentationPdfSources(repositoryRoot = defaultRoot) {
  const root = await realpath(path.resolve(repositoryRoot));
  const sources = new Set(fixedSources);
  const resolveSource = relative => {
    if (typeof relative !== 'string' || !relative || relative.includes('\\') || path.posix.isAbsolute(relative)
      || /^[A-Za-z]:/.test(relative) || relative.split('/').includes('..')) {
      throw new Error(`Invalid presentation source path: ${relative}`);
    }
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(root + path.sep)) throw new Error(`Presentation source outside repository: ${relative}`);
    return filename;
  };
  async function inspectSource(relative) {
    const filename = resolveSource(relative);
    const info = await lstat(filename);
    if (info.isSymbolicLink()) throw new Error(`Presentation source cannot be a symlink: ${relative}`);
    const resolved = await realpath(filename);
    if (!resolved.startsWith(root + path.sep)) throw new Error(`Presentation source resolves outside repository: ${relative}`);
    return { filename, info };
  }
  async function addDirectory(relative) {
    const { filename, info } = await inspectSource(relative);
    if (!info.isDirectory()) throw new Error(`Expected presentation source directory: ${relative}`);
    for (const entry of await readdir(filename, { withFileTypes: true })) {
      const child = `${relative}/${entry.name}`;
      if (entry.isSymbolicLink()) throw new Error(`Presentation source cannot be a symlink: ${child}`);
      if (entry.isDirectory()) await addDirectory(child);
      else if (entry.isFile()) sources.add(child);
      else throw new Error(`Unsupported presentation source: ${child}`);
    }
  }
  for (const directory of sourceDirectories) await addDirectory(directory);

  const mediaPath = resolveSource('src/investor/media.json');
  const media = JSON.parse(await readFile(mediaPath, 'utf8'));
  for (const source of Object.values(media)) {
    resolveSource(source);
    sources.add(source);
  }

  // The build adds floorplan aliases from this manifest. Hash only the nine
  // selected paths and their actual bytes, not unrelated asset inventory data.
  const assetManifest = JSON.parse(await readFile(resolveSource('assets/manifest.json'), 'utf8'));
  const plans = [];
  for (let page = 1; page <= 9; page++) {
    const marker = `{{PLAN_PAGE_${page}}}`;
    const matches = assetManifest.filter(item => item.marker === marker);
    if (matches.length !== 1) throw new Error(`Expected one presentation floorplan source: ${marker}`);
    const source = matches[0].path;
    resolveSource(source);
    sources.add(source);
    plans.push([marker, source]);
  }

  const files = [];
  for (const relative of [...sources].sort()) {
    const { filename, info } = await inspectSource(relative);
    if (!info.isFile()) throw new Error(`Expected presentation source file: ${relative}`);
    const raw = await readFile(filename);
    // Git may check out text with CRLF on Windows and LF on Linux. These
    // differences do not change the presentation and must not invalidate PDFs.
    const bytes = textExtension.test(relative) ? Buffer.from(raw.toString('utf8').replace(/\r\n?/g, '\n'), 'utf8') : raw;
    files.push({ path: relative, bytes: bytes.length, sha256: sha256(bytes) });
  }
  const canonical = JSON.stringify({
    algorithm: PRESENTATION_SOURCE_ALGORITHM,
    files: files.map(file => [file.path, file.bytes, file.sha256]),
    floorplanAliases: plans,
  }) + '\n';
  return { algorithm: PRESENTATION_SOURCE_ALGORITHM, sourceSha256: sha256(Buffer.from(canonical, 'utf8')), files };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await presentationPdfSources();
  console.log(JSON.stringify(process.argv.includes('--files') ? result : {
    algorithm: result.algorithm, sourceSha256: result.sourceSha256, fileCount: result.files.length,
  }, null, 2));
}
