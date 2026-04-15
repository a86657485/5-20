import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  options?: string[];
  isHidden?: boolean;
}

interface ReflectionPhaseProps {
  onComplete: () => void;
}

const STANDARD_STEPS = [
  "创建桶，确定桶的区间范围和数量",
  "把所有数据逐个放入对应的桶中",
  "对每个桶内的数据进行排序",
  "按照桶的顺序把数据组合起来"
];

export const ReflectionPhase: React.FC<ReflectionPhaseProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: '恭喜你完成了第二关！通过刚才将企鹅放入不同重量区间的桶中，你已经体验了桶排序的核心过程。现在，请你用自然语言描述一下桶排序算法的一般步骤是什么？（可以分步骤来说哦）',
      options: [
        "第一步是创建不同重量区间的桶",
        "把企鹅按重量分到不同的桶里",
        "我不太清楚，能给点提示吗？"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flowchartUnlocked, setFlowchartUnlocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Flowchart state
  const [availableSteps, setAvailableSteps] = useState<string[]>([]);
  const [flowchartSlots, setFlowchartSlots] = useState<(string | null)[]>([null, null, null, null]);

  useEffect(() => {
    // Shuffle steps for the flowchart
    setAvailableSteps([...STANDARD_STEPS].sort(() => Math.random() - 0.5));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const SYSTEM_PROMPT = `你是一个温柔、鼓励学生的AI信息技术老师。学生刚刚完成了“桶排序”的第二关（将不同重量的企鹅放入对应重量区间的桶中）。
现在你需要引导学生用自然语言总结桶排序的一般步骤。
标准步骤参考：
1. 创建桶，确定桶的区间范围和数量。
2. 把所有数据逐个放入对应的桶中。
3. 对每个桶内的数据进行排序。
4. 按照桶的顺序把数据组合起来。

你的任务：
1. 分析学生的回答，指出其中的闪光点，并温和地指出遗漏或错误的地方。
2. 引导学生不断修改，直到他们的描述基本覆盖了上述4个核心步骤。
3. 当学生描述正确后，告诉他们：“太棒了！你已经掌握了桶排序的步骤。现在请在右侧完成流程图的拼接吧！”并必须在回复的最后加上特殊标记 [FLOWCHART_UNLOCK] 以解锁流程图功能。
4. 保持对话简短、互动性强，不要一次性把答案全说出来，要启发学生思考。
5. 【重要】为了减少学生打字，你必须在每次回复的最后，提供2-4个供学生选择的回复选项。格式必须严格为（每行一个）：
[OPTION] 选项1内容
[OPTION] 选项2内容
[OPTION] 选项3内容`;

  const fetchAIResponse = async (currentMessages: Message[], systemNotification?: string) => {
    setIsLoading(true);
    
    let messagesForState = [...currentMessages];
    if (systemNotification) {
      messagesForState.push({ role: 'system', content: systemNotification, isHidden: true });
      setMessages(messagesForState);
    }

    try {
      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messagesForState.map(m => ({ role: m.role, content: m.content }))
      ];

      // Append a reminder to the last user message to strictly enforce options
      const lastMessage = apiMessages[apiMessages.length - 1];
      if (lastMessage.role === 'user') {
        lastMessage.content += '\n\n【系统提示：请务必在回复的最后提供2-4个[OPTION]选项，格式为“[OPTION] 选项内容”】';
      }

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-eb65e011c69a4e1cb667eecdfce990a8'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: apiMessages,
          temperature: 0.7
        })
      });

      const data = await response.json();
      let aiReply = data.choices[0].message.content;
      let options: string[] = [];

      if (aiReply.includes('[FLOWCHART_UNLOCK]')) {
        setFlowchartUnlocked(true);
        aiReply = aiReply.replace('[FLOWCHART_UNLOCK]', '').trim();
      }

      const optionRegex = /\[OPTION\][:\s]*(.*)/gi;
      let match;
      while ((match = optionRegex.exec(aiReply)) !== null) {
        options.push(match[1].trim());
      }
      aiReply = aiReply.replace(/\[OPTION\].*/gi, '').trim();

      setMessages([...messagesForState, { role: 'assistant', content: aiReply, options }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages([...messagesForState, { role: 'assistant', content: '抱歉，AI导师开小差了，请再试一次。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const userMsg = typeof textToSend === 'string' ? textToSend.trim() : input.trim();
    if (!userMsg || isLoading) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    await fetchAIResponse(newMessages);
  };

  const triggerFlowchartHint = async (currentSlots: string[]) => {
    if (isLoading) return;
    const systemNotification = `【系统内部通知，不要向学生暴露此条信息】学生刚刚拼接流程图失败了。他们提交的顺序是：\n1. ${currentSlots[0]}\n2. ${currentSlots[1]}\n3. ${currentSlots[2]}\n4. ${currentSlots[3]}\n请你主动给出一个温和的提示，指出逻辑哪里不对，引导他们纠正。并在最后按要求提供[OPTION]选项。`;
    await fetchAIResponse(messages, systemNotification);
  };

  const handleSlotClick = (index: number) => {
    if (flowchartSlots[index] !== null) {
      // Return to available
      setAvailableSteps(prev => [...prev, flowchartSlots[index]!]);
      const newSlots = [...flowchartSlots];
      newSlots[index] = null;
      setFlowchartSlots(newSlots);
    }
  };

  const handleAvailableClick = (step: string) => {
    const emptyIndex = flowchartSlots.findIndex(s => s === null);
    if (emptyIndex !== -1) {
      const newSlots = [...flowchartSlots];
      newSlots[emptyIndex] = step;
      setFlowchartSlots(newSlots);
      setAvailableSteps(prev => prev.filter(s => s !== step));
    }
  };

  const isFlowchartCorrect = flowchartSlots.every((slot, index) => slot === STANDARD_STEPS[index]);
  const isFlowchartFull = flowchartSlots.every(slot => slot !== null);

  const prevIsFullRef = useRef(false);

  useEffect(() => {
    if (isFlowchartFull && !isFlowchartCorrect && !prevIsFullRef.current) {
      triggerFlowchartHint(flowchartSlots as string[]);
    }
    prevIsFullRef.current = isFlowchartFull;
  }, [flowchartSlots, isFlowchartFull, isFlowchartCorrect]);

  const visibleMessages = messages.filter(msg => !msg.isHidden);

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-50 flex flex-col md:flex-row">
      {/* Left: AI Chat */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-white">
        <div className="p-4 border-b border-slate-100 bg-blue-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">AI 导师</h2>
            <p className="text-xs text-slate-500">辅助总结桶排序算法</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {visibleMessages.map((msg, idx) => (
            <div key={idx} className="flex flex-col">
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-tr-sm' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{msg.content}</p>
                </div>
              </div>
              {/* Render options if it's the last message and from assistant */}
              {idx === visibleMessages.length - 1 && msg.role === 'assistant' && msg.options && msg.options.length > 0 && !isLoading && (
                <div className="flex flex-wrap gap-2 justify-start mt-3 pl-2">
                  {msg.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleSendMessage(opt)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-xl text-sm transition-colors text-left shadow-sm"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm p-4 flex gap-2 items-center shadow-sm">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="输入你的描述..."
              className="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Flowchart */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full bg-slate-50 p-6 flex flex-col items-center justify-center relative overflow-y-auto">
        {!flowchartUnlocked && (
          <div className="absolute inset-0 z-10 bg-slate-50/90 backdrop-blur-sm flex flex-col items-center justify-center text-slate-500">
            <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center max-w-xs">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Lock size={32} className="text-slate-400" />
              </div>
              <p className="text-lg font-bold text-slate-700 mb-2">流程图已锁定</p>
              <p className="text-sm text-slate-500">请先在左侧与AI导师交流，成功总结出桶排序的步骤后即可解锁。</p>
            </div>
          </div>
        )}

        <div className="w-full max-w-md flex flex-col items-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">桶排序流程图</h2>
          <p className="text-slate-500 text-sm mb-8 text-center">点击下方可选步骤，按正确顺序填入流程图中。填错可点击流程图中的步骤撤回。</p>

          <div className="flex flex-col items-center gap-3 w-full">
            {flowchartSlots.map((slot, index) => (
              <React.Fragment key={`slot-${index}`}>
                <div 
                  onClick={() => handleSlotClick(index)}
                  className={`w-full min-h-[64px] border-2 rounded-xl flex items-center justify-center p-4 text-center transition-all ${
                    slot 
                      ? isFlowchartFull 
                        ? slot === STANDARD_STEPS[index] 
                          ? 'bg-green-50 border-green-400 text-green-700 shadow-sm cursor-pointer' 
                          : 'bg-red-50 border-red-400 text-red-700 shadow-sm cursor-pointer'
                        : 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm cursor-pointer'
                      : 'border-dashed border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  {slot || <span className="opacity-50">步骤 {index + 1}</span>}
                </div>
                {index < 3 && (
                  <ArrowRight size={24} className="text-slate-300 rotate-90" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-10 w-full">
            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider text-center">可选步骤（点击填入）</h3>
            <div className="flex flex-wrap gap-2 justify-center min-h-[100px]">
              <AnimatePresence>
                {availableSteps.map((step) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => handleAvailableClick(step)}
                    className="bg-white border border-slate-200 shadow-sm rounded-lg p-3 text-sm cursor-pointer hover:border-blue-400 hover:shadow-md transition-all text-slate-700 text-center flex-1 min-w-[45%]"
                  >
                    {step}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {isFlowchartFull && isFlowchartCorrect && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex flex-col items-center"
            >
              <div className="flex items-center gap-2 text-green-600 font-bold text-lg mb-4 bg-green-50 px-4 py-2 rounded-full">
                <CheckCircle2 size={24} />
                <span>流程图拼接完全正确！</span>
              </div>
              <button
                onClick={onComplete}
                className="px-8 py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
              >
                进入第三关 <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
