import { createContext, useContext } from 'react';

export const FieldErrorMessages = createContext<string[]>([]);

export function FieldError({ id, message }: { id: string; message?: string }) {
  const messages = useContext(FieldErrorMessages);

  return (
    <div className="grid text-sm text-destructive">
      {messages.map((text) => (
        <span key={text} aria-hidden="true" className="invisible col-start-1 row-start-1">{text}</span>
      ))}
      <p id={id} aria-live="polite" className="col-start-1 row-start-1">{message}</p>
    </div>
  );
}
