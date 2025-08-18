import * as React from 'react';

export type NotifyFn = (msg: string) => void;

const NotificationContext = React.createContext<NotifyFn>(() => {});

export function useNotifier() {
  return React.useContext(NotificationContext);
}

let externalNotifier: NotifyFn = () => {};

export function setNotifier(fn: NotifyFn) {
  externalNotifier = fn;
}

export function notify(msg: string) {
  externalNotifier(msg);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<string[]>([]);

  const notify = React.useCallback((msg: string) => {
    setMessages((m) => [...m, msg]);
    setTimeout(() => {
      setMessages((m) => m.slice(1));
    }, 3000);
  }, []);

  React.useEffect(() => {
    setNotifier(notify);
  }, [notify]);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <div aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} role="status">{m}</div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
