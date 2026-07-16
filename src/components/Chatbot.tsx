import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, X, User, Bot, HelpCircle, RefreshCw } from "lucide-react";
import { ChatMessage, User as UserType } from "../types";

interface ChatbotProps {
  user: UserType | null;
}

export default function Chatbot({ user }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "bot",
      text: `Namaste${user ? ' ' + user.name : ''}! I am RuralMind AI Advisor. I can help you evaluate government welfare schemes, file a public utility complaint, check development projects, or guide you regarding Panchayat office timings. What would you like to ask today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const presets = [
    { text: "How do I file a water complaint?", label: "File Complaint" },
    { text: "What are the rules for PMKSY agriculture subsidy?", label: "PMKSY Subsidy" },
    { text: "Check status of Ward 2 Borewell motor", label: "Borewell Pump Status" },
    { text: "Who is my Taluk Headquarters engineer?", label: "Officer Contacts" }
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `m-usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          userProfile: user,
          history: messages.map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text }))
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg: ChatMessage = {
          id: `m-bot-${Date.now()}`,
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error();
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `m-bot-err-${Date.now()}`,
        sender: "bot",
        text: "My neural connection was interrupted. Please ensure the backend server is running correctly or try again shortly.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-all group border-2 border-emerald-500/20"
        id="chatbot-trigger"
      >
        <MessageSquare className="w-6 h-6 animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-xs font-bold uppercase tracking-wider block">
          AI Assist
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 w-80 md:w-96 h-[500px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-slide-up"
          id="chatbot-window"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-950 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-white/10 border border-white/20">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-xs md:text-sm">RuralMind AI Advisor</h4>
                <p className="text-[9px] text-slate-400">Powered by Gemini 3.5</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-rose-400 p-1 font-mono text-sm"
            >
              ✕
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950 text-xs">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-2 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`p-1.5 rounded-lg shrink-0 h-fit ${
                  m.sender === "user" ? "bg-emerald-100 text-emerald-800" : "bg-teal-900 text-emerald-300"
                }`}>
                  {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Text Bubble */}
                <div className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  m.sender === "user" 
                    ? "bg-emerald-600 text-white rounded-tr-none" 
                    : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-sm"
                }`}>
                  {m.text}
                  <span className={`block text-[8px] mt-1 text-right ${m.sender === "user" ? "text-white/60" : "text-slate-400"}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 max-w-[80%] mr-auto">
                <div className="p-1.5 rounded-lg bg-teal-900 text-emerald-300 shrink-0 h-fit">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 text-slate-400 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-850 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                  <span>AI Advisor is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Presets */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.text)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-[9px] font-bold text-slate-600 dark:text-slate-300 transition-all shrink-0 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
            className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-2"
          >
            <input
              type="text"
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about Kuttanad development..."
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-850 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
