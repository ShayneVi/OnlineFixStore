// api/coop.js
// Place this file in your /api folder for Vercel
//
// IMPORTANT: This API currently returns MOCK data with 4 players for ALL games.
//
// To fix player count issues:
// 1. Manually populate coopData.json with correct data from Co-Optimus for each game
// 2. OR implement a web scraper (see implementation notes below)
//
// The app tries coopData.json FIRST, then falls back to this API.
// So the easiest solution is to populate coopData.json with accurate data.

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

  // TODO: Implement actual Co-Optimus scraping here
  // WARNING: Co-Optimus may block automated scraping. Use at your own risk.
  //
  // For a proper implementation, you would:
  // 1. Search Co-Optimus for the game
  // 2. Parse the HTML to extract co-op data
  // 3. Extract maxPlayers from the page (look for "2 Players", "3 Players", "12 Players", etc.)
  // 4. Return the structured data
  //
  // Example structure to extract:
  // - Look for "Online Co-Op:" section and parse player count
  // - Look for "Couch Co-Op:" or "Local Co-Op:" section
  // - Parse campaign support, LAN play, etc.

  // Return mock data for now - REPLACE THIS with actual scraping logic
  // NOTE: This returns 4 players for ALL games, which causes incorrect data
  try {
    const mockData = {
      localCoop: false,
      localCoopPlayers: null,
      onlineCoop: true,
      onlineCoopPlayers: "4 Players",
      comboCoop: false,
      lanPlay: false,
      coopCampaign: true,
      maxPlayers: 4, // ⚠️ HARDCODED - This causes 3-player games to show as 4-player
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