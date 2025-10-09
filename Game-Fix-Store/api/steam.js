// api/steam.js
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    const { appid } = req.query;
    
    if (!appid) {
        return res.status(400).json({ error: 'App ID is required' });
    }
    
    try {
        const response = await fetch(
            `https://store.steampowered.com/api/appdetails?appids=${appid}&json=1`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Steam API request failed');
        }
        
        const data = await response.json();
        
        // Cache the response for 24 hours
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
        
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching Steam data:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch game data',
            appid: appid 
        });
    }
}