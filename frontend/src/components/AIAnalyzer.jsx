import { useState, useRef, useEffect } from 'react';

const WORKER_URL = import.meta.env.VITE_WORKER_URL;

export default function AIAnalyzer() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${WORKER_URL}/analyze-responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze responses');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${error.message}. Please try again.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What's the average score for sensitized users?",
    "How many users have chronic pain?",
    "What's the conversion rate by traffic source?",
    "Show me trends over the past week",
    "What percentage of users are confident about their medical clearance?"
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2
            className="text-xl font-bold mb-2"
            style={{
              fontFamily: 'Libre Baskerville, serif',
              color: '#101827',
              letterSpacing: '-0.02em'
            }}
          >
            AI Data Analyzer
          </h2>
          <p
            className="text-sm"
            style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
          >
            Ask questions about your quiz responses and get AI-powered insights
          </p>
        </div>

        {/* Chat Messages */}
        <div
          className="p-6 space-y-4 overflow-y-auto"
          style={{ height: '500px', backgroundColor: '#EFEDEC' }}
        >
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p
                className="mb-6"
                style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
              >
                Try asking a question about your quiz data:
              </p>
              <div className="space-y-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="block w-full text-left px-4 py-3 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#4D1E22',
                      fontSize: '0.9375rem'
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-white'
                        : 'border'
                    }`}
                    style={{
                      backgroundColor: msg.role === 'user' ? '#4D1E22' : 'white',
                      color: msg.role === 'user' ? 'white' : '#101827',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '1.0625rem',
                      borderColor: msg.role === 'assistant' ? '#E5E7EB' : 'transparent'
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="max-w-[80%] rounded-lg px-4 py-3 bg-white border"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#6D6B6B',
                      borderColor: '#E5E7EB'
                    }}
                  >
                    Analyzing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-6 border-t" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your data..."
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                fontFamily: 'Inter, sans-serif',
                borderColor: '#D1D5DB',
                fontSize: '1.0625rem'
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
              style={{
                backgroundColor: '#4D1E22',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
