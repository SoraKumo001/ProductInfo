
import {RakutenReader} from "../src/app/modules/Rakuten"
async function Test() {
  const reader = new RakutenReader("1034797542507942346");
  const genres = await reader.loadItem(100000);
  console.log(JSON.stringify(genres));
}

Test();