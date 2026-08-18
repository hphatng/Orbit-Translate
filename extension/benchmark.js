const fs = require('fs');
const https = require('https');

// Put your Gemini API keys here to test. 
// We will pass them as arguments or hardcode for local testing.
const apiKeys = process.env.GEMINI_KEYS ? process.env.GEMINI_KEYS.split(',') : ['YOUR_API_KEY_HERE']; 
if (apiKeys[0] === 'YOUR_API_KEY_HERE') {
  console.log("Please provide API keys via GEMINI_KEYS env var, e.g. GEMINI_KEYS=key1,key2 node benchmark.js");
  // Try to load from .env if possible
}

const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];

function fetchGemini(model, apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
    });

    const start = performance.now();
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const end = performance.now();
        const duration = end - start;
        
        try {
          const json = JSON.parse(data);
          if (json.error) {
            resolve({ model, status: res.statusCode, error: json.error.message, duration });
          } else {
            resolve({ model, status: res.statusCode, success: true, duration });
          }
        } catch (e) {
          resolve({ model, status: res.statusCode, error: "Parse error", duration });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(payload);
    req.end();
  });
}

async function runBenchmark() {
  console.log("Starting Gemini API Benchmark...\n");
  
  const prompt = `Bạn là chuyên gia ngôn ngữ. Dịch MỤC TIÊU sang tiếng Việt, dựa vào NGỮ CẢNH để dịch chính xác.
NGỮ CẢNH: "This is a simple test sentence to measure the latency of the translation AI."
MỤC TIÊU CẦN DỊCH: "measure the latency"
YÊU CẦU BẮT BUỘC:
1. Bản dịch tiếng Việt ngắn gọn, tự nhiên. KHÔNG dịch toàn bộ NGỮ CẢNH.
2. Trả về đúng định dạng JSON: {"translation": "bản dịch"}`;

  for (const model of models) {
    console.log(`Testing model: ${model}...`);
    // Run 3 times to measure average
    let totalTime = 0;
    let successCount = 0;
    
    for (let i = 0; i < 3; i++) {
      const key = apiKeys[i % apiKeys.length];
      const result = await fetchGemini(model, key, prompt);
      
      if (result.success) {
        console.log(`  Attempt ${i+1}: ${result.duration.toFixed(2)}ms (Status: ${result.status})`);
        totalTime += result.duration;
        successCount++;
      } else {
        console.log(`  Attempt ${i+1}: Failed! (Status: ${result.status}) - ${result.error}`);
      }
      
      // Delay slightly between requests to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    }
    
    if (successCount > 0) {
      console.log(`> Average latency for ${model}: ${(totalTime / successCount).toFixed(2)}ms\n`);
    }
  }
  
  console.log("Benchmark finished.");
}

runBenchmark();
