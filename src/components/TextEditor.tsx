import React, { useState, useEffect } from 'react';

interface TextEditorProps {
  initialText: string;
  onTextChange: (text: string) => void;
  onGenerateQuiz: () => void;
  isGenerating: boolean;
}

const TextEditor: React.FC<TextEditorProps> = ({ 
  initialText, 
  onTextChange, 
  onGenerateQuiz, 
  isGenerating 
}) => {
  const [text, setText] = useState(initialText);
  const [wordCount, setWordCount] = useState(initialText.length);

  // 当 initialText 改变时更新文本
  useEffect(() => {
    setText(initialText);
    setWordCount(initialText.length);
  }, [initialText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setWordCount(newText.length);
    onTextChange(newText);
  };

  const handleClear = () => {
    setText('');
    setWordCount(0);
    onTextChange('');
  };

  const handleFormat = () => {
    // 简单的文本格式化：去除多余空行，统一段落间距
    const formatted = text
      .split('\n')
      .map(line => line.trim())
      .filter((line, index, arr) => {
        // 保留非空行，以及非连续的空行
        return line !== '' || (line === '' && arr[index - 1] !== '');
      })
      .join('\n');
    
    setText(formatted);
    setWordCount(formatted.length);
    onTextChange(formatted);
  };

  return (
    <div className="space-y-6">
      {/* 标题和工具栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">文本编辑器</h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400">
            字符数: {wordCount.toLocaleString()}
          </span>
          <button
            onClick={handleFormat}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            格式化
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
          >
            清空
          </button>
        </div>
      </div>

      {/* 文本编辑区域 */}
      <div className="relative">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="在这里编辑您的文本内容..."
          className="w-full h-96 p-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: '14px',
            lineHeight: '1.6'
          }}
        />
        
        {/* 编辑器装饰 */}
        <div className="absolute top-3 right-3 flex space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          💡 提示：编辑完成后，点击"生成刷题网页"将内容转换为练习题
        </div>
        
        <button
          onClick={onGenerateQuiz}
          disabled={!text.trim() || isGenerating}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>生成中...</span>
            </>
          ) : (
            <>
              <i className="fas fa-magic"></i>
              <span>生成刷题网页</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TextEditor;
