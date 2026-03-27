let counter = 0;

/** Generates a cuid-like unique ID */
export function createId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  const count = (counter++).toString(36);
  return `c${timestamp}${random}${count}`;
}
