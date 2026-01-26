
import React, { useState, useEffect } from 'react';
import ProductForm from './ProductForm';

interface Producto {
  id: number;
  nombre: string;
  sku?: string;
  descripcion?: string;
  precio: number;
  cantidad: number;
}

const ProductManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      const response = await fetch('http://localhost:5081/api/productos');
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (productoData: any) => {
    try {
      const url = editingProducto 
        ? `http://localhost:5081/api/productos/${editingProducto.id}` 
        : 'http://localhost:5081/api/productos';
      const method = editingProducto ? 'PUT' : 'POST';

      const dataToSend = editingProducto 
        ? { ...productoData, id: editingProducto.id }
        : productoData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Error al guardar el producto');
      }

      await loadProductos();
      setShowForm(false);
      setEditingProducto(null);
    } catch (error: any) {
      alert(error.message || 'Error al guardar el producto');
      console.error('Error:', error);
    }
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setShowForm(true);
  };

  const handleDelete = async (productoId: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const response = await fetch(`http://localhost:5081/api/productos/${productoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      await loadProductos();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar el producto');
      console.error('Error:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProducto(null);
  };

  const filteredProductos = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm) {
    return (
      <ProductForm 
        onCancel={handleCancel} 
        onSubmit={handleSubmit}
        initialData={editingProducto}
        isEditing={!!editingProducto}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Productos</h2>
          <p className="text-sm text-slate-400 mt-1">Gestiona el inventario de productos de tu academia</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <i className="fas fa-plus"></i> Nuevo Producto
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <input 
            type="text" 
            placeholder="Buscar productos..." 
            className="bg-[#0f1419] p-2.5 pl-4 rounded-md border border-slate-700 text-sm w-full text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#1a2332] border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400 bg-[#0f1419] border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs uppercase">Producto</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase">SKU</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase">Precio</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase">Cantidad</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase">Estado</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                    Cargando...
                  </td>
                </tr>
              ) : filteredProductos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-sm font-medium">No se encontraron productos</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProductos.map((producto) => (
                  <tr key={producto.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{producto.nombre}</td>
                    <td className="px-6 py-4 text-slate-300">{producto.sku || '-'}</td>
                    <td className="px-6 py-4 text-slate-300">${producto.precio.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-300">{producto.cantidad}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        producto.cantidad > 10 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : producto.cantidad > 0
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {producto.cantidad > 10 ? 'En Stock' : producto.cantidad > 0 ? 'Bajo' : 'Agotado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(producto)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Editar"
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(producto.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Eliminar"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
