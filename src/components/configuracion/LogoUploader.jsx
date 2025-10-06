// src/components/configuracion/LogoUploader.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadBusinessLogo } from '../../services/storageService';
import { updateTenantData } from '../../services/tenantService';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import './LogoUploader.css';

const LogoUploader = ({ currentLogoUrl }) => {
  // Se obtiene 'currentUser' además de 'userData' para acceder al UID.
  const { userData, currentUser } = useAuth();
  const tenantId = userData?.tenantId;
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentLogoUrl || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    // Se añade la comprobación de que 'currentUser' exista.
    if (!file || !tenantId || !currentUser) {
      toast.error("Error: sesión no válida. Por favor, recargue la página.");
      return;
    }

    setIsLoading(true);
    try {
      // Se pasa el UID del usuario como segundo argumento a la función de subida.
      const logoUrl = await uploadBusinessLogo(tenantId, currentUser.uid, file);
      
      await updateTenantData(tenantId, { businessLogoUrl: logoUrl });
      
      toast.success('¡Logo actualizado con éxito!');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo subir el logo.');
    }
    setIsLoading(false);
  };

  return (
    <div className="logo-uploader-card">
      <h3>Logo del Negocio</h3>
      <p>Este logo aparecerá en tus tickets, remitos y presupuestos.</p>
      <div className="preview-container">
        {preview ? (
          <img src={preview} alt="Vista previa del logo" />
        ) : (
          <div className="no-logo-placeholder">Sin Logo</div>
        )}
      </div>
      <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={!file || isLoading} type="primary">
        {isLoading ? 'Subiendo...' : 'Guardar Logo'}
      </Button>
    </div>
  );
};
export default LogoUploader;