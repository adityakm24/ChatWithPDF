import pdf from 'pdf-parse';
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

    const pdfFile = req.files && req.files.pdfFile;

    if (!pdfFile) {
        return res.status(400).json({ error: 'PDF file is missing.' });
    }

    try {
        const pdfData = await pdf(pdfFile.data);
        const pdfText = pdfData.text;
        res.status(200).json({ text: pdfText });
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}
