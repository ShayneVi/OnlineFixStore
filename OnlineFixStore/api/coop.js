// api/coop.js
// Place this file in your /api folder for Vercel

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Game name is required' });
  }

  console.log('Fetching co-op data for:', name);

  // Return mock data for now - you can enhance this later
  // For testing, return some default co-op structure
  try {
    const mockData = {
      localCoop: false,
      localCoopPlayers: null,
      onlineCoop: true,
      onlineCoopPlayers: "4 Players",
      comboCoop: false,
      lanPlay: false,
      coopCampaign: true,
      maxPlayers: 4,
      popularity: null,
      source: `https://www.co-optimus.com/search.php?q=${encodeURIComponent(name)}`
    };

    console.log('Returning mock data:', mockData);
    return res.status(200).json(mockData);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to fetch co-op data' });
  }
}