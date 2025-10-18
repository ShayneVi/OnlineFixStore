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
        // Fetch Steam Store API data
        const steamResponse = await fetch(
            `https://store.steampowered.com/api/appdetails?appids=${appid}&json=1`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );
        
        if (!steamResponse.ok) {
            throw new Error('Steam API request failed');
        }
        
        const steamData = await steamResponse.json();
        
        // Fetch Steam Spy API for tags (popular user-defined tags)
        let tags = [];
        try {
            const spyResponse = await fetch(
                `https://steamspy.com/api.php?request=appdetails&appid=${appid}`
            );
            
            if (spyResponse.ok) {
                const spyData = await spyResponse.json();
                if (spyData.tags) {
                    // Convert tags object to array sorted by count
                    tags = Object.entries(spyData.tags)
                        .map(([name, count]) => ({ name, count }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 15); // Top 15 tags
                }
            }
        } catch (tagError) {
            console.log('Could not fetch tags from SteamSpy:', tagError);
        }
        
        // Merge tags into Steam data
        if (steamData[appid] && steamData[appid].success) {
            steamData[appid].data.user_tags = tags;

            // If Metacritic score is missing, try to fetch from RAWG as fallback
            if (!steamData[appid].data.metacritic && steamData[appid].data.name) {
                try {
                    const gameName = steamData[appid].data.name;
                    const rawgResponse = await fetch(
                        `https://api.rawg.io/api/games?search=${encodeURIComponent(gameName)}&page_size=3`
                    );

                    if (rawgResponse.ok) {
                        const rawgData = await rawgResponse.json();
                        if (rawgData.results && rawgData.results.length > 0) {
                            const game = rawgData.results[0];
                            if (game.metacritic) {
                                steamData[appid].data.metacritic = {
                                    score: game.metacritic,
                                    url: `https://www.metacritic.com/game/${game.slug || ''}`
                                };
                                console.log(`✓ Added Metacritic score from RAWG for ${gameName}: ${game.metacritic}`);
                            }
                        }
                    }
                } catch (rawgError) {
                    console.log('Could not fetch Metacritic from RAWG:', rawgError);
                }
            }
        }

        // Cache the response for 24 hours
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

        return res.status(200).json(steamData);
    } catch (error) {
        console.error('Error fetching Steam data:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch game data',
            appid: appid 
        });
    }
}