import test from 'node:test';
import assert from 'node:assert/strict';
import { withVideoRange } from './video-range.mjs';

const url = 'https://invest.example/assets/video/test.mp4';
const content = '0123456789abcdef';
test('build-provided size supports asset bodies without an internal Content-Length', async () => {
  const source = new Response(content, {headers:{'Content-Type':'video/mp4'}});
  const partial = await withVideoRange(request('bytes=0-3'), source, content.length);
  assert.equal(partial.status,206);
  assert.equal(partial.headers.get('Content-Length'),'4');
  assert.equal(partial.headers.get('Content-Range'),'bytes 0-3/16');
  assert.equal(await partial.text(),'0123');
});
function request(range, headers = {}, method = 'GET') {
  return new Request(url, { method, headers: { ...(range ? { Range: range } : {}), ...headers } });
}
function response({ headers = {}, status = 200, body = content } = {}) {
  return new Response(body, { status, headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(content.length), ETag: '"video-v1"', ...headers } });
}

test('closed, open, suffix and oversized ranges produce exact partial bodies', async () => {
  for (const [range, expected, contentRange] of [
    ['bytes=0-3', '0123', 'bytes 0-3/16'],
    ['bytes=3-8', '345678', 'bytes 3-8/16'],
    ['bytes=12-', 'cdef', 'bytes 12-15/16'],
    ['bytes=-4', 'cdef', 'bytes 12-15/16'],
    ['bytes=-99', content, 'bytes 0-15/16'],
    ['bytes=14-99999999999999999999999', 'ef', 'bytes 14-15/16'],
    ['bytes=0-15', content, 'bytes 0-15/16'],
  ]) {
    const result = await withVideoRange(request(range), response());
    assert.equal(result.status, 206, range);
    assert.equal(result.headers.get('Content-Range'), contentRange, range);
    assert.equal(result.headers.get('Content-Length'), String(expected.length), range);
    assert.equal(result.headers.get('Accept-Ranges'), 'bytes', range);
    assert.equal(await result.text(), expected, range);
  }
});

test('unsatisfiable ranges return 416 and cancel the unused source', async () => {
  for (const range of ['bytes=16-', 'bytes=30-40', 'bytes=9-2', 'bytes=-0', 'bytes=99999999999999999999999-']) {
    let canceled = false;
    const body = new ReadableStream({ cancel() { canceled = true; } });
    const result = await withVideoRange(request(range), response({ body }));
    assert.equal(result.status, 416, range);
    assert.equal(result.headers.get('Content-Range'), 'bytes */16', range);
    assert.equal(result.headers.get('Content-Length'), '0', range);
    assert.equal(await result.text(), '', range);
    assert.equal(canceled, true, range);
  }
});

test('malformed, unsupported and multipart ranges retain the full response', async () => {
  for (const range of ['bytes=', 'bytes=-', 'bytes=foo-bar', 'bytes=0-2,4-6', 'items=0-3', 'bytes=1.5-3', 'bytes=+1-3']) {
    const original = response();
    assert.equal(await withVideoRange(request(range), original), original, range);
    assert.equal(original.headers.has('Content-Range'), false, range);
    assert.equal(await original.text(), content, range);
  }
});

test('only an exact strong If-Range ETag enables partial transfer', async () => {
  const matched = await withVideoRange(request('bytes=1-2', { 'If-Range': '"video-v1"' }), response());
  assert.equal(matched.status, 206);
  assert.equal(await matched.text(), '12');
  for (const validator of ['"video-v0"', 'W/"video-v1"', 'Sun, 27 Sep 2026 12:00:00 GMT']) {
    const original = response();
    assert.equal(await withVideoRange(request('bytes=1-2', { 'If-Range': validator }), original), original);
  }
  const weak = response({ headers: { ETag: 'W/"video-v1"' } });
  assert.equal(await withVideoRange(request('bytes=1-2', { 'If-Range': 'W/"video-v1"' }), weak), weak);
});

test('non-GET, non-MP4, encoded, unknown-size and non-200 responses are untouched', async () => {
  for (const [req, original] of [
    [request('bytes=0-3', {}, 'HEAD'), response()],
    [request(null), response()],
    [request('bytes=0-3'), response({ headers: { 'Content-Type': 'text/html' } })],
    [request('bytes=0-3'), response({ headers: { 'Content-Encoding': 'gzip' } })],
    [request('bytes=0-3'), response({ headers: { 'Content-Length': 'unknown' } })],
    [request('bytes=0-3'), response({ headers: { 'Content-Length': '9007199254740992' } })],
    [request('bytes=0-3'), response({ headers: { 'Content-Length': '0' } })],
    [request('bytes=0-3'), response({ status: 206 })],
    [request('bytes=0-3'), new Response(null, { status: 304 })],
  ]) assert.equal(await withVideoRange(req, original), original);
});

test('streaming slices cross source chunks and cancels without reading the whole video', async () => {
  let chunks = 0, canceled = false;
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    pull(controller) { chunks++; controller.enqueue(encoder.encode('0123')); },
    cancel() { canceled = true; },
  });
  const result = await withVideoRange(request('bytes=3-8'), response({ body, headers: { 'Content-Length': '4000000' } }));
  assert.equal(await result.text(), '301230');
  assert.equal(canceled, true);
  assert.ok(chunks <= 4, `Only relevant chunks plus normal stream prefetch should be read; got ${chunks}`);
});

test('canceling the partial response cancels its source safely', async () => {
  let canceledWith;
  const body = new ReadableStream({ cancel(reason) { canceledWith = reason; } });
  const result = await withVideoRange(request('bytes=0-3'), response({ body }));
  await result.body.cancel('viewer left');
  assert.equal(canceledWith, 'viewer left');
});

test('a truncated source fails rather than silently returning fewer promised bytes', async () => {
  const result = await withVideoRange(request('bytes=2-10'), response({ body: '0123' }));
  await assert.rejects(result.arrayBuffer(), /ended before the requested range/);
});

test('range headers are cloned while privacy and validation headers remain intact', async () => {
  const original = response({ headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' } });
  const result = await withVideoRange(request('bytes=1-4'), original);
  assert.equal(original.headers.get('Content-Length'), '16');
  assert.equal(original.headers.has('Content-Range'), false);
  assert.equal(original.headers.has('Accept-Ranges'), false);
  assert.equal(result.headers.get('Content-Length'), '4');
  for (const header of ['Cache-Control', 'Vary', 'X-Content-Type-Options', 'ETag', 'Content-Type']) assert.equal(result.headers.get(header), original.headers.get(header));
  assert.equal(await result.text(), '1234');
});
