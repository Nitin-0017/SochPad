const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA_FAKE_KEY'; // Just need to see if 404 or 400
async function test() {
  const r1 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, { method: 'POST', body: '{}' });
  console.log("gemini-2.0-flash:", r1.status);
  const r2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, { method: 'POST', body: '{}' });
  console.log("gemini-1.5-flash:", r2.status);
  const r3 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, { method: 'POST', body: '{}' });
  console.log("gemini-2.5-flash:", r3.status);
}
test();
