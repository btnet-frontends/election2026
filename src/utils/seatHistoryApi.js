const HISTORY_API_URL = 'https://doqvf81n9htmm.cloudfront.net/2026election/getParliamentaryHistory';
const PARTY_COLOR_CSV_URL = 'https://docs.google.com/spreadsheets/d/16UCNbkRG239e4Q4SiEXE9xn470I5Xs0b7h8DLa0g8D8/export?format=csv&gid=0';

// API 的政黨名稱與色票表（Google Sheet）名稱不一致時的對照
const COLOR_NAME_ALIASES = {
  綠黨: '台灣綠黨',
  台灣團結聯盟: '台聯黨'
};

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

const parseCsvRows = (text) => {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
};

// 色票表欄位：政黨編號,政黨名稱,圖片名稱,負責人,代表顏色色碼,自定色票註記
const parsePartyColors = (csvText) => {
  const colors = {};

  parseCsvRows(csvText).slice(1).forEach((columns) => {
    const name = columns[1]?.trim();
    const color = columns[4]?.trim();
    if (name && HEX_COLOR_PATTERN.test(color)) {
      colors[name] = color;
    }
  });

  return colors;
};

const resolvePartyColor = (partyName, colors) => (
  colors[partyName] ?? colors[COLOR_NAME_ALIASES[partyName]] ?? null
);

const normalizeHistory = (historyJson, colors) => {
  const years = Object.keys(historyJson)
    .filter((key) => /^\d{4}$/.test(key))
    .map(Number)
    .sort((a, b) => b - a);

  const data = Object.fromEntries(years.map((year) => [
    year,
    Object.fromEntries(Object.entries(historyJson[String(year)]).map(([city, cityData]) => [
      city,
      {
        totalSeats: cityData.total_seats,
        parties: Object.entries(cityData.parties).map(([name, party]) => ({
          name,
          seats: party.seats,
          voteRate: party.vote_rate,
          color: resolvePartyColor(name, colors)
        }))
      }
    ]))
  ]));

  return { years, data, source: historyJson.metadata?.source ?? null };
};

/**
 * 抓取各縣市議員席次歷史（中選會資料）並套上政黨代表色。
 * 於 Astro build 階段呼叫；失敗時回傳 null。
 */
export async function fetchSeatHistory() {
  try {
    const [historyRes, colorRes] = await Promise.all([
      fetch(HISTORY_API_URL),
      fetch(PARTY_COLOR_CSV_URL)
    ]);

    if (!historyRes.ok) {
      throw new Error(`議員席次 API 回應 ${historyRes.status}`);
    }

    let colors = {};
    if (colorRes.ok) {
      colors = parsePartyColors(await colorRes.text());
    } else {
      console.error(`政黨色票表抓取失敗: ${colorRes.status}，改用預設顏色`);
    }

    return normalizeHistory(await historyRes.json(), colors);
  } catch (error) {
    console.error('Astro 靜態抓取議員席次資料發生異常:', error);
    return null;
  }
}
