import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import {
  MessageSquare,
  Send,
  Cpu,
  CornerDownLeft,
  RefreshCw,
  Sparkles,
  Bot
} from 'lucide-react';

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your SHEMS AI Operations Assistant. I monitor real-time microgrids, Scikit-learn predictive models, and SQLite/MySQL database metrics. How can I help you optimize hospital energy consumption today?",
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const samplePrompts = [
    "Which department consumes the most energy?",
    "Predict tomorrow's energy usage.",
    "Show active anomalies.",
    "Show HVAC efficiency."
  ];

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Direct call to API ask endpoint
      const response = await api.askAssistant(textToSend);
      
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: `Error: ${err.message || 'Unable to connect to AI engine.'}`,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Header */}
      <div className="flex-none">
        <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
          <Bot className="text-clinical-500" />
          <span>SHEMS Copilot AI Assistant</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Interact with live database tables, request ML forecasts, and audit anomalies using natural language.
        </p>
      </div>

      {/* Chat Harvester Shell */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar suggestions */}
        <div className="lg:col-span-1 glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hidden lg:flex">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-3">AI Quick Directives</span>
            <div className="space-y-2.5">
              {samplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left text-xs font-semibold p-3 bg-slate-100 dark:bg-slate-800/30 hover:bg-slate-200 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800/40 rounded-xl transition-all duration-200 flex items-start gap-2 group text-slate-600 dark:text-slate-300"
                >
                  <Sparkles size={14} className="text-clinical-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-clinical-500/5 border border-clinical-500/20 rounded-xl">
            <h4 className="text-[10px] font-extrabold uppercase text-clinical-400 flex items-center gap-1.5">
              <Cpu size={12}/>
              <span>BEMS Query Logic</span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Questions are converted into fast SQLAlchemy database queries checking average department counts, alerts, and model prediction metrics.
            </p>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="lg:col-span-3 glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden bg-white/40 dark:bg-slate-900/10 shadow-sm relative">
          
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div key={msg.id} className={`flex items-start gap-3 ${!isAssistant ? 'flex-row-reverse' : ''}`}>
                  
                  {/* Avatar icon */}
                  <div className={`p-2 rounded-xl shrink-0 ${isAssistant ? 'bg-clinical-600/10 text-clinical-400 border border-clinical-500/20' : 'bg-slate-700 text-white'}`}>
                    {isAssistant ? <Bot size={16} /> : <MessageSquare size={16} />}
                  </div>

                  {/* Message bubble */}
                  <div className="max-w-[75%] space-y-1">
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isAssistant 
                        ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-800/10' 
                        : 'bg-gradient-to-r from-clinical-600 to-clinical-500 text-white font-semibold'
                    }`}>
                      {/* Render line breaks or simple markdown */}
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                    <span className={`text-[9px] text-slate-400 block ${!isAssistant ? 'text-right' : ''}`}>{msg.timestamp}</span>
                  </div>

                </div>
              );
            })}

            {/* Loading / Typing indicator */}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-clinical-600/10 text-clinical-400 border border-clinical-500/20 rounded-xl animate-pulse">
                  <Bot size={16} />
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/10 rounded-2xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-clinical-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-clinical-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-clinical-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Form input */}
          <div className="flex-none p-4 border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30">
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask me about highest consumers, forecasts, anomalies, HVAC status..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-clinical-500 text-xs font-medium placeholder-slate-400 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="px-4 bg-clinical-600 hover:bg-clinical-500 disabled:bg-slate-700 text-white rounded-xl shadow-md transition-all flex items-center justify-center shrink-0 border border-clinical-500/20"
              >
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AIAssistant;
