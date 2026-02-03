import React from 'react';
import { UserProvider } from './context/UserContext';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <UserProvider>
      <Dashboard />
    </UserProvider>
  );
}

export default App;
