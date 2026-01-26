
import React, { useState, useEffect } from 'react';

interface ProductFormProps {
  onCancel: () => void;
  onSubmit: (productoData: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ onCancel, onSubmit, initialData, isEditing = false }) => {
  const [nombre, setNombre] = useState('');
  const [sku, setSku] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('0');
  const [cantidad, setCantidad] = useState('0');

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || '');
      setSku(initialData.sku || '');
      setDescripcion(initialData.descripcion || '');
      setPrecio(initialData.precio?.toString() || '0');
      setCantidad(initialData.cantidad?.toString() || '0');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert('El nombre del producto es requerido');
      return;
    }

    const productoData = {
      nombre: nombre.trim(),
      sku: sku.trim() || null,
      descripcion: descripcion.trim() || null,
      precio: parseFloat(precio) || 0,
      cantidad: parseInt(cantidad) || 0,
    };

    onSubmit(productoData);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-[#1a2332] rounded-lg shadow-xl border border-slate-700 p-6">
        <h2 className="text-lg font-bold mb-6 text-white">Nuevo Producto</h2>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Nombre del Producto</label>
            <input 
              type="text" 
              placeholder="Ej: Balón de fútbol"
              className="bg-[#0f1419] p-3 rounded-md border border-blue-500 text-white w-full focus:outline-none focus:border-blue-400 placeholder:text-slate-600"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">SKU (Opcional)</label>
            <input 
              type="text" 
              placeholder="Código del producto"
              className="bg-[#0f1419] p-3 rounded-md border border-slate-700 text-white w-full focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Descripción (Opcional)</label>
            <textarea 
              rows={3}
              placeholder="Descripción del producto"
              className="bg-[#0f1419] p-3 rounded-md border border-slate-700 text-white w-full resize-none focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">Precio</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                className="bg-[#0f1419] p-3 rounded-md border border-slate-700 text-white w-full focus:outline-none focus:border-blue-500"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">Cantidad</label>
              <input 
                type="number" 
                min="0"
                className="bg-[#0f1419] p-3 rounded-md border border-slate-700 text-white w-full focus:outline-none focus:border-blue-500"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4">
            <button 
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all font-medium text-sm shadow-lg shadow-blue-500/20"
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
