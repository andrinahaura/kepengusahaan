import { bootPage } from "../common.js";
import { initPeta } from "../features/peta.js";
import { renderRingkasan } from "../features/ringkasan.js";

bootPage((d) => {
  renderRingkasan(d);
  initPeta(d);
});
