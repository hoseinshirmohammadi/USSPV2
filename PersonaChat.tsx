
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Card } from '../components/atoms/Card';
import { PERSONA_CHAT_DATA, SEND_ICON, AI_ASSISTANT_ICON } from '../constants';
import { PersonaType, MessageType } from '../types';
import { Icon } from '../components/atoms/Icon';

const PersonaSelector: React.FC<{ onSelect: (persona: PersonaType) => void; activePersonaId?: string }> = ({ onSelect, activePersonaId }) => (
    <div className="space-y-3">
        {PERSONA_CHAT_DATA.map(persona => (
            <button key={persona.id} onClick={() => onSelect(persona)} className={`w-full flex items-center p-3 rounded-lg text-right transition-colors duration-200 ${activePersonaId === persona.id ? 'bg-primary/20' : 'hover:bg-white/10'}`}>
                <img src={persona.avatarUrl} alt={persona.name} className="w-12 h-12 rounded-full"/>
                <div className="me-4">
                    <p className="font-bold text-white">{persona.name}</p>
                    <p className="text-xs text-gray-400">{persona.title}</p>
                </div>
            </button>
        ))}
    </div>
);

const ChatWindow: React.FC<{ 
    persona: PersonaType, 
    messages: MessageType[], 
    onSendMessage: (text: string) => void,
    isLoading: boolean,
    error: string | null
}> = ({ persona, messages, onSendMessage, isLoading, error }) => {
    const [inputValue, setInputValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputValue]);
    
    const handleSend = () => {
        if (inputValue.trim() && !isLoading) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full">
             <div className="flex-grow p-6 overflow-y-auto space-y-4">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`chat-bubble ${message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-persona'}`}>
                            <p className="whitespace-pre-wrap">{message.text}</p>
                        </div>
                    </div>
                ))}
                
                {isLoading && messages[messages.length - 1]?.sender === 'user' && (
                    <div className="flex justify-start">
                        <div className="chat-bubble chat-bubble-persona flex items-center justify-center p-3">
                           <Icon svg={AI_ASSISTANT_ICON} className="w-5 h-5 animate-spin text-primary"/>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="flex justify-start">
                        <div className="chat-bubble bg-red-500/20 text-red-300">
                           <p>{error}</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
    
            <div className="p-4 border-t border-white/10">
                <div className="relative flex items-end">
                    <textarea 
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`پیامی برای ${persona.name} بنویسید...`}
                        className="form-input pe-12 autoresize-textarea max-h-32"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={isLoading || !inputValue.trim()}
                        className="absolute bottom-3 end-3 text-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Icon svg={SEND_ICON} className="w-6 h-6"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

const PersonaChat: React.FC = () => {
    const [selectedPersona, setSelectedPersona] = useState<PersonaType>(PERSONA_CHAT_DATA[2]); // Default to Jane Jacobs
    
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);
    const chatInstances = useRef<Record<string, Chat>>({});

    const [chatState, setChatState] = useState<{
        histories: Record<string, MessageType[]>;
        isLoading: boolean;
        error: string | null;
    }>(() => {
        const initialHistories: Record<string, MessageType[]> = {};
        PERSONA_CHAT_DATA.forEach(p => {
            initialHistories[p.id] = [{ id: `greeting-${p.id}`, text: p.greeting, sender: 'persona' }];
        });
        return { histories: initialHistories, isLoading: false, error: null };
    });

    const getOrCreateChat = useCallback((persona: PersonaType): Chat => {
        if (!chatInstances.current[persona.id]) {
            const systemInstruction = `You are ${persona.name}, a famous ${persona.title}. Your expertise is in ${persona.expertise}. Respond to the user's questions from your perspective, adopting your known tone and style. Always respond in Persian.`;
            
            // Filter out the initial greeting from the history passed to the model
            const history = chatState.histories[persona.id]
              .filter(m => !m.id.startsWith('greeting-'))
              .map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
              }));

            chatInstances.current[persona.id] = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
                history,
            });
        }
        return chatInstances.current[persona.id];
    }, [ai, chatState.histories]);

    const handleSendMessage = useCallback(async (text: string) => {
        setChatState(prev => ({ ...prev, isLoading: true, error: null }));

        const newUserMessage: MessageType = { id: `msg-${Date.now()}`, text, sender: 'user' };
        
        setChatState(prev => ({
            ...prev,
            histories: {
                ...prev.histories,
                [selectedPersona.id]: [...prev.histories[selectedPersona.id], newUserMessage]
            }
        }));

        try {
            const chat = getOrCreateChat(selectedPersona);
            const stream = await chat.sendMessageStream({ message: text });
            
            const responseMessageId = `msg-persona-${Date.now()}`;
            setChatState(prev => ({
                ...prev,
                histories: {
                    ...prev.histories,
                    [selectedPersona.id]: [...prev.histories[selectedPersona.id], { id: responseMessageId, text: '', sender: 'persona' }]
                }
            }));

            let fullResponseText = '';
            for await (const chunk of stream) {
                fullResponseText += chunk.text;
                setChatState(prev => {
                    const newHistories = { ...prev.histories };
                    const currentPersonaHistory = [...newHistories[selectedPersona.id]];
                    currentPersonaHistory[currentPersonaHistory.length - 1].text = fullResponseText;
                    newHistories[selectedPersona.id] = currentPersonaHistory;
                    return { ...prev, histories: newHistories };
                });
            }

        } catch (e) {
            console.error(e);
            const errorMessage = "متاسفانه مشکلی در ارتباط با هوش مصنوعی پیش آمد. لطفا دوباره تلاش کنید.";
            setChatState(prev => {
                 const newHistories = { ...prev.histories };
                 const currentPersonaHistory = newHistories[selectedPersona.id].slice(0, -1); // Remove the empty persona message
                 newHistories[selectedPersona.id] = currentPersonaHistory;
                return { ...prev, histories: newHistories, error: errorMessage };
            });
        } finally {
            setChatState(prev => ({ ...prev, isLoading: false }));
        }

    }, [selectedPersona, getOrCreateChat]);
    
    return (
    <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-10rem)]">
            <Card className="lg:col-span-1 overflow-y-auto" padding="p-4">
                <h2 className="font-bold text-lg text-white mb-4">انتخاب شخصیت</h2>
                <PersonaSelector onSelect={setSelectedPersona} activePersonaId={selectedPersona.id} />
            </Card>
            <Card className="lg:col-span-3 flex flex-col" padding="p-0">
                <ChatWindow 
                    persona={selectedPersona} 
                    messages={chatState.histories[selectedPersona.id] || []}
                    onSendMessage={handleSendMessage}
                    isLoading={chatState.isLoading}
                    error={chatState.error}
                />
            </Card>
        </div>
    </div>
  );
};
export default PersonaChat;
