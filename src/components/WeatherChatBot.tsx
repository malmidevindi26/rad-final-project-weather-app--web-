import React, { useState, useRef, useEffect } from "react";
import { askChatBot } from "../service/weather";

interface ChatBotProps{
    currentCity?: string
}

export const WeatherChatBot: React.FC<ChatBotProps> = ({currentCity}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{sender: "user" | "bot"; text:String}[]>([
        {sender: "bot", text:"👋 Hi! I'm SkyAI. Ask me anything about today's weather plans!" }
    ])

    const [input, setInput] = useState("")
    const[loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null)

    // automatically scroll the ui when fetch new msg
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messages, isOpen])

    const handleSend = async (e: React.FormEvent) =>{
        e.preventDefault()
        if(!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput("")
        setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
        setLoading(true)

        try {
            const data = await askChatBot(userMsg, currentCity)
            setMessages((prev) => [...prev, { sender: "bot", text: data.reply }])
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {sender:"bot", text: "❌ Oops! Something went wrong. Please check your connection." }
            ])
        }finally{
            setLoading(false)
        }
    }

    return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Button Toggle */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center text-2xl border border-white/20 animate-bounce"
        >
          💬
        </button>
      )}

      {/* Actual Chat Window */}
      {isOpen && (
        <div className="bg-white w-[340px] h-[450px] rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <div>
                <h4 className="font-extrabold text-sm tracking-wide">SkyAI Assistant</h4>
                <p className="text-[10px] text-blue-100">Online & Ready</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 font-bold text-sm cursor-pointer px-2 py-1 rounded-lg hover:bg-white/10 transition"
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-xs font-medium shadow-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-400 p-3 rounded-2xl text-xs border border-gray-100 rounded-tl-none italic animate-pulse">
                  SkyAI is thinking...🤔
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Ask about trips, clothes, weather..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-slate-50 text-xs px-3 py-2.5 rounded-xl text-gray-700 border border-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white px-3 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 transition active:scale-95 disabled:bg-gray-200 cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}