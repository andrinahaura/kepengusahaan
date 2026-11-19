import { bootPage } from "../common.js";
import { initPeta } from "../features/peta.js";
import { renderRingkasan } from "../features/ringkasan.js";
import { renderSekilas } from "../features/sekilas.js";

bootPage((d) => {
  renderRingkasan(d);
  initPeta(d);
  renderSekilas(d);
});
