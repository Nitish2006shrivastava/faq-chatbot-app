const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load FAQs Data
const faqsPath = path.join(__dirname, 'faqs.json');
const faqs = JSON.parse(fs.readFileSync(faqsPath, 'utf8'));

// Simple NLP Preprocessing & Word Matching Function
function getBestFAQMatch(userQuery) {
    // 1. Preprocessing: Lowercase karna aur faltu characters (??, !!, dots) hatana
    const cleanQuery = userQuery.toLowerCase().replace(/[^\w\s]/g, '');
    
    // 2. Tokenization: Sawaal ko alag-alag words (tokens) mein todna
    const queryTokens = cleanQuery.split(/\s+/);

    let bestMatch = null;
    let maxMatchCount = 0;

    // Stop words jinhe hum ignore kar sakte hain (NLP Cleaning)
    const stopWords = ['what', 'is', 'how', 'to', 'can', 'i', 'the', 'a', 'an', 'for', 'in', 'of', 'will', 'you', 'get', 'are', 'do'];

    // Filter out stop words from user query
    const filteredQueryTokens = queryTokens.filter(token => !stopWords.includes(token));

    faqs.forEach((faq) => {
        const cleanQuestion = faq.question.toLowerCase().replace(/[^\w\s]/g, '');
        const questionTokens = cleanQuestion.split(/\s+/);

        let currentMatchCount = 0;

        // Count how many important words match
        filteredQueryTokens.forEach(token => {
            if (questionTokens.includes(token) && token.length > 1) {
                currentMatchCount++;
            }
        });

        // Intent matching via sentence inclusion
        if (cleanQuestion.includes(cleanQuery) || cleanQuery.includes(cleanQuestion)) {
            currentMatchCount += 3; // Extra weight if phrase matches directly
        }

        if (currentMatchCount > maxMatchCount) {
            maxMatchCount = currentMatchCount;
            bestMatch = faq;
        }
    });

    // Threshold: Kam se kam 1 ya usse zyada zaroori word match hona chahiye
    if (maxMatchCount > 0) {
        return bestMatch.answer;
    }
    
    return null;
}

// Chatbot Route
app.post('/api/chatbot', (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ reply: "Please say something!" });
    }

    const botReply = getBestFAQMatch(userMessage);

    if (botReply) {
        res.json({ reply: botReply });
    } else {
        res.json({ 
            reply: "I'm sorry, I couldn't find a matching answer for that. Try asking keywords like 'certificate', 'duration', 'paid', 'free', or 'apply'!" 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Chatbot Server running on http://localhost:${PORT}`);
});