import React from 'react';
    import { Outlet } from 'react-router-dom';
    import Sidebar from '../components/layout/Sidebar';
    import './MainLayout.css';

    const MainLayout = () => {
      return (
        <div className="main-layout">
          <Sidebar />
          <main className="main-content">
            {/* El <Outlet> es donde React Router renderizará la página actual */}
            <Outlet />
          </main>
        </div>
      );
    };

    export default MainLayout;