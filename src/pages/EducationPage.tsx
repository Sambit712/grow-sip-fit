/**
 * EducationPage.tsx
 *
 * Contextual AI Education Assistant Page (Phase 5).
 * Conversational learning interface with browseable topic chips,
 * profile-personalized insights, and strict compliance guardrails.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFinancialProfileStore } from '../store/useFinancialProfileStore';
import { DEMO_PROFILES } from '../data/demoProfiles';
import type { FinancialProfile } from '../types/FinancialProfile';
import { EDUCATIONAL_TOPICS, askEducationalQuestion } from '../ai/educationService';
import { track } from '../utils/analytics';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  topicId?: string;
}

export const EducationPage: React.FC = () => {
  const { profile, setProfile } = useFinancialProfileStore();
  const activeProfile = profile || DEMO_PROFILES[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I'm your Groww investment education companion. I can help demystify mutual funds, NAV, SIP continuity, and market volatility.\n\nEverything here is tailored to help you build disciplined financial readiness${
        activeProfile.goal.purpose
          ? ` for your goal of "${activeProfile.goal.purpose}"`
          : ''
      }. Select any topic below or ask your own question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string, topicId?: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isTyping) return;

    // Track analytics event
    track('AI_question_asked', {
      topic: topicId || trimmed.substring(0, 30),
      userId: activeProfile.userId,
    });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topicId,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await askEducationalQuestion(trimmed, activeProfile);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue processing your question. Please try asking again or select one of the topics above.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-lg">
                G
              </div>
              <span className="hidden sm:inline">Groww SIP Fit</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-700">AI Education Assistant</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:inline">Personalizing for:</span>
            <select
              value={activeProfile.id}
              onChange={(e) => {
                const found = DEMO_PROFILES.find((p: FinancialProfile) => p.id === e.target.value);
                if (found) setProfile(found);
              }}
              className="text-xs font-semibold bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {DEMO_PROFILES.map((p: FinancialProfile) => (
                <option key={p.id} value={p.id}>
                  {p.goal.purpose}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col w-full">
        {/* Context Strip */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 mb-4 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <span>
              Target Goal: <strong>{activeProfile.goal.purpose}</strong> (Horizon:{' '}
              <strong>{activeProfile.goal.horizonYears} years</strong>, Target:{' '}
              <strong>₹{activeProfile.goal.targetAmount.toLocaleString('en-IN')}</strong>)
            </span>
          </div>
          <Link
            to="/payment-help"
            className="font-bold text-emerald-700 hover:text-emerald-800 underline hidden sm:inline"
          >
            Payment Troubleshooter →
          </Link>
        </div>

        {/* Topic Chips Carousel / Grid */}
        <div className="mb-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Browse Frequently Asked Concepts (Click to ask):
          </div>
          <div className="flex flex-wrap gap-2">
            {EDUCATIONAL_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleSendMessage(topic.fullQuestion, topic.id)}
                disabled={isTyping}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition shadow-2xs disabled:opacity-50"
              >
                {topic.chipLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 overflow-y-auto mb-4 flex flex-col space-y-4 min-h-[380px] shadow-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-gray-100 text-gray-900 rounded-bl-xs border border-gray-200/60'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    m.sender === 'user' ? 'text-emerald-100' : 'text-gray-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200/60 rounded-bl-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question (e.g. 'What is Rupee Cost Averaging?' or 'Can I stop my SIP?')..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            Ask
          </button>
        </form>

        {/* Compliance Footer Disclaimer */}
        <p className="text-[11px] text-gray-400 text-center mt-3">
          Groww SIP Fit is an educational readiness guide. We do not provide specific mutual fund or stock recommendations, nor do we promise financial returns. Mutual fund investments are subject to market risks.
        </p>
      </main>
    </div>
  );
};
