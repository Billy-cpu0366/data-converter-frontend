import React, { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-stone-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            AI 智能题库转换
          </h1>
          <p className="text-xl text-gray-600">
            一键转换你的题库文件为精美的在线练习
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* 第一步：文件上传 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-lg shadow-gray-200/50">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                1
              </div>
              <h2 className="text-2xl font-bold text-gray-800">上传题库文件</h2>
            </div>
            
            <FileUpload
              onFileSelect={setFile}
              selectedFile={file}
              onRemoveFile={() => setFile(null)}
            />

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleConvert}
                disabled={!file || loading}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-green-200/50 hover:shadow-xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>AI分析中...</span>
                  </div>
                ) : (
                  <span>开始转换</span>
                )}
              </button>
            </div>
          </div>

          {/* 第二步：编辑题目 */}
          {editableQuizData.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">编辑题目</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={quizMode}
                    onChange={(e) => setQuizMode(e.target.value as 'random' | 'sequential')}
                    className="px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg focus:ring-2 focus:ring-green-400 shadow-sm"
                  >
                    <option value="random" className="text-gray-800">随机模式</option>
                    <option value="sequential" className="text-gray-800">顺序模式</option>
                  </select>
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={generatingQuiz}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200/50 hover:shadow-xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  >
                    {generatingQuiz ? '生成中...' : '生成练习'}
                  </button>
                </div>
              </div>

              <div className="mb-4 text-sm text-gray-600">
                共 {editableQuizData.length} 道题目，原始文件：{originalFilename}
              </div>

              <div className="space-y-6">
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

          {/* 空状态 */}
          {editableQuizData.length === 0 && !loading && file && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-gray-500">上传文件后开始转换题目...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;