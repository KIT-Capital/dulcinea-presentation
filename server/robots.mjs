import { publicPagePaths } from './access-policy.mjs';
import { publicAssetPaths } from './public-asset-paths.mjs';

// Keep general indexing disabled while allowing previews of existing public
// pages and assets. This does not grant access or change authentication.
const previewAgents = ['facebookexternalhit', 'Twitterbot', 'LinkedInBot', 'WhatsApp', 'Slackbot-LinkExpanding'];
const previewPaths = [...new Set([...publicPagePaths, ...publicAssetPaths])].sort();
export const robotsText = [
  'User-agent: *',
  'Disallow: /',
  '',
  ...previewAgents.map(agent => `User-agent: ${agent}`),
  'Disallow: /',
  ...previewPaths.flatMap(path => [`Allow: ${path}$`, `Allow: ${path}?`]),
  '',
].join('\n');
