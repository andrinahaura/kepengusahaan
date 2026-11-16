import { esc } from "./format.js";

export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];

/** Isi <select> dengan nilai unik yang sudah diurutkan. */
export function fillSelect(sel, values) {
  [...new Set(values.filter(Boolean))]
    .sort()
    .forEach((v) => sel.insertAdjacentHTML("beforeend", `<option>${esc(v)}</option>`));
}
