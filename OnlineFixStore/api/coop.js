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

  try {
    // Search Co-Optimus for the game
    const searchQuery = encodeURIComponent(name);
    const searchUrl = `https://www.co-optimus.com/search.php?q=${searchQuery}`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!searchResponse.ok) {
      throw new Error('Failed to fetch from Co-Optimus');
    }

    const html = await searchResponse.text();
    
    // Parse the HTML to extract co-op information
    // This is a simplified parser - you may need to adjust based on actual HTML structure
    const coopData = parseCoopData(html, name);
    
    if (!coopData) {
      return res.status(404).json({ error: 'Co-op data not found' });
    }

    return res.status(200).json(coopData);

  } catch (error) {
    console.error('Error fetching co-op data:', error);
    return res.status(500).json({ error: 'Failed to fetch co-op data' });
  }
}

function parseCoopData(html, gameName) {
  try {
    // Basic parsing - this will need refinement based on actual HTML structure
    const data = {
      localCoop: false,
      localCoopPlayers: null,
      onlineCoop: false,
      onlineCoopPlayers: null,
      comboCoop: false,
      lanPlay: false,
      coopCampaign: false,
      popularity: null,
      source: null
    };

    // Look for "Local Co-Op" section
    if (html.includes('Local Co-Op') || html.includes('Couch Co-Op')) {
      data.localCoop = !html.includes('Local Co-Op</td><td>No</td>') && 
                       !html.includes('Not Supported');
      
      // Try to extract player count
      const localMatch = html.match(/Local Co-Op[^<]*<\/td>\s*<td[^>]*>([^<]+)</i);
      if (localMatch && localMatch[1]) {
        const playerInfo = localMatch[1].trim();
        if (!playerInfo.includes('No') && !playerInfo.includes('Not')) {
          data.localCoopPlayers = playerInfo;
        }
      }
    }

    // Look for "Online Co-Op" section
    if (html.includes('Online Co-Op')) {
      data.onlineCoop = !html.includes('Online Co-Op</td><td>No</td>') &&
                        !html.includes('Not Supported');
      
      const onlineMatch = html.match(/Online Co-Op[^<]*<\/td>\s*<td[^>]*>([^<]+)/i);
      if (onlineMatch && onlineMatch[1]) {
        const playerInfo = onlineMatch[1].trim();
        if (!playerInfo.includes('No') && !playerInfo.includes('Not')) {
          data.onlineCoopPlayers = playerInfo;
        }
      }
    }

    // Look for Combo Co-Op
    if (html.includes('Combo Co-Op')) {
      data.comboCoop = !html.includes('Combo Co-Op</td><td>No</td>');
    }

    // Look for LAN Play
    if (html.includes('LAN Play') || html.includes('System Link')) {
      data.lanPlay = !html.includes('LAN Play</td><td>No</td>') &&
                     !html.includes('System Link</td><td>No</td>');
    }

    // Look for Co-Op Campaign
    if (html.includes('Co-Op Campaign')) {
      data.coopCampaign = !html.includes('Co-Op Campaign</td><td>No</td>');
    }

    // Try to extract popularity ranking
    const popularityMatch = html.match(/Popularity\s*#(\d+)/i);
    if (popularityMatch) {
      data.popularity = parseInt(popularityMatch[1]);
    }

    // Find the game page URL
    const urlMatch = html.match(/href="(\/game\/\d+\/[^"]+)"/);
    if (urlMatch) {
      data.source = `https://www.co-optimus.com${urlMatch[1]}`;
    }

    // Only return data if we found at least some co-op information
    if (data.localCoop || data.onlineCoop || data.comboCoop || data.lanPlay) {
      return data;
    }

    return null;

  } catch (error) {
    console.error('Error parsing co-op data:', error);
    return null;
  }
}