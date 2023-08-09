import React, { useState } from 'react';
import axios from 'axios';
import { Document, Page } from 'react-pdf';

export default function PdfProcessor() {
    const [numPages, setNumPages] = useState(null);
    const [pdfText, setPdfText] = useState('');
    const [prompt, setPrompt] = useState('');
    const [tweet, setTweet] = useState('');
    const [pdfFile, setPdfFile] = useState(null);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleFileUpload = (e) => {
        setPdfFile(e.target.files[0]);
    };

    const extractText = async () => {
        if (!pdfFile) {
            alert('Please upload a PDF file.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('pdfFile', pdfFile);

            const response = await axios.post('/api/extractText', formData);
            setPdfText(response.data.text);
        } catch (error) {
            console.error('Error extracting PDF text:', error);
        }
    };

    const generateTweet = async () => {
        if (!prompt) {
            alert('Please extract text from a PDF first.');
            return;
        }

        try {
            const response = await axios.post('/api/generateTweet', { prompt });
            setTweet(response.data.tweet);
        } catch (error) {
            console.error('Error generating tweet:', error);
        }
    };

    return (
        <div>
            <input type="file" accept=".pdf" onChange={handleFileUpload} />
            <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
            >
                {Array.from(new Array(numPages), (_, index) => (
                    <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                ))}
            </Document>
            <button onClick={extractText}>Extract Text</button>
            <textarea
                value={pdfText}
                onChange={(e) => setPdfText(e.target.value)}
                placeholder="PDF Text"
            />
            <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter tweet prompt..."
            />
            <button onClick={generateTweet}>Generate Tweet</button>
            <div>Tweet: {tweet}</div>
        </div>
    );
}
