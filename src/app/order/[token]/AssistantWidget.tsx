'use client';
import React, { useEffect, useRef, useState, useTransition } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { askAssistant } from './assistant-actions';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface Props {
  token: string;
  primaryColor: string;
}

export default function AssistantWidget({ token, primaryColor }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isPending]);

  const send = () => {
    const question = input.trim();
    if (!question || isPending) return;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    startTransition(async () => {
      const result = await askAssistant(token, question);
      setMessages((m) => [...m, { role: 'assistant', text: result.answer || result.error || 'Something went wrong.' }]);
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-105"
        style={{ backgroundColor: primaryColor }}
        aria-label={open ? 'Close assistant' : 'Ask a question'}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-sm h-[28rem] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 text-white text-sm font-semibold flex-shrink-0" style={{ backgroundColor: primaryColor }}>
            Ask a question
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-neutral-50">
            {messages.length === 0 && (
              <p className="text-xs text-neutral-400 text-center mt-6 px-4">
                Ask about your products, prices, or recent orders. I can't place or change orders \u2014 use the form for that.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                    m.role === 'user' ? 'text-white rounded-br-sm' : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm'
                  }`}
                  style={m.role === 'user' ? { backgroundColor: primaryColor } : undefined}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex justify-start">
                <div className="bg-white border border-neutral-200 rounded-xl rounded-bl-sm px-3 py-2 text-sm text-neutral-400">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-neutral-200 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a question..."
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-300"
            />
            <button
              onClick={send}
              disabled={isPending || !input.trim()}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white disabled:opacity-50 flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
