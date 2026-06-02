async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const messageText = inputField.value.trim();
    const chatBox = document.getElementById('chatBox');

    if (!messageText) return;

    // 1. User Message UI me add karein
    appendMessage(messageText, 'user-msg');
    inputField.value = ''; // Input clear karein

    // 2. Loading state/Typing placeholder
    const typingIndicator = appendMessage("Typing...", 'bot-msg');

    try {
        // Backend NLP API ko hit karein
        const response = await fetch('http://localhost:5000/api/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: messageText })
        });

        const data = await response.json();
        
        // Typing indicator hatakar real reply dalein
        typingIndicator.innerText = data.reply;

    } catch (error) {
        console.error('Error connecting to chatbot backend:', error);
        typingIndicator.innerText = "Error: Unable to connect to the bot server right now.";
    }

    // Auto scroll down
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(text, className) {
    const chatBox = document.getElementById('chatBox');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv; // Reference return kar rahe hain taaki "Typing..." text ko replace kar sakein
}

// Enter key dabane par message send ho jaye
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}