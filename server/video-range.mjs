// The asset binding can return complete files for Range requests. Slice only
// known-length MP4 bodies; the caller remains responsible for authentication.
export async function withVideoRange(request, response, knownSize) {
  const range = request.headers.get('Range');
  if (request.method !== 'GET' || response.status !== 200 || !range || !response.body
      || !/^video\/mp4(?:\s*;|$)/i.test((response.headers.get('Content-Type') || '').trim())) return response;

  const encoding = response.headers.get('Content-Encoding');
  if (encoding && encoding.toLowerCase() !== 'identity') return response;
  const lengthHeader = response.headers.get('Content-Length') ?? (Number.isSafeInteger(knownSize) && knownSize > 0 ? String(knownSize) : '');
  if (!/^\d+$/.test(lengthHeader)) return response;
  const size = Number(lengthHeader);
  if (!Number.isSafeInteger(size) || size <= 0) return response;

  // Dates and weak validators cannot establish the strong comparison required
  // by If-Range, so conservatively return the complete representation for them.
  const ifRange = request.headers.get('If-Range');
  if (ifRange && (!ifRange.startsWith('"') || ifRange !== response.headers.get('ETag'))) return response;

  // Ignoring malformed and multipart ranges is permitted by HTTP semantics.
  const match = /^bytes=(\d*)-(\d*)$/i.exec(range.trim());
  if (!match || (!match[1] && !match[2])) return response;
  const total = BigInt(size);
  let first, last;
  if (!match[1]) {
    const suffix = BigInt(match[2]);
    first = suffix >= total ? 0n : total - suffix;
    last = total - 1n;
  } else {
    first = BigInt(match[1]);
    last = match[2] ? BigInt(match[2]) : total - 1n;
  }
  const headers = new Headers(response.headers);
  headers.set('Accept-Ranges', 'bytes');
  if (first >= total || last < first) {
    headers.set('Content-Range', `bytes */${size}`);
    headers.set('Content-Length', '0');
    try { await response.body.cancel(); } catch { /* The rejected body is no longer needed. */ }
    return new Response(null, { status: 416, statusText: 'Range Not Satisfiable', headers });
  }
  if (last >= total) last = total - 1n;
  const start = Number(first), end = Number(last), rangeLength = end - start + 1;
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(rangeLength));

  const reader = response.body.getReader();
  let position = 0, sent = 0, finished = false, cancellation;
  const cancelSource = reason => cancellation ||= (async () => {
    try { await reader.cancel(reason); } catch { /* A closed or failed source needs no further work. */ }
    try { reader.releaseLock(); } catch { /* Cancellation may race a pending read. */ }
  })();
  const body = new ReadableStream({
    async pull(controller) {
      if (finished) return;
      try {
        while (!finished) {
          const { value, done } = await reader.read();
          if (finished) return;
          if (done) {
            finished = true;
            if (sent < rangeLength) controller.error(new Error('Video response ended before the requested range.'));
            else controller.close();
            await cancelSource();
            return;
          }
          const chunkStart = position;
          position += value.byteLength;
          const from = Math.max(0, start - chunkStart);
          const to = Math.min(value.byteLength, end + 1 - chunkStart);
          if (to > from) {
            const bytes = value.subarray(from, to);
            sent += bytes.byteLength;
            controller.enqueue(bytes);
          }
          if (position > end) {
            finished = true;
            controller.close();
            await cancelSource();
            return;
          }
          if (to > from) return;
        }
      } catch (error) {
        if (!finished) { finished = true; controller.error(error); }
        await cancelSource(error);
      }
    },
    async cancel(reason) {
      finished = true;
      await cancelSource(reason);
    },
  });
  // Workers derives Content-Length from the body, ignoring manually set values
  // for ordinary streams. Node uses the standard stream in the unit tests.
  if (typeof globalThis.FixedLengthStream === 'function') {
    const fixed = new globalThis.FixedLengthStream(rangeLength);
    body.pipeTo(fixed.writable).catch(() => {});
    return new Response(fixed.readable, { status: 206, statusText: 'Partial Content', headers });
  }
  return new Response(body, { status: 206, statusText: 'Partial Content', headers });
}
