(function () {
  var toggle = document.getElementById("nav-toggle");
  if (toggle) {
    document.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.checked = false;
      });
    });
  }

  var filterRoot = document.querySelector("[data-project-filter]");
  if (!filterRoot) return;

  var buttons = filterRoot.querySelectorAll("[data-filter]");
  var cards = document.querySelectorAll(".card[data-tags]");
  var blocks = document.querySelectorAll(".field-block");
  var status = document.querySelector("[data-filter-status]");

  function label(count, filter) {
    var names = { all: "all", software: "Software", ai: "AI", data: "Data", robot: "Robot" };
    var name = names[filter] || filter;
    var noun = count === 1 ? "project" : "projects";
    return count + " " + noun + " in " + name;
  }

  function applyFilter(filter) {
    var shown = 0;
    cards.forEach(function (card) {
      var tags = (card.getAttribute("data-tags") || "").split(/\s+/);
      var match = filter === "all" || tags.indexOf(filter) !== -1;
      card.classList.toggle("is-hidden", !match);
      if (match) shown += 1;
    });
    blocks.forEach(function (block) {
      var visible = block.querySelectorAll(".card:not(.is-hidden)").length;
      block.classList.toggle("is-empty", visible === 0);
    });
    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-filter") === filter));
    });
    if (status) status.textContent = label(shown, filter);
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      applyFilter(button.getAttribute("data-filter"));
    });
  });

  applyFilter("all");
})();
