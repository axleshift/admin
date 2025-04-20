import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const DEFAULT_MODEL = 'gemini-1.5-pro-latest'; ;

function loadApiKey() {
  // Try multiple locations to find .env file
  const envPaths = ['.env', '../.env', '../../.env'];
  let envFound = false;
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      console.log(`Loading environment from ${envPath}`);
      dotenv.config({ path: envPath });
      envFound = true;
      break;
    }
  }

  if (!envFound) {
    console.log('No .env file found, trying default dotenv.config()');
    dotenv.config(); // Try loading from default location or process env
  }

  // Try to get the API key
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error('❌ ERROR: No GEMINI_API_KEY found in environment variables.');
    console.log('Available environment variables:', Object.keys(process.env).filter(key => !key.includes('SECRET'))); // Basic filtering
    console.log('\nPlease ensure your .env file contains: GEMINI_API_KEY=your_key_here');
    return null; // Indicate failure
  }

  // Safe logging of API key (partial)
  const keyFirstChars = API_KEY.substring(0, 5);
  const keyLength = API_KEY.length;
  console.log(`Found API key: ${keyFirstChars}... (${keyLength} characters)`);
  return API_KEY;
}


async function generateContent(prompt, apiKey, model = DEFAULT_MODEL) {
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  console.log(`\n--- Sending prompt to ${model} ---`);
  console.log(`Prompt: "${prompt}"`);
  console.log('---------------------------------');


  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        // Add generationConfig here if needed
        // generationConfig: GENERATION_CONFIG
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the text response
    // Optional: Add more robust checking if the structure might vary
    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (responseText) {
      console.log('✅ API call successful.');
      return responseText.trim(); // Return the generated text
    } else {
      console.warn('❓ API responded, but no text content found in the expected location.');
      console.log('Full response data:', JSON.stringify(response.data, null, 2));
      return null; // Indicate no content was generated as expected
    }

  } catch (error) {
    console.error('❌ ERROR calling Gemini API:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error(`Response data:`, JSON.stringify(error.response.data, null, 2)); // Log the full error response
      // Re-throw a more specific error or let the original bubble up
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('API Error: No response received from server.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      throw new Error(`API Error: Request setup failed - ${error.message}`);
    }
    // We re-throw the error so the calling code knows something went wrong.
    // You could also return null here if you prefer that pattern.
  }
}

// --- Main Execution ---
async function main() {
  console.log('===== Gemini API Runner =====');

  const apiKey = loadApiKey();
  if (!apiKey) {
    console.error("Exiting due to missing API key.");
    return; // Stop execution if the key wasn't found
  }

  // --- Define your prompt here ---
  const myPrompt = "Explain the difference between `let`, `const`, and `var` in JavaScript, provide examples for each.";
  // ------------------------------

  try {
    const generatedText = await generateContent(myPrompt, apiKey /*, optional_model_name */);

    if (generatedText) {
      console.log('\n===== Generated Content =====');
      console.log(generatedText);
      console.log('===========================');
    } else {
       console.log('\nNo content was generated or extracted from the response.');
    }

  
  } catch (error) {
    console.error('\n--- An error occurred during API interaction ---');
    console.error('Execution failed. Please check the error logs above.');

     console.error('--------------------------------------------\n');
  }
}

// Run the main function
main();