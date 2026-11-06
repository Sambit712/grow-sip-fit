import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessmentStore } from '../store/useAssessmentStore';
import { useFinancialProfileStore } from '../store/useFinancialProfileStore';
import { useReportStore } from '../store/useReportStore';
import { createConversationEngine, ASSESSMENT_QUESTIONS } from '../ai';
import { ProgressBar } from '../components/ui/ProgressBar';
import { QuickReplyChips } from '../components/ui/QuickReplyChips';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { formatINR } from '../validation/currencyParser';
import { track } from '../utils/analytics';
import type { FinancialProfile } from '../types/FinancialProfile';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Edit2,
  BookmarkCheck,
  CheckCircle,
  FileText,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    session,
    messages,
    currentCategory,
    stepIndex,
    collectedData,
    isTyping,
    startSession,
    addMessage,
    updateCollectedData,
    setIsTyping,
    editAnswer,
    completeSession,
    resetSession,
  } = useAssessmentStore();

  const { updateProfile } = useFinancialProfileStore();
  const { generateReport } = useReportStore();

  const [engine] = useState(() => createConversationEngine());
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInputVal, setEditInputVal] = useState('');
  const [customTextInput, setCustomTextInput] = useState('');

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // If session is active and no messages yet, fire the first question
  useEffect(() => {
    if (session && session.status === 'in_progress' && messages.length === 0) {
      const firstQ = ASSESSMENT_QUESTIONS[0];
      addMessage({
        id: `msg-${Date.now()}-0`,
        sessionId: session.id,
        sender: 'assistant',
        content: firstQ.text,
        quickReplies: firstQ.quickReplies,
        category: firstQ.category,
        stepIndex: 0,
        timestamp: new Date().toISOString(),
        dataKey: firstQ.dataKey,
      });
    }
  }, [session, messages.length, addMessage]);

  const handleStart = () => {
    startSession();
  };

  const handleUserReply = async (replyText: string) => {
    if (!session) return;

    // Analytics: track question answered
    track('Assessment_question_answered', {
      category: currentCategory,
      stepIndex,
      userId: session.userId,
    });

    // 1. Record User Message
    const userMsgId = `user-msg-${Date.now()}`;
    addMessage({
      id: userMsgId,
      sessionId: session.id,
      sender: 'user',
      content: replyText,
      category: currentCategory,
      stepIndex,
      timestamp: new Date().toISOString(),
      canEdit: true,
    });

    setIsTyping(true);

    try {
      // 2. Call Conversation Engine
      const reply = await engine.generateReply(session, replyText);

      // 3. Update collected state
      if (reply.extractedData) {
        updateCollectedData(reply.extractedData);
        updateProfile(reply.extractedData);
      }

      // 4. Record Assistant Message
      if (reply.isComplete) {
        completeSession();
        track('Assessment_completed', {
          userId: session.userId,
          durationMs: Date.now() - new Date(session.startedAt).getTime(),
        });
      }

      addMessage({
        id: `ast-msg-${Date.now()}`,
        sessionId: session.id,
        sender: 'assistant',
        content: reply.message,
        quickReplies: reply.quickReplies,
        category: reply.nextCategory || currentCategory,
        stepIndex: reply.stepIndex ?? stepIndex + 1,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleEditSubmit = (msgId: string) => {
    if (!editInputVal.trim()) return;
    editAnswer(msgId, editInputVal.trim());
    setEditingMessageId(null);
    setEditInputVal('');
  };

  const handleGenerateReport = () => {
    // Sync full profile and generate report
    const fullProfile = collectedData as FinancialProfile;
    generateReport(fullProfile, [], session?.id);
    navigate('/report');
  };

  // ── VIEW 1: OPENING WELCOME SCREEN ─────────────────────────────────────
  if (!session || session.status === 'not_started') {
    const hasExistingSession = session && (session.status as string) === 'in_progress';

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
        <div className="max-w-xl w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-5">
            <Sparkles size={24} />
          </div>

          <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full mb-3">
            Pre-Investment Checkpoint
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
            Groww SIP Fit Readiness Assessment
          </h1>

          <div className="space-y-4 text-gray-600 text-sm leading-relaxed mb-6">
            <p className="text-base text-gray-800 font-medium">
              Before you begin investing, let's understand your financial situation.
            </p>
            <p>
              We'll help you evaluate your monthly financial commitments, available savings, and investment goals so that you can make an informed decision about starting an SIP without risking essential needs.
            </p>
            <div className="p-3.5 bg-slate-50 border border-gray-200 rounded-xl flex items-start gap-3 text-xs text-gray-600">
              <Clock className="text-emerald-600 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-semibold text-gray-800">Duration: </span>
                This assessment takes approximately 3–5 minutes. (This is a proposed design target, not a guaranteed completion time.)
              </div>
            </div>
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-3 text-xs text-emerald-900">
              <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-semibold text-emerald-950">Privacy Guarantee: </span>
                We never request PAN, OTP, bank passwords, or raw bank credentials. All inputs are used solely for affordability modeling.
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleStart}
              className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Start Readiness Assessment</span>
              <ArrowRight size={16} />
            </button>

            {hasExistingSession && (
              <button
                onClick={() => {}}
                className="py-3 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-1.5"
              >
                <BookmarkCheck size={16} />
                <span>Resume Previous</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW 2: COMPLETION SCREEN ──────────────────────────────────────────
  if (session.status === 'completed') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
        <div className="max-w-xl w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 mx-auto">
            <CheckCircle size={32} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Assessment Completed!
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Thank you for providing your financial details. Our deterministic calculation engine has analyzed your cash flows and reserve position.
          </p>

          {/* Quick Summary Grid */}
          <div className="bg-slate-50 rounded-xl border border-gray-200 p-4 mb-6 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Financial Goal</span>
              <span className="font-semibold text-gray-900">{collectedData.goal?.purpose || 'Not specified'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Monthly Take-Home</span>
              <span className="font-semibold text-gray-900">
                {collectedData.income?.monthlyTakeHome ? formatINR(collectedData.income.monthlyTakeHome) : '₹0'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Housing / Rent</span>
              <span className="font-semibold text-gray-900">
                {formatINR(collectedData.expenses?.rent ?? 0)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 font-medium">Emergency Savings</span>
              <span className="font-semibold text-gray-900">
                {formatINR(collectedData.savings?.accessibleEmergencyFund ?? 0)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleGenerateReport}
              className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <FileText size={18} />
              <span>Generate My Financial Report</span>
            </button>

            <button
              onClick={resetSession}
              className="w-full py-2.5 px-4 text-gray-600 hover:text-gray-900 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw size={14} />
              <span>Retake Assessment</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW 3: LIVE CONVERSATION CHAT ─────────────────────────────────────
  const currentQ = ASSESSMENT_QUESTIONS[stepIndex] || ASSESSMENT_QUESTIONS[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky Progress Bar */}
      <ProgressBar
        currentCategory={currentCategory}
        stepIndex={stepIndex}
        totalSteps={ASSESSMENT_QUESTIONS.length}
      />

      {/* Chat Thread Container */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col justify-between">
        <div className="space-y-4 mb-4">
          {messages.map((msg) => {
            const isAssistant = msg.sender === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
              >
                {isAssistant && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                    SIP
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-md ${isAssistant ? '' : 'text-right'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`inline-block p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-xs text-left ${
                      isAssistant
                        ? 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs'
                        : 'bg-emerald-600 text-white rounded-tr-xs'
                    }`}
                  >
                    {editingMessageId === msg.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editInputVal}
                          onChange={(e) => setEditInputVal(e.target.value)}
                          className="px-2 py-1 bg-white text-gray-800 rounded border border-gray-300 text-xs"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingMessageId(null)}
                            className="px-2 py-0.5 text-xs text-gray-200 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditSubmit(msg.id)}
                            className="px-2.5 py-0.5 bg-white text-emerald-800 rounded text-xs font-semibold"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p>{msg.content}</p>

                        {/* Edit option for prior user replies */}
                        {!isAssistant && msg.canEdit && (
                          <button
                            onClick={() => {
                              setEditingMessageId(msg.id);
                              setEditInputVal(msg.content);
                            }}
                            className="text-[11px] text-emerald-200 hover:text-white flex items-center gap-1 mt-1 opacity-80 hover:opacity-100 transition-opacity"
                          >
                            <Edit2 size={11} />
                            <span>Edit answer</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                SIP
              </div>
              <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock Area */}
        <div className="sticky bottom-4 w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-md">
          {currentQ.inputType === 'currency' ? (
            <CurrencyInput
              placeholder={currentQ.placeholder}
              sensitivityNote={currentQ.sensitivityNote}
              onSubmit={handleUserReply}
              disabled={isTyping}
            />
          ) : currentQ.inputType === 'quick_reply' && currentQ.quickReplies ? (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                Choose an option:
              </span>
              <QuickReplyChips
                options={currentQ.quickReplies}
                onSelect={handleUserReply}
                disabled={isTyping}
              />
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customTextInput.trim()) {
                  handleUserReply(customTextInput.trim());
                  setCustomTextInput('');
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={customTextInput}
                disabled={isTyping}
                onChange={(e) => setCustomTextInput(e.target.value)}
                placeholder="Type your answer..."
                className="flex-1 px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isTyping || !customTextInput.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              >
                Send
              </button>
            </form>
          )}

          {/* Bottom Utility Bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 mt-3">
            <span className="flex items-center gap-1 text-[11px]">
              <AlertCircle size={12} className="text-gray-400" />
              <span>Deterministic calculation verified</span>
            </span>

            <button
              onClick={() => {
                // Keep session saved in localStorage and navigate home
                navigate('/');
              }}
              className="text-gray-500 hover:text-emerald-700 font-medium transition-colors"
            >
              Save & Resume Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
