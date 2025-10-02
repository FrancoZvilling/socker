// src/App.jsx
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext'; 
import { BusinessProvider } from './context/BusinessContext';
import { AccessProvider } from './context/AccessContext';
import { ConnectionProvider } from './context/ConnectionContext';

function App() {
  return (
    <AuthProvider>
      <BusinessProvider> 
        <AccessProvider>
         <ConnectionProvider>
            <AppRouter />
          </ConnectionProvider>
        </AccessProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}

export default App;