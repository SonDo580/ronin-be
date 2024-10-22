const express = require("express");
const NodeCache = require("node-cache");

// mock data
const airports = [
  { code: "HAN", name: "Noi Bai" },
  { code: "SGN", name: "Tan Son Nhat" },
  { code: "DAD", name: "Da Nang" },
  { code: "CXR", name: "Cam Ranh" },
  { code: "VII", name: "Vinh" },
];

const app = express();
const PORT = 5000;

// in-memory cache with TTL of 5 seconds
const cache = new NodeCache({ stdTTL: 5 });
const CACHE_KEYS = {
  airports: "airports",
};

// implement read-aside
const getData = (key, retrieveFn) => {
  // check cache first
  const cachedData = cache.get(key);
  if (cachedData) {
    return { fromCache: true, data: cachedData };
  }

  // retrieve data from DB if not found in cache
  const data = retrieveFn();

  // write to cache
  cache.set(key, data);
  return { fromCache: false, data };
};

app.get("/airports", async (req, res) => {
  const { fromCache, data } = getData(CACHE_KEYS.airports, () => airports);
  res.json({ fromCache, data });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
