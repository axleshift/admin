import React, { createContext, useState, useContext } from 'react'
import PropTypes from 'prop-types' // Import PropTypes for validation

// Create a context for the theme
const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light') // Default theme

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  // The return statement should be inside the functional component body
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === 'light' ? 'light-theme' : 'dark-theme'}>{children}</div>
    </ThemeContext.Provider>
  )
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validate children as required node
}

export default ThemeProvider // Export the ThemeProvider
