// src/pages/SuperAdminPage.jsx
import React, { useState, useEffect } from 'react';
import { getTenantsRealtime, approveTenantAccount, updateTenantStatus } from '../services/superAdminService';
import Button from '../components/common/Button';
import '../styles/common.css';
import './SuperAdminPage.css';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const SuperAdminPage = () => {
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getTenantsRealtime((fetchedTenants) => {
      setTenants(fetchedTenants);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = (tenantId) => {
    const promise = approveTenantAccount(tenantId);
    toast.promise(promise, {
      loading: 'Marcando para aprobación...',
      success: <b>¡Cuenta marcada para aprobación!</b>,
      error: (err) => <b>Error: {err.message}</b>,
    });
  };

  const handleStatusChange = (tenantId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const actionText = newStatus === 'active' ? 'Reanudar' : 'Pausar';

    Swal.fire({
      title: `¿Confirmar ${actionText}?`,
      text: `¿Estás seguro de que quieres ${actionText.toLowerCase()} la cuenta de este negocio?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const promise = updateTenantStatus(tenantId, newStatus);
        toast.promise(promise, {
          loading: `${actionText.slice(0, -1)}ando cuenta...`,
          success: <b>¡Estado actualizado!</b>,
          error: <b>No se pudo actualizar el estado.</b>,
        });
      }
    });
  };

  return (
    <div className="super-admin-page">
      <header className="page-header">
        <h1>Panel de Super-Administrador</h1>
      </header>
      {isLoading ? (
        <p>Cargando lista de negocios...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre del Negocio</th>
                <th>Email de Contacto</th>
                <th>WhatsApp</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => (
                <tr key={tenant.id}>
                  <td>{tenant.name}</td>
                  <td>{tenant.contactEmail}</td>
                  <td>{tenant.contactWhatsapp}</td>
                  <td>
                    {/* Lógica de visualización de estado mejorada */}
                    <span className={`status-badge ${tenant.status || 'undefined'}`}>
                      {
                        tenant.status === 'pending_approval' ? 'Pendiente Aprob.' :
                        tenant.status === 'approved' ? 'Activación Pendiente' :
                        tenant.status === 'active' ? 'Activo' :
                        tenant.status === 'suspended' ? 'Suspendido' :
                        tenant.status || 'Indefinido'
                      }
                    </span>
                  </td>
                  <td className="actions-cell">
                    {/* Lógica de botones de acción mejorada */}
                    {tenant.status === 'pending_approval' && (
                      <Button onClick={() => handleApprove(tenant.id)} type="primary">
                        Aprobar
                      </Button>
                    )}
                    {tenant.status === 'active' && (
                      <Button onClick={() => handleStatusChange(tenant.id, tenant.status)} type="secondary">
                        Pausar
                      </Button>
                    )}
                    {tenant.status === 'suspended' && (
                      <Button onClick={() => handleStatusChange(tenant.id, tenant.status)} type="primary">
                        Reanudar
                      </Button>
                    )}
                    {/* No se muestra ningún botón para el estado 'approved' */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPage;