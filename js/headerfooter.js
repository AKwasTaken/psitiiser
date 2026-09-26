async function loadComponent(elementId, filePath, callback) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath} (Status: ${response.status})`);
    }
    const html = await response.text();
    const container = document.getElementById(elementId);
    if (container) {
      container.innerHTML = html;
      if (callback) callback();
    } else {
      console.warn(`Container element #${elementId} not found in DOM.`);
    }
  } catch (error) {
    console.error("Error loading component:", error);
  }
}

function setupMobileNav() {
  const toggleBtn = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (!toggleBtn || !navLinks) {
    console.warn("Mobile nav elements (#navToggle or #navLinks) missing from loaded template.");
    return;
  }

  toggleBtn.addEventListener("click", (event) => {
    event.stopPropagation();

    // Toggles both 'open' and 'is-open' so it works regardless of your CSS convention
    navLinks.classList.toggle("open");
    const isOpen = navLinks.classList.toggle("is-open");

    toggleBtn.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    const isClickInsideMenu = navLinks.contains(event.target);
    const isClickOnToggle = toggleBtn.contains(event.target);

    if (
      (navLinks.classList.contains("open") || navLinks.classList.contains("is-open")) &&
      !isClickInsideMenu &&
      !isClickOnToggle
    ) {
      navLinks.classList.remove("open", "is-open");
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("site-header", "assets/templates/header.html", setupMobileNav);
  loadComponent("site-footer", "assets/templates/footer.html");
});
