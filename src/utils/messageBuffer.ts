const messageBuffers: Map<string, string[]> = new Map();

export function addMessage(channelId: string, message: string) {
  const buffer = messageBuffers.get(channelId) || [];
  buffer.push(message);
  if (buffer.length > 1000) buffer.shift();
  messageBuffers.set(channelId, buffer);
}

export function getBuffer(channelId: string): string[] | undefined {
  return messageBuffers.get(channelId);
}

export function clearBuffer(channelId: string) {
  messageBuffers.set(channelId, []);
}
