// src/pages/ConfiguracionPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import PinManager from '../components/configuracion/PinManager';
import { updateTenantData } from '../services/tenantService';
import bcrypt from 'bcryptjs';
import { toast } from 'react-hot-toast';
import './ConfiguracionPage.css';

const ConfiguracionPage = () => {
  const { userData } = useAuth();
  const { businessData } = useBusiness();
  const tenantId = userData?.tenantId;

  const handlePinUpdate = async (newPin) => {
    try {
      // Generamos un 'salt' y luego hasheamos el PIN
      const salt = await bcrypt.genSalt(10);
      const pinHash = await bcrypt.hash(newPin, salt);

      // Guardamos el PIN hasheado en Firestore
      await updateTenantData(tenantId, { adminPinHash: pinHash });
      toast.success('¡PIN de Administrador actualizado con éxito!');
    } catch (error) {
      console.error("Error al actualizar el PIN:", error);
      toast.error('No se pudo actualizar el PIN.');
    }
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1>Configuración del Negocio</h1>
      </header>
      <div className="settings-content">
        {tenantId && (
          <PinManager 
            tenantId={tenantId}
            currentPinHash={businessData?.adminPinHash}
            onPinUpdate={handlePinUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default ConfiguracionPage;