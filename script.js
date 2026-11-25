(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var THEME_KEY = "gs-theme";

  /* =======================================================
     Theme
     ======================================================= */
  var themeToggle = document.getElementById("theme-toggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function storedTheme() {
    try {
      var value = localStorage.getItem(THEME_KEY);
      return value === "light" || value === "dark" ? value : null;
    } catch (err) {
      return null;
    }
  }

  function syncThemeUI() {
    var dark = root.dataset.theme === "dark";
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      themeToggle.setAttribute("aria-pressed", String(dark));
    }
    if (themeMeta) {
      themeMeta.setAttribute("content", dark ? "#07070d" : "#f7f7fc");
    }
  }

  syncThemeUI();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (err) {
        /* Storage can be blocked; the theme still changes for this view. */
      }
      syncThemeUI();
    });
  }

  var systemTheme = window.matchMedia("(prefers-color-scheme: light)");
  function onSystemThemeChange(event) {
    if (storedTheme()) return;
    root.dataset.theme = event.matches ? "light" : "dark";
    syncThemeUI();
  }
  if (systemTheme.addEventListener) {
    systemTheme.addEventListener("change", onSystemThemeChange);
  }

  /* =======================================================
     Mobile navigation
     ======================================================= */
  var nav = document.getElementById("nav");
  var menuToggle = document.getElementById("menu-toggle");

  function closeMenu() {
    if (!nav || !menuToggle) return;
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }

  if (nav && menuToggle) {
    menuToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(event.target) || menuToggle.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* =======================================================
     Scroll progress + back to top
     ======================================================= */
  var progressBar = document.getElementById("scroll-progress-bar");
  var backToTop = document.getElementById("back-to-top");
  var scrollQueued = false;

  function updateScrollUI() {
    var scrollTop = window.scrollY || window.pageYOffset;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    if (progressBar) {
      progressBar.style.transform = "scaleX(" + progress + ")";
    }
    if (backToTop) {
      backToTop.classList.toggle("is-visible", scrollTop > 600);
    }

    updateActiveNav();
    scrollQueued = false;
  }

  function requestScrollUpdate() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(updateScrollUI);
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
    });
  }

  /* =======================================================
     Animated navigation indicator + scroll spy
     ======================================================= */
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  var navIndicator = nav ? nav.querySelector(".nav-indicator") : null;
  var activeNavLink = null;

  function moveIndicator(link) {
    if (!navIndicator || !nav) return;
    if (!link || window.innerWidth <= 900) {
      navIndicator.style.opacity = "0";
      return;
    }
    var navRect = nav.getBoundingClientRect();
    var linkRect = link.getBoundingClientRect();
    navIndicator.style.opacity = "1";
    navIndicator.style.width = linkRect.width + "px";
    navIndicator.style.transform =
      "translate(" + (linkRect.left - navRect.left) + "px, -50%)";
  }

  navLinks.forEach(function (link) {
    link.addEventListener("mouseenter", function () {
      moveIndicator(link);
    });
  });

  if (nav) {
    nav.addEventListener("mouseleave", function () {
      moveIndicator(activeNavLink);
    });
  }

  var navSections = navLinks
    .map(function (link) {
      var target = link.getAttribute("href");
      return target ? document.querySelector(target) : null;
    })
    .filter(Boolean);

  function updateActiveNav() {
    if (!navLinks.length || !navSections.length) return;

    var headerHeight = parseInt(getComputedStyle(root).getPropertyValue("--header-h"), 10) || 76;
    var marker = (window.scrollY || window.pageYOffset) + headerHeight + 120;
    var current = null;

    navSections.forEach(function (section) {
      var top = section.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
      if (top <= marker) current = section;
    });

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = navSections[navSections.length - 1];
    }

    if (current) {
      var currentLink = navLinks.find(function (link) {
        return link.getAttribute("href") === "#" + current.id;
      });
      if (currentLink) {
        activeNavLink = currentLink;
        navLinks.forEach(function (link) {
          if (link === currentLink) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
        moveIndicator(currentLink);
      }
    } else {
      activeNavLink = null;
      navLinks.forEach(function (link) {
        link.removeAttribute("aria-current");
      });
      moveIndicator(null);
    }
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      moveIndicator(activeNavLink);
    });
  }

  /* =======================================================
     Reveal on scroll
     ======================================================= */
  var revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* =======================================================
     Skill tabs
     ======================================================= */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".skill-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".skill-panel"));

  function activateTab(tab, focusTab) {
    tabs.forEach(function (item) {
      var selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    panels.forEach(function (panel) {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    });

    if (focusTab) tab.focus();
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      activateTab(tab, false);
    });

    tab.addEventListener("keydown", function (event) {
      var nextIndex = null;

      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;

      if (nextIndex !== null) {
        event.preventDefault();
        activateTab(tabs[nextIndex], true);
      }
    });
  });

  /* =======================================================
     Project filters
     ======================================================= */
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var projectCards = Array.prototype.slice.call(document.querySelectorAll(".project-card"));

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");

      filterButtons.forEach(function (item) {
        var active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      projectCards.forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-category") === filter;
        card.hidden = !show;
        if (show) card.classList.add("is-visible");
      });
    });
  });

  /* =======================================================
     Copy GitHub username
     ======================================================= */
  var copyButton = document.getElementById("copy-github");

  if (copyButton) {
    var copyLabel = copyButton.querySelector("span");
    var originalCopyLabel = copyLabel ? copyLabel.textContent : "Copy";

    copyButton.addEventListener("click", function () {
      var value = copyButton.getAttribute("data-copy") || "";
      var copied = false;

      function showCopyState(success) {
        if (copyLabel) copyLabel.textContent = success ? "Copied" : "Try again";
        copyButton.classList.toggle("is-copied", success);
        window.setTimeout(function () {
          if (copyLabel) copyLabel.textContent = originalCopyLabel;
          copyButton.classList.remove("is-copied");
        }, 1800);
      }

      function fallbackCopy() {
        try {
          var textarea = document.createElement("textarea");
          textarea.value = value;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          copied = document.execCommand("copy");
          document.body.removeChild(textarea);
        } catch (err) {
          copied = false;
        }
        showCopyState(copied);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(
          function () {
            showCopyState(true);
          },
          fallbackCopy
        );
      } else {
        fallbackCopy();
      }
    });
  }

  /* =======================================================
     GitHub activity
     ======================================================= */
  var GITHUB_USER = "shashank192008";
  var GITHUB_CACHE_KEY = "gs-github-cache-v1";
  var GITHUB_CACHE_TTL = 10 * 60 * 1000;
  var githubPanel = document.getElementById("github-panel");
  var githubStatus = document.getElementById("github-status");

  function setText(selector, value) {
    var element = document.querySelector(selector);
    if (element && value != null) element.textContent = value;
  }

  function formatMonthYear(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
  }

  function renderGitHub(data) {
    var user = data.user || {};
    var repos = Array.isArray(data.repos) ? data.repos.slice() : [];

    var languageCounts = {};
    repos.forEach(function (repo) {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });

    var languageEntry = Object.keys(languageCounts)
      .sort(function (a, b) {
        return languageCounts[b] - languageCounts[a];
      })
      .map(function (language) {
        return [language, languageCounts[language]];
      })[0];

    var primaryLanguage = languageEntry ? languageEntry[0] : "TypeScript";

    var latest = repos.sort(function (a, b) {
      return new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0);
    })[0];

    setText("[data-gh-repos]", typeof user.public_repos === "number" ? user.public_repos : repos.length);
    setText("[data-gh-lang]", primaryLanguage);
    setText("[data-gh-push]", latest ? formatMonthYear(latest.pushed_at) : "—");
    setText("[data-gh-since]", user.created_at ? String(new Date(user.created_at).getFullYear()) : "2026");

    if (latest) {
      setText("[data-gh-repo-name]", latest.name);
      setText("[data-gh-repo-desc]", latest.description || "No description provided.");
      setText("[data-gh-repo-lang]", latest.language || primaryLanguage);
      setText("[data-gh-repo-updated]", "Updated " + formatMonthYear(latest.updated_at || latest.pushed_at));

      var repoLink = document.querySelector(".latest-head a");
      if (repoLink && latest.html_url) repoLink.setAttribute("href", latest.html_url);

      var languageDot = document.querySelector(".lang-dot");
      var languageColors = {
        TypeScript: "#3178c6",
        JavaScript: "#f1e05a",
        CSS: "#563d7c",
        HTML: "#e34c26",
        Python: "#3572a5",
        Java: "#b07219",
        SQL: "#e38c00"
      };
      if (languageDot) {
        languageDot.style.background = languageColors[latest.language] || "var(--accent-2)";
      }
    } else {
      setText("[data-gh-repo-name]", "No public repositories yet");
      setText("[data-gh-repo-desc]", "New projects are on the way.");
      setText("[data-gh-repo-lang]", "—");
      setText("[data-gh-repo-updated]", "—");
    }

    if (githubStatus) {
      githubStatus.textContent = "Live data loaded from GitHub.";
    }
  }

  function readGitHubCache() {
    try {
      var raw = sessionStorage.getItem(GITHUB_CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.time || Date.now() - parsed.time > GITHUB_CACHE_TTL) return null;
      return parsed.data;
    } catch (err) {
      return null;
    }
  }

  function loadGitHub() {
    if (!githubPanel) return;

    var cached = readGitHubCache();
    if (cached) {
      renderGitHub(cached);
      return;
    }

    var timer = null;

    function finish() {
      if (timer) window.clearTimeout(timer);
    }

    var controller = "AbortController" in window ? new AbortController() : null;
    if (controller) {
      timer = window.setTimeout(function () {
        controller.abort();
      }, 8000);
    }

    var options = {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller ? controller.signal : undefined
    };

    Promise.all([
      fetch("https://api.github.com/users/" + GITHUB_USER, options),
      fetch("https://api.github.com/users/" + GITHUB_USER + "/repos?per_page=100&sort=updated", options)
    ])
      .then(function (responses) {
        if (!responses[0].ok || !responses[1].ok) throw new Error("GitHub request failed");
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(function (results) {
        var data = { user: results[0], repos: Array.isArray(results[1]) ? results[1] : [] };
        renderGitHub(data);
        try {
          sessionStorage.setItem(
            GITHUB_CACHE_KEY,
            JSON.stringify({ time: Date.now(), data: data })
          );
        } catch (err) {
          /* Caching is optional. */
        }
      })
      .catch(function () {
        if (githubStatus) {
          githubStatus.textContent =
            "Live data is unavailable right now. Showing the profile details saved on this page.";
        }
      })
      .finally(finish);
  }

  loadGitHub();

  /* =======================================================
     Contact form
     ======================================================= */
  var CONTACT_ENDPOINT = ""; /* e.g. "https://formspree.io/f/your-id" */
  var form = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");

  if (form) {
    var fields = {
      name: {
        input: document.getElementById("name"),
        error: document.getElementById("name-error"),
        validate: function (value) {
          return value.trim().length >= 2 ? "" : "Please enter your name.";
        }
      },
      email: {
        input: document.getElementById("email"),
        error: document.getElementById("email-error"),
        validate: function (value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
            ? ""
            : "Please enter a valid email address.";
        }
      },
      message: {
        input: document.getElementById("message"),
        error: document.getElementById("message-error"),
        validate: function (value) {
          return value.trim().length >= 10
            ? ""
            : "Please add a little more detail (at least 10 characters).";
        }
      }
    };

    function validateField(key) {
      var field = fields[key];
      if (!field || !field.input) return true;
      var message = field.validate(field.input.value);

      if (field.error) field.error.textContent = message;
      field.input.setAttribute("aria-invalid", message ? "true" : "false");
      return !message;
    }

    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (!field.input) return;

      field.input.addEventListener("input", function () {
        if (field.input.getAttribute("aria-invalid") === "true") validateField(key);
      });

      field.input.addEventListener("blur", function () {
        if (field.input.value.trim()) validateField(key);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (formStatus) {
        formStatus.textContent = "";
        formStatus.className = "form-status";
      }

      var firstInvalid = null;

      Object.keys(fields).forEach(function (key) {
        var valid = validateField(key);
        if (!valid && !firstInvalid) firstInvalid = fields[key].input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var honeypot = form.elements.namedItem("company");
      if (honeypot && honeypot.value) return;

      var payload = {
        name: fields.name.input.value.trim(),
        email: fields.email.input.value.trim(),
        message: fields.message.input.value.trim(),
        page: window.location.href
      };

      if (!CONTACT_ENDPOINT) {
        if (formStatus) {
          formStatus.className = "form-status is-info";
          formStatus.innerHTML =
            'The contact form isn\'t connected yet. Please reach out on ' +
            '<a href="https://github.com/shashank192008" target="_blank" rel="noopener">GitHub</a>.';
        }
        return;
      }

      var submitButton = form.querySelector(".form-submit");
      var submitLabel = submitButton ? submitButton.querySelector(".submit-label") : null;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add("is-loading");
      }
      if (submitLabel) submitLabel.textContent = "Sending…";

      fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed");
          form.reset();
          Object.keys(fields).forEach(function (key) {
            var field = fields[key];
            if (field.error) field.error.textContent = "";
            if (field.input) field.input.setAttribute("aria-invalid", "false");
          });
          if (formStatus) {
            formStatus.className = "form-status is-success";
            formStatus.textContent = "Thanks — your message is on its way.";
          }
        })
        .catch(function () {
          if (formStatus) {
            formStatus.className = "form-status is-error";
            formStatus.textContent =
              "Something went wrong. Please try again or reach me on GitHub.";
          }
        })
        .finally(function () {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove("is-loading");
          }
          if (submitLabel) submitLabel.textContent = "Send message";
        });
    });
  }

  /* =======================================================
     Footer year
     ======================================================= */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* Initial paint */
  updateScrollUI();
})();
