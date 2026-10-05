import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertDeploymentTarget} from './deployment-targets.mjs';
import {SOCIAL_ORIGIN} from '../shared/social-metadata.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const config=JSON.parse((await readFile(path.join(root,'wrangler.jsonc'),'utf8')).replace(/^\uFEFF/,''));
assertDeploymentTarget(config,'production');
const branch=execFileSync('git',['-c',`safe.directory=${root.replaceAll('\\','/')}`,'branch','--show-current'],{cwd:root,encoding:'utf8'}).trim();
assert.ok(['codex/radisson-independent','main'].includes(branch),'Production deployment branch check failed');
const build=JSON.parse(await readFile(path.join(root,'dist/investor-build.json'),'utf8'));
assert.deepEqual(build,{version:1,mode:'production',origin:SOCIAL_ORIGIN},'Run npm run build:site before deploying the canonical website');
const cli=process.env.WRANGLER_CLI;
if(!cli)throw Error('Set WRANGLER_CLI to the installed official Wrangler JS entrypoint');
execFileSync(process.execPath,[path.join(root,'scripts/verify-investor-build.mjs')],{cwd:root,stdio:'inherit'});
// Ordinary deploy preserves the Worker's existing secrets. Never upload .dev.vars
// or pass --secrets-file as part of a website release.
execFileSync(process.execPath,[cli,'deploy','--config','wrangler.jsonc'],{cwd:root,stdio:'inherit'});
