import{a as i}from"./index-t--hEgTQ.js";const c="AIzaSyBlGfiToGE4_D_86kpLw_7QSzvaAySDASA",h="https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",f=async e=>{try{const t={length:e.length,hasLowercase:/[a-z]/.test(e),hasUppercase:/[A-Z]/.test(e),hasNumbers:/\d/.test(e),hasSymbols:/[^A-Za-z0-9]/.test(e),patterns:{hasRepeatedChars:/(.)\1{2,}/.test(e),hasSequentialNumbers:/(?:012|123|234|345|456|567|678|789)/.test(e),hasKeyboardPatterns:/(?:qwer|asdf|zxcv|wasd)/i.test(e)}},s=`
      As a password security AI, analyze this password's strength based on these features:
      - Length: ${t.length} characters
      - Contains lowercase letters: ${t.hasLowercase}
      - Contains uppercase letters: ${t.hasUppercase}
      - Contains numbers: ${t.hasNumbers}
      - Contains symbols: ${t.hasSymbols}
      - Contains repeated characters: ${t.patterns.hasRepeatedChars}
      - Contains sequential numbers: ${t.patterns.hasSequentialNumbers}
      - Contains keyboard patterns: ${t.patterns.hasKeyboardPatterns}
      
      Provide a JSON response with:
      1. A numerical score from 0-100
      2. A strength classification (Weak, Moderate, Strong, Very Strong)
      3. An array of specific improvement suggestions
      4. A brief explanation of the scoring
      
      Return ONLY valid JSON without any other text.
    `,r=(await i.post(h,{contents:[{parts:[{text:s}]}]},{headers:{"Content-Type":"application/json","x-goog-api-key":c}})).data.candidates[0].content.parts[0].text,n=r.match(/```json\s*([\s\S]*?)\s*```/)||r.match(/\{[\s\S]*\}/),o=n?JSON.parse(n[0].startsWith("{")?n[0]:n[1]):null;if(!o)throw new Error("Failed to parse AI response");return o}catch(t){return console.error("AI Password Analysis Error:",t),l(e)}},l=e=>{let t=0;const s=[];e.length>=8&&(t+=20),e.length>=12&&(t+=10),/[a-z]/.test(e)&&(t+=10),/[A-Z]/.test(e)&&(t+=15),/\d/.test(e)&&(t+=15),/[^A-Za-z0-9]/.test(e)&&(t+=20),/(.)\1{2,}/.test(e)&&(t-=10),e.length<8&&s.push("Use at least 8 characters"),/[a-z]/.test(e)||s.push("Add lowercase letters"),/[A-Z]/.test(e)||s.push("Add uppercase letters"),/\d/.test(e)||s.push("Add numbers"),/[^A-Za-z0-9]/.test(e)||s.push("Add special characters"),/(.)\1{2,}/.test(e)&&s.push("Avoid repeated characters");let a="Weak";return t>=30&&(a="Moderate"),t>=60&&(a="Strong"),t>=80&&(a="Very Strong"),{score:t,strength:a,feedback:s.length>0?s:["Good password!"],explanation:"Basic password analysis (AI fallback)"}};export{f as a};
