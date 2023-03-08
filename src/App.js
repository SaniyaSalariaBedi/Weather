import React, { useEffect } from 'react';
import WeatherApp from './components/Weather';
import './App.css';
import { loginInstance } from './services/api-instance';
const App = () => {

  // Runs once on mount
  useEffect(() => {
    login()
  }, []);


  // Function to authenticate user and store token in localStorage
  const login = async () => {
    const { data } = await loginInstance.get();
    localStorage.setItem('authToken', data.access_token);
  }
  return (
    <div className="App">
      <header className="App-header">
        <h1>Weather Dashboard</h1>
        <WeatherApp />
      </header>
    </div>
  );
}

export default App;
