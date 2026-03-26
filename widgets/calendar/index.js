/**
 * Widget Calendar — receive events and expose them for the UI
 */

let currentEvents = [];

export function render(events) {
  if (Array.isArray(events)) {
    currentEvents = events;
  } else if (events?.events) {
    currentEvents = events.events;
  }
  return { success: true, count: currentEvents.length };
}

export function get_events() {
  return { events: currentEvents };
}

export default { render, get_events };
