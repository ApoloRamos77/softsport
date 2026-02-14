import React, { useEffect } from 'react';

interface ReciboImpresionProps {
    recibo: any;
    onClose: () => void;
}

const ReciboImpresion: React.FC<ReciboImpresionProps> = ({ recibo, onClose }) => {
    useEffect(() => {
        // Auto-focus for keyboard accessibility
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handlePrint = () => {
        window.print();
    };

    const fecha = recibo.fecha ? new Date(recibo.fecha) : new Date();
    const totalAbonado = recibo.abonos?.reduce((sum: number, a: any) => sum + a.monto, 0) || 0;
    const saldoPendiente = recibo.total - totalAbonado;
    const isPagado = saldoPendiente <= 0;

    // Render Receipt Content - Used for both screen and print
    const renderReceipt = () => (
        <div>
            {/* Header */}
            <div style={{
                textAlign: 'center',
                border: '3px solid #0066cc',
                padding: '20px',
                marginBottom: '20px',
                background: 'linear-gradient(to bottom, #e6f2ff 0%, #ffffff 50%)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    {/* Left Side: Logo, Location and Date - Vertical Stack */}
                    <div style={{ flex: '0 0 auto' }}>
                        <img
                            src="/logo_academia.jpg"
                            alt="AD HSOFT SPORT"
                            style={{
                                maxHeight: '100px',
                                marginBottom: '15px',
                                border: '3px solid #0066cc',
                                borderRadius: '50%',
                                padding: '5px',
                                display: 'block'
                            }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />

                        {/* Address */}
                        <div style={{ fontSize: '11px', color: '#0066cc', marginBottom: '10px', maxWidth: '200px' }}>
                            <i className="bi bi-geo-alt-fill me-1"></i>
                            Jr. J.C. Mariategui 315 Block E1<br />
                            Dpto 102 Condominio La Pradera Club<br />
                            Puente Piedra
                        </div>

                        {/* Date Fields - Vertical Layout */}
                        <table style={{ borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{
                                        border: '2px solid #0066cc',
                                        padding: '3px 8px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        backgroundColor: '#e6f2ff'
                                    }}>DÍA</td>
                                    <td style={{
                                        border: '2px solid #0066cc',
                                        padding: '3px 8px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        backgroundColor: '#e6f2ff'
                                    }}>MES</td>
                                    <td style={{
                                        border: '2px solid #0066cc',
                                        padding: '3px 8px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        backgroundColor: '#e6f2ff'
                                    }}>AÑO</td>
                                </tr>
                                <tr>
                                    <td style={{
                                        border: '2px solid #0066cc',
                                        padding: '5px 8px',
                                        textAlign: 'center',
                                        fontWeight: 'bold'
                                    }}>{fecha.getDate()}</td>
                                    <td style={{
                                        border: '2px solid #0066cc',
                                        padding: '5px 8px',
                                        textAlign: 'center',
                                        fontWeight: 'bold'
                                    }}>{fecha.getMonth() + 1}</td>
                                    <td style={{
                                        border: '2px solid #0066cc',
                                        padding: '5px 8px',
                                        textAlign: 'center',
                                        fontWeight: 'bold'
                                    }}>{fecha.getFullYear()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Right Side: Company Name and Receipt Info */}
                    <div style={{ textAlign: 'center', flex: '1 1 auto', marginLeft: '20px' }}>
                        <div style={{
                            backgroundColor: '#0066cc',
                            color: 'white',
                            padding: '8px 40px',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                            fontSize: '18px'
                        }}>
                            ACADEMIA DEPORTIVA
                        </div>
                        <div style={{
                            backgroundColor: '#e6f2ff',
                            color: '#0066cc',
                            padding: '6px 40px',
                            borderBottom: '3px solid #0066cc',
                            fontWeight: 'bold',
                            fontSize: '20px'
                        }}>
                            Helper Soft Sport
                        </div>

                        {/* RECIBO Box */}
                        <div style={{
                            backgroundColor: '#0066cc',
                            color: 'white',
                            padding: '10px 30px',
                            marginTop: '15px',
                            marginBottom: '10px',
                            border: '3px solid #0066cc',
                            fontWeight: 'bold',
                            fontSize: '24px',
                            letterSpacing: '2px'
                        }}>
                            RECIBO
                        </div>

                        {/* Receipt Number */}
                        <div style={{
                            display: 'inline-block',
                            border: '3px solid #0066cc',
                            padding: '8px 25px',
                            marginBottom: '10px'
                        }}>
                            <div style={{ fontSize: '14px', color: '#cc0000' }}>N°</div>
                            <div style={{
                                fontSize: '28px',
                                fontWeight: 'bold',
                                color: '#cc0000',
                                letterSpacing: '1px'
                            }}>
                                {String(recibo.numero || recibo.id).padStart(6, '0')}
                            </div>
                        </div>

                        {/* Phone */}
                        <div style={{ fontSize: '13px', color: '#0066cc', marginTop: '8px' }}>
                            <i className="bi bi-whatsapp me-1"></i>
                            941 883 990 / 977 816 213
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Info */}
            <div style={{ margin: '20px 0', fontSize: '16px', borderBottom: '2px solid #0066cc', paddingBottom: '10px' }}>
                <div style={{ marginBottom: '8px' }}>
                    <strong>Alumno:</strong> {recibo.alumnoNombre || recibo.AlumnoNombre || '-'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong>Dirección:</strong> _______________________________</div>
                    <div><strong>D.N.I:</strong> _______________</div>
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '15px 0' }}>
                <thead>
                    <tr>
                        <th style={{
                            width: '80px',
                            backgroundColor: '#e6f2ff',
                            border: '2px solid #0066cc',
                            padding: '10px',
                            textAlign: 'left',
                            fontWeight: 'bold',
                            color: '#0066cc'
                        }}>CANT.</th>
                        <th style={{
                            backgroundColor: '#e6f2ff',
                            border: '2px solid #0066cc',
                            padding: '10px',
                            textAlign: 'left',
                            fontWeight: 'bold',
                            color: '#0066cc'
                        }}>DESCRIPCIÓN</th>
                        <th style={{
                            width: '120px',
                            backgroundColor: '#e6f2ff',
                            border: '2px solid #0066cc',
                            padding: '10px',
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: '#0066cc'
                        }}>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    {recibo.items && recibo.items.length > 0 ? (
                        recibo.items.map((item: any, index: number) => (
                            <tr key={index}>
                                <td style={{ border: '2px solid #0066cc', padding: '10px', textAlign: 'center' }}>{item.cantidad || 1}</td>
                                <td style={{ border: '2px solid #0066cc', padding: '10px' }}>{item.nombre || item.descripcion || item.Nombre || item.Descripcion || 'Item'}</td>
                                <td style={{ border: '2px solid #0066cc', padding: '10px', textAlign: 'right' }}>S/. {((item.precioUnitario || item.precio || 0) * (item.cantidad || 1)).toFixed(2)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={3} style={{ border: '2px solid #0066cc', padding: '20px', textAlign: 'center', color: '#999' }}>
                                No hay items registrados
                            </td>
                        </tr>
                    )}
                    {/* Empty rows for formatting like physical receipt */}
                    {[...Array(Math.max(0, 5 - (recibo.items?.length || 0)))].map((_, i) => (
                        <tr key={`empty-${i}`}>
                            <td style={{ border: '2px solid #0066cc', padding: '10px' }}>&nbsp;</td>
                            <td style={{ border: '2px solid #0066cc', padding: '10px' }}>&nbsp;</td>
                            <td style={{ border: '2px solid #0066cc', padding: '10px' }}>&nbsp;</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Observations */}
            {recibo.observaciones && (
                <div style={{ margin: '15px 0', padding: '10px', border: '2px solid #0066cc', background: '#f8f9fa' }}>
                    <strong style={{ color: '#0066cc' }}>Observaciones:</strong> {recibo.observaciones}
                </div>
            )}

            {/* Footer Message */}
            <div style={{
                textAlign: 'center',
                fontStyle: 'italic',
                color: '#0066cc',
                marginTop: '30px',
                padding: '15px',
                borderTop: '2px solid #0066cc'
            }}>
                <div style={{ fontSize: '18px', fontStyle: 'italic', marginBottom: '10px' }}>
                    Gracias por su Preferencia...
                </div>
            </div>

            {/* Total */}
            <div style={{
                textAlign: 'right',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '20px 0',
                padding: '15px',
                background: '#e6f2ff',
                border: '2px solid #0066cc'
            }}>
                TOTAL: S/. {(recibo.total || 0).toFixed(2)}
            </div>

            {/* Payment Status */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <div style={{
                    display: 'inline-block',
                    padding: '10px 30px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    border: '3px solid',
                    margin: '15px 0',
                    background: isPagado ? '#d4edda' : '#fff3cd',
                    color: isPagado ? '#155724' : '#856404',
                    borderColor: isPagado ? '#28a745' : '#ffc107'
                }}>
                    {isPagado ? '✓ PAGADO' : '⚠ PENDIENTE'}
                </div>
                {!isPagado && (
                    <div style={{ marginTop: '10px', fontSize: '16px' }}>
                        <strong>Saldo Pendiente:</strong> S/. {saldoPendiente.toFixed(2)}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-area, #print-area * {
                        visibility: visible;
                    }
                    #print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px;
                    }
                }
                
                @media screen {
                    #print-area {
                        display: none;
                    }
                }
            `}</style>

            {/* Hidden print area - only visible when printing */}
            <div id="print-area">
                {renderReceipt()}
            </div>

            {/* Modal Overlay */}
            <div
                className="modal fade show d-block"
                style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999 }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">
                                <i className="bi bi-printer me-2"></i>
                                Vista Previa de Impresión
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={onClose}
                            ></button>
                        </div>
                        <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {/* Receipt Content for screen */}
                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                {renderReceipt()}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                Cerrar sin Imprimir
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handlePrint}
                            >
                                <i className="bi bi-printer me-2"></i>
                                Imprimir Recibo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReciboImpresion;
