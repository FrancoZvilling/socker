// src/pages/ClientesPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getClientsRealtime, addClient, updateClient, deleteClient } from '../services/clientService';
import ClientTable from '../components/clientes/ClientTable';
import ClientForm from '../components/clientes/ClientForm';
import ClientHistoryModal from '../components/clientes/ClientHistoryModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import '../styles/common.css';

const ClientesPage = () => {
  const { userData } = useAuth(); // <-- CAMBIO
  const tenantId = userData?.tenantId;

  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!tenantId) return;

    // --- 3. Pasa el tenantId al servicio ---
    const unsubscribe = getClientsRealtime(tenantId, (fetchedClients) => {
      setClients(fetchedClients);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [tenantId]); // <-- 4. El efecto ahora depende de tenantId

  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return clients.filter(client =>
      client.name.toLowerCase().includes(term) ||
      (client.idNumber && client.idNumber.toString().includes(term))
    );
  }, [clients, searchTerm]);

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
      // --- 3. Pasa el tenantId ---
      promise = updateClient(tenantId, clientToEdit.id, clientData);
      toast.promise(promise, { /* ... */ });
    } else {
      // --- 3. Pasa el tenantId ---
      promise = addClient(tenantId, clientData);
      toast.promise(promise, { /* ... */ });
    }
    promise.then(() => handleCloseModal());
  };

  const handleDelete = (id) => {
    Swal.fire({ /* ... */ }).then((result) => {
      if (result.isConfirmed) {
        // --- 3. Pasa el tenantId ---
        const promise = deleteClient(tenantId, id);
        toast.promise(promise, { /* ... */ });
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
        <ClientTable
          clients={filteredClients}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onShowHistory={handleShowHistory}
        />
      )}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={clientToEdit ? "Editar Cliente" : "Añadir Nuevo Cliente"}>
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