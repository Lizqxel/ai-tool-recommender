"use client";

import { useState, useRef, useEffect } from 'react';
import { Message, UserPreferences, ChatState } from '@/lib/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, RotateCcw, X, Maximize2, Minimize2 } from 'lucide-react';

const INITIAL_STATE: ChatState = {
  messages: [{
    role: 'assistant',
    content: 'こんにちは！AIツールの専門家です。\nあなたが達成したい目的や目標を教えていただけますか？',
    timestamp: new Date()
  }],
  preferences: {
    budget: '無料'
  },
  isCollectingPreferences: true,
  currentQuestion: 'purpose'
};

const QUESTIONS = {
  purpose: 'あなたが達成したい目的や目標を教えていただけますか？',
  budget: '予算について教えていただけますか？（無料/有料）',
  technicalLevel: 'AIツールの使用経験はどの程度ですか？（初心者/中級者/上級者）',
  priorities: '特に重視したい点はありますか？（例：使いやすさ、機能の豊富さなど）',
  limitations: '制限や避けたい点はありますか？'
};

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<ChatState>(INITIAL_STATE);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const resetChat = () => {
    setState(INITIAL_STATE);
    setInput('');
  };

  const updateRecommendations = async (preferences: UserPreferences) => {
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needs: [preferences.purpose],
          budget: preferences.budget,
          technicalLevel: preferences.technicalLevel,
          priorities: preferences.priorities,
          limitations: preferences.limitations
        }),
      });

      if (!response.ok) {
        throw new Error('推薦の取得に失敗しました');
      }

      const data = await response.json();
      // 推薦結果を親コンポーネントに通知
      if (data.recommendations) {
        // ここで推薦結果を更新する処理を追加
      }
    } catch (error) {
      console.error('推薦エラー:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
    setInput('');
    setIsLoading(true);

    try {
      if (state.isCollectingPreferences) {
        // ユーザー設定の収集
        const updatedPreferences = { ...state.preferences };
        
        switch (state.currentQuestion) {
          case 'purpose':
            updatedPreferences.purpose = input;
            setState(prev => ({
              ...prev,
              preferences: updatedPreferences,
              currentQuestion: 'technicalLevel',
              messages: [...prev.messages, {
                role: 'assistant',
                content: QUESTIONS['technicalLevel'],
                timestamp: new Date()
              }]
            }));
            break;
          case 'technicalLevel':
            updatedPreferences.technicalLevel = input as UserPreferences['technicalLevel'];
            setState(prev => ({
              ...prev,
              preferences: updatedPreferences,
              currentQuestion: 'priorities',
              messages: [...prev.messages, {
                role: 'assistant',
                content: QUESTIONS['priorities'],
                timestamp: new Date()
              }]
            }));
            break;
          case 'priorities':
            updatedPreferences.priorities = input.split(',').map(p => p.trim());
            setState(prev => ({
              ...prev,
              preferences: updatedPreferences,
              currentQuestion: 'limitations',
              messages: [...prev.messages, {
                role: 'assistant',
                content: QUESTIONS['limitations'],
                timestamp: new Date()
              }]
            }));
            break;
          case 'limitations':
            updatedPreferences.limitations = input.split(',').map(l => l.trim());
            setState(prev => ({
              ...prev,
              preferences: updatedPreferences,
              isCollectingPreferences: false,
              messages: [...prev.messages, {
                role: 'assistant',
                content: 'ご回答ありがとうございます。これからは自由に質問や相談をしていただけます。',
                timestamp: new Date()
              }]
            }));
            break;
        }

        // 推薦の更新
        await updateRecommendations(updatedPreferences);
      } else {
        // 通常のチャット応答
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: input,
            preferences: state.preferences
          }),
        });

        if (!response.ok) {
          throw new Error('チャットの送信に失敗しました');
        }

        const data = await response.json();
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, {
            role: 'assistant',
            content: data.response,
            timestamp: new Date()
          }]
        }));
      }
    } catch (error) {
      console.error('チャットエラー:', error);
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          role: 'assistant',
          content: '申し訳ありません。エラーが発生しました。もう一度お試しください。',
          timestamp: new Date()
        }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollOptions = {
        behavior: 'smooth' as const,
        block: 'end' as const
      };
      messagesEndRef.current.scrollIntoView(scrollOptions);
    }
  }, [state.messages]);

  // ドラッグ開始時の処理
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.draggable')) {
      e.preventDefault(); // ヘッダーでの文字選択を防ぐ
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // ドラッグ中の処理
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault(); // ドラッグ中の文字選択を防ぐ
      requestAnimationFrame(() => {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      });
    }
  };

  // ドラッグ終了時の処理
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // リサイズハンドルの処理
  const handleResize = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(300, startWidth + (e.clientX - startX));
      const newHeight = Math.max(400, startHeight + (e.clientY - startY));
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={windowRef}
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isMinimized ? 'translate-y-[calc(100%-40px)]' : ''
      } ${isDragging ? 'select-none' : ''}`}
      style={{
        width: size.width,
        height: isMinimized ? '40px' : size.height,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <Card className="h-full w-full flex flex-col shadow-2xl border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 glass-effect">
        <CardHeader 
          className="flex flex-row items-center justify-between draggable cursor-move border-b border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm select-none"
          onMouseDown={handleMouseDown}
        >
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">AIアシスタント</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? "最大化" : "最小化"}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetChat}
              title="チャットをリセット"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title="閉じる"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        {!isMinimized && (
          <>
            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
              <div 
                className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4 mac-scrollbar"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent'
                }}
              >
                {state.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 shadow-sm backdrop-blur-sm ${
                        message.role === 'user'
                          ? 'bg-blue-500/90 text-white'
                          : 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex space-x-2 pt-2 border-t border-gray-200/50 dark:border-gray-800/50">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="メッセージを入力..."
                  className="flex-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:bg-white/80 dark:focus:bg-gray-800/80"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading}
                  className="bg-blue-500/90 hover:bg-blue-600/90 text-white backdrop-blur-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
              onMouseDown={handleResize}
            />
          </>
        )}
      </Card>
    </div>
  );
} 