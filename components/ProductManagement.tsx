
import React, { useState, useEffect } from 'react';
import ProductForm from './ProductForm';
import { apiService, Producto } from '../services/api';

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
      setLoading(true);
      const data = await apiService.getProductos();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (productoData: any) => {
    try {
      const dataToSend = editingProducto
        ? { ...productoData, id: editingProducto.id }
        : productoData;

      if (editingProducto) {
        await apiService.updateProducto(editingProducto.id!, dataToSend);
      } else {
        await apiService.createProducto(dataToSend);
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
      await apiService.deleteProducto(productoId);
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
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Gestión de Productos</h2>
            <p className="text-secondary mb-0 small">Gestiona el inventario de productos de tu academia</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm d-flex align-items-center gap-2 text-white border-secondary border-opacity-50"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid #30363d' }}
            >
              <i className="bi bi-file-pdf"></i> Exportar PDF
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary d-flex align-items-center gap-2 px-3"
              style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
            >
              <i className="bi bi-plus-lg"></i> Nuevo Producto
            </button>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4" style={{ backgroundColor: '#161b22' }}>
          <div className="card-body p-4">
            <div className="position-relative" style={{ maxWidth: '400px' }}>
              <i className="bi bi-search position-absolute text-secondary" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}></i>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control border-secondary border-opacity-25 text-white placeholder-secondary"
                style={{ backgroundColor: '#0d1117', paddingLeft: '35px' }}
              />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ backgroundColor: '#0f1419' }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
                <thead style={{ backgroundColor: '#161b22' }}>
                  <tr>
                    <th className="ps-4 py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Producto</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">SKU</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Precio</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Cantidad</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Estado</th>
                    <th className="pe-4 py-3 text-end text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-secondary">
                        <div className="spinner-border text-primary mb-2" role="status"></div>
                        <p className="mb-0">Cargando...</p>
                      </td>
                    </tr>
                  ) : filteredProductos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-box-seam text-secondary display-4 mb-3"></i>
                          <p className="text-muted fw-medium mb-0">No se encontraron productos</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProductos.map((producto) => (
                      <tr key={producto.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                        <td className="ps-4 py-3 text-white fw-medium border-bottom border-secondary border-opacity-10">{producto.nombre}</td>
                        <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">{producto.sku || '-'}</td>
                        <td className="py-3 text-white border-bottom border-secondary border-opacity-10">S/. {producto.precio.toFixed(2)}</td>
                        <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">{producto.cantidad}</td>
                        <td className="py-3 border-bottom border-secondary border-opacity-10">
                          <span className={`badge bg-opacity-20 border border-opacity-30 text-white ${producto.cantidad > 10
                            ? 'bg-success border-success'
                            : producto.cantidad > 0
                              ? 'bg-warning border-warning'
                              : 'bg-danger border-danger'
                            }`}>
                            {producto.cantidad > 10 ? 'En Stock' : producto.cantidad > 0 ? 'Bajo' : 'Agotado'}
                          </span>
                        </td>
                        <td className="pe-4 py-3 text-end border-bottom border-secondary border-opacity-10">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              onClick={() => handleEdit(producto)}
                              className="btn btn-sm text-primary p-0 me-2"
                              title="Editar"
                              style={{ backgroundColor: 'transparent', border: 'none' }}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(producto.id!)}
                              className="btn btn-sm text-danger p-0"
                              title="Eliminar"
                              style={{ backgroundColor: 'transparent', border: 'none' }}
                            >
                              <i className="bi bi-trash"></i>
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
      </div >
    </div >
  );
};

export default ProductManagement;
