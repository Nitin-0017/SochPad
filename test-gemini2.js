const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA_FAKE_KEY';
async function test() {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-invalid-model:generateContent?key=${apiKey}`, { method: 'POST', body: '{}' });
  console.log("invalid model:", r.status);
}
test();
