import { useState } from 'react';
import axios from 'axios';

export default function Home() {
    const [pdfFile, setPdfFile] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [tweet, setTweet] = useState('');

    const handleFileUpload = (e) => {
        setPdfFile(e.target.files[0]);
    };

    const generateTweet = async () => {
        if (!pdfFile) {
            alert('Please upload a PDF file.');
            return;
        }

        const formData = new FormData();
        formData.append('pdfFile', pdfFile);
        formData.append('prompt', prompt);

        try {
            const response = await axios.post('/api/generateTweet', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setTweet(response.data.tweet);
        } catch (error) {
            console.error('Error generating tweet:', error);
        }
    };

    return (
        <div>
            <input type="file" accept=".pdf" onChange={handleFileUpload} />
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
