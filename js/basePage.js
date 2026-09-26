import { initHomeContent } from "./content.js";
import { initAmbientField } from "./animations/ambientField.js";
// import { initWaveHero } from "./animations/waveHero.js";
// import { initDiffraction } from "./animations/diffractionSlit.js";

window.addEventListener("DOMContentLoaded", () => {
  initAmbientField();

  if (document.getElementById("featuredContainer")) {
    initHomeContent();
  } else {
    window.addEventListener("footerLoaded", () => {
      initHomeContent();
    }, { once: true });
  }
});
