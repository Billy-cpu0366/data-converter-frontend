import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

// Define the structure of a single quiz question
interface QuizQuestion {
    question: string;
    options: string[];
    answer: string; // The text of the correct answer
    correctOptionIndex?: number; // The index (0-3) of the correct option
}

function App() {
    const [file, setFile] = useState<File | null>(null);
    const [editableQuizData, setEditableQuizData] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [generatingQuiz, setGeneratingQuiz] = useState(false);
    const [quizMode, setQuizMode] = useState<'random' | 'sequential'>('random');
    const [error, setError] = useState<string | null>(null); // For displaying user-friendly errors
    const [originalFilename, setOriginalFilename] = useState<string>("");

    

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
            setError(null); // Clear previous errors
        }
    };

    const handleConvert = async () => {
        if (!file) {
            setError('Please select a file first.');
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
            console.error('Error converting data:', err);
            const errorMsg = err.response?.data?.error || 'Failed to convert data. Check the console for details.';
            setError(errorMsg);
            setEditableQuizData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (rowIndex: number, field: keyof QuizQuestion, value: any) => {
        const updatedData = [...editableQuizData];
        const currentItem = { ...updatedData[rowIndex] };
        (currentItem[field] as any) = value;

        // If the options array is changed, we need to re-evaluate the answer
        if (field === 'options') {
            const newIndex = currentItem.options.indexOf(currentItem.answer);
            currentItem.correctOptionIndex = newIndex !== -1 ? newIndex : undefined;
        }
        // If the answer index is changed, update the answer text to match
        if (field === 'correctOptionIndex') {
            if (value !== undefined && currentItem.options[value]) {
                currentItem.answer = currentItem.options[value];
            }
        }

        updatedData[rowIndex] = currentItem;
        setEditableQuizData(updatedData);
    };

    const handleGenerateQuiz = async () => {
        if (editableQuizData.length === 0) {
            setError('No quiz data to generate. Please convert data first.');
            return;
        }

        // Validate that all questions have a selected answer
        const invalidQuestion = editableQuizData.find(q => q.correctOptionIndex === undefined || q.correctOptionIndex < 0 || q.correctOptionIndex >= 4);
        if (invalidQuestion) {
            setError(`错误：题目 "${invalidQuestion.question.substring(0, 30)}..." 没有正确选择答案。请在答案列中选择正确的选项。`);
            return;
        }

        setGeneratingQuiz(true);
        setError(null);
        
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const payload = {
            quiz_data: editableQuizData,
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
            link.setAttribute('download', `quiz-${quizMode}-${Date.now()}.html`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Error generating quiz page:', err);
            const errorMsg = err.response?.data?.error || 'Failed to generate quiz page. Check console for details.';
            setError(errorMsg);
        } finally {
            setGeneratingQuiz(false);
        }
    };

    return (
        <div className="container mt-4 mb-5">
            <h1 className="mb-4 text-center">AI 题库转换与练习工具</h1>
            
            {/* --- Error Display --- */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* --- File Upload Section --- */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">第一步：上传题库文件</h5>
                    <p className="card-text">支持 .txt, .docx, .xls, .xlsx 等格式。</p>
                    <div className="input-group">
                        <input
                            id="file-input"
                            type="file"
                            className="form-control"
                            onChange={handleFileChange}
                            accept=".txt,.doc,.docx,.xls,.xlsx,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleConvert}
                            disabled={loading || !file}
                        >
                            {loading ? (
                                <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 正在转换...</>
                            ) : '开始转换'}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Data Editing Section --- */}
            {editableQuizData.length > 0 && (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">第二步：检查并修正数据</h5>
                        <p className="card-text">您可以在下表中微调 AI 提取的结果。请确保每个问题都已选择正确答案。</p>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className='text-muted'>原始文件: <strong>{originalFilename}</strong></span>
                            <div className="d-flex align-items-center">
                                <select 
                                    className="form-select me-2" 
                                    value={quizMode} 
                                    onChange={(e) => setQuizMode(e.target.value as 'random' | 'sequential')}
                                    style={{ width: 'auto' }}
                                >
                                    <option value="random">随机模式</option>
                                    <option value="sequential">顺序模式</option>
                                </select>
                                <button
                                    className="btn btn-success"
                                    onClick={handleGenerateQuiz}
                                    disabled={generatingQuiz}
                                >
                                    {generatingQuiz ? (
                                        <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 正在生成...</>
                                    ) : '生成刷题网页'}
                                </button>
                            </div>
                        </div>
                        
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover" style={{ minWidth: '800px' }}>
                                <thead className='table-light'>
                                    <tr>
                                        <th style={{ width: '35%' }}>Question</th>
                                        <th style={{ width: '45%' }}>Options</th>
                                        <th style={{ width: '20%' }}>Correct Answer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editableQuizData.map((item, rowIndex) => (
                                        <tr key={rowIndex}>
                                            <td>
                                                <textarea
                                                    className="form-control form-control-sm"
                                                    value={item.question}
                                                    onChange={(e) => handleEditChange(rowIndex, 'question', e.target.value)}
                                                    rows={4}
                                                />
                                            </td>
                                            <td>
                                                {item.options.map((option, optionIndex) => (
                                                    <div key={optionIndex} className="input-group input-group-sm mb-1">
                                                        <span className="input-group-text">{String.fromCharCode(65 + optionIndex)}</span>
                                                        <textarea
                                                            className="form-control"
                                                            value={option}
                                                            onChange={(e) => {
                                                                const updatedOptions = [...item.options];
                                                                updatedOptions[optionIndex] = e.target.value;
                                                                handleEditChange(rowIndex, 'options', updatedOptions);
                                                            }}
                                                            rows={1}
                                                        />
                                                    </div>
                                                ))}
                                            </td>
                                            <td>
                                                <select
                                                    className={`form-select form-select-sm ${item.correctOptionIndex === undefined ? 'is-invalid' : ''}`}
                                                    value={item.correctOptionIndex ?? ''}
                                                    onChange={(e) => handleEditChange(rowIndex, 'correctOptionIndex', e.target.value !== '' ? parseInt(e.target.value) : undefined)}
                                                >
                                                    <option value="" disabled>选择答案</option>
                                                    {item.options.map((_, optionIndex) => (
                                                        <option key={optionIndex} value={optionIndex}>
                                                            {String.fromCharCode(65 + optionIndex)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
