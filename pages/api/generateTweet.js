import axios from 'axios';
import cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';
import textSummarizer from 'nodejs-text-summarizer'; // Import the library

const MAX_PROMPT_LENGTH = 500; // Define your maximum prompt length here
const API_TOKEN = 'YOUR_OPENAI_API_TOKEN'; // Replace with your OpenAI API token

const corsMiddleware = cors({
    origin: 'http://localhost:3000', // Allow requests from localhost:3000
    methods: ['POST', 'OPTIONS'], // Add other methods you need
});

function generatePdfAbstract(pdfText) {
    const options = {
        ratio: 0.2, // Adjust the ratio as needed
        sentences: false,
    };

    const summary = textSummarizer(pdfText, options);
    return summary;
}

export default async function handler(req, res) {
    await new Promise((resolve, reject) => {
        corsMiddleware(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });

    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const { prompt, pdfText } = req.body; // Extracted PDF text added

    if (prompt.length > MAX_PROMPT_LENGTH) {
        return res.status(400).json({ error: 'Prompt length exceeds the maximum limit.' });
    }

    const abstract = generatePdfAbstract(pdfText); // Generate abstract

    const totalInput = `${abstract}\n\nPrompt: ${prompt}`;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/engines/text-davinci-004/completions',
            {
                prompt: totalInput,
                max_tokens: 50,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_TOKEN}`,
                },
            }
        );

        const tweet = response.data.choices[0].text.trim();
        res.status(200).json({ tweet });
    } catch (error) {
        console.error('Error generating tweet:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}
