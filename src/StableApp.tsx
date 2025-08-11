import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

// 稳定版本的数据结构
interface RawQuestion {
  raw_question: string;
  raw_answer: string;
  raw_options: string[];
  metadata?: {
    source_line: number;
    confidence: number;
    checksum: string;
  };
}

interface StableAppState {
  questions: RawQuestion[];
  currentIndex: number;
  loading: boolean;
  error: string | null;
  mode: 'random' | 'sequential';
}

const StableApp: React.FC = () => {
  const [state, setState] = useState<StableAppState>({
    questions: [],
    currentIndex: 0,
    loading: false,
    error: null,
    mode: 'random'
  });

  const [file, setFile] = useState<File | null>(null);

  // 文件处理
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setState(prev => ({ ...prev, error: null }));
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setState(prev => ({ ...prev, error: '请选择文件' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const formData = new FormData();
    formData.append('file', file);

    const endpoints = [
      'http://localhost:8001/convert-stable', // 首选：稳定端点（stable_api.py）
      'http://localhost:8001/convert'         // 兼容：主服务端点（main.py）
    ];

    let lastError: any = null;

    for (const url of endpoints) {
      try {
        const response = await axios.post(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data?.success) {
          setState(prev => ({
            ...prev,
            questions: response.data.questions,
            loading: false,
            error: null
          }));
          return; // 成功则直接返回
        } else if (response.data?.converted_data) {
          // 兼容极老的返回结构
          setState(prev => ({
            ...prev,
            questions: response.data.converted_data,
            loading: false,
            error: null
          }));
          return;
        } else {
          lastError = response.data?.error || '未知错误';
        }
      } catch (err: any) {
        lastError = err.response?.data?.error || err.message || '转换失败';
      }
    }

    setState(prev => ({
      ...prev,
      error: `转换失败：${lastError}`,
      loading: false
    }));
  };

  const handleGeneratePractice = async () => {
    if (state.questions.length === 0) {
      setState(prev => ({ ...prev, error: '没有题目数据' }));
      return;
    }

    const endpoints = [
      'http://localhost:8001/generate-stable-practice',
      'http://localhost:8001/generate-practice'
    ];

    let lastError: any = null;

    for (const url of endpoints) {
      try {
        const response = await axios.post(url, {
          questions: state.questions,
          mode: state.mode
        }, {
          responseType: 'blob'
        });

        const fileBlob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'text/html' });
        const dlUrl = window.URL.createObjectURL(fileBlob);
        const link = document.createElement('a');
        link.href = dlUrl;
        link.setAttribute('download', `题库练习-${state.mode}-${Date.now()}.html`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(dlUrl);
        return; // 成功即返回
      } catch (err: any) {
        lastError = err.response?.data?.error || err.message || '生成失败';
      }
    }

    setState(prev => ({
      ...prev,
      error: `生成失败：${lastError}`
    }));
  };

  const handleModeChange = (mode: 'random' | 'sequential') => {
    setState(prev => ({ ...prev, mode }));
  };

  // 数据验证显示
  const getDataStats = () => {
    if (state.questions.length === 0) return null;
    
    const total = state.questions.length;
    const validAnswers = state.questions.filter(q => 
      q.raw_answer && ['A', 'B', 'C', 'D'].includes(q.raw_answer)
    ).length;
    const completeOptions = state.questions.filter(q => 
      q.raw_options && q.raw_options.length >= 2
    ).length;
    
    return {
      total,
      validAnswers,
      completeOptions,
      warnings: total - validAnswers
    };
  };

  const stats = getDataStats();

  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4 text-center">稳定版题库系统</h1>
      
      {state.error && (
        <div className="alert alert-danger" role="alert">
          {state.error}
        </div>
      )}

      {/* --- 文件上传 --- */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">第一步：上传题库文件</h5>
          <p className="card-text">支持所有格式，保留原始文本</p>
          <div className="input-group">
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
              accept=".txt,.doc,.docx,.xls,.xlsx"
            />
            <button
              className="btn btn-primary"
              onClick={handleConvert}
              disabled={state.loading || !file}
            >
              {state.loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  转换中...
                </>
              ) : '开始转换'}
            </button>
          </div>
        </div>
      </div>

      {/* --- 数据显示 --- */}
      {state.questions.length > 0 && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">第二步：检查数据</h5>
            
            {stats && (
              <div className="alert alert-info">
                <strong>数据统计：</strong><br/>
                总题目：{stats.total}题<br/>
                有效答案：{stats.validAnswers}题<br/>
                完整选项：{stats.completeOptions}题<br/>
                {stats.warnings > 0 && <span className="text-warning">警告：{stats.warnings}题格式可能有问题</span>}
              </div>
            )}

            <div className="mb-3">
              <label>选择模式：</label>
              <select 
                className="form-select" 
                value={state.mode}
                onChange={(e) => handleModeChange(e.target.value as 'random' | 'sequential')}
              >
                <option value="random">随机模式</option>
                <option value="sequential">顺序模式</option>
              </select>
            </div>

            <button
              className="btn btn-success"
              onClick={handleGeneratePractice}
            >
              生成稳定练习网页
            </button>

            {/* --- 预览表格 --- */}
            <div className="mt-4">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th># </th>
                      <th>题目</th>
                      <th>答案</th>
                      <th>选项数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.questions.slice(0, 5).map((q, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="small">
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            <code>
                              {JSON.stringify(q.raw_question).slice(1, -1)}
                            </code>
                          </pre>
                        </td>
                        <td>{q.raw_answer || '无'}</td>
                        <td>{q.raw_options?.length || 0}</td>
                      </tr>
                    ))}
                    {state.questions.length > 5 && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted">...共{state.questions.length}题</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StableApp;