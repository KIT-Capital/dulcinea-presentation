import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(await readFile(path.join(root,'content/video-library.json'),'utf8'));
const aliases=JSON.parse(await readFile(path.join(root,'src/investor/media.json'),'utf8'));
const active=new Set(Object.values(aliases).filter(value=>value.endsWith('.mp4')));
const walk=async folder=>(await Promise.all((await readdir(folder,{withFileTypes:true})).map(async entry=>{
  const file=path.join(folder,entry.name);
  return entry.isDirectory()?walk(file):file.toLowerCase().endsWith('.mp4')?[path.relative(root,file).replaceAll('\\','/')]:[];
}))).flat();
const files=await walk(path.join(root,'assets/video'));
assert.deepEqual(files.sort(),catalog.repository_videos.map(video=>video.path).sort(),'Every retained MP4 must have a catalog entry');
const hashes=new Set();
for(const entry of catalog.repository_videos){
  const hash=createHash('sha256');
  let bytes=0;
  for await(const chunk of createReadStream(path.join(root,entry.path))){hash.update(chunk);bytes+=chunk.length;}
  const digest=hash.digest('hex');
  assert.equal(digest,entry.sha256,`Video changed without updating catalog: ${entry.path}`);
  assert.equal(bytes,entry.bytes,`Video size mismatch: ${entry.path}`);
  assert(!hashes.has(digest),`Duplicate retained MP4: ${entry.path}`);
  hashes.add(digest);
  assert.equal(entry.status,active.has(entry.path)?'active':'retained-for-future-use',`Update video status: ${entry.path}`);
}
const stockIds=catalog.stock_clips.map(clip=>clip.stock_id);
assert.equal(new Set(stockIds).size,stockIds.length,'Only one canonical entry per stock identity');
for(const clip of catalog.stock_clips){
  assert(catalog.repository_videos.some(entry=>entry.path===clip.canonical_mp4),`Missing canonical stock file: ${clip.stock_id}`);
}
for(const file of active)assert(files.includes(file),`Active video absent from library: ${file}`);

let remoteVerified=false;
if(process.argv.includes('--remote')){
  const branch=execFileSync('git',['-c',`safe.directory=${root.replaceAll('\\','/')}`,'branch','--show-current'],{cwd:root,encoding:'utf8'}).trim();
  assert.equal(branch,'codex/radisson-independent','Remote verification is scoped to the review branch');
  const tree=JSON.parse(execFileSync('gh',['api',`repos/KIT-Capital/dulcinea-presentation/git/trees/${branch}?recursive=1`],{encoding:'utf8',maxBuffer:8*1024*1024}));
  assert.equal(tree.truncated,false,'GitHub tree must be complete');
  for(const entry of catalog.repository_videos){
    const remote=tree.tree.find(file=>file.path===entry.path);
    assert(remote,`Video missing from GitHub: ${entry.path}`);
    assert.equal(remote.sha,entry.git_blob,`Remote video differs: ${entry.path}`);
    assert.equal(remote.size,entry.bytes,`Remote video size differs: ${entry.path}`);
  }
  remoteVerified=true;
}
console.log(JSON.stringify({distinct_repository_videos:files.length,active_videos:active.size,canonical_stock_clips:stockIds.length,duplicate_files:0,remote_verified:remoteVerified}));
