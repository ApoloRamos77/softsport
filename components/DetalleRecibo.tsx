import React from 'react';

interface DetalleReciboProps {
  recibo: any;
  onClose: () => void;
}

const DetalleRecibo: React.FC<DetalleReciboProps> = ({ recibo, onClose }) => {
  // Calculate total paid from abonos
  const totalAbonado = recibo.abonos
    ? recibo.abonos.reduce((sum: number, a: any) => sum + (a.monto || 0), 0)
    : 0;

  const saldoPendiente = (recibo.total || 0) - totalAbonado;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="card border-0 shadow-lg"
        style={{
          backgroundColor: '#161b22',
          borderRadius: '12px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid #30363d'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="card-header border-bottom d-flex justify-content-between align-items-center"
          style={{
            backgroundColor: '#0d1117',
            borderBottom: '1px solid #30363d',
            padding: '1.25rem 1.5rem',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }}
        >
          <div>
            <h2 className="text-white fw-bold mb-1" style={{ fontSize: '1.5rem' }}>
              Detalle del Recibo #{recibo.id}
            </h2>
            <p className="text-secondary mb-0 small">
              Información completa del recibo y pagos
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm text-secondary hover:text-white"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#8b949e'}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="card-body" style={{ padding: '1.5rem' }}>
          {/* General Information */}
          <div className="mb-4">
            <h5 className="text-white fw-bold mb-3" style={{ fontSize: '1rem' }}>
              📋 Información General
            </h5>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div
                  className="card border-0"
                  style={{ backgroundColor: '#0d1117', padding: '1rem', borderRadius: '8px' }}
                >
                  <p className="text-secondary small mb-1 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                    Número de Recibo
                  </p>
                  <p className="text-white fw-bold mb-0" style={{ fontSize: '1.1rem' }}>
                    #{recibo.numero || recibo.id}
                  </p>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div
                  className="card border-0"
                  style={{ backgroundColor: '#0d1117', padding: '1rem', borderRadius: '8px' }}
                >
                  <p className="text-secondary small mb-1 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                    Fecha
                  </p>
                  <p className="text-white fw-bold mb-0" style={{ fontSize: '1.1rem' }}>
                    {new Date(recibo.fecha).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div
                  className="card border-0"
                  style={{ backgroundColor: '#0d1117', padding: '1rem', borderRadius: '8px' }}
                >
                  <p className="text-secondary small mb-1 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                    Alumno
                  </p>
                  <p className="text-white fw-bold mb-0" style={{ fontSize: '1.1rem' }}>
                    {recibo.alumnoNombre || recibo.AlumnoNombre || '-'}
                  </p>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div
                  className="card border-0"
                  style={{ backgroundColor: '#0d1117', padding: '1rem', borderRadius: '8px' }}
                >
                  <p className="text-secondary small mb-1 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                    Estado
                  </p>
                  <span
                    className={`badge ${recibo.estado === 'Pagado'
                      ? 'bg-success bg-opacity-20 border-success'
                      : recibo.estado === 'Pendiente'
                        ? 'bg-warning bg-opacity-20 border-warning'
                        : 'bg-danger bg-opacity-20 border-danger'
                      }`}
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.5rem 1rem',
                      fontWeight: 600,
                      border: '1px solid',
                      display: 'inline-block'
                    }}
                  >
                    {recibo.estado}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <h5 className="text-white fw-bold mb-3" style={{ fontSize: '1rem' }}>
              🛒 Items del Recibo
            </h5>
            <div
              className="card border-0"
              style={{
                backgroundColor: '#0d1117',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <div className="table-responsive">
                <table className="table table-dark mb-0">
                  <thead style={{ backgroundColor: '#161b22' }}>
                    <tr>
                      <th className="text-white fw-bold small" style={{ padding: '1rem', borderBottom: '1px solid #30363d' }}>
                        DESCRIPCIÓN
                      </th>
                      <th className="text-white fw-bold small text-center" style={{ padding: '1rem', borderBottom: '1px solid #30363d' }}>
                        CANTIDAD
                      </th>
                      <th className="text-white fw-bold small text-end" style={{ padding: '1rem', borderBottom: '1px solid #30363d' }}>
                        PRECIO UNIT.
                      </th>
                      <th className="text-white fw-bold small text-end" style={{ padding: '1rem', borderBottom: '1px solid #30363d' }}>
                        TOTAL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recibo.items && recibo.items.length > 0 ? (
                      recibo.items.map((item: any, index: number) => (
                        <tr key={index} style={{ borderBottom: '1px solid #21262d' }}>
                          <td className="text-white" style={{ padding: '1rem' }}>
                            {item.descripcion || item.nombre || item.Nombre || item.Descripcion || 'Item sin descripción'}
                          </td>
                          <td className="text-secondary text-center" style={{ padding: '1rem' }}>
                            {item.cantidad || 1}
                          </td>
                          <td className="text-secondary text-end font-monospace" style={{ padding: '1rem' }}>
                            S/. {(item.precioUnitario || 0).toFixed(2)}
                          </td>
                          <td className="text-white fw-bold text-end font-monospace" style={{ padding: '1rem' }}>
                            S/. {(item.total || item.precioUnitario || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center text-secondary" style={{ padding: '2rem' }}>
                          <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                          No hay items registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mb-4">
            <h5 className="text-white fw-bold mb-3" style={{ fontSize: '1rem' }}>
              💰 Resumen Financiero
            </h5>
            <div
              className="card border-0"
              style={{ backgroundColor: '#0d1117', padding: '1.5rem', borderRadius: '8px' }}
            >
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center pb-2" style={{ borderBottom: '1px solid #21262d' }}>
                  <span className="text-secondary">Subtotal:</span>
                  <span className="text-white fw-bold font-monospace" style={{ fontSize: '1.1rem' }}>
                    S/. {(recibo.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center pb-2" style={{ borderBottom: '1px solid #21262d' }}>
                  <span className="text-secondary">Descuento:</span>
                  <span className="text-warning fw-bold font-monospace" style={{ fontSize: '1.1rem' }}>
                    -S/. {(recibo.descuento || 0).toFixed(2)}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center pb-2" style={{ borderBottom: '1px solid #21262d' }}>
                  <span className="text-white fw-bold" style={{ fontSize: '1.1rem' }}>Total:</span>
                  <span className="text-success fw-bold font-monospace" style={{ fontSize: '1.5rem' }}>
                    S/. {(recibo.total || 0).toFixed(2)}
                  </span>
                </div>
                {totalAbonado > 0 && (
                  <>
                    <div className="d-flex justify-content-between align-items-center pb-2" style={{ borderBottom: '1px solid #21262d' }}>
                      <span className="text-secondary">Total Abonado:</span>
                      <span className="text-info fw-bold font-monospace" style={{ fontSize: '1.1rem' }}>
                        S/. {totalAbonado.toFixed(2)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-white fw-bold" style={{ fontSize: '1.1rem' }}>Saldo Pendiente:</span>
                      <span
                        className={`fw-bold font-monospace ${saldoPendiente > 0 ? 'text-danger' : 'text-success'}`}
                        style={{ fontSize: '1.5rem' }}
                      >
                        S/. {saldoPendiente.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Payment History */}
          {recibo.abonos && recibo.abonos.length > 0 && (
            <div>
              <h5 className="text-white fw-bold mb-3" style={{ fontSize: '1rem' }}>
                📅 Historial de Pagos
              </h5>
              <div
                className="card border-0"
                style={{ backgroundColor: '#0d1117', padding: '1.5rem', borderRadius: '8px' }}
              >
                <div className="d-flex flex-column gap-3">
                  {recibo.abonos.map((abono: any, index: number) => (
                    <div
                      key={index}
                      className="d-flex justify-content-between align-items-center p-3"
                      style={{
                        backgroundColor: '#161b22',
                        borderRadius: '6px',
                        border: '1px solid #21262d'
                      }}
                    >
                      <div>
                        <p className="text-white fw-bold mb-1 font-monospace" style={{ fontSize: '1.2rem' }}>
                          S/. {(abono.monto || 0).toFixed(2)}
                        </p>
                        <p className="text-secondary small mb-0">
                          <i className="bi bi-calendar3 me-2"></i>
                          {new Date(abono.fecha).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      {abono.referencia && (
                        <div className="text-end">
                          <span className="badge bg-secondary bg-opacity-50" style={{ fontSize: '0.75rem' }}>
                            Ref: {abono.referencia}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {recibo.observaciones && (
            <div className="mb-4">
              <h5 className="text-white fw-bold mb-3" style={{ fontSize: '1rem' }}>
                📝 Observaciones
              </h5>
              <div
                className="card border-0"
                style={{ backgroundColor: '#0d1117', padding: '1.5rem', borderRadius: '8px' }}
              >
                <p className="text-white mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                  {recibo.observaciones}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="card-footer border-top d-flex justify-content-end gap-2"
          style={{
            backgroundColor: '#0d1117',
            borderTop: '1px solid #30363d',
            padding: '1.25rem 1.5rem',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px'
          }}
        >
          <button
            onClick={onClose}
            className="btn btn-secondary px-4"
            style={{
              backgroundColor: '#21262d',
              borderColor: '#30363d',
              color: '#ffffff',
              fontWeight: 600
            }}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleRecibo;
