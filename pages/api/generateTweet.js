import axios from 'axios';
import pdf from 'pdf-parse';
import cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

const corsMiddleware = cors({
    origin: '*', // Update this to your actual frontend URL
    methods: ['POST', 'OPTIONS'], // Add other methods you need
});

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

    const { prompt } = req.body;
    const pdfFile = req.files && req.files.pdfFile;

    if (!pdfFile) {
        return res.status(400).json({ error: 'PDF file is missing.' });
    }

    try {
        const pdfData = await pdf(pdfFile.data);
        const pdfText = pdfData.text;
        console.log(pdfText);

        const response = await axios.post(
            'https://api.openai.com/v1/engines/text-davinci-004/completions',
            {
                prompt: `${pdfText}\n\nPrompt: ${prompt}`,
                max_tokens: 50,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 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', // Replace with your OpenAI API key
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
