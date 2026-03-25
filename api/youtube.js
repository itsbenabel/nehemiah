export default async function handler(req, res) {
  const CHANNEL_ID = 'UCfMbCmbWrchtewC87T5xVtQ';
  const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  try {
    const response = await fetch(RSS_URL);
    if (!response.ok) throw new Error('Feed fetch failed');
    const xml = await response.text();

    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 3);

    const videos = entries.map(([, entry]) => {
      const title = (entry.match(/<title>(.*?)<\/title>/) || [])[1] || '';
      const videoId = (entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/) || [])[1] || '';
      const published = (entry.match(/<published>(.*?)<\/published>/) || [])[1] || '';
      return {
        title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        published,
      };
    });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ videos });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
}
