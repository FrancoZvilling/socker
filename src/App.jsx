// src/App.jsx
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext'; 
import { BusinessProvider } from './context/BusinessContext';
import { AccessProvider } from './context/AccessContext';


function App() {
  return (
    <AuthProvider>
      <BusinessProvider> 
        <AccessProvider>
          <AppRouter />
        </AccessProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}

export default App;