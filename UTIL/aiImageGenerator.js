import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base template with modern design libraries included
const baseTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Banner</title>
  <!-- Include modern design libraries -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body, html {
      margin: 0;
      padding: 0;
      font-family: 'Poppins', sans-serif;
      overflow: hidden;
    }
    .banner-container {
      width: 1200px;
      height: 400px;
      overflow: hidden;
      position: relative;
    }
    /* Base styles for better appearance */
    h1, h2, h3 {
      margin: 0;
      line-height: 1.2;
      letter-spacing: -0.5px;
    }
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.2);
      z-index: 1;
    }
    .content {
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 0 100px;
    }
    /* Animation classes */
    .animate-text {
      animation: fadeInUp 1s ease-out;
    }
    /* Add your additional CSS after this line - AI will insert here */
  </style>
</head>
<body>
  <!-- Banner content will be inserted here by AI -->
</body>
</html>
`;

// Function to enhance prompt with design guidelines
const createEnhancedPrompt = (text) => {
  return `Create a visually striking and professional HTML announcement banner with this title: "${text}".

DESIGN REQUIREMENTS:
- Modern and professional corporate appearance
- Strong visual hierarchy with the main message being clearly visible
- Use a color palette that's both professional and eye-catching (blues, teals, or brand-appropriate colors)
- Include subtle animations or visual effects if appropriate
- Incorporate modern design principles like depth, shadows, and subtle gradients
- Optional: Include an abstract or geometric background pattern
- Banner dimensions: exactly 1200×400 pixels

TECHNICAL REQUIREMENTS:
- Use only HTML and CSS (no JavaScript)
- Ensure text is crisp and readable
- Build upon this base template structure:
\`\`\`
${baseTemplate}
\`\`\`
- Only complete the <body> section and add any additional CSS in the designated area
- Use web-safe fonts or Google Fonts that are already included
- Ensure the design looks professional, not generic

The banner should include:
1. The main headline: "${text}"
2. An appropriate visual metaphor or graphical element (using CSS, not external images)
3. Optional: A short supporting subheading if appropriate

Ensure the final result looks like a premium, professionally designed banner that would impress corporate clients. DO NOT include any explanations, just the complete HTML code.`;
};

// Function to generate banner using HTML + Screenshot approach
export const generateBanner = async (prompt) => {
  try {
    // Check API key availability
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use gemini-1.5-pro for better creative results
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Generate HTML for a banner with enhanced prompt
    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [{ text: createEnhancedPrompt(prompt) }] 
      }],
    });
    
    const htmlContent = result.response.text();
    
    // Ensure directories exist
    const tempDir = path.join(__dirname, '..', 'temp');
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    
    [tempDir, uploadsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Save HTML to a temporary file
    const tempHtmlPath = path.join(tempDir, `banner-${Date.now()}.html`);
    fs.writeFileSync(tempHtmlPath, htmlContent);
    
    // Use puppeteer to take a screenshot with enhanced quality settings
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
    
    const page = await browser.newPage();
    
    // Better image quality settings
    await page.setViewport({
      width: 1200,
      height: 400,
      deviceScaleFactor: 2, // Higher resolution (2x)
    });
    
    // Navigate with longer timeout for complex renders
    await page.goto(`file://${tempHtmlPath}`, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait a bit for any CSS animations to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create filename and path for the image
    const filename = `ai-banner-${Date.now()}.png`;
    const filePath = path.join(uploadsDir, filename);
    
    // FIXED: Removed 'quality' parameter for PNG screenshots
    await page.screenshot({ 
      path: filePath,
      type: 'png',
      fullPage: false,
      omitBackground: false
    });
    
    await browser.close();
    
    // Clean up the temporary HTML file
    fs.unlinkSync(tempHtmlPath);
    
    console.log(`Banner generated successfully: ${filename}`);
    return filename;
  } catch (error) {
    console.error("Error generating banner with AI:", error);
    throw new Error(`Failed to generate banner: ${error.message}`);
  }
};

// Optional: Add predefined templates that can be selected by users
export const bannerTemplates = {
  corporate: {
    name: "Corporate Blue",
    css: `
      .banner-corporate {
        background: linear-gradient(135deg, #1a3a8f 0%, #0f2557 100%);
        color: white;
        font-family: 'Poppins', sans-serif;
      }
      .banner-corporate h1 {
        font-size: 3.5rem;
        font-weight: 700;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
    `
  },
  modern: {
    name: "Modern Gradient",
    css: `
      .banner-modern {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: 'Poppins', sans-serif;
      }
      .banner-modern h1 {
        font-size: 3.5rem;
        font-weight: 600;
        letter-spacing: -1px;
      }
    `
  }
};

// Function to generate banner from a template
export const generateBannerFromTemplate = async (prompt, templateKey = 'corporate') => {
  // Implementation would be similar to generateBanner but using predefined templates
  // This is a placeholder for the concept
};