
import React, { useState, useEffect } from 'react';

interface ReceiptFormProps {
  recibo?: any;
  onCancel: () => void;
}

interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
}

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
}

interface Producto {
  id: number;
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

  useEffect(() => {
    const initializeForm = async () => {
      await Promise.all([loadAlumnos(), loadServicios(), loadProductos()]);
      
      // Si estamos editando, cargar los datos del recibo
      if (recibo && recibo.items) {
        setDestType(recibo.destinatarioType || 'alumnos');
        setSelectedAlumnoId(recibo.destinatarioId?.toString() || '');
        setDescuentoManual(recibo.descuento || 0);
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

  const loadAlumnos = async () => {
    try {
      const response = await fetch('http://localhost:5081/api/alumnos');
      const data = await response.json();
      setAlumnos(data);
    } catch (error) {
      console.error('Error cargando alumnos:', error);
    }
  };

  const loadServicios = async () => {
    try {
      const response = await fetch('http://localhost:5081/api/servicios');
      const data = await response.json();
      setServicios(data);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  };

  const loadProductos = async () => {
    try {
      const response = await fetch('http://localhost:5081/api/productos');
      const data = await response.json();
      setProductos(data);
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
        fecha: recibo?.fecha || new Date().toISOString(),
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

      const url = isEditMode 
        ? `http://localhost:5081/api/recibos/${recibo.id}`
        : 'http://localhost:5081/api/recibos';

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reciboData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `Error al ${isEditMode ? 'actualizar' : 'crear'} el recibo`);
      }

      alert(`Recibo ${isEditMode ? 'actualizado' : 'creado'} exitosamente`);
      onCancel();
    } catch (error: any) {
      alert(error.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el recibo`);
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1a2332] rounded-lg shadow-xl border border-slate-700 p-6">
        <h2 className="text-xl font-bold mb-1 text-white">
          {isEditMode ? 'Editar Recibo' : 'Crear Nuevo Recibo'}
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          {isEditMode 
            ? 'Modifica los datos del recibo' 
            : 'Selecciona destinatarios, agrega servicios/productos y crea recibos individuales'}
        </p>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Destinatarios */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white">Destinatarios</label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="radio" 
                    name="dest" 
                    checked={destType === 'alumnos'}
                    onChange={() => setDestType('alumnos')}
                    className="w-4 h-4 appearance-none border-2 border-blue-500 rounded-full checked:bg-blue-500 checked:border-blue-500 focus:outline-none cursor-pointer"
                  />
                  {destType === 'alumnos' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Alumnos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="radio" 
                    name="dest" 
                    checked={destType === 'grupos'}
                    onChange={() => setDestType('grupos')}
                    className="w-4 h-4 appearance-none border-2 border-blue-500 rounded-full checked:bg-blue-500 checked:border-blue-500 focus:outline-none cursor-pointer"
                  />
                  {destType === 'grupos' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Grupos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="radio" 
                    name="dest" 
                    checked={destType === 'categorias'}
                    onChange={() => setDestType('categorias')}
                    className="w-4 h-4 appearance-none border-2 border-blue-500 rounded-full checked:bg-blue-500 checked:border-blue-500 focus:outline-none cursor-pointer"
                  />
                  {destType === 'categorias' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Categorías</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="radio" 
                    name="dest" 
                    checked={destType === 'todos'}
                    onChange={() => setDestType('todos')}
                    className="w-4 h-4 appearance-none border-2 border-blue-500 rounded-full checked:bg-blue-500 checked:border-blue-500 focus:outline-none cursor-pointer"
                  />
                  {destType === 'todos' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Todos los alumnos activos</span>
              </label>
            </div>
            <select 
              value={selectedAlumnoId}
              onChange={(e) => setSelectedAlumnoId(e.target.value)}
              className="bg-[#0f1419] p-3 rounded-md border border-slate-700 text-slate-400 w-full focus:outline-none focus:border-blue-500"
            >
              <option value="">Selecciona alumnos</option>
              {alumnos.map((alumno) => (
                <option key={alumno.id} value={alumno.id} className="text-white">
                  {alumno.nombre} {alumno.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* Items del Recibo */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white">Ítems del Recibo</label>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3">
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Tipo</label>
                <select 
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="bg-[#0f1419] p-2.5 rounded-md border border-slate-700 text-white w-full text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="servicio">Servicio</option>
                  <option value="producto">Producto</option>
                </select>
              </div>
              <div className="col-span-5">
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Ítem</label>
                <select 
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="bg-[#0f1419] p-2.5 rounded-md border border-slate-700 text-slate-400 w-full text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">
                    {itemType === 'servicio' ? 'Selecciona servicio' : 'Selecciona producto'}
                  </option>
                  {itemType === 'servicio' 
                    ? servicios.map((servicio) => (
                        <option key={servicio.id} value={servicio.id} className="text-white">
                          {servicio.nombre} - ${servicio.precio.toFixed(2)}
                        </option>
                      ))
                    : productos.map((producto) => (
                        <option key={producto.id} value={producto.id} className="text-white">
                          {producto.nombre} - ${producto.precio.toFixed(2)}
                        </option>
                      ))
                  }
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Cantidad</label>
                <input 
                  type="number" 
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  className="bg-[#0f1419] p-2.5 rounded-md border border-slate-700 text-white w-full text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-2 flex items-end">
                <button 
                  type="button"
                  onClick={handleAgregarItem}
                  className="w-full p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <i className="fas fa-plus text-xs"></i> Agregar
                </button>
              </div>
            </div>

            {/* Lista de items agregados */}
            {items.length > 0 && (
              <div className="mt-4 bg-[#0f1419] border border-slate-700 rounded-md p-3 space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm bg-slate-800/50 p-2 rounded">
                    <div className="flex-1">
                      <span className="text-white font-medium">{item.nombre}</span>
                      <span className="text-slate-400 ml-2">x{item.cantidad}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">${item.subtotal.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleEliminarItem(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Descuento Manual */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-white">Descuento Manual (opcional)</label>
            <input 
              type="number" 
              min="0"
              step="0.01"
              value={descuentoManual}
              onChange={(e) => setDescuentoManual(parseFloat(e.target.value) || 0)}
              className="bg-[#0f1419] p-3 rounded-md border border-slate-700 text-white w-full focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Resumen */}
          <div className="bg-[#0f1419] border border-slate-700 rounded-lg p-5 space-y-2.5">
            <h3 className="text-base font-bold text-white mb-3">Resumen</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">• Ítems: <span className="font-semibold">{items.length}</span></span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">• Subtotal:</span>
              <span className="text-white font-semibold">${calcularSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">• Descuento manual:</span>
              <span className="text-white font-semibold">${descuentoManual.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
              <span className="text-base font-bold text-white">Total por recibo:</span>
              <span className="text-xl font-bold text-white">${calcularTotal().toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-500 italic mt-3">* Las becas se aplicarán automáticamente sobre servicios</p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
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
              {isEditMode ? 'Actualizar Recibo' : 'Crear Recibo(s)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiptForm;
