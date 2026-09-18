import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { Button, IconButton } from '../components/common/Button.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { Card } from '../components/common/Card.jsx';
import { AIMessage, AIThinking } from '../components/ai/AIMessage.jsx';
import { PromptSuggestions } from '../components/ai/PromptSuggestions.jsx';
import { ContextSelector } from '../components/ai/ContextSelector.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useAuth } from '../context/AuthContext.jsx';
import { cn } from '../utils/cn.js';
import { fileAPI, geminiAPI, notesAPI, projectAPI } from '../services/api.js';

export default function AIAssistant() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [context, setContext] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);

  const projects = useAsync(() => projectAPI.list(), []);
  const notes = useAsync(() => notesAPI.list(), []);
  const files = useAsync(() => fileAPI.list(), []);

  const contextOptions = useMemo(
    () => [
      ...(projects.data || []).slice(0, 5).map((p) => ({ type: 'project', id: p._id, label: p.name })),
      ...(notes.data || []).slice(0, 5).map((n) => ({ type: 'note', id: n._id, label: n.title })),
      ...(files.data || []).slice(0, 5).map((f) => ({ type: 'file', id: f._id, label: f.name })),
    ],
    [projects.data, notes.data, files.data]
  );

  useEffect(() => {
    const raw = params.get('context');
    if (!raw || !contextOptions.length) return;
    const [type, id] = raw.split(':');
    const match = contextOptions.find((o) => o.type === type && o.id === id);
    if (match) setContext(match);
  }, [params, contextOptions]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const openConversation = (conversation) => {
    setActiveId(conversation._id);
    setMessages(conversation.messages);
    setContext(conversation.context || null);
    setSidebarOpen(false);
  };

  const newConversation = () => {
    setActiveId(null);
    setMessages([]);
    setDraft('');
    setSidebarOpen(false);
  };

  const send = async (prompt) => {
    const text = (prompt ?? draft).trim();
    if (!text || thinking) return;
    const userMessage = { id: `u_${Date.now()}`, role: 'user', content: text, at: new Date().toISOString() };
    setMessages((m) => [...m, userMessage]);
    setDraft('');
    setThinking(true);
    try {
      const reply = await geminiAPI.chat({ prompt: text, context, history: messages });
      setMessages((m) => [...m, reply]);
    } finally {
      setThinking(false);
    }
  };

  const regenerate = async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser || thinking) return;
    // Drop the previous exchange, then ask the same question again.
    let trimmed = messages;
    if (trimmed[trimmed.length - 1]?.role === 'assistant') trimmed = trimmed.slice(0, -1);
    if (trimmed[trimmed.length - 1]?.role === 'user') trimmed = trimmed.slice(0, -1);
    setMessages(trimmed);
    await send(lastUser.content);
  };

  return (
    <AppLayout fullBleed>
      <div className="flex h-[calc(100vh-4rem)] min-h-0">
        {/* Conversation history */}
        <aside
          className={cn(
            'w-[260px] shrink-0 flex-col border-r border-line bg-surface',
            sidebarOpen ? 'absolute inset-y-16 left-0 z-40 flex' : 'hidden lg:flex'
          )}
        >
          <div className="p-3">
            <Button variant="secondary" icon="plus" fullWidth onClick={newConversation}>
              New conversation
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            <p className="px-2 py-1.5 text-[11.5px] text-faint">Recent</p>
            {conversations.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => openConversation(c)}
                className={cn(
                  'flex w-full flex-col gap-0.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                  activeId === c._id ? 'bg-raised' : 'hover:bg-raised'
                )}
              >
                <span className="truncate text-[13px] text-ink">{c.title}</span>
                <span className="flex items-center gap-1.5 text-[11px] text-faint">
                  <Icon name={c.context?.type === 'file' ? 'file' : c.context?.type === 'note' ? 'note' : 'folder'} size={10} />
                  <span className="truncate">{c.context?.label}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <IconButton icon="panelLeft" label="Conversations" className="lg:hidden" onClick={() => setSidebarOpen((o) => !o)} />
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-[15px] font-semibold text-ink">
                {activeId ? conversations.find((c) => c._id === activeId)?.title : 'New conversation'}
              </h1>
            </div>
            <ContextSelector context={context} options={contextOptions} onChange={setContext} />
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
            <div className="mx-auto max-w-3xl">
              {messages.length === 0 && !thinking && (
                <div className="flex flex-col items-center px-2 py-12 text-center sm:py-20">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface text-ai">
                    <Icon name="sparkles" size={22} />
                  </span>
                  <h2 className="mt-5 font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">
                    What should I look at?
                  </h2>
                  <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted">
                    Set a project, note or file as context and ask. Answers come back grounded in that content, and
                    nothing is saved until you copy it somewhere.
                  </p>
                  <PromptSuggestions className="mt-7 justify-center" onSelect={send} />
                </div>
              )}

              {messages.map((message, i) => (
                <AIMessage
                  key={message.id || i}
                  message={message}
                  user={user}
                  isLast={i === messages.length - 1}
                  onRegenerate={regenerate}
                />
              ))}

              {thinking && <AIThinking />}
            </div>
          </div>

          <div className="border-t border-line px-4 py-3">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-end gap-2 rounded-xl border border-line bg-surface p-2 transition-colors focus-within:border-lineStrong">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder={context ? `Ask about ${context.label}…` : 'Ask anything about your projects…'}
                  className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-[14px] leading-relaxed text-ink placeholder:text-faint focus:outline-none"
                />
                <Button
                  variant="primary"
                  size="sm"
                  icon="send"
                  onClick={() => send()}
                  disabled={!draft.trim() || thinking}
                  className="mb-0.5"
                >
                  Send
                </Button>
              </div>
              <p className="mt-2 text-center text-[11.5px] text-faint">
                Responses are generated server-side through the CollabSphere Gemini API.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
