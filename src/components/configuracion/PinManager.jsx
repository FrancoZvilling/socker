// src/components/configuracion/PinManager.jsx
import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';
// Necesitaremos una función para actualizar el tenant, podemos crear un servicio.
// Por ahora, asumimos que existe una función 'updateTenantData'.

const PinManager = ({ tenantId, currentPinHash, onPinUpdate }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      toast.error('El nuevo PIN y su confirmación no coinciden.');
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      toast.error('El PIN debe ser exactamente de 4 dígitos numéricos.');
      return;
    }

    setIsLoading(true);
    // La función 'onPinUpdate' contendrá la lógica de hasheo y guardado.
    await onPinUpdate(newPin);
    setIsLoading(false);
    
    // Limpiamos los campos
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  return (
    <div className="pin-manager-card">
      <h3>PIN de Administrador</h3>
      <p>
        Este PIN se solicitará para acceder a funciones restringidas 
        mientras la aplicación está en "Modo Empleado".
      </p>
      <form onSubmit={handleSubmit}>
        {/* Si ya existe un PIN, pedimos el actual para cambiarlo */}
        {currentPinHash && (
          <Input 
            label="PIN Actual" 
            name="currentPin" 
            type="password" 
            value={currentPin} 
            onChange={(e) => setCurrentPin(e.target.value)} 
            maxLength="4"
          />
        )}
        <Input 
          label="Nuevo PIN (4 dígitos)" 
          name="newPin" 
          type="password" 
          value={newPin} 
          onChange={(e) => setNewPin(e.target.value)} 
          maxLength="4"
        />
        <Input 
          label="Confirmar Nuevo PIN" 
          name="confirmPin" 
          type="password" 
          value={confirmPin} 
          onChange={(e) => setConfirmPin(e.target.value)} 
          maxLength="4"
        />
        <div className="form-actions">
          <Button type="primary" disabled={isLoading}>
            {isLoading ? 'Guardando...' : (currentPinHash ? 'Cambiar PIN' : 'Establecer PIN')}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default PinManager;