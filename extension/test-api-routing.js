// Mocking Chrome Extension Environment
const performance = { now: () => Date.now() };

// The exact state and variables from background.js
const keyHealth = new Map();
let currentKeyIndex = 0;
const AI_MODELS = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];
const aiCache = new Map();

// Mock Fetch to simulate Google API responses
let fetchCalls = [];
async function mockFetch(url, options) {
  fetchCalls.push(url);
  
  // Extract key and model from URL
  const modelMatch = url.match(/models\/(.*?):/);
  const keyMatch = url.match(/key=(.*)/);
  const model = modelMatch ? modelMatch[1] : '';
  const key = keyMatch ? keyMatch[1] : '';

  // Simulate latency
  await new Promise(r => setTimeout(r, 10));

  // --- SCENARIO MOCKS ---
  
  // Scenario 3: Key 1 gets Rate Limited (429)
  if (key === 'KEY_RATE_LIMITED') {
    return {
      status: 429,
      json: async () => ({ error: { message: "Quota exceeded" } })
    };
  }

  // Scenario 5: Flash model fails on Key 2, should fallback to Pro
  if (key === 'KEY_FALLBACK' && model === 'gemini-1.5-flash-latest') {
    return {
      status: 500,
      json: async () => ({ error: { message: "Internal Server Error" } })
    };
  }
  
  // Scenario: Dead Key
  if (key === 'KEY_DEAD') {
    return {
      status: 400,
      json: async () => ({ error: { message: "API key not valid" } })
    };
  }

  // Success Response
  return {
    status: 200,
    json: async () => ({
      candidates: [{
        content: { parts: [{ text: `{"translation": "Mocked Translation from ${model} using ${key}"}` }] }
      }]
    })
  };
}

// Extracted executeAI logic (stripped of chrome.storage)
async function executeAI(prompt, apiKeys) {
  const startTime = performance.now();
  
  if (aiCache.has(prompt)) {
    return { success: true, meta: { model: 'cache', cached: true } };
  }

  let lastError = 'All keys exhausted or dead.';
  const now = Date.now();

  // Wake up cooled-down keys
  for (let k = 0; k < apiKeys.length; k++) {
    const kStr = apiKeys[k];
    const health = keyHealth.get(kStr);
    if (health && health.state === 'COOLDOWN' && now >= health.until) {
      keyHealth.set(kStr, { state: 'HEALTHY', until: 0 });
    }
  }

  // Smart Key Rotation
  const startingKeyIndex = currentKeyIndex;
  for (let attempt = 0; attempt < apiKeys.length; attempt++) {
    const keyIndex = (startingKeyIndex + attempt) % apiKeys.length;
    const apiKey = apiKeys[keyIndex];
    
    const health = keyHealth.get(apiKey) || { state: 'HEALTHY', until: 0 };
    if (health.state !== 'HEALTHY') continue;

    currentKeyIndex = (keyIndex + 1) % apiKeys.length;
    let keyExhausted = false;
    
    // Tiered Model Routing
    for (let m = 0; m < AI_MODELS.length; m++) {
      const model = AI_MODELS[m];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      try {
        const res = await mockFetch(url);
        const data = await res.json();

        if (data.error) {
          lastError = data.error.message || 'API Error';
          if (lastError.includes('API key not valid')) {
            keyHealth.set(apiKey, { state: 'DEAD', until: 0 });
            keyExhausted = true;
            break;
          }
          if (lastError.includes('quota') || lastError.includes('Quota') || res.status === 429) {
            keyHealth.set(apiKey, { state: 'COOLDOWN', until: Date.now() + 60000 });
            keyExhausted = true;
            break;
          }
          continue; // Fallback to next model
        } 
        
        if (data.candidates) {
          return { success: true, data: data.candidates[0].content.parts[0].text, meta: { key: apiKey, model } };
        }
      } catch (error) {
        lastError = error.message;
      }
    } 
  } 
  return { success: false, error: lastError };
}

async function runTests() {
  console.log("🚀 BẮT ĐẦU PENTEST KIẾN TRÚC SMART GATEWAY\n");

  console.log("--- TEST 1: CHIA TẢI 3 REQUEST (LOAD BALANCING) ---");
  let keys = ['KEY_1', 'KEY_2'];
  let reqs = [executeAI("Req 1", keys), executeAI("Req 2", keys), executeAI("Req 3", keys)];
  let results = await Promise.all(reqs);
  results.forEach((r, i) => console.log(`Request ${i+1}: Dùng ${r.meta ? r.meta.key : 'N/A'} -> ${r.success ? '✅ OK' : '❌ Lỗi'}`));
  console.log("Kỳ vọng: Key 1 -> Key 2 -> Key 1. (Chia đều tải 50-50)\n");

  console.log("--- TEST 2: XỬ LÝ LỖI RATE LIMIT (429) ---");
  keys = ['KEY_RATE_LIMITED', 'KEY_GOOD'];
  console.log("Bắn Request 1 (Sẽ dính 429 trên KEY_RATE_LIMITED)");
  let r1 = await executeAI("Req 4", keys);
  console.log(`Kết quả: Dùng ${r1.meta ? r1.meta.key : ('Lỗi ' + r1.error)} -> ${r1.success ? '✅ OK' : '❌ Lỗi'}`);
  console.log(`Trạng thái Key 1: ${keyHealth.get('KEY_RATE_LIMITED')?.state}`);
  
  console.log("Bắn Request 2 ngay sau đó");
  let r2 = await executeAI("Req 5", keys);
  console.log(`Kết quả: Dùng ${r2.meta ? r2.meta.key : 'N/A'} -> ${r2.success ? '✅ OK' : '❌ Lỗi'}`);
  console.log("Kỳ vọng: Lần 1 lỗi thì tự động switch sang KEY_GOOD. Lần 2 mặc định bỏ qua KEY_RATE_LIMITED và gọi KEY_GOOD.\n");

  console.log("--- TEST 3: MODEL FALLBACK TỰ ĐỘNG ---");
  keys = ['KEY_FALLBACK'];
  console.log("Bắn Request với Key bị lỗi model Flash");
  let r3 = await executeAI("Req 6", keys);
  console.log(`Kết quả: Mô hình thực tế đã dùng -> ${r3.meta.model}`);
  console.log("Kỳ vọng: Thuật toán nhận ra lỗi Flash và tự động nhảy sang dùng gemini-1.5-pro-latest trên CÙNG 1 Key!\n");

  console.log("✅ PENTEST HOÀN TẤT.");
}

runTests();
