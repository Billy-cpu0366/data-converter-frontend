import React, { useState } from 'react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex?: number;
}

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  onUpdate: (index: number, field: keyof QuizQuestion, value: any) => void;
  onRemove: (index: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, onUpdate, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleOptionChange = (optionIndex: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onUpdate(index, 'options', newOptions);
  };

  const handleAddOption = () => {
    if (question.options.length < 6) {
      onUpdate(index, 'options', [...question.options, '']);
    }
  };

  const handleRemoveOption = (optionIndex: number) => {
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    onUpdate(index, 'options', newOptions);
    
    if (question.correctOptionIndex === optionIndex) {
      onUpdate(index, 'correctOptionIndex', undefined);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 overflow-hidden transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>
            <h3 className="font-semibold text-gray-800">题目 {index + 1}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-gray-600 hover:text-green-600 transition-colors duration-200 rounded-full hover:bg-green-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              onClick={() => onRemove(index)}
              className="p-2 text-gray-600 hover:text-red-500 transition-colors duration-200 rounded-full hover:bg-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.222.261L12 5.291M12 5.291A2.25 2.25 0 0112.75 3h-1.5A2.25 2.25 0 019 5.291m0 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-600 hover:text-green-600 transition-colors duration-200 rounded-full hover:bg-green-50"
            >
              {isExpanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="mb-4">
          {isEditing ? (
            <textarea
              value={question.question}
              onChange={(e) => onUpdate(index, 'question', e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none"
              rows={3}
              placeholder="输入题目内容..."
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">{question.question || '点击编辑添加题目内容...'}</p>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    question.correctOptionIndex === optionIndex
                      ? 'border-green-400 bg-green-500/20'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`answer-${index}`}
                      checked={question.correctOptionIndex === optionIndex}
                      onChange={() => onUpdate(index, 'correctOptionIndex', optionIndex)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="font-medium text-gray-700">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                      className="flex-1 px-2 py-1 bg-transparent border-b border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700 placeholder-gray-500"
                      placeholder={`选项 ${String.fromCharCode(65 + optionIndex)}`}
                    />
                    {question.options.length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(optionIndex)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.222.261L12 5.291M12 5.291A2.25 2.25 0 0112.75 3h-1.5A2.25 2.25 0 019 5.291m0 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {question.options.length < 6 && (
              <button
                onClick={handleAddOption}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors duration-200"
              >
                + 添加选项
              </button>
            )}

            {question.correctOptionIndex === undefined && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                <p className="text-amber-800 text-sm">
                  ⚠️ 请选择正确答案
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;