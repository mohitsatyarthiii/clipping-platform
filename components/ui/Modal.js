'use client';

import { useState } from 'react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions = null,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-200"
        onClick={onClose}
      />
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 w-full max-w-md mx-4">
        <div className="bg-linear-to-b from-slate-900/95 to-slate-950/95 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 p-6">
          {title && (
            <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
          )}
          {description && (
            <p className="text-slate-400 text-xs mb-4">{description}</p>
          )}
          {children}
          {actions && (
            <div className="flex gap-3 mt-6 justify-end">{actions}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;
