import React, { useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReciboImpresionProps {
    recibo: any;
    onClose: () => void;
}

const ReciboImpresion: React.FC<ReciboImpresionProps> = ({ recibo, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const fecha = recibo.fecha ? new Date(recibo.fecha) : new Date();
    const totalAbonado = recibo.abonos?.reduce((sum: number, a: any) => sum + a.monto, 0) || 0;
    const saldoPendiente = recibo.total - totalAbonado;
    const isPagado = saldoPendiente <= 0;

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Colors
        const primaryBlue = [0, 102, 204]; // #0066cc
        const lightBlue = [230, 242, 255]; // #e6f2ff
        const red = [204, 0, 0]; // #cc0000
        const green = [21, 87, 36]; // #155724
        const yellow = [133, 100, 4]; // #856404

        let yPos = 20;

        // Header Box - Increased height
        doc.setDrawColor(...primaryBlue);
        doc.setLineWidth(1);
        doc.rect(15, yPos, pageWidth - 30, 65);

        // Logo (left side) - If image available
        try {
            const logoImg = document.querySelector('img[src="/logo_academia.jpg"]') as HTMLImageElement;
            if (logoImg && logoImg.complete && logoImg.naturalHeight !== 0) {
                doc.addImage(logoImg.src, 'JPEG', 20, yPos + 5, 30, 30);
            }
        } catch (e) {
            console.log('Logo not available for PDF');
        }

        // Address (below logo) - Smaller text, moved down slightly
        doc.setFontSize(7);
        doc.setTextColor(...primaryBlue);
        doc.text('Jr. J.C. Mariategui 315 Block E1', 20, yPos + 38);
        doc.text('Dpto 102 Condominio La Pradera Club', 20, yPos + 42);
        doc.text('Puente Piedra', 20, yPos + 46);

        // Date boxes (below address) - Moved down and made smaller
        const dateBoxY = yPos + 51;
        const dateBoxWidth = 13;
        doc.setFillColor(...lightBlue);

        // DIA
        doc.rect(20, dateBoxY, dateBoxWidth, 5, 'FD');
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryBlue);
        doc.text('DÍA', 26.5, dateBoxY + 3.5, { align: 'center' });
        doc.rect(20, dateBoxY + 5, dateBoxWidth, 5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text(String(fecha.getDate()), 26.5, dateBoxY + 9, { align: 'center' });

        // MES
        doc.setFillColor(...lightBlue);
        doc.rect(33, dateBoxY, dateBoxWidth, 5, 'FD');
        doc.setTextColor(...primaryBlue);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.text('MES', 39.5, dateBoxY + 3.5, { align: 'center' });
        doc.rect(33, dateBoxY + 5, dateBoxWidth, 5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text(String(fecha.getMonth() + 1), 39.5, dateBoxY + 9, { align: 'center' });

        // AÑO
        doc.setFillColor(...lightBlue);
        doc.rect(46, dateBoxY, dateBoxWidth, 5, 'FD');
        doc.setTextColor(...primaryBlue);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.text('AÑO', 52.5, dateBoxY + 3.5, { align: 'center' });
        doc.rect(46, dateBoxY + 5, dateBoxWidth, 5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text(String(fecha.getFullYear()), 52.5, dateBoxY + 9, { align: 'center' });

        // Right side - Company info - Adjusted positioning and widths
        const rightColStart = 95;
        const rightColWidth = pageWidth - rightColStart - 20;

        // ACADEMIA DEPORTIVA box
        doc.setFillColor(...primaryBlue);
        doc.rect(rightColStart, yPos + 5, rightColWidth, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('ACADEMIA DEPORTIVA', (rightColStart + rightColWidth / 2), yPos + 10, { align: 'center' });

        // Helper Soft Sport box
        doc.setFillColor(...lightBlue);
        doc.rect(rightColStart, yPos + 13, rightColWidth, 7, 'F');
        doc.setTextColor(...primaryBlue);
        doc.setFontSize(9);
        doc.text('Helper Soft Sport', (rightColStart + rightColWidth / 2), yPos + 18, { align: 'center' });

        // RECIBO box - Centered in right column
        const reciboBoxWidth = 50;
        const reciboBoxX = rightColStart + (rightColWidth - reciboBoxWidth) / 2;
        doc.setFillColor(...primaryBlue);
        doc.rect(reciboBoxX, yPos + 22, reciboBoxWidth, 9, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('RECIBO', reciboBoxX + reciboBoxWidth / 2, yPos + 28, { align: 'center' });

        // Receipt Number - Centered in right column
        const numBoxWidth = 40;
        const numBoxX = rightColStart + (rightColWidth - numBoxWidth) / 2;
        doc.setDrawColor(...primaryBlue);
        doc.setLineWidth(0.8);
        doc.rect(numBoxX, yPos + 33, numBoxWidth, 11);
        doc.setFontSize(7);
        doc.setTextColor(...red);
        doc.text('N°', numBoxX + numBoxWidth / 2, yPos + 37, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(String(recibo.numero || recibo.id).padStart(6, '0'), numBoxX + numBoxWidth / 2, yPos + 42, { align: 'center' });

        // Phone - Centered in right column
        doc.setFontSize(7);
        doc.setTextColor(...primaryBlue);
        doc.setFont('helvetica', 'normal');
        doc.text('941 883 990 / 977 816 213', (rightColStart + rightColWidth / 2), yPos + 48, { align: 'center' });

        yPos = 90;

        // Student Info
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(15, yPos, pageWidth - 15, yPos);

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Alumno:', 20, yPos + 5);
        doc.setFont('helvetica', 'normal');
        doc.text(recibo.alumnoNombre || recibo.AlumnoNombre || '-', 38, yPos + 5);

        doc.setFont('helvetica', 'bold');
        doc.text('Dirección:', 20, yPos + 10);
        doc.setFont('helvetica', 'normal');
        doc.text('_______________________________', 42, yPos + 10);

        doc.setFont('helvetica', 'bold');
        doc.text('D.N.I:', pageWidth - 60, yPos + 10);
        doc.setFont('helvetica', 'normal');
        doc.text('_______________', pageWidth - 48, yPos + 10);

        yPos += 15;

        // Items Table
        const tableData = [];
        if (recibo.items && recibo.items.length > 0) {
            recibo.items.forEach((item: any) => {
                tableData.push([
                    String(item.cantidad || 1),
                    item.nombre || item.descripcion || item.Nombre || item.Descripcion || 'Item',
                    `S/. ${((item.precioUnitario || item.precio || 0) * (item.cantidad || 1)).toFixed(2)}`
                ]);
            });
        }

        // Add empty rows to match physical receipt
        const minRows = 5;
        for (let i = tableData.length; i < minRows; i++) {
            tableData.push(['', '', '']);
        }

        autoTable(doc, {
            startY: yPos,
            head: [['CANT.', 'DESCRIPCIÓN', 'TOTAL']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: lightBlue,
                textColor: primaryBlue,
                fontStyle: 'bold',
                halign: 'left',
                lineWidth: 0.5,
                lineColor: primaryBlue
            },
            bodyStyles: {
                lineWidth: 0.5,
                lineColor: primaryBlue
            },
            columnStyles: {
                0: { cellWidth: 20, halign: 'center' },
                1: { cellWidth: 120 },
                2: { cellWidth: 35, halign: 'right' }
            },
            margin: { left: 15, right: 15 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 5;

        // Observations
        if (recibo.observaciones) {
            doc.setDrawColor(...primaryBlue);
            doc.setFillColor(248, 249, 250);
            doc.roundedRect(15, yPos, pageWidth - 30, 15, 2, 2, 'FD');
            doc.setFontSize(9);
            doc.setTextColor(...primaryBlue);
            doc.setFont('helvetica', 'bold');
            doc.text('Observaciones:', 20, yPos + 5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const obsLines = doc.splitTextToSize(recibo.observaciones, pageWidth - 50);
            doc.text(obsLines, 20, yPos + 10);
            yPos += 20;
        }

        // Footer Message
        doc.setFontSize(12);
        doc.setTextColor(...primaryBlue);
        doc.setFont('helvetica', 'italic');
        doc.text('Gracias por su Preferencia...', pageWidth / 2, yPos + 5, { align: 'center' });

        yPos += 12;

        // Total Box
        doc.setFillColor(...lightBlue);
        doc.setDrawColor(...primaryBlue);
        doc.setLineWidth(0.8);
        doc.roundedRect(pageWidth - 80, yPos, 65, 12, 2, 2, 'FD');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL: S/. ${(recibo.total || 0).toFixed(2)}`, pageWidth - 47.5, yPos + 8, { align: 'center' });

        yPos += 18;

        // Payment Status
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        if (isPagado) {
            doc.setFillColor(...green);
            doc.setDrawColor(40, 167, 69);
            doc.setTextColor(255, 255, 255);
        } else {
            doc.setFillColor(...yellow);
            doc.setDrawColor(255, 193, 7);
            doc.setTextColor(0, 0, 0);
        }
        doc.setLineWidth(1);
        doc.roundedRect(pageWidth / 2 - 30, yPos, 60, 12, 3, 3, 'FD');
        doc.text(isPagado ? '✓ PAGADO' : '⚠ PENDIENTE', pageWidth / 2, yPos + 8, { align: 'center' });

        if (!isPagado) {
            yPos += 15;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text('Saldo Pendiente:', pageWidth / 2 - 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(`S/. ${saldoPendiente.toFixed(2)}`, pageWidth / 2 + 18, yPos);
        }

        // Save/Open PDF
        const fileName = `Recibo_${String(recibo.numero || recibo.id).padStart(6, '0')}.pdf`;
        doc.save(fileName);
    };

    // Render Receipt Preview (HTML)
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
                    {/* Left Side */}
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
                        <div style={{ fontSize: '11px', color: '#0066cc', marginBottom: '10px', maxWidth: '200px' }}>
                            <i className="bi bi-geo-alt-fill me-1"></i>
                            Jr. J.C. Mariategui 315 Block E1<br />
                            Dpto 102 Condominio La Pradera Club<br />
                            Puente Piedra
                        </div>
                        <table style={{ borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ border: '2px solid #0066cc', padding: '3px 8px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#e6f2ff' }}>DÍA</td>
                                    <td style={{ border: '2px solid #0066cc', padding: '3px 8px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#e6f2ff' }}>MES</td>
                                    <td style={{ border: '2px solid #0066cc', padding: '3px 8px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#e6f2ff' }}>AÑO</td>
                                </tr>
                                <tr>
                                    <td style={{ border: '2px solid #0066cc', padding: '5px 8px', textAlign: 'center', fontWeight: 'bold' }}>{fecha.getDate()}</td>
                                    <td style={{ border: '2px solid #0066cc', padding: '5px 8px', textAlign: 'center', fontWeight: 'bold' }}>{fecha.getMonth() + 1}</td>
                                    <td style={{ border: '2px solid #0066cc', padding: '5px 8px', textAlign: 'center', fontWeight: 'bold' }}>{fecha.getFullYear()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Right Side */}
                    <div style={{ textAlign: 'center', flex: '1 1 auto', marginLeft: '20px' }}>
                        <div style={{ backgroundColor: '#0066cc', color: 'white', padding: '8px 40px', marginBottom: '5px', fontWeight: 'bold', fontSize: '18px' }}>
                            ACADEMIA DEPORTIVA
                        </div>
                        <div style={{ backgroundColor: '#e6f2ff', color: '#0066cc', padding: '6px 40px', borderBottom: '3px solid #0066cc', fontWeight: 'bold', fontSize: '20px' }}>
                            Helper Soft Sport
                        </div>
                        <div style={{ backgroundColor: '#0066cc', color: 'white', padding: '10px 30px', marginTop: '15px', marginBottom: '10px', border: '3px solid #0066cc', fontWeight: 'bold', fontSize: '24px', letterSpacing: '2px' }}>
                            RECIBO
                        </div>
                        <div style={{ display: 'inline-block', border: '3px solid #0066cc', padding: '8px 25px', marginBottom: '10px' }}>
                            <div style={{ fontSize: '14px', color: '#cc0000' }}>N°</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#cc0000', letterSpacing: '1px' }}>
                                {String(recibo.numero || recibo.id).padStart(6, '0')}
                            </div>
                        </div>
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
                        <th style={{ width: '80px', backgroundColor: '#e6f2ff', border: '2px solid #0066cc', padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#0066cc' }}>CANT.</th>
                        <th style={{ backgroundColor: '#e6f2ff', border: '2px solid #0066cc', padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#0066cc' }}>DESCRIPCIÓN</th>
                        <th style={{ width: '120px', backgroundColor: '#e6f2ff', border: '2px solid #0066cc', padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#0066cc' }}>TOTAL</th>
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
            <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#0066cc', marginTop: '30px', padding: '15px', borderTop: '2px solid #0066cc' }}>
                <div style={{ fontSize: '18px', fontStyle: 'italic', marginBottom: '10px' }}>
                    Gracias por su Preferencia...
                </div>
            </div>

            {/* Total */}
            <div style={{ textAlign: 'right', fontSize: '24px', fontWeight: 'bold', margin: '20px 0', padding: '15px', background: '#e6f2ff', border: '2px solid #0066cc' }}>
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
                            <i className="bi bi-file-earmark-pdf me-2"></i>
                            Vista Previa de Recibo
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
                            Cerrar
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={generatePDF}
                        >
                            <i className="bi bi-file-earmark-pdf me-2"></i>
                            Descargar PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReciboImpresion;
