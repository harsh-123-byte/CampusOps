"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles,
  Bot,
  Send,
  X,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  GraduationCap,
  Clock,
  FileText,
  Search,
  Loader2,
  PanelRightClose,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  provider?: string;
  suggestions?: string[];
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onToggle?: () => void;
}

// Simple lightweight markdown parser for clean chat formatting
function FormattedChatText({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Horizontal divider
        if (trimmed === "---" || trimmed === "***") {
          return <hr key={idx} className="my-2 border-slate-200" />;
        }

        // Headers
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-slate-900 mt-2 mb-1 text-sm">
              {renderInline(trimmed.replace("### ", ""))}
            </h4>
          );
        }
        if (trimmed.startsWith("#### ")) {
          return (
            <h5 key={idx} className="font-semibold text-slate-800 mt-1.5 mb-0.5 text-xs uppercase tracking-wider">
              {renderInline(trimmed.replace("#### ", ""))}
            </h5>
          );
        }

        // Bullet lists
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          const bulletText = trimmed.replace(/^(\*|-|•)\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
              <span>{renderInline(bulletText)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-blue-600 font-semibold shrink-0 text-xs mt-0.5">{numMatch[1]}.</span>
              <span>{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        // Blockquotes
        if (trimmed.startsWith("> ")) {
          return (
            <div key={idx} className="border-l-2 border-blue-400 pl-2.5 py-1 text-xs text-slate-600 italic bg-blue-50/50 rounded-r">
              {renderInline(trimmed.replace(/^>\s*/, ""))}
            </div>
          );
        }

        // Tables simple render (fallback)
        if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
          const cells = trimmed
            .split("|")
            .filter((c, i, arr) => i > 0 && i < arr.length - 1)
            .map((c) => c.trim());
          if (cells.every((c) => c.match(/^:?-+:?$/))) {
            return null; // Skip markdown separator row
          }
          return (
            <div key={idx} className="grid grid-cols-2 sm:grid-cols-3 gap-1 bg-slate-100/70 p-1.5 rounded text-[11px] font-medium text-slate-700">
              {cells.map((cell, cIdx) => (
                <div key={cIdx} className="truncate">
                  {renderInline(cell)}
                </div>
              ))}
            </div>
          );
        }

        // Regular paragraph
        return <p key={idx}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

// Inline formatting (bold, code, links)
function renderInline(text: string): React.ReactNode {
  // Regex to match **bold**, `code`, and [link](url)
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Check for bold **text**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/);
    // Check for inline code `code`
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)$/);
    // Check for link [text](url)
    const linkMatch = remaining.match(/^(.*?)\[(.+?)\]\((.+?)\)(.*)$/);

    // Pick earliest match
    let firstType: "bold" | "code" | "link" | null = null;
    let firstIdx = Infinity;

    if (boldMatch && boldMatch[1].length < firstIdx) {
      firstType = "bold";
      firstIdx = boldMatch[1].length;
    }
    if (codeMatch && codeMatch[1].length < firstIdx) {
      firstType = "code";
      firstIdx = codeMatch[1].length;
    }
    if (linkMatch && linkMatch[1].length < firstIdx) {
      firstType = "link";
      firstIdx = linkMatch[1].length;
    }

    if (!firstType) {
      parts.push(remaining);
      break;
    }

    if (firstType === "bold" && boldMatch) {
      if (boldMatch[1]) parts.push(boldMatch[1]);
      parts.push(
        <strong key={key++} className="font-semibold text-slate-900">
          {boldMatch[2]}
        </strong>
      );
      remaining = boldMatch[3];
    } else if (firstType === "code" && codeMatch) {
      if (codeMatch[1]) parts.push(codeMatch[1]);
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs text-blue-700 font-medium">
          {codeMatch[2]}
        </code>
      );
      remaining = codeMatch[3];
    } else if (firstType === "link" && linkMatch) {
      if (linkMatch[1]) parts.push(linkMatch[1]);
      const href = linkMatch[3];
      const isInternal = href.startsWith("/");
      if (isInternal) {
        parts.push(
          <Link key={key++} href={href} className="text-blue-600 hover:text-blue-800 underline font-medium">
            {linkMatch[2]}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium inline-flex items-center gap-0.5"
          >
            {linkMatch[2]}
          </a>
        );
      }
      remaining = linkMatch[4];
    }
  }

  return parts;
}

export function AIChatSidebar({ isOpen, onClose, onOpen }: AIChatSidebarProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize initial welcome message
  useEffect(() => {
    if (!user) return;

    const getWelcomeMessage = () => {
      if (user.role === "STUDENT") {
        return `👋 Hi **${user.name}**! I'm your **CampusOps AI Copilot**.\n\nAsk me anything regarding:\n* 🎓 **Scholarships**: Eligibility, government portals (NSP), required documents & deadlines.\n* 📄 **Required Documents**: Checklists for Bonafide, Internship NOC, Event Permissions & Lab Access.\n* ⏱️ **Timelines & SLAs**: How long requests take and stages of approval.\n* 🔍 **Application Tracking**: Check the real-time status of your submitted requests.`;
      } else if (user.role === "FACULTY") {
        return `👋 Welcome Professor **${user.name}**! I'm your **Faculty Review Copilot**.\n\nI can assist you with:\n* 📋 **Verification Guidelines**: What to verify for Bonafide, NOC, and scholarship endorsements.\n* ⏱️ **Turnaround SLAs**: Departmental turnaround timelines & multi-tier approval flows.\n* ✍️ **Action Guidance**: Best practices for approving, requesting revisions, or rejecting requests.\n* 🔍 **Review Queue**: Summarize your pending student applications.`;
      } else {
        return `👋 Welcome Administrator **${user.name}**! I'm your **Operations Assistant**.\n\nI can assist you with:\n* 🛡️ **Institutional Compliance**: Scholarship verification protocols and audit logs.\n* 🏢 **Department Hierarchy**: Managing departments, workflows, and faculty assignments.\n* 📊 **Operational Bottlenecks**: Analysis of request velocity and department turnaround.\n* ⚡ **Live Operations**: Real-time status of campus-wide submissions.`;
      }
    };

    const initialSuggestions =
      user.role === "STUDENT"
        ? [
            "What documents are required for Scholarship?",
            "What is the timeline for Bonafide certificate?",
            "How do I get an NOC for an internship?",
            "Check status of my recent requests",
          ]
        : user.role === "FACULTY"
        ? [
            "What documents to check for Scholarship & Bonafide?",
            "What is the expected approval timeline / SLA?",
            "How do I request revisions from a student?",
            "Summarize my review queue",
          ]
        : [
            "Scholarship verification guidelines & audit rules",
            "Campus approval workflows & SLA matrix",
            "How to manage departments and user roles",
            "Summarize request backlog & bottlenecks",
          ];

    setMessages([
      {
        id: "welcome-msg",
        role: "assistant",
        content: getWelcomeMessage(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions: initialSuggestions,
      },
    ]);
  }, [user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Build conversation history for context
      const history = newMessages
        .filter((m) => m.id !== "welcome-msg")
        .slice(-6)
        .map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("model" as const),
          content: m.content,
        }));

      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          provider: data.provider,
          suggestions: data.suggestions,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: `assistant-err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ ${data.error || "I could not retrieve an answer at this moment. Please try asking again or select one of the suggested prompts."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestions: ["What documents are required for Scholarship?", "What is the timeline for Bonafide certificate?"],
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      const networkErrorMessage: Message = {
        id: `assistant-neterr-${Date.now()}`,
        role: "assistant",
        content: `⚠️ Connection to the campus AI server was interrupted. Please check your network and try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, networkErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (!user) return;
    const initialSuggestions =
      user.role === "STUDENT"
        ? [
            "What documents are required for Scholarship?",
            "What is the timeline for Bonafide certificate?",
            "How do I get an NOC for an internship?",
            "Check status of my recent requests",
          ]
        : user.role === "FACULTY"
        ? [
            "What documents to check for Scholarship & Bonafide?",
            "What is the expected approval timeline / SLA?",
            "How do I request revisions from a student?",
            "Summarize my review queue",
          ]
        : [
            "Scholarship verification guidelines & audit rules",
            "Campus approval workflows & SLA matrix",
            "How to manage departments and user roles",
          ];

    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: "assistant",
        content: `Conversation reset. How can I assist you with **documents**, **timelines**, or **scholarships** today, ${user.name}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions: initialSuggestions,
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating launcher button when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={onOpen || onClose}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 p-2.5 sm:px-3 sm:py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-md border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
          title="Open Campus Copilot"
        >
          <Bot className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">Campus Copilot</span>
        </button>
      )}

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Right Sidebar Container */}
      <aside
        className={cn(
          "bg-white border-l border-slate-200 flex flex-col h-full z-50 shrink-0 shadow-xl lg:shadow-none transition-all duration-200 ease-in-out",
          // Mobile positioning: fixed slide-over
          "fixed inset-y-0 right-0 w-full sm:w-[400px] lg:relative lg:inset-auto",
          // Desktop positioning: clean dockable right sidebar
          isOpen
            ? "translate-x-0 lg:w-[380px] xl:w-[400px]"
            : "translate-x-full lg:hidden lg:w-0 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-slate-900 text-blue-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 text-sm truncate">Campus Copilot</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate leading-none mt-0.5">
                {user?.role === "STUDENT"
                  ? "Student Concierge"
                  : user?.role === "FACULTY"
                  ? "Faculty Review Copilot"
                  : "Operations Assistant"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Close panel"
            >
              <PanelRightClose className="w-4 h-4 hidden lg:block" />
              <X className="w-4 h-4 lg:hidden" />
            </button>
          </div>
        </div>

        {/* Quick Topics Banner */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="font-medium text-slate-600 truncate">
            Guidance for documents, timelines & policies
          </span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider shrink-0">
            {user?.role}
          </span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
          {messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "max-w-[88%] rounded-lg px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed relative group",
                    isUser
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-800 border border-slate-200/90 shadow-2xs"
                  )}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div>
                      <FormattedChatText content={msg.content} />

                      {/* Copy action on assistant responses */}
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-medium">
                          {msg.provider || "Campus Intelligence"}
                        </span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Timestamp */}
                <span className="text-[10px] text-slate-400 px-1">
                  {msg.timestamp}
                </span>

                {/* Suggested prompt chips underneath assistant messages */}
                {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-0.5 flex flex-wrap gap-1.5 max-w-[95%]">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(sug)}
                        disabled={isLoading}
                        className="text-left text-[11px] leading-tight px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 transition-colors shadow-2xs flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                      >
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing/Thinking Indicator */}
          {isLoading && (
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 shadow-2xs flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                <span className="text-xs text-slate-600">Retrieving campus guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Category Action Chips */}
        <div className="px-3 pt-2 pb-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => handleSendMessage("What documents are required for Scholarship?")}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-[11px] font-medium text-slate-700 shrink-0 transition-colors cursor-pointer"
          >
            <GraduationCap className="w-3 h-3 text-slate-500" />
            Scholarship
          </button>
          <button
            onClick={() => handleSendMessage("What is the timeline and SLA for Bonafide and NOC?")}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-[11px] font-medium text-slate-700 shrink-0 transition-colors cursor-pointer"
          >
            <Clock className="w-3 h-3 text-slate-500" />
            Timelines
          </button>
          <button
            onClick={() => handleSendMessage("Check the status of my recent requests")}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-[11px] font-medium text-slate-700 shrink-0 transition-colors cursor-pointer"
          >
            <Search className="w-3 h-3 text-slate-500" />
            My Requests
          </button>
          <button
            onClick={() => handleSendMessage("What documents do I need for Bonafide and NOC?")}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-[11px] font-medium text-slate-700 shrink-0 transition-colors cursor-pointer"
          >
            <FileText className="w-3 h-3 text-slate-500" />
            Documents
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about documents, timelines, approvals..."
                disabled={isLoading}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-md pl-3 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
              title="Send query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-0.5">
            <span>Powered by Gemini</span>
            <span>Enter to send</span>
          </div>
        </div>
      </aside>
    </>
  );
}
