'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
  quickReplies?: string[]
}

// No longer need LeadData for grocery store

// No longer need legacy case types.

const INITIAL_MESSAGE: Message = {
  id: '1',
  type: 'bot',
  content: '¡Hola! 🙌 Bienvenido a Súper Tienda El Maná. Soy tu asistente inteligente. \n\n¿En qué puedo ayudarte hoy? Puedo darte información de la tienda o ayudarte a usar el sistema.',
  timestamp: new Date(),
  quickReplies: ['¿Cómo registro una venta?', 'Ver mis ganancias', 'Horarios']
}

// FAQ logic is now handled by AI, but we keep a few quick keywords if needed
const DEFAULT_QUICK_REPLIES = ['¿Cómo funciona?', 'Horarios', 'Ubicación'];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([INITIAL_MESSAGE])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addBotMessage = (content: string, quickReplies?: string[]) => {
    setIsTyping(true)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content,
        timestamp: new Date(),
        quickReplies
      }])
      setIsTyping(false)
    }, 800)
  }

  const handleSend = (text: string = input) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    processUserInput(text.toLowerCase())
  }

  const processUserInput = async (text: string) => {
    setIsTyping(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { id: 'current', type: 'user', content: text, timestamp: new Date() }]
        }),
      })

      const data = await response.json()
      if (data.error) {
        addBotMessage(data.error)
      } else {
        addBotMessage(data.text)
      }
    } catch (error) {
      addBotMessage('Lo siento, tuve un problema al conectarme con el servidor. ¿Podrías intentar de nuevo?')
    } finally {
      setIsTyping(false)
    }
  }

  // Legacy booking flow removed

  const handleQuickReply = (reply: string) => {
    handleSend(reply)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        data-tour="chat-widget"
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary-500 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 transition-all hover:scale-105 z-50"
        aria-label="Abrir chat"
      >
        <ChatIcon className="w-7 h-7 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-500 rounded-full animate-pulse" />
      </button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] flex flex-col shadow-2xl z-50 animate-scale-in overflow-hidden">
      {/* Header */}
      <div className="bg-primary-500 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center shadow-lg shadow-secondary-500/20">
            <ShopIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Súper Tienda El Maná Asistente</h3>
            <p className="text-xs text-white/70">En línea</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Knowledge Disclaimer Removal - Bot is now smarter */}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.type === 'user'
                ? 'bg-primary-500 text-white rounded-br-md'
                : 'bg-white shadow-sm rounded-bl-md'
                }`}
            >
              <p className="text-sm whitespace-pre-line">{message.content}</p>
              <p className={`text-[10px] mt-1 ${message.type === 'user' ? 'text-white/60' : 'text-foreground-muted'
                }`}>
                {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Quick Replies */}
        {messages.length > 0 && messages[messages.length - 1].quickReplies && (
          <div className="flex flex-wrap gap-2">
            {messages[messages.length - 1].quickReplies!.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleQuickReply(reply)}
                className="px-4 py-2 bg-white border border-primary-200 text-primary-600 rounded-full text-sm hover:bg-primary-50 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <Button type="submit" disabled={!input.trim() || isTyping}>
            <SendIcon className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </Card>
  )
}

// Icons
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function ShopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}
