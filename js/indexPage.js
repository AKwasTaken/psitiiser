import { initHomeContent } from "./content.js";
import { initAmbientField } from "./animations/ambientField.js";
import { initWaveHero } from "./animations/waveHero.js";
import { initDiffraction } from "./animations/diffractionSlit.js";

window.addEventListener("DOMContentLoaded", () => {
  initHomeContent();
  initAmbientField();
  initWaveHero();
  initDiffraction();
});
