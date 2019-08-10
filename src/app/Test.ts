
import {RakutenReader} from "./modules/Rakuten/RakutenReader"
async function Test() {
  const reader = new RakutenReader("1034797542507942346");
  const items = await reader.loadItem(100094);
  console.log(JSON.stringify(items));
}

Test();