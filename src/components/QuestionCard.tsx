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
    } else if (question.correctOptionIndex !== undefined && question.correctOptionIndex > optionIndex) {
      onUpdate(index, 'correctOptionIndex', question.correctOptionIndex - 1);
    }
  };

  const isValid = question.correctOptionIndex !== undefined;

  return (
    <div className={`apple-card transition-all duration-300 ${!isValid ? 'border-apple-orange/20 dark:border-apple-orange/30' : ''}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-8 h-8 bg-apple-blue/10 dark:bg-apple-blue/20 rounded-full flex items-center justify-center text-apple-blue font-semibold text-sm flex-shrink-0 mt-0.5">
              {index + 1}
            </div>
            <div className="flex-1">
              <textarea
                value={question.question}
                onChange={(e) => onUpdate(index, 'question', e.target.value)}
                className="w-full apple-textarea p-3 bg-apple-secondary-bg dark:bg-apple-dark-secondary-bg border border-apple-separator dark:border-apple-dark-separator text-apple-text dark:text-apple-dark-text rounded-apple resize-none focus:outline-none focus:ring-2 focus:ring-apple-blue"
                rows={2}
                placeholder="输入题目内容..."
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="apple-button p-2 text-apple-text-secondary hover:text-apple-blue rounded-lg hover:bg-apple-blue/10 transition-colors"
            >
              <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-sm`}></i>
            </button>
            <button
              onClick={() => onRemove(index)}
              className="apple-button p-2 text-apple-text-secondary hover:text-apple-red rounded-lg hover:bg-apple-red/10 transition-colors"
            >
              <i className="fas fa-trash text-sm"></i>
            </button>
          </div>
        </div>

        <div className={`transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className={`apple-button flex items-center space-x-3 p-4 rounded-apple border transition-all duration-200 ${
                    question.correctOptionIndex === optionIndex
                      ? 'border-apple-green bg-apple-green/5 dark:bg-apple-green/10'
                      : 'border-apple-separator dark:border-apple-dark-separator hover:border-apple-blue dark:hover:border-apple-blue'
                  }`}
                >
                  <input
                    type="radio"
                    name={`answer-${index}`}
                    checked={question.correctOptionIndex === optionIndex}
                    onChange={() => onUpdate(index, 'correctOptionIndex', optionIndex)}
                    className="w-4 h-4 text-apple-blue focus:ring-apple-blue"
                  />
                  <span className="font-medium text-apple-text-secondary dark:text-apple-dark-text-secondary">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                    className="flex-1 apple-input px-3 py-2 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-apple-blue"
                    placeholder={`选项 ${String.fromCharCode(65 + optionIndex)}`}
                  />
                  {question.options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(optionIndex)}
                      className="apple-button text-apple-text-secondary hover:text-apple-red text-sm"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={handleAddOption}
                disabled={question.options.length >= 6}
                className="apple-button text-apple-blue hover:text-apple-blue/80 text-sm font-medium"
              >
                <i className="fas fa-plus mr-1"></i>
                添加选项
              </button>
              
              {!isValid && (
                <div className="apple-badge apple-badge-warning">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  请选择正确答案
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;