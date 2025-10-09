export default async function handler(req, res) {
     const { appid } = req.query;
     
     if (!appid) {
       return res.status(400).json({ error: 'AppID is required' });
     }

     try {
       const response = await fetch(
         `https://store.steampowered.com/api/appdetails?appids=${appid}`
       );
       const data = await response.json();
       
       res.setHeader('Access-Control-Allow-Origin', '*');
       res.setHeader('Access-Control-Allow-Methods', 'GET');
       res.json(data);
     } catch (error) {
       res.status(500).json({ error: 'Failed to fetch from Steam' });
     }
   }