/**
 * Widget Chat — manage conversation messages
 */

let messages = [];

export function message(text, role = 'agent') {
  const msg = {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    text,
    role,
    timestamp: new Date().toISOString(),
  };
  messages.push(msg);
  return { success: true, message: msg };
}

export function get_messages() {
  return { messages };
}

export function clear() {
  messages = [];
  return { success: true };
}

export default { message, get_messages, clear };
