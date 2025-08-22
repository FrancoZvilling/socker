// src/components/clientes/ClientSelectionModal.jsx
import React, { useState } from 'react';
import Modal from '../common/Modal';
import './ClientSelectionModal.css';

const ClientSelectionModal = ({ isOpen, onClose, clients, onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.idNumber && client.idNumber.includes(searchTerm))
  );

  const handleSelect = (client) => {
    onSelectClient(client);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar Cliente">
      <div className="client-selection-content">
        <input
          type="text"
          placeholder="Buscar cliente por nombre o DNI..."
          className="client-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus // Hacemos que el cursor aparezca aquí al abrir
        />
        <div className="client-list">
          {filteredClients.length > 0 ? (
            filteredClients.map(client => (
              <div
                key={client.id}
                className="client-list-item"
                onClick={() => handleSelect(client)}
              >
                <span className="client-name">{client.name}</span>
                <span className="client-id">{client.idNumber || 'Sin DNI'}</span>
              </div>
            ))
          ) : (
            <p className="no-clients-found">No se encontraron clientes.</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ClientSelectionModal;