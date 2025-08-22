// src/pages/ClientesPage.jsx

import React, { useState, useEffect, useMemo } from 'react'; // Se añade useMemo
import { getClientsRealtime, addClient, updateClient, deleteClient } from '../services/clientService';
import ClientTable from '../components/clientes/ClientTable';
import ClientForm from '../components/clientes/ClientForm';
import ClientHistoryModal from '../components/clientes/ClientHistoryModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import '../styles/common.css'; // Se importa el nuevo archivo de estilos para el buscador

const ClientesPage = () => {
  // Estados existentes
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState(null);
  
  // Nuevo estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = getClientsRealtime((fetchedClients) => {
      setClients(fetchedClients);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Nueva lógica de filtrado
  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return clients.filter(client =>
      client.name.toLowerCase().includes(term) ||
      (client.idNumber && client.idNumber.toString().includes(term))
    );
  }, [clients, searchTerm]);

  // El resto de las funciones handler no cambian
  const handleOpenModal = (client = null) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setClientToEdit(null);
    setIsModalOpen(false);
  };

  const handleShowHistory = (client) => {
    setSelectedClientForHistory(client);
    setIsHistoryModalOpen(true);
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedClientForHistory(null);
  };

  const handleFormSubmit = (clientData) => {
    let promise;
    if (clientToEdit) {
      promise = updateClient(clientToEdit.id, clientData);
      toast.promise(promise, {
        loading: 'Actualizando cliente...',
        success: <b>¡Cliente actualizado!</b>,
        error: <b>No se pudo actualizar.</b>,
      });
    } else {
      promise = addClient(clientData);
      toast.promise(promise, {
        loading: 'Guardando cliente...',
        success: <b>¡Cliente guardado!</b>,
        error: <b>No se pudo guardar.</b>,
      });
    }
    promise.then(() => handleCloseModal());
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminará el cliente de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const promise = deleteClient(id);
        toast.promise(promise, {
          loading: 'Eliminando cliente...',
          success: <b>¡Cliente eliminado!</b>,
          error: <b>No se pudo eliminar.</b>,
        });
      }
    });
  };

  return (
    <div className="clients-page">
      <header className="page-header">
        <h1>Gestión de Clientes</h1>
        <Button onClick={() => handleOpenModal()} icon={<FiPlus />}>
          Añadir Cliente
        </Button>
      </header>
      
      {/* Se añade el contenedor y el input del buscador */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por nombre o DNI..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <p>Cargando clientes...</p>
      ) : (
        // Se pasa la lista FILTRADA a la tabla
        <ClientTable
          clients={filteredClients}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onShowHistory={handleShowHistory}
        />
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={clientToEdit ? "Editar Cliente" : "Añadir Nuevo Cliente"}
        >
          <ClientForm onFormSubmit={handleFormSubmit} initialData={clientToEdit} />
        </Modal>
      )}

      {isHistoryModalOpen && (
        <ClientHistoryModal
          client={selectedClientForHistory}
          onClose={handleCloseHistoryModal}
        />
      )}
    </div>
  );
};

export default ClientesPage;