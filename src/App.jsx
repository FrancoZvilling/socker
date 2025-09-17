// src/App.jsx
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext'; 
import { BusinessProvider } from './context/BusinessContext';


function App() {
  return (
    <AuthProvider>
      <BusinessProvider> 
        <AppRouter />
      </BusinessProvider>
    </AuthProvider>
  );
}

export default App;