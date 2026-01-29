
import React, { useState, useEffect } from 'react';
import { Producto, apiService } from '../services/api';

interface ProductFormProps {
  onCancel: () => void;
  onSubmit: (productoData: any) => void;
  initialData?: Producto | null;
  isEditing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ onCancel, onSubmit, initialData, isEditing = false }) => {
  const [nombre, setNombre] = useState('');
  const [sku, setSku] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('0');
  const [cantidad, setCantidad] = useState('0');
  const [imagenUrl, setImagenUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await apiService.uploadFile(file, 'products');
      setImagenUrl(url);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || '');
      setSku(initialData.sku || '');
      setDescripcion(initialData.descripcion || '');
      setPrecio(initialData.precio?.toString() || '0');
      setCantidad(initialData.cantidad?.toString() || '0');
      setImagenUrl(initialData.imagenUrl || '');
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
      imagenUrl: imagenUrl.trim() || null,
    };

    onSubmit(productoData);
  };

  return (
    <div className="max-w-md mx-auto animate-fadeIn">
      <div className="card shadow-lg border-secondary border-opacity-25" style={{ backgroundColor: '#161b22' }}>
        <div className="card-body p-4">
          <h2 className="text-xl font-bold mb-4 text-white">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>

          <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">Nombre del Producto</label>
              <input
                type="text"
                placeholder="Ej: Balón de fútbol"
                className="form-control border-secondary border-opacity-25 text-white placeholder-secondary"
                style={{ backgroundColor: '#0d1117' }}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">SKU (Opcional)</label>
              <input
                type="text"
                placeholder="Código del producto"
                className="form-control border-secondary border-opacity-25 text-white placeholder-secondary"
                style={{ backgroundColor: '#0d1117' }}
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">Descripción (Opcional)</label>
              <textarea
                rows={3}
                placeholder="Descripción del producto"
                className="form-control border-secondary border-opacity-25 text-white placeholder-secondary"
                style={{ backgroundColor: '#0d1117', resize: 'none' }}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">Imagen del Producto</label>

              <div className="d-flex gap-3 align-items-center mb-2">
                {imagenUrl && (
                  <div className="position-relative">
                    <img
                      src={imagenUrl}
                      alt="Preview"
                      className="rounded border border-secondary"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center"
                      style={{ width: '20px', height: '20px', transform: 'translate(30%, -30%)' }}
                      onClick={() => setImagenUrl('')}
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="flex-grow-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117]"
                    disabled={uploading}
                  />
                  {uploading && <small className="text-info">Subiendo imagen...</small>}
                </div>
              </div>

              <input
                type="text"
                placeholder="O pega una URL externa aquí..."
                className="form-control border-secondary border-opacity-25 text-white placeholder-secondary text-xs"
                style={{ backgroundColor: '#0d1117' }}
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
              />
            </div>

            <div className="row g-3">
              <div className="col-6">
                <label className="form-label text-secondary small fw-bold">Precio</label>
                <div className="input-group">
                  <span className="input-group-text border-secondary border-opacity-25 text-secondary" style={{ backgroundColor: '#0d1117' }}>S/.</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control border-secondary border-opacity-25 text-white"
                    style={{ backgroundColor: '#0d1117' }}
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-6">
                <label className="form-label text-secondary small fw-bold">Cantidad</label>
                <input
                  type="number"
                  min="0"
                  className="form-control border-secondary border-opacity-25 text-white"
                  style={{ backgroundColor: '#0d1117' }}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-outline-secondary text-white border-secondary border-opacity-25 hover-bg-dark-lighter"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
              >
                {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
