// src/components/dashboard/CashDrawerIndicator.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getActiveCashSessionRealtime } from '../../services/cashService';
import { Link } from 'react-router-dom';
import './CashDrawerIndicator.css';

const CashDrawerIndicator = () => {
  const { userData } = useAuth();
  const tenantId = userData?.tenantId;
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    const unsubscribe = getActiveCashSessionRealtime(tenantId, (session) => {
      setIsActive(!!session);
    });
    return () => unsubscribe();
  }, [tenantId]);

  return (
    <Link to="/caja" className="cash-indicator-link">
      <div className={`cash-indicator ${isActive ? 'open' : 'closed'}`}>
        <div className="indicator-dot"></div>
        <span>Caja {isActive ? 'Abierta' : 'Cerrada'}</span>
      </div>
    </Link>
  );
};
export default CashDrawerIndicator;