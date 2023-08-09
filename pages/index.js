import React, { useState } from 'react';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';

export default function Home() {
    const [pdfFile, setPdfFile] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [tweet, setTweet] = useState('');

    const handleFileUpload = (e) => {
        setPdfFile(e.target.files[0]);
    };

    const extractText = async () => {
        if (!pdfFile) {
            alert('Please upload a PDF file.');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const pdfData = new Uint8Array(event.target.result);
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.js'; // Set worker source

                const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                let pdfText = '';

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const pageText = await page.getTextContent();
                    pdfText += pageText.items.map(item => item.str).join(' ');
                }

                console.log('Extracted Text:', pdfText); // Log the extracted text
                setPrompt(pdfText);
            };

            reader.readAsArrayBuffer(pdfFile);
        } catch (error) {
            console.error('Error extracting PDF text:', error);
        }
    };

    const generateTweet = async () => {
        // Generate tweet logic using the prompt
    };

    return (
        <div>
            <input type="file" accept=".pdf" onChange={handleFileUpload} />
            <button onClick={extractText}>Extract Text</button>
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
