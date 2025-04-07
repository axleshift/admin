import axios from 'axios';

const API_URL = 'http://localhost:5053/client/login';
const TEST_CREDENTIALS = {
    identifier: 'try@gmail.com',
    password: '123123123'
};

async function sendSequentialRequests(count) {
    console.log(`Sending ${count} sequential login requests...`);
    
    for (let i = 0; i < count; i++) {
        console.log(`Sending request ${i+1}...`);
        try {
            await axios.post(API_URL, TEST_CREDENTIALS);
            console.log(`Request ${i+1} completed successfully`);
        } catch (err) {
            console.log(`Request ${i+1} error: ${err.response?.status || 'Connection error'}`);
            console.log(`Error details: ${JSON.stringify(err.response?.data || {})}`);
        }
        
        // Short delay between requests to ensure they're recorded separately but close together
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('All requests completed');
}

// Send 5 sequential requests
sendSequentialRequests(5);