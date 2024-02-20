// Function to calculate the current theme setting based on user preferences
function calculateSettingAsThemeString({ localStorageTheme, systemSettingDark }) {
    if (localStorageTheme !== null) {
      return localStorageTheme; // Use the stored theme if available
    }
    if (systemSettingDark.matches) {
      return "dark" // Use dark theme if user prefers dark mode
    }
    return "light" // Default to light theme
  }
  
  // Function to update the theme setting on the HTML tag
  function updateThemeOnHtmlEl({ theme }) {
    document.querySelector("html").setAttribute("data-theme", theme)
  }
  
  // On page load:
  const button = document.querySelector("[data-theme-toggle]")
  const localStorageTheme = localStorage.getItem("theme")
  const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)")
  
  let currentThemeSetting = calculateSettingAsThemeString({ localStorageTheme, systemSettingDark })
  
  // Set initial theme based on user preferences
  updateThemeOnHtmlEl({ theme: currentThemeSetting })
  
  // Event listener to toggle the theme
  button.addEventListener("click", (event) => {
    const newTheme = currentThemeSetting === "dark" ? "light" : "dark"
  
    // Update theme setting in local storage
    localStorage.setItem("theme", newTheme)
    // Update theme based on new theme
    updateThemeOnHtmlEl({ theme: newTheme })
    
    // Update current theme setting
    currentThemeSetting = newTheme

  })
  