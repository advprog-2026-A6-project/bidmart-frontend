const API_BASE = (
  import.meta.env.VITE_ORDER_NOTIFICATION_API_BASE ||
  import.meta.env.VITE_API_GATEWAY_BASE ||
  import.meta.env.VITE_GATEWAY_URL ||
  ''
).trim().replace(/\/$/, '');

const explicitWsBase = (import.meta.env.VITE_ORDER_NOTIFICATION_WS_BASE || '').trim().replace(/\/$/, '');

const resolveWsBase = () => {
  if (explicitWsBase) {
    return explicitWsBase;
  }

  if (!API_BASE || API_BASE.startsWith('/')) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }

  try {
    const apiUrl = new URL(API_BASE);
    return `${apiUrl.protocol === 'https:' ? 'wss:' : 'ws:'}//${apiUrl.host}`;
  } catch {
    return API_BASE.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
  }
};

const createSockJsUrl = () => {
  const sessionId = Math.random().toString(36).slice(2, 10);
  return `${resolveWsBase()}/ws/000/${sessionId}/websocket`;
};

const decodeSockJsMessages = (data) => {
  if (typeof data !== 'string' || data === 'o' || data === 'h') {
    return [];
  }

  if (!data.startsWith('a')) {
    return [data];
  }

  try {
    return JSON.parse(data.slice(1));
  } catch {
    return [];
  }
};

const parseStompBody = (frame) => {
  const bodyStart = frame.indexOf('\n\n');
  if (bodyStart < 0) {
    return null;
  }

  const body = frame.slice(bodyStart + 2).replace(/\0$/, '');
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
};

export const subscribeToOrderNotificationTopic = (destination, onMessage) => {
  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
    return () => {};
  }

  const socket = new WebSocket(createSockJsUrl());
  const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let connected = false;

  const sendFrame = (frame) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify([`${frame}\0`]));
    }
  };

  socket.onmessage = (event) => {
    decodeSockJsMessages(event.data).forEach((frame) => {
      if (frame.startsWith('CONNECTED')) {
        connected = true;
        sendFrame(`SUBSCRIBE\nid:${subscriptionId}\ndestination:${destination}\nack:auto\n\n`);
        return;
      }

      if (frame.startsWith('MESSAGE')) {
        onMessage(parseStompBody(frame));
      }
    });
  };

  socket.onopen = () => {
    sendFrame('CONNECT\naccept-version:1.2\nheart-beat:10000,10000\n\n');
  };

  return () => {
    if (connected) {
      sendFrame(`UNSUBSCRIBE\nid:${subscriptionId}\n\n`);
      sendFrame('DISCONNECT\n\n');
    }
    socket.close();
  };
};
