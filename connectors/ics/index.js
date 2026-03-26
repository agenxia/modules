/**
 * Connector ICS — subscribe to and parse ICS calendar feeds
 */

let icsUrl = null;
let cachedEvents = [];
let lastFetchedAt = null;

export function subscribe(url) {
  icsUrl = url;
  cachedEvents = [];
  lastFetchedAt = null;
  return { success: true, url };
}

export async function events() {
  if (!icsUrl) return { events: [], error: 'No ICS URL configured. Call subscribe(url) first.' };
  
  try {
    const res = await fetch(icsUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    cachedEvents = parseICS(text);
    lastFetchedAt = new Date().toISOString();
    return { events: cachedEvents, fetched_at: lastFetchedAt, count: cachedEvents.length };
  } catch (err) {
    return { events: cachedEvents, error: err.message, fetched_at: lastFetchedAt };
  }
}

function parseICS(text) {
  const events = [];
  const blocks = text.split('BEGIN:VEVENT');
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0];
    const get = (key) => {
      const match = block.match(new RegExp(`^${key}[;:](.*)$`, 'm'));
      return match ? match[1].trim() : null;
    };
    const summary = get('SUMMARY');
    const dtstart = get('DTSTART');
    const dtend = get('DTEND');
    const location = get('LOCATION');
    const description = get('DESCRIPTION');
    const uid = get('UID');
    
    if (summary && dtstart) {
      events.push({
        uid: uid || `event-${i}`,
        summary,
        start: parseICSDate(dtstart),
        end: dtend ? parseICSDate(dtend) : null,
        location: location || null,
        description: description ? description.replace(/\n/g, '
').replace(/\,/g, ',') : null,
      });
    }
  }
  return events.sort((a, b) => new Date(a.start) - new Date(b.start));
}

function parseICSDate(str) {
  // Handle both 20260326T140000Z and 20260326 formats
  const clean = str.replace(/^.*[:=]/, '');
  if (clean.length >= 15) {
    return `${clean.slice(0,4)}-${clean.slice(4,6)}-${clean.slice(6,8)}T${clean.slice(9,11)}:${clean.slice(11,13)}:${clean.slice(13,15)}Z`;
  }
  if (clean.length >= 8) {
    return `${clean.slice(0,4)}-${clean.slice(4,6)}-${clean.slice(6,8)}`;
  }
  return str;
}

export default { subscribe, events };
