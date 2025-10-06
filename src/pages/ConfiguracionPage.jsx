// src/pages/ConfiguracionPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import PinManager from '../components/configuracion/PinManager';
import LogoUploader from '../components/configuracion/LogoUploader'; // Se importa el nuevo componente
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
      const salt = await bcrypt.genSalt(10);
      const pinHash = await bcrypt.hash(newPin, salt);

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
          // Se usa un Fragmento <> para agrupar los dos componentes
          <>
            <PinManager 
              tenantId={tenantId}
              currentPinHash={businessData?.adminPinHash}
              onPinUpdate={handlePinUpdate}
            />
            
            {/* Se añade el nuevo componente para subir el logo */}
            <LogoUploader 
              currentLogoUrl={businessData?.businessLogoUrl} 
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ConfiguracionPage;