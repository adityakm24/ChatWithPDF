import axios from 'axios';
import cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

const corsMiddleware = cors({
    origin: 'http://localhost:3000', // Allow requests from localhost:3000
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

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/engines/text-davinci-004/completions',
            {
                prompt: `${prompt}`,
                max_tokens: 50,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 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', // Your OpenAI API key
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
