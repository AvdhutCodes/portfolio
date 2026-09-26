/**
 * LETTERBOXD AUTOMATED SYNC ENGINE FOR AVDHUT KULKARNI
 * Fetches https://letterboxd.com/avd1234/rss/ and generates structured JSON
 * Supports build-time synchronization & offline fallback.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const RSS_URL = 'https://letterboxd.com/avd1234/rss/';
const OUTPUT_PATHS = [
  path.join(__dirname, '..', 'data', 'letterboxd.json'),
  path.join(__dirname, '..', 'dist', 'data', 'letterboxd.json'),
  path.join(__dirname, '..', 'src', 'data', 'letterboxd.json'),
  path.join(__dirname, '..', 'public', 'data', 'letterboxd.json')
];

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function fetchRss(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchRss(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch RSS: HTTP ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseLetterboxdRss(xml) {
  const items = xml.split('<item>').slice(1);
  const reviews = [];

  for (const itemXml of items) {
    const titleMatch = itemXml.match(/<letterboxd:filmTitle>([^<]+)<\/letterboxd:filmTitle>/);
    const yearMatch = itemXml.match(/<letterboxd:filmYear>([^<]+)<\/letterboxd:filmYear>/);
    const ratingMatch = itemXml.match(/<letterboxd:memberRating>([^<]+)<\/letterboxd:memberRating>/);
    const watchedMatch = itemXml.match(/<letterboxd:watchedDate>([^<]+)<\/letterboxd:watchedDate>/);
    const rewatchMatch = itemXml.match(/<letterboxd:rewatch>([^<]+)<\/letterboxd:rewatch>/);
    const linkMatch = itemXml.match(/<link>([^<]+)<\/link>/);
    const likedMatch = itemXml.match(/<letterboxd:memberLike>([^<]+)<\/letterboxd:memberLike>/);
    const posterMatch = itemXml.match(/src="([^"]+)"/);

    const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
    let reviewSnippet = '';
    if (descMatch) {
      // Remove poster image paragraph and HTML tags
      const cleaned = descMatch[1]
        .replace(/<p><img[^>]*><\/p>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .trim();
      reviewSnippet = cleaned.length > 280 ? cleaned.substring(0, 277) + '...' : cleaned;
    }

    if (titleMatch) {
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
      let stars = '';
      if (rating > 0) {
        const fullStars = Math.floor(rating);
        const halfStar = (rating % 1 !== 0) ? '½' : '';
        stars = '★'.repeat(fullStars) + halfStar;
      }

      reviews.push({
        title: titleMatch[1],
        year: yearMatch ? yearMatch[1] : '',
        rating,
        stars: stars || 'Unrated',
        watchedDate: watchedMatch ? watchedMatch[1] : '',
        rewatch: rewatchMatch ? rewatchMatch[1] === 'Yes' : false,
        liked: likedMatch ? likedMatch[1] === 'Yes' : false,
        poster: posterMatch ? posterMatch[1] : null,
        link: linkMatch ? linkMatch[1] : 'https://letterboxd.com/avd1234/',
        review: reviewSnippet
      });
    }
  }

  // Filter 5-star masterpieces for "Top Four"
  const fiveStars = reviews.filter(r => r.rating === 5.0 && r.poster);
  const fourPointFive = reviews.filter(r => r.rating === 4.5 && r.poster);
  
  // Curate Top Four
  let topFour = [...fiveStars];
  if (topFour.length < 4) {
    topFour = topFour.concat(fourPointFive);
  }
  // If more than 4, pick top 4 distinct masterpieces
  topFour = topFour.slice(0, 4);

  return {
    lastUpdated: new Date().toISOString(),
    username: 'avd1234',
    profileUrl: 'https://letterboxd.com/avd1234/',
    totalEntries: reviews.length,
    topFour,
    recentWatches: reviews.slice(0, 16)
  };
}

async function syncLetterboxd() {
  console.log('🎬 Fetching live Letterboxd feed for @avd1234...');
  let xmlData = '';

  try {
    xmlData = await fetchRss(RSS_URL);
    console.log(`📡 Successfully fetched RSS XML (${xmlData.length} bytes)`);
  } catch (err) {
    console.warn('⚠️ Network fetch failed, checking for local fallback or cache:', err.message);
    const localXmlPath = path.join(__dirname, '..', 'letterboxd_rss.xml');
    if (fs.existsSync(localXmlPath)) {
      xmlData = fs.readFileSync(localXmlPath, 'utf8');
      console.log('📂 Loaded cached XML from letterboxd_rss.xml');
    } else {
      throw err;
    }
  }

  const parsedData = parseLetterboxdRss(xmlData);
  console.log(`✨ Parsed ${parsedData.totalEntries} diary entries.`);
  console.log(`🏆 Top Four: ${parsedData.topFour.map(m => m.title).join(', ')}`);
  console.log(`🍿 Latest Watch: ${parsedData.recentWatches[0]?.title} (${parsedData.recentWatches[0]?.year}) - ${parsedData.recentWatches[0]?.stars}`);

  const jsonString = JSON.stringify(parsedData, null, 2);

  OUTPUT_PATHS.forEach(p => {
    ensureDirForFile(p);
    fs.writeFileSync(p, jsonString, 'utf8');
    console.log(`💾 Saved Letterboxd data to ${p}`);
  });

  return parsedData;
}

if (require.main === module) {
  syncLetterboxd().then(() => {
    console.log('✅ Letterboxd sync completed successfully.');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Letterboxd sync error:', err);
    process.exit(1);
  });
}

module.exports = { syncLetterboxd, parseLetterboxdRss };
