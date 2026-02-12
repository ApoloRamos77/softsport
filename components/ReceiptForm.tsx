
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface ReceiptFormProps {
  recibo?: any;
  onCancel: () => void;
}

interface Alumno {
  id?: number;
  nombre: string;
  apellido: string;
  documento?: string;
}

interface Servicio {
  id?: number;
  nombre: string;
  precio: number;
}

interface Producto {
  id?: number;
  nombre: string;
  precio: number;
}

interface ReciboItem {
  tipo: 'servicio' | 'producto';
  itemId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

const ReceiptForm: React.FC<ReceiptFormProps> = ({ recibo, onCancel }) => {
  const isEditMode = !!recibo;
  const [destType, setDestType] = useState('alumnos');
  const [itemType, setItemType] = useState('servicio');
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedAlumnoId, setSelectedAlumnoId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [descuentoManual, setDescuentoManual] = useState(0);
  const [items, setItems] = useState<ReciboItem[]>([]);
  // Added state for fecha
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  // Autocomplete states
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);

  useEffect(() => {
    if (destType === 'alumnos' && !isEditMode) {
      const delayDebounceFn = setTimeout(() => {
        loadAlumnos(searchTerm);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      // Para otros modos, cargar lista normal si es necesario
      loadAlumnos();
    }
  }, [searchTerm, destType]);

  useEffect(() => {
    const initializeForm = async () => {
      await Promise.all([loadAlumnos(), loadServicios(), loadProductos()]);

      if (recibo && recibo.items) {
        setDestType(recibo.destinatarioType || 'alumnos');
        setSelectedAlumnoId(recibo.destinatarioId?.toString() || '');
        setDescuentoManual(recibo.descuento || 0);
        if (recibo.fecha) {
          setFecha(new Date(recibo.fecha).toISOString().split('T')[0]);
        }
      }
    };

    initializeForm();
  }, []);

  // Cargar items después de que servicios y productos estén disponibles
  useEffect(() => {
    if (recibo && recibo.items && servicios.length > 0 && productos.length > 0) {
      const reciboItems: ReciboItem[] = recibo.items.map((item: any) => {
        let nombre = item.nombre || item.descripcion || 'Item';
        let precio = item.precioUnitario || 0;

        // Buscar el nombre y precio real del servicio o producto
        if (item.tipo === 'servicio') {
          const servicio = servicios.find(s => s.id === item.itemId);
          if (servicio) {
            nombre = servicio.nombre;
            // Si no tiene precio unitario, usar el precio del servicio
            if (!item.precioUnitario) {
              precio = servicio.precio;
            }
          }
        } else if (item.tipo === 'producto') {
          const producto = productos.find(p => p.id === item.itemId);
          if (producto) {
            nombre = producto.nombre;
            // Si no tiene precio unitario, usar el precio del producto
            if (!item.precioUnitario) {
              precio = producto.precio;
            }
          }
        }

        const cantidad = item.cantidad || 1;
        const subtotal = precio * cantidad;

        return {
          tipo: item.tipo,
          itemId: item.itemId,
          nombre: nombre,
          precio: precio,
          cantidad: cantidad,
          subtotal: subtotal
        };
      });
      setItems(reciboItems);
    }
  }, [recibo, servicios, productos]);

  const loadAlumnos = async (term: string = '') => {
    try {
      setLoadingAlumnos(true);
      const params: any = {};
      if (term) params.searchTerm = term;

      const result = await apiService.getAlumnos(params);
      setAlumnos(Array.isArray(result) ? result : (result.data || []));
    } catch (error) {
      console.error('Error cargando alumnos:', error);
    } finally {
      setLoadingAlumnos(false);
    }
  };

  const loadServicios = async () => {
    try {
      const result = await apiService.getServicios();
      setServicios(Array.isArray(result) ? result : (result.data || []));
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  };

  const loadProductos = async () => {
    try {
      const result = await apiService.getProductos();
      setProductos(Array.isArray(result) ? result : (result.data || []));
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const handleAgregarItem = () => {
    if (!selectedItemId) {
      alert('Selecciona un servicio o producto');
      return;
    }

    if (cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    const item = itemType === 'servicio'
      ? servicios.find(s => s.id === parseInt(selectedItemId))
      : productos.find(p => p.id === parseInt(selectedItemId));

    if (!item) return;

    const nuevoItem: ReciboItem = {
      tipo: itemType as 'servicio' | 'producto',
      itemId: item.id,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: cantidad,
      subtotal: item.precio * cantidad
    };

    setItems([...items, nuevoItem]);
    setSelectedItemId('');
    setCantidad(1);
  };

  const handleEliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calcularSubtotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal() - descuentoManual;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAlumnoId && destType === 'alumnos') {
      alert('Selecciona al menos un alumno');
      return;
    }

    if (items.length === 0) {
      alert('Agrega al menos un ítem al recibo');
      return;
    }

    try {
      const reciboData: any = {
        destinatarioType: destType,
        destinatarioId: selectedAlumnoId ? parseInt(selectedAlumnoId) : null,
        fecha: fecha ? new Date(fecha).toISOString() : new Date().toISOString(),
        subtotal: calcularSubtotal(),
        descuento: descuentoManual,
        total: calcularTotal(),
        estado: recibo?.estado || 'Pendiente',
        items: items.map(item => ({
          tipo: item.tipo,
          itemId: item.itemId,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
          subtotal: item.subtotal
        }))
      };

      // Agregar ID si está en modo edición
      if (isEditMode && recibo?.id) {
        reciboData.id = recibo.id;
      }

      if (isEditMode && recibo?.id) {
        await apiService.updateRecibo(recibo.id, reciboData);
      } else {
        await apiService.createRecibo(reciboData);
      }

      alert(`Recibo ${isEditMode ? 'actualizado' : 'creado'} exitosamente`);
      onCancel();
    } catch (error: any) {
      alert(error.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el recibo`);
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn mb-10 pb-5">
      <div className="card shadow-xl border-secondary border-opacity-25 w-100" style={{ backgroundColor: '#161b22' }}>
        <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-4 px-4 d-flex justify-content-between align-items-center">
          <div>
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 d-block">Módulo de Ingresos</label>
            <h5 className="mb-0 fw-bold text-white tracking-tight">
              {isEditMode ? 'Editar Comprobante' : 'Nuevo Recibo / Facturador'}
            </h5>
            <p className="text-secondary small mb-0">Gestione la emisión de documentos legales y control de caja.</p>
          </div>
          <button onClick={onCancel} className="btn-close btn-close-white opacity-50 hover-opacity-100"></button>
        </div>

        <div className="card-body p-4">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Header Info Row */}
            <div className="row g-4 mb-2">
              <div className="col-12 d-flex justify-content-end">
                <div className="d-flex align-items-center gap-2">
                  <label className="text-secondary small fw-bold mb-0">Fecha de Emisión / Pago:</label>
                  <input
                    type="date"
                    className="form-control form-control-sm bg-[#0d1117] border-secondary border-opacity-25 text-white"
                    style={{ width: '150px' }}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Main Info Row */}
            <div className="row g-4">
              {/* Left Column: Destinatarios */}
              <div className="col-lg-5">
                <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30 h-100">
                  <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Destinatario</label>

                  <div className="d-flex flex-wrap gap-4 mb-4">
                    {['alumnos', 'grupos', 'categorias', 'todos'].map((type) => (
                      <label key={type} className="d-flex align-items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="dest"
                          checked={destType === type}
                          onChange={() => setDestType(type)}
                          className="form-check-input bg-transparent border-secondary border-opacity-50 mt-0"
                        />
                        <span className="text-[13px] text-secondary group-hover:text-white transition-colors text-capitalize">
                          {type === 'todos' ? 'Todos' : type}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-slate-400 uppercase mb-2">Selección Específica</label>

                    {destType === 'alumnos' && !isEditMode ? (
                      <div className="position-relative">
                        <div className="input-group">
                          <span className="input-group-text bg-transparent border-secondary border-opacity-25 text-secondary">
                            <i className="bi bi-search"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar alumno por nombre..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setShowDropdown(true);
                              if (!e.target.value) {
                                setSelectedAlumnoId('');
                              }
                            }}
                            onFocus={() => setShowDropdown(true)}
                          />
                        </div>

                        {showDropdown && (searchTerm || alumnos.length > 0) && (
                          <div className="position-absolute w-100 z-50 mt-1 rounded shadow-lg border border-secondary border-opacity-25 bg-[#161b22]"
                            style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {loadingAlumnos ? (
                              <div className="p-3 text-center text-secondary small">
                                <div className="spinner-border spinner-border-sm mb-1" role="status"></div>
                                <div>Buscando...</div>
                              </div>
                            ) : alumnos.length > 0 ? (
                              <div className="list-group list-group-flush">
                                {alumnos.map((alumno) => (
                                  <button
                                    key={alumno.id || Math.random()}
                                    type="button"
                                    className="list-group-item list-group-item-action bg-transparent text-white border-secondary border-opacity-10 py-2 px-3 small"
                                    onClick={() => {
                                      if (alumno.id) {
                                        setSelectedAlumnoId(alumno.id.toString());
                                        setSearchTerm(`${alumno.nombre} ${alumno.apellido}`);
                                        setShowDropdown(false);
                                      }
                                    }}
                                  >
                                    <div className="fw-bold">{alumno.nombre} {alumno.apellido}</div>
                                    <div className="text-secondary" style={{ fontSize: '10px' }}>{alumno.documento || 'Sin documento'}</div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 text-center text-secondary small">
                                No se encontraron alumnos.
                              </div>
                            )}
                          </div>
                        )}
                        {selectedAlumnoId && (
                          <div className="text-success small mt-1">
                            <i className="bi bi-check-circle-fill me-1"></i> Alumno seleccionado
                          </div>
                        )}
                      </div>
                    ) : (
                      <select
                        value={selectedAlumnoId}
                        onChange={(e) => setSelectedAlumnoId(e.target.value)}
                        className="form-select"
                        disabled={destType === 'todos' || (isEditMode && destType === 'alumnos')}
                      >
                        <option value="">{destType === 'alumnos' ? 'Seleccionar alumno...' : 'Seleccionar grupo/cat...'}</option>
                        {/* Logic for other types would go here if implemented, currently sharing 'alumnos' state which is not ideal for groups/cats but user only asked for students */}
                        {alumnos.map((alumno) => (
                          <option key={alumno.id} value={alumno.id}>
                            {alumno.nombre} {alumno.apellido}
                          </option>
                        ))}
                      </select>
                    )}

                    <p className="text-[10px] text-secondary opacity-60 italic mt-2 px-1">
                      <i className="bi bi-info-circle me-1"></i>
                      {destType === 'todos' ? 'Se generará un recibo por cada alumno activo.' : 'Elige a quién va dirigido este comprobante.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Agregar Items */}
              <div className="col-lg-7">
                <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30 h-100">
                  <label className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-4 d-block border-bottom border-green-900 border-opacity-30 pb-2">Agregar Conceptos</label>

                  <div className="row g-3 mb-4">
                    <div className="col-md-3">
                      <label>Tipo</label>
                      <select
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                        className="form-select"
                      >
                        <option value="servicio">Servicio</option>
                        <option value="producto">Producto</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label>Concepto</label>
                      <select
                        value={selectedItemId}
                        onChange={(e) => setSelectedItemId(e.target.value)}
                        className="form-select"
                      >
                        <option value="">{itemType === 'servicio' ? 'Elegir servicio...' : 'Elegir producto...'}</option>
                        {(itemType === 'servicio' ? servicios : productos).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nombre} - S/. {item.precio.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label>Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAgregarItem}
                    className="btn btn-primary w-100 fw-bold text-[12px] py-2"
                    style={{ backgroundColor: '#238636', borderColor: '#2ea043' }}
                  >
                    <i className="bi bi-plus-circle me-1"></i> AÑADIR AL RECIBO
                  </button>
                </div>
              </div>
            </div >

            {/* Table and Summary Row */}
            < div className="row g-4" >
              {/* Items List Table */}
              < div className="col-lg-8" >
                <div className="border border-secondary border-opacity-10 rounded-lg overflow-hidden bg-[#0d1117] bg-opacity-20">
                  <table className="table align-middle mb-0" style={{ fontSize: '13px', borderColor: '#30363d' }}>
                    <thead style={{ backgroundColor: '#161b22' }}>
                      <tr>
                        <th className="ps-4 py-3 text-white border-bottom border-secondary border-opacity-25">Descripción</th>
                        <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Cant.</th>
                        <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Precio</th>
                        <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Subtotal</th>
                        <th className="text-end pe-4 py-3 text-white border-bottom border-secondary border-opacity-25"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-5 text-secondary">
                            <i className="bi bi-cart3 d-block h3 opacity-20 mb-2"></i>
                            No has agregado ítems todavía
                          </td>
                        </tr>
                      ) : (
                        items.map((item, index) => (
                          <tr key={index} className="hover-bg-dark-lighter">
                            <td className="ps-4 border-bottom border-secondary border-opacity-10 py-3">
                              <span className="fw-bold text-white">{item.nombre}</span>
                              <br /><small className="text-secondary text-uppercase" style={{ fontSize: '10px' }}>{item.tipo}</small>
                            </td>
                            <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">{item.cantidad}</td>
                            <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">S/. {item.precio.toFixed(2)}</td>
                            <td className="fw-bold text-blue-400 border-bottom border-secondary border-opacity-10 py-3">S/. {item.subtotal.toFixed(2)}</td>
                            <td className="text-end pe-4 border-bottom border-secondary border-opacity-10 py-3">
                              <button
                                type="button"
                                onClick={() => handleEliminarItem(index)}
                                className="btn btn-sm text-danger p-0"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div >

              {/* Financial Summary */}
              < div className="col-lg-4" >
                <div className="p-4 rounded-lg bg-blue-600 bg-opacity-10 border border-blue-500 border-opacity-20 h-100 flex-column d-flex">
                  <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-30 pb-2">Resumen Financiero</label>

                  <div className="space-y-4 flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10 pb-2">
                      <span className="text-secondary text-sm">Subtotal Bruto:</span>
                      <span className="text-white fw-bold">S/. {calcularSubtotal().toFixed(2)}</span>
                    </div>

                    <div className="space-y-2 mt-4">
                      <label className="text-[11px] font-bold text-slate-400 uppercase mb-2">Descuento Manual / Ajuste</label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-[#0d1117] border-secondary border-opacity-25 text-secondary">S/.</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={descuentoManual}
                          onChange={(e) => setDescuentoManual(parseFloat(e.target.value) || 0)}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-5 border-top border-secondary border-opacity-20">
                    <div className="d-flex justify-content-between align-items-end">
                      <span className="text-secondary font-bold text-xs uppercase tracking-tighter h5 mb-0">TOTAL FINAL</span>
                      <span className="text-white font-bold h2 mb-0 tracking-tighter">S/. {calcularTotal().toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-blue-400 mt-3 italic text-end mb-0">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Las becas correspondientes se aplicarán individualmente al procesar el pago.
                    </p>
                  </div>
                </div>
              </div >
            </div >

            <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top border-secondary border-opacity-25">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-sm px-4 text-secondary hover-text-white border-0 bg-transparent"
                style={{ fontSize: '13px', fontWeight: '600' }}
              >
                Cancelar Operación
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-primary px-5 fw-bold"
                style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontSize: '13px', borderBottom: '2px solid #005cc5' }}
              >
                {isEditMode ? 'Guardar Cambios' : 'Confirmar y Emitir Recibo(s)'}
              </button>
            </div>
          </form >
        </div >
      </div >
    </div >
  );
};

export default ReceiptForm;
