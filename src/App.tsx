import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import QuestionCard from './components/QuestionCard';

interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex?: number;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [editableQuizData, setEditableQuizData] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizMode, setQuizMode] = useState<'random' | 'sequential'>('random');
  const [error, setError] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string>("");
  const [darkMode, setDarkMode] = useState(false);

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('quizData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setEditableQuizData(parsed.data || []);
        setQuizMode(parsed.mode || 'random');
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }

    // Check for dark mode preference
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(savedTheme ? savedTheme === 'true' : prefersDark);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (editableQuizData.length > 0) {
      localStorage.setItem('quizData', JSON.stringify({
        data: editableQuizData,
        mode: quizMode,
        timestamp: Date.now()
      }));
    }
  }, [editableQuizData, quizMode]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleConvert = async () => {
    if (!file) {
      setError('请先选择文件');
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_BASE_URL}/convert`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setEditableQuizData(response.data.converted_data || []);
      setOriginalFilename(response.data.original_filename || "");

    } catch (err: any) {
      console.error('转换错误:', err);
      const errorMsg = err.response?.data?.error || '转换失败，请检查文件格式';
      setError(errorMsg);
      setEditableQuizData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedData = [...editableQuizData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setEditableQuizData(updatedData);
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedData = editableQuizData.filter((_, i) => i !== index);
    setEditableQuizData(updatedData);
  };

  const handleGenerateQuiz = async () => {
    if (editableQuizData.length === 0) {
      setError('没有题目可以生成');
      return;
    }

    const invalidQuestions = editableQuizData.filter(
      q => q.correctOptionIndex === undefined
    );
    
    if (invalidQuestions.length > 0) {
      setError(`有 ${invalidQuestions.length} 道题目未设置正确答案`);
      return;
    }

    setGeneratingQuiz(true);
    setError(null);
    
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const payload = {
      quiz_data: editableQuizData.map(q => ({
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex
      })),
      mode: quizMode,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/generate-practice-page`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `题库练习-${quizMode}-${Date.now()}.html`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error('生成失败:', err);
      const errorMsg = err.response?.data?.error || '生成失败，请重试';
      setError(errorMsg);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const clearAllData = () => {
    setEditableQuizData([]);
    setFile(null);
    setOriginalFilename('');
    localStorage.removeItem('quizData');
  };

  return (
    <div className={`min-h-screen bg-apple-bg dark:bg-apple-dark-bg transition-colors duration-300`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-apple-bg/80 dark:bg-apple-dark-bg/80 backdrop-blur-apple border-b border-apple-separator dark:border-apple-dark-separator">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-apple-blue to-apple-purple rounded-xl flex items-center justify-center">
                <i className="fas fa-brain text-white text-sm"></i>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-apple-text dark:text-apple-dark-text">
                AI 智能题库转换器
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {editableQuizData.length > 0 && (
                <button
                  onClick={clearAllData}
                  className="apple-button px-3 py-1.5 text-sm text-apple-red hover:bg-apple-red/10 rounded-lg transition-colors"
                >
                  清空数据
                </button>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="apple-button p-2 text-apple-text-secondary hover:text-apple-text rounded-lg hover:bg-apple-gray6 dark:hover:bg-apple-dark-gray6 transition-colors"
              >
                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-sm`}></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-apple-text dark:text-apple-dark-text mb-6">
            一键转换
            <span className="bg-gradient-to-r from-apple-blue to-apple-purple bg-clip-text text-transparent ml-3">
              智能题库
            </span>
          </h2>
          <p className="text-xl text-apple-text-secondary dark:text-apple-dark-text-secondary max-w-2xl mx-auto leading-relaxed">
            将您的题库文件转换为精美的在线练习，支持多种格式，AI智能识别题目结构
          </p>
        </div>

        {/* Alerts */}
        <div className="space-y-4 mb-8">
          {error && (
            <div className="apple-card border-apple-red/20 bg-apple-red/5 p-4 rounded-apple flex items-center space-x-3">
              <i className="fas fa-exclamation-triangle text-apple-red"></i>
              <span className="text-apple-red font-medium">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-apple-red hover:text-apple-red/70"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="apple-card p-8">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-apple-blue/10 rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-upload text-apple-blue"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-apple-text dark:text-apple-dark-text">
                    上传题库文件
                  </h3>
                  <p className="text-apple-text-secondary dark:text-apple-dark-text-secondary mt-1">
                    支持 .txt, .docx, .xlsx 等格式
                  </p>
                </div>
              </div>

              <FileUpload
                onFileSelect={setFile}
                selectedFile={file}
                onRemoveFile={() => setFile(null)}
              />

              <div className="mt-8">
                <button
                  onClick={handleConvert}
                  disabled={!file || loading}
                  className="w-full apple-button px-6 py-3 bg-gradient-to-r from-apple-blue to-apple-purple text-white font-semibold rounded-apple shadow-apple hover:shadow-apple-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>AI 分析中...</span>
                    </div>
                  ) : (
                    <span>开始转换</span>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {editableQuizData.length > 0 && (
              <div className="apple-card p-8 mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-apple-text dark:text-apple-dark-text">
                      编辑题目
                    </h3>
                    <p className="text-apple-text-secondary dark:text-apple-dark-text-secondary mt-1">
                      共 {editableQuizData.length} 道题目
                      {originalFilename && ` • ${originalFilename}`}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={quizMode}
                      onChange={(e) => setQuizMode(e.target.value as 'random' | 'sequential')}
                      className="apple-button px-4 py-2 bg-apple-secondary-bg dark:bg-apple-dark-secondary-bg border border-apple-separator dark:border-apple-dark-separator text-apple-text dark:text-apple-dark-text rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue"
                    >
                      <option value="random">随机模式</option>
                      <option value="sequential">顺序模式</option>
                    </select>
                    <button
                      onClick={handleGenerateQuiz}
                      disabled={!editableQuizData.every(q => q.correctOptionIndex !== undefined) || generatingQuiz}
                      className="apple-button px-6 py-2 bg-gradient-to-r from-apple-green to-apple-teal text-white font-semibold rounded-apple shadow-apple hover:shadow-apple-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {generatingQuiz ? (
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>生成中...</span>
                        </div>
                      ) : (
                        <span>生成练习</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {editableQuizData.map((question, index) => (
                    <QuestionCard
                      key={index}
                      question={question}
                      index={index}
                      onUpdate={handleEditChange}
                      onRemove={handleRemoveQuestion}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="apple-card p-6">
              <h3 className="text-lg font-semibold text-apple-text dark:text-apple-dark-text mb-4">
                使用指南
              </h3>
              <div className="space-y-4 text-sm text-apple-text-secondary dark:text-apple-dark-text-secondary">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-apple-blue/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-apple-blue font-semibold text-xs">1</span>
                  </div>
                  <p>上传您的题库文件，支持多种格式</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-apple-blue/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-apple-blue font-semibold text-xs">2</span>
                  </div>
                  <p>检查并编辑题目内容，设置正确答案</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-apple-blue/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-apple-blue font-semibold text-xs">3</span>
                  </div>
                  <p>选择练习模式，生成精美的HTML文件</p>
                </div>
              </div>
            </div>

            {editableQuizData.length === 0 && !loading && (
              <div className="apple-card p-6 mt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-apple-gray6 dark:bg-apple-dark-gray6 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-question text-apple-gray dark:text-apple-dark-gray text-xl"></i>
                  </div>
                  <h4 className="font-medium text-apple-text dark:text-apple-dark-text mb-2">
                    开始转换
                  </h4>
                  <p className="text-sm text-apple-text-secondary dark:text-apple-dark-text-secondary">
                    上传题库文件，开始创建您的智能练习
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;