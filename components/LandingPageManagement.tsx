import React, { useState, useEffect } from 'react';
import { apiService, LandingGallery, ContactMessage } from '../services/api';
import { Tabs, Tab, Button, Form, Card, Table, Badge } from 'react-bootstrap';

const LandingPageManagement: React.FC = () => {
    const [galleries, setGalleries] = useState<LandingGallery[]>([]);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<LandingGallery | null>(null);
    const [formData, setFormData] = useState<LandingGallery>({
        tipo: 'Entrenamiento',
        imageUrl: '',
        titulo: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [galleryData, messageData] = await Promise.all([
                apiService.getGalleries(),
                apiService.getContactMessages()
            ]);
            setGalleries(galleryData);
            setMessages(messageData);
        } catch (error) {
            console.error('Error cargando datos de landing page:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await apiService.updateGallery(editingItem.id!, formData);
            } else {
                await apiService.createGallery(formData);
            }
            setShowForm(false);
            setEditingItem(null);
            setFormData({ tipo: 'Entrenamiento', imageUrl: '', titulo: '', descripcion: '', fecha: new Date().toISOString().split('T')[0] });
            loadData();
        } catch (error) {
            alert('Error al guardar item de galería');
        }
    };

    const handleEdit = (item: LandingGallery) => {
        setEditingItem(item);
        setFormData({
            ...item,
            fecha: item.fecha ? new Date(item.fecha).toISOString().split('T')[0] : ''
        });
        setShowForm(true);
    };

    const handleDeleteGallery = async (id: number) => {
        if (confirm('¿Eliminar esta imagen de la galería?')) {
            await apiService.deleteGallery(id);
            loadData();
        }
    };

    const handleDeleteMessage = async (id: number) => {
        if (confirm('¿Eliminar este mensaje?')) {
            await apiService.deleteContactMessage(id);
            loadData();
        }
    };

    return (
        <div className="p-4 bg-dark text-white min-vh-100">
            <h2 className="mb-4">Administración de Landing Page</h2>

            <Tabs defaultActiveKey="gallery" className="mb-4 custom-tabs">
                <Tab eventKey="gallery" title="Galería (Fotos)">
                    <div className="d-flex justify-content-between mb-3 align-items-center">
                        <h4 className="mb-0">Entrenamientos y Torneos</h4>
                        <Button variant="primary" onClick={() => { setShowForm(true); setEditingItem(null); }}>
                            Agregar Imagen
                        </Button>
                    </div>

                    {showForm && (
                        <Card className="bg-secondary text-white mb-4 shadow p-4">
                            <Form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-3 mb-3">
                                        <Form.Label>Tipo</Form.Label>
                                        <Form.Select name="tipo" value={formData.tipo} onChange={(e: any) => handleFormChange(e)}>
                                            <option value="Entrenamiento">Entrenamiento</option>
                                            <option value="Torneo">Torneo</option>
                                        </Form.Select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <Form.Label>URL de Imagen</Form.Label>
                                        <Form.Control name="imageUrl" value={formData.imageUrl} onChange={handleFormChange} required />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <Form.Label>Fecha</Form.Label>
                                        <Form.Control type="date" name="fecha" value={formData.fecha} onChange={handleFormChange} />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <Form.Label>Título</Form.Label>
                                    <Form.Control name="titulo" value={formData.titulo} onChange={handleFormChange} />
                                </div>
                                <div className="mb-3">
                                    <Form.Label>Descripción</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="descripcion" value={formData.descripcion} onChange={handleFormChange} />
                                </div>
                                <div className="d-flex gap-2">
                                    <Button type="submit" variant="success">{editingItem ? 'Actualizar' : 'Guardar'}</Button>
                                    <Button variant="outline-light" onClick={() => setShowForm(false)}>Cancelar</Button>
                                </div>
                            </Form>
                        </Card>
                    )}

                    <Table responsive striped bordered hover variant="dark">
                        <thead>
                            <tr>
                                <th>Vista</th>
                                <th>Tipo</th>
                                <th>Título</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {galleries.map(item => (
                                <tr key={item.id}>
                                    <td><img src={item.imageUrl} height="40" alt="thumb" /></td>
                                    <td><Badge bg={item.tipo === 'Entrenamiento' ? 'info' : 'warning'}>{item.tipo}</Badge></td>
                                    <td>{item.titulo}</td>
                                    <td>{item.fecha ? new Date(item.fecha).toLocaleDateString() : '-'}</td>
                                    <td>
                                        <Button variant="sm btn-outline-primary me-2" onClick={() => handleEdit(item)}><i className="bi bi-pencil"></i></Button>
                                        <Button variant="sm btn-outline-danger" onClick={() => handleDeleteGallery(item.id!)}><i className="bi bi-trash"></i></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Tab>

                <Tab eventKey="messages" title="Mensajes de Contacto">
                    <Table responsive striped bordered hover variant="dark">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Celular</th>
                                <th>Mensaje</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map(msg => (
                                <tr key={msg.id}>
                                    <td>{msg.nombres} {msg.apellidos}</td>
                                    <td>{msg.email}</td>
                                    <td>{msg.celular}</td>
                                    <td><small>{msg.mensaje}</small></td>
                                    <td>{new Date(msg.fechaCreacion!).toLocaleString()}</td>
                                    <td>
                                        <Button variant="sm btn-outline-danger" onClick={() => handleDeleteMessage(msg.id!)}><i className="bi bi-trash"></i></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Tab>
            </Tabs>
        </div>
    );
};

export default LandingPageManagement;
