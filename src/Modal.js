// src/Modal.js
import React from 'react';
import './Modal.css'; // Ensure you create a CSS file for styling

const Modal = ({ message, onClose, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
