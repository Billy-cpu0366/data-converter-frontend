import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [file, setFile] = useState<File | null>(null);
    const [convertedData, setConvertedData] = useState<any>(null);
    const [editableQuizData, setEditableQuizData] = useState<any[]>([]); // New state for editable data
    const [loading, setLoading] = useState(false);
    const [generatingQuiz, setGeneratingQuiz] = useState(false); // New state for quiz generation

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleConvert = async () => {
        if (!file) {
            alert('Please select a file first.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/convert', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setConvertedData(response.data);
            // Initialize editableQuizData with the converted data for micro-tuning
            if (response.data && response.data.converted_data) {
                setEditableQuizData(response.data.converted_data);
            }
        } catch (error) {
            console.error('Error converting data:', error);
            alert('Failed to convert data. Please check the console for more details.');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle changes in the editable quiz data table
    const handleEditChange = (rowIndex: number, field: string, value: any) => { // Changed value type to any
        const updatedData = [...editableQuizData];
        if (field === 'options' && typeof value === 'object') { // Special handling for options object
            updatedData[rowIndex] = {
                ...updatedData[rowIndex],
                [field]: value,
            };
        } else {
            updatedData[rowIndex] = {
                ...updatedData[rowIndex],
                [field]: value,
            };
        }
        setEditableQuizData(updatedData);
    };

    const downloadJSON = () => {
        if (!convertedData || !convertedData.converted_data) return;
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(convertedData.converted_data, null, 2)
        )}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = 'converted_data.json';
        link.click();
    };

    const downloadCSV = () => {
        if (!convertedData || !convertedData.converted_data || convertedData.converted_data.length === 0) return;
        const items = convertedData.converted_data;
        const replacer = (key: any, value: any) => value === null ? '' : value;
        const header = Object.keys(items[0]);
        const csv = [
            header.join(','),
            ...items.map((row: any) => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
        ].join('\r\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'converted_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // New function to handle generating and downloading the quiz page
    const handleGenerateQuiz = async () => {
        if (editableQuizData.length === 0) {
            alert('No quiz data to generate. Please convert data first.');
            return;
        }

        setGeneratingQuiz(true);
        console.log("Sending quiz data to backend:", editableQuizData); // Added for debugging
        try {
            const response = await axios.post('http://localhost:8000/generate-practice-page', editableQuizData, {
                responseType: 'blob', // Important: receive as blob for file download
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'practice_quiz.html');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating quiz page:', error);
            alert('Failed to generate quiz page. Please check the console for more details.');
        } finally {
            setGeneratingQuiz(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 text-center">Intelligent Data Converter</h1>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="file-input">Upload Unstructured Data File</label>
                        <input
                            id="file-input"
                            type="file"
                            className="form-control"
                            onChange={handleFileChange}
                        />
                    </div>
                    
                    <button
                        className="btn btn-primary mt-3"
                        onClick={handleConvert}
                        disabled={loading || !file}
                    >
                        {loading ? 'Converting...' : 'Convert'}
                    </button>
                </div>
                <div className="col-md-6">
                    <h3>Converted Data (Micro-tune below)</h3>
                    {convertedData && (
                        <div>
                            <div className="alert alert-secondary">
                                <p><strong>Original File:</strong> {convertedData.original_filename}</p>
                                <p><strong>Instructions:</strong> {convertedData.instructions}</p>
                            </div>
                            <div className="btn-group mb-3">
                                <button className="btn btn-success" onClick={downloadJSON}>Download JSON</button>
                                <button className="btn btn-info" onClick={downloadCSV}>Download CSV</button>
                                <button
                                    className="btn btn-warning"
                                    onClick={handleGenerateQuiz}
                                    disabled={generatingQuiz || editableQuizData.length === 0}
                                >
                                    {generatingQuiz ? 'Generating...' : 'Generate Practice Page'}
                                </button>
                            </div>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        {editableQuizData.length > 0 &&
                                            Object.keys(editableQuizData[0]).map(key => (
                                                <th key={key}>{key === 'options' ? 'Options' : key}</th>
                                            ))
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {editableQuizData.map((item: any, rowIndex: number) => (
                                        <tr key={rowIndex}>
                                            {Object.keys(item).map((key: string, colIndex: number) => {
                                                const indexToLetter = (index: number) => String.fromCharCode(65 + index);
                                                return (
                                                    <td key={colIndex}>
                                                        {key === 'options' && Array.isArray(item[key]) ? (
                                                            item[key].map((option: string, optionIndex: number) => (
                                                                <div key={optionIndex}>
                                                                    <strong>{indexToLetter(optionIndex)}:</strong>
                                                                    <textarea
                                                                        className="form-control form-control-sm"
                                                                        value={option}
                                                                        onChange={(e) => {
                                                                            const updatedOptions = [...item[key]];
                                                                            updatedOptions[optionIndex] = e.target.value;
                                                                            handleEditChange(rowIndex, key, updatedOptions);
                                                                        }}
                                                                        rows={1}
                                                                    />
                                                                </div>
                                                            ))
                                                        ) : key === 'answer' ? (
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={indexToLetter(item.options.indexOf(item.answer))}
                                                                onChange={(e) => {
                                                                    const newAnswerLetter = e.target.value.toUpperCase();
                                                                    const newAnswerIndex = newAnswerLetter.charCodeAt(0) - 65;
                                                                    if (newAnswerIndex >= 0 && newAnswerIndex < item.options.length) {
                                                                        handleEditChange(rowIndex, key, item.options[newAnswerIndex]);
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={String(item[key])}
                                                                onChange={(e) => handleEditChange(rowIndex, key, e.target.value)}
                                                            />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
