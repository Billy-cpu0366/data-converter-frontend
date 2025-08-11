import React, { useState, useEffect } from 'react';
import ParticleBackground from './ParticleBackground';
import CoolLoader from './CoolLoader';
import TypewriterText from './TypewriterText';
import Card3D from './Card3D';
import GradientAnimation from './GradientAnimation';
import FileUpload from './FileUpload';
import LoadingScreen from './LoadingScreen';
import TextEditor from './TextEditor';
import { generateSampleText } from '../utils/fileParser';
import { API_ENDPOINTS } from '../config/api';

const CoolShowcase: React.FC = () => {

  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [activeSection, setActiveSection] = useState<'upload' | 'demo'>('upload');
  const [currentStep, setCurrentStep] = useState<'upload' | 'edit' | 'result'>('upload');
  const [extractedText, setExtractedText] = useState<string>('');
  const [editedText, setEditedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizUrl, setQuizUrl] = useState<string | null>(null);
  const [convertedQuizData, setConvertedQuizData] = useState<any[]>([]);

  // 应用暗色模式
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLoadingComplete = () => {
    setIsTransitioning(true);
    // 延迟一点时间让过渡动画开始，然后隐藏加载屏幕
    setTimeout(() => {
      setIsLoading(false);
    }, 800); // 给足够时间让淡出动画完成
  };

  const handleFileSelect = async (selectedFile: File) => {
    console.log('handleFileSelect 被调用，文件:', selectedFile.name, '大小:', selectedFile.size);
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      // 直接调用后端API处理文件
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('发送请求到后端...');
      const response = await fetch(API_ENDPOINTS.convert, {
        method: 'POST',
        body: formData,
      });

      console.log('收到响应，状态码:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('后端响应结果:', JSON.stringify(result, null, 2));
        console.log('total_questions:', result.total_questions);
        console.log('questions数组长度:', result.questions?.length);
        console.log('all_questions数组长度:', result.all_questions?.length);
        console.log('error_questions:', result.error_questions);

        const convertedData = result.questions || result.converted_data;

        if (convertedData && convertedData.length > 0) {
          console.log('找到题目数据，数量:', convertedData.length);

          // 🔧 修复：直接保存原始数据，不要格式化为文本再解析
          setConvertedQuizData(convertedData);

          // 为了显示，生成格式化文本（但不用于生成HTML）
          const formattedText = convertedData.map((q: any, index: number) => {
            const question = q.raw_question || q.question;
            const options = q.raw_options || q.options;
            const answer = q.raw_answer || '';

            return `题目 ${index + 1}:
${question}

选项:
${options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}

答案: ${answer}
---`;
          }).join('\n\n');

          console.log('设置提取的文本:', formattedText.substring(0, 200) + '...');
          setExtractedText(formattedText);
          setEditedText(formattedText);
          console.log('切换到编辑步骤');
          setCurrentStep('edit');
        } else {
          console.log('没有找到题目数据');
          alert('文件中没有找到有效的题目数据');
        }
      } else {
        const error = await response.json();
        console.error('后端返回错误:', error);
        throw new Error(error.error || '文件处理失败');
      }
    } catch (error) {
      console.error('文件处理失败:', error);
      alert(`文件处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseSampleText = () => {
    // 直接创建示例题目数据
    const sampleQuizData = [
      {
        question: "Python是什么类型的编程语言？",
        options: ["编译型语言", "解释型语言", "汇编语言", "机器语言"],
        correctOptionIndex: 1
      },
      {
        question: "在Python中，用于定义函数的关键字是？",
        options: ["function", "def", "func", "define"],
        correctOptionIndex: 1
      },
      {
        question: "以下哪个不是Python的基本数据类型？",
        options: ["int", "float", "array", "str"],
        correctOptionIndex: 2
      },
      {
        question: "Python中用于创建列表的符号是？",
        options: ["{}", "[]", "()", "<>"],
        correctOptionIndex: 1
      },
      {
        question: "在Python中，哪个关键字用于处理异常？",
        options: ["catch", "except", "handle", "error"],
        correctOptionIndex: 1
      }
    ];

    // 转换为文本格式显示
    const formattedText = formatQuizDataToText(sampleQuizData);
    setExtractedText(formattedText);
    setEditedText(formattedText);
    setCurrentStep('edit');
  };

  const handleTextChange = (text: string) => {
    setEditedText(text);
  };

  // 将题目数据格式化为可编辑的文本
  const formatQuizDataToText = (quizData: any[]): string => {
    return quizData.map((item, index) => {
      const { question, options, correctOptionIndex } = item;
      const optionsText = options.map((opt: string, idx: number) =>
        `${String.fromCharCode(65 + idx)}. ${opt}`
      ).join('\n');
      const correctAnswer = String.fromCharCode(65 + correctOptionIndex);

      return `${index + 1}. ${question}\n${optionsText}\n【答案】${correctAnswer}\n`;
    }).join('\n');
  };

  // 将文本解析回题目数据格式
  const parseTextToQuizData = (text: string): any[] => {
    const questions = [];
    const questionBlocks = text.split(/\n\s*\n/).filter(block => block.trim());

    for (const block of questionBlocks) {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length < 3) continue;

      // 提取题目
      const questionLine = lines[0];
      const question = questionLine.replace(/^\d+\.\s*/, '');

      // 提取选项
      const options = [];
      let answerLine = '';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^[A-D]\.\s/)) {
          options.push(line.substring(3));
        } else if (line.includes('【答案】')) {
          answerLine = line;
          break;
        }
      }

      // 提取答案
      const answerMatch = answerLine.match(/【答案】([A-D])/);
      const correctOptionIndex = answerMatch ? answerMatch[1].charCodeAt(0) - 65 : 0;

      if (question && options.length > 0) {
        questions.push({
          question,
          options,
          correctOptionIndex
        });
      }
    }

    return questions;
  };

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);

    try {
      let quizData;

      // 🔧 修复：优先使用原始数据，如果没有则解析文本
      if (convertedQuizData && convertedQuizData.length > 0) {
        console.log('使用原始转换数据:', convertedQuizData.length, '道题目');
        quizData = convertedQuizData;
      } else if (editedText.trim()) {
        console.log('解析编辑后的文本');
        quizData = parseTextToQuizData(editedText);
      } else {
        alert('没有题目数据可以生成');
        return;
      }

      if (quizData.length === 0) {
        alert('未能从文本中解析出有效的题目数据，请检查格式');
        return;
      }

      console.log('发送到后端的数据:', quizData);

      // 调用后端API生成刷题网页
      const response = await fetch(API_ENDPOINTS.generatePractice, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: quizData,
          mode: 'random' // 可以让用户选择
        }),
      });

      if (response.ok) {
        const htmlContent = await response.text();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setQuizUrl(url);
        setCurrentStep('result');
      } else {
        const error = await response.json();
        throw new Error(error.error || '生成失败');
      }
    } catch (error) {
      console.error('生成刷题网页失败:', error);
      alert(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setCurrentStep('upload');
    setExtractedText('');
    setEditedText('');
    setQuizUrl(null);
    setIsProcessing(false);
    setIsGenerating(false);
  };

  const features = [
    {
      icon: '🚀',
      title: '超快速度',
      description: '毫秒级的数据处理速度，让等待成为过去'
    },
    {
      icon: '🎨',
      title: '炫酷界面',
      description: '现代化的设计语言，带来极致的视觉体验'
    },
    {
      icon: '🤖',
      title: 'AI 智能',
      description: '人工智能驱动，自动识别和优化数据结构'
    },
    {
      icon: '🔒',
      title: '安全可靠',
      description: '企业级安全保障，保护您的数据隐私'
    }
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* 动态粒子背景 - 始终渲染以避免白屏 */}
      <ParticleBackground />

      {/* 加载屏幕 - 使用绝对定位覆盖 */}
      {isLoading && (
        <div
          className={`fixed inset-0 z-50 transition-all duration-1000 ease-in-out ${
            isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
          style={{
            transitionProperty: 'opacity, transform',
            willChange: 'opacity, transform'
          }}
        >
          <LoadingScreen onComplete={handleLoadingComplete} />
        </div>
      )}

      {/* 主内容 - 始终渲染但在加载时隐藏 */}
      <div
        className={`transition-all duration-1000 ease-in-out ${
          isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{
          transitionProperty: 'opacity, transform',
          willChange: 'opacity, transform'
        }}
      >

      {/* 主要内容 */}
      <div className="relative z-10 min-h-screen"
           style={{
             background: darkMode
               ? 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)'
               : 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.3) 100%)'
           }}>
        
        {/* 顶部导航 */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <GradientAnimation type="background" className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">⚡</span>
                  </GradientAnimation>
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl blur opacity-30 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    NEXUS CONVERTER
                  </h1>
                  <p className="text-xs text-gray-400">未来数据处理平台</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveSection(activeSection === 'upload' ? 'demo' : 'upload')}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
                >
                  {activeSection === 'upload' ? '🎮 查看演示' : '📁 文件上传'}
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-3 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-110"
                >
                  <span className="text-2xl">{darkMode ? '☀️' : '🌙'}</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* 主内容区域 */}
        <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
          <div className="max-w-7xl mx-auto w-full">

            {activeSection === 'upload' ? (
              /* 文件上传区域 */
              <div className="text-center">
                <div className="mb-12">
                  <h1 className="text-6xl md:text-7xl font-black mb-6 leading-none">
                    <span className="block bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      数据转换
                    </span>
                    <span className="block text-white text-5xl md:text-6xl mt-4">
                      新纪元
                    </span>
                  </h1>

                  <div className="text-xl md:text-2xl text-cyan-300 mb-8 h-8 font-light">
                    <TypewriterText
                      texts={[
                        '🚀 拖拽文件，AI智能提取题目',
                        '⚡ 编辑内容，个性化定制',
                        '🌟 一键生成，交互式刷题网页',
                        '💎 让学习变得更加高效'
                      ]}
                      speed={60}
                      deleteSpeed={30}
                      pauseTime={2500}
                    />
                  </div>
                </div>

                {/* 文件上传组件 */}
                <div className="max-w-4xl mx-auto">
                  <div className="group relative p-8 bg-gradient-to-br from-black/40 to-gray-900/60 backdrop-blur-xl rounded-3xl border border-cyan-400/20 overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-400/20 hover:border-cyan-400/40">
                    {/* 动态光效背景 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

                    {/* 边框光效 */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 blur-sm"></div>
                    </div>

                    {/* 内容区域 */}
                    <div className="relative z-10">
                      {/* 步骤指示器 */}
                      <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center space-x-4">
                          <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-cyan-400' : currentStep === 'edit' || currentStep === 'result' ? 'text-green-400' : 'text-gray-500'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'upload' ? 'border-cyan-400 bg-cyan-400/20' : currentStep === 'edit' || currentStep === 'result' ? 'border-green-400 bg-green-400/20' : 'border-gray-500'}`}>
                              <i className="fas fa-upload text-sm"></i>
                            </div>
                            <span className="text-sm font-medium">上传文件</span>
                          </div>
                          <div className={`w-8 h-0.5 ${currentStep === 'edit' || currentStep === 'result' ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                          <div className={`flex items-center space-x-2 ${currentStep === 'edit' ? 'text-cyan-400' : currentStep === 'result' ? 'text-green-400' : 'text-gray-500'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'edit' ? 'border-cyan-400 bg-cyan-400/20' : currentStep === 'result' ? 'border-green-400 bg-green-400/20' : 'border-gray-500'}`}>
                              <i className="fas fa-edit text-sm"></i>
                            </div>
                            <span className="text-sm font-medium">编辑文本</span>
                          </div>
                          <div className={`w-8 h-0.5 ${currentStep === 'result' ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                          <div className={`flex items-center space-x-2 ${currentStep === 'result' ? 'text-cyan-400' : 'text-gray-500'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'result' ? 'border-cyan-400 bg-cyan-400/20' : 'border-gray-500'}`}>
                              <i className="fas fa-magic text-sm"></i>
                            </div>
                            <span className="text-sm font-medium">生成网页</span>
                          </div>
                        </div>
                      </div>

                      {/* 步骤1: 文件上传 */}
                      {currentStep === 'upload' && (
                        <div className="space-y-6">
                          <FileUpload
                            onFileSelect={handleFileSelect}
                            selectedFile={file}
                            onRemoveFile={resetAll}
                          />

                          {isProcessing && (
                            <div className="text-center py-8">
                              <div className="inline-flex items-center space-x-3 text-cyan-400">
                                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                <span>正在解析文件...</span>
                              </div>
                            </div>
                          )}

                          <div className="text-center">
                            <div className="text-gray-400 mb-4">或者</div>
                            <button
                              onClick={handleUseSampleText}
                              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                            >
                              使用示例文本
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 步骤2: 文本编辑 */}
                      {currentStep === 'edit' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">编辑文本内容</h2>
                            <button
                              onClick={resetAll}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <i className="fas fa-arrow-left mr-2"></i>
                              重新开始
                            </button>
                          </div>

                          <TextEditor
                            initialText={extractedText}
                            onTextChange={handleTextChange}
                            onGenerateQuiz={handleGenerateQuiz}
                            isGenerating={isGenerating}
                          />
                        </div>
                      )}

                      {/* 步骤3: 结果展示 */}
                      {currentStep === 'result' && quizUrl && (
                        <div className="space-y-6 text-center">
                          <div className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
                            <i className="fas fa-check-circle text-green-400 text-4xl mb-4"></i>
                            <h3 className="text-2xl font-bold text-white mb-2">刷题网页生成成功！</h3>
                            <p className="text-green-300">您的学习内容已转换为交互式刷题网页</p>
                          </div>

                          <div className="flex justify-center space-x-4">
                            <a
                              href={quizUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                            >
                              <i className="fas fa-external-link-alt mr-2"></i>
                              打开刷题网页
                            </a>

                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = quizUrl;
                                link.download = 'quiz.html';
                                link.click();
                              }}
                              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
                            >
                              <i className="fas fa-download mr-2"></i>
                              下载网页
                            </button>

                            <button
                              onClick={resetAll}
                              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                            >
                              <i className="fas fa-plus mr-2"></i>
                              创建新的
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 演示区域 */
              <div className="text-center">
                <div className="mb-12">
                  <h1 className="text-6xl md:text-7xl font-black mb-6 leading-none">
                    <span className="block bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      视觉特效
                    </span>
                    <span className="block text-white text-5xl md:text-6xl mt-4">
                      演示
                    </span>
                  </h1>
                </div>

                {/* 演示内容 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  {/* AI分析 */}
                  <Card3D className="group">
                    <div className="relative p-6 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl border border-cyan-400/30 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-transparent animate-pulse"></div>
                      <div className="relative z-10">
                        <div className="text-4xl mb-4">🧠</div>
                        <CoolLoader type="spinner" size="md" text="" />
                        <h3 className="text-white font-bold mt-3">AI 神经分析</h3>
                        <p className="text-cyan-300 text-sm">深度学习算法</p>
                      </div>
                    </div>
                  </Card3D>

                  {/* 量子处理 */}
                  <Card3D className="group">
                    <div className="relative p-6 bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl border border-purple-400/30 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-transparent animate-pulse"></div>
                      <div className="relative z-10">
                        <div className="text-4xl mb-4">⚛️</div>
                        <CoolLoader type="dots" size="md" text="" />
                        <h3 className="text-white font-bold mt-3">量子处理</h3>
                        <p className="text-purple-300 text-sm">并行计算引擎</p>
                      </div>
                    </div>
                  </Card3D>

                  {/* 数据重构 */}
                  <Card3D className="group">
                    <div className="relative p-6 bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl border border-green-400/30 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-transparent animate-pulse"></div>
                      <div className="relative z-10">
                        <div className="text-4xl mb-4">🔄</div>
                        <CoolLoader type="pulse" size="md" text="" />
                        <h3 className="text-white font-bold mt-3">数据重构</h3>
                        <p className="text-green-300 text-sm">智能结构优化</p>
                      </div>
                    </div>
                  </Card3D>

                  {/* 输出生成 */}
                  <Card3D className="group">
                    <div className="relative p-6 bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-xl rounded-2xl border border-orange-400/30 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-transparent animate-pulse"></div>
                      <div className="relative z-10">
                        <div className="text-4xl mb-4">✨</div>
                        <CoolLoader type="wave" size="md" text="" />
                        <h3 className="text-white font-bold mt-3">完美输出</h3>
                        <p className="text-orange-300 text-sm">极致用户体验</p>
                      </div>
                    </div>
                  </Card3D>
                </div>
              </div>
            )}



            {/* 底部提示 */}
            <div className="mt-16 text-center">
              <p className="text-gray-400 text-lg">
                {activeSection === 'upload'
                  ? '支持多种格式：JSON, CSV, XML, YAML 等'
                  : '体验极致的视觉特效和流畅动画'
                }
              </p>
            </div>
          </div>
        </section>

        {/* 简化的特性展示 */}
        {activeSection === 'demo' && (
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  核心特性
                </h2>
                <p className="text-xl text-gray-300">
                  强大功能，简单易用
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <Card3D key={index} className="group">
                    <div className="p-6 bg-gradient-to-br from-black/40 to-gray-900/60 backdrop-blur-xl rounded-2xl border border-cyan-400/20 h-full">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </Card3D>
                ))}
              </div>
            </div>
          </section>
        )}



        {/* 底部 */}
        <footer className="py-12 px-6 border-t border-apple-separator/30 dark:border-apple-dark-separator/30">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-apple-text-secondary dark:text-apple-dark-text-secondary">
              © 2024 Data Converter Pro. 让数据转换变得更加智能和炫酷。
            </p>
          </div>
        </footer>
        </div>
      </div>
    </div>
  );
};

export default CoolShowcase;
