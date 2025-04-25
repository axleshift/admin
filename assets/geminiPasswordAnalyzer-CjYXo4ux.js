import{a as c}from"./index-xsH4HHeE.js";const l="AIzaSyBlGfiToGE4_D_86kpLw_7QSzvaAySDASA",h="https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",u=async e=>{try{const t={length:e.length,hasLowercase:/[a-z]/.test(e),hasUppercase:/[A-Z]/.test(e),hasNumbers:/\d/.test(e),hasSymbols:/[^A-Za-z0-9]/.test(e),patterns:{hasRepeatedChars:/(.)\1{2,}/.test(e),hasSequentialNumbers:/(?:012|123|234|345|456|567|678|789)/.test(e),hasKeyboardPatterns:/(?:qwer|asdf|zxcv|wasd)/i.test(e)}},s=`
    Analyze the following password features and provide a JSON response:
    - Length: ${t.length}
    - Contains lowercase: ${t.hasLowercase}
    - Contains uppercase: ${t.hasUppercase}
    - Contains numbers: ${t.hasNumbers}
    - Contains symbols: ${t.hasSymbols}
    - Contains repeated characters: ${t.patterns.hasRepeatedChars}
    - Contains sequential numbers: ${t.patterns.hasSequentialNumbers}
    - Contains keyboard patterns: ${t.patterns.hasKeyboardPatterns}

    Return a JSON object with:
    {
      "score": (0-100),
      "strength": "Weak | Moderate | Strong | Very Strong",
      "feedback": ["list of improvement suggestions"],
      "explanation": "brief explanation of the score"
    }
    `,n=(await c.post(h,{contents:[{parts:[{text:s}]}]},{headers:{"Content-Type":"application/json","x-goog-api-key":l}})).data.candidates[0].content.parts[0].text,a=n.match(/```json\s*([\s\S]*?)\s*```/)||n.match(/\{[\s\S]*\}/),r=a?JSON.parse(a[0].startsWith("{")?a[0]:a[1]):null;return!r||typeof r.score!="number"?(console.warn("AI response invalid, using fallback analysis."),i(e)):r}catch(t){return console.error("AI Password Analysis Error:",t),i(e)}},i=e=>{let t=0;const s=[],o=["password","123456","qwerty","letmein","welcome"];e.length>=8&&(t+=20),e.length>=12&&(t+=10),/[a-z]/.test(e)&&(t+=10),/[A-Z]/.test(e)&&(t+=15),/\d/.test(e)&&(t+=15),/[^A-Za-z0-9]/.test(e)&&(t+=20),/(.)\1{2,}/.test(e)&&(t-=10,s.push("Avoid excessive repetition of characters.")),o.includes(e.toLowerCase())&&(t-=30,s.push("Avoid using common passwords.")),e.length<8&&s.push("Use at least 8 characters."),/[a-z]/.test(e)||s.push("Add lowercase letters."),/[A-Z]/.test(e)||s.push("Add uppercase letters."),/\d/.test(e)||s.push("Add numbers."),/[^A-Za-z0-9]/.test(e)||s.push("Add special characters."),f(e)<28&&s.push("Increase password complexity for better security.");let a="Weak";return t>=30&&(a="Moderate"),t>=60&&(a="Strong"),t>=80&&(a="Very Strong"),{score:t,strength:a,feedback:s.length>0?s:["Good password!"],explanation:"Basic password analysis (AI fallback)."}},f=e=>{let t=0;return/[a-z]/.test(e)&&(t+=26),/[A-Z]/.test(e)&&(t+=26),/\d/.test(e)&&(t+=10),/[^A-Za-z0-9]/.test(e)&&(t+=32),e.length*Math.log2(t)};export{u as a,f as c};
