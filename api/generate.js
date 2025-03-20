import fetch from 'node-fetch';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // CORS for frontend
  const { niche, keywords } = req.query;

  if (!niche || !keywords) {
    res.status(400).json({ error: 'Niche and keywords are required' });
    return;
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: `${niche} news: ${keywords} are trending.` })
    });
    const data = await response.json();
    const summary = data[0]?.summary_text || `${niche} + ${keywords} = hot!`;

    const posts = {
      x: `${summary.slice(0, 280)}`,
      instagram: `Check out ${niche}: ${keywords}!`,
      tiktok: `"Yo, ${niche} fans, ${keywords} is lit!"`
    };
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate posts: ' + error.message });
  }
};