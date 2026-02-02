import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Row, Col, Card, Button, Form, Carousel } from 'react-bootstrap';
import { apiService, LandingGallery, Producto } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faFacebookMessenger } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt, faUser, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

// Add icons to library
library.add(faWhatsapp, faFacebookMessenger, faEnvelope, faPhone, faMapMarkerAlt, faUser, faChevronRight);

interface LandingPageProps {
    onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
    const [activeSection, setActiveSection] = useState('home');
    const [galleries, setGalleries] = useState<LandingGallery[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [contactForm, setContactForm] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        celular: '',
        mensaje: ''
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [galleryData, productData] = await Promise.all([
                    apiService.getGalleries(),
                    apiService.getProductos()
                ]);
                setGalleries(galleryData);
                // getProductos now returns a paginated object { totalCount, data }
                const products = Array.isArray(productData) ? productData : (productData.data || []);
                setProductos(products.filter(p => p.activo).slice(0, 4)); // Only active and first 4 for landing
            } catch (error) {
                console.error('Error loading landing data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContactForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiService.createContactMessage(contactForm);
            alert('Mensaje enviado correctamente. Nos pondremos en contacto pronto.');
            setContactForm({ nombres: '', apellidos: '', email: '', celular: '', mensaje: '' });
        } catch (error) {
            alert('Error al enviar el mensaje. Intente de nuevo más tarde.');
        }
    };

    // Academy Colors from Logo
    const colors = {
        blue: '#2C6496', // Approximate from image
        green: '#74B72E', // Approximate from image
        white: '#FFFFFF',
        lightBlue: '#E6F4F1'
    };

    const trainingPhotos = galleries.filter(g => g.tipo === 'Entrenamiento');
    const tournamentPhotos = galleries.filter(g => g.tipo === 'Torneo');

    return (
        <div className="landing-page" style={{ scrollBehavior: 'smooth' }}>
            {/* Navigation */}
            <Navbar bg="white" expand="lg" sticky="top" className="shadow-sm py-3">
                <Container>
                    <Navbar.Brand href="#home" className="d-flex align-items-center">
                        <img
                            src="/logo_academia.jpg"
                            height="50"
                            className="d-inline-block align-top me-2"
                            alt="HELPER SOFT SPORT Logo"
                        />
                        <span style={{ fontWeight: 800, color: colors.blue, letterSpacing: '1px' }}>HELPER SOFT SPORT</span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center">
                            <Nav.Link href="#home" className="mx-2" style={{ fontWeight: 600 }}>Inicio</Nav.Link>
                            <Nav.Link href="#entrenamiento" className="mx-2" style={{ fontWeight: 600 }}>Entrenamiento</Nav.Link>
                            <Nav.Link href="#torneos" className="mx-2" style={{ fontWeight: 600 }}>Torneos</Nav.Link>
                            <Nav.Link href="#productos" className="mx-2" style={{ fontWeight: 600 }}>Productos</Nav.Link>
                            <Nav.Link href="#contacto" className="mx-2" style={{ fontWeight: 600 }}>Contáctenos</Nav.Link>
                            <Button
                                onClick={() => window.open(window.location.origin + '?login=true', '_blank')}
                                className="ms-lg-4 px-4 py-2"
                                style={{ backgroundColor: colors.blue, border: 'none', borderRadius: '25px', fontWeight: 600 }}
                            >
                                LOGIN
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Hero Section */}
            <section id="home" className="d-flex align-items-center justify-content-center" style={{
                minHeight: '80vh',
                background: `linear-gradient(135deg, ${colors.blue} 0%, #1a4a75 100%)`,
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
                <Container className="text-center" style={{ position: 'relative', zIndex: 2 }}>
                    <img src="/logo_academia.jpg" width="200" className="mb-4 rounded-circle bg-white p-2 shadow" alt="Logo Large" />
                    <h1 className="display-3 mb-4" style={{ fontWeight: 900 }}>ACADEMIA DEPORTIVA HELPER SOFT SPORT</h1>
                    <p className="lead mb-5" style={{ fontSize: '1.5rem', opacity: 0.9 }}>Formando campeones con valores y pasión por el deporte.</p>
                    <div className="d-flex justify-content-center gap-3">
                        <Button size="lg" href="#contacto" style={{ backgroundColor: colors.green, border: 'none', padding: '15px 40px', borderRadius: '30px', fontWeight: 700 }}>Inscríbete Ahora</Button>
                        <Button size="lg" variant="outline-light" href="#entrenamiento" style={{ padding: '15px 40px', borderRadius: '30px', fontWeight: 700 }}>Ver Galería</Button>
                    </div>
                </Container>
            </section>

            {/* Entrenamiento Section */}
            <section id="entrenamiento" className="py-5" style={{ backgroundColor: '#f9f9f9' }}>
                <Container className="py-5 text-center">
                    <h2 className="mb-2" style={{ color: colors.blue, fontWeight: 800 }}>ENTRENAMIENTO</h2>
                    <div className="mx-auto mb-5" style={{ width: '80px', height: '4px', backgroundColor: colors.green }}></div>
                    <p className="mb-5 text-muted">Explora nuestras jornadas de entrenamiento donde la técnica y el esfuerzo se unen.</p>
                    <Row>
                        {trainingPhotos.length > 0 ? trainingPhotos.map((item, i) => (
                            <Col md={4} key={i} className="mb-4">
                                <Card className="border-0 shadow-sm overflow-hidden h-100 gallery-card" style={{ borderRadius: '15px' }}>
                                    <img src={item.imageUrl} alt={item.titulo} className="img-fluid" style={{ height: '250px', objectFit: 'cover' }} />
                                    <div className="p-3">
                                        <h5 style={{ color: colors.blue }}>{item.titulo}</h5>
                                        <p className="small text-muted mb-0">{item.descripcion}</p>
                                    </div>
                                </Card>
                            </Col>
                        )) : (
                            <Col className="text-muted">Próximamente fotos de nuestros entrenamientos.</Col>
                        )}
                    </Row>
                </Container>
            </section>

            {/* Torneos Section */}
            <section id="torneos" className="py-5">
                <Container className="py-5 text-center">
                    <h2 className="mb-2" style={{ color: colors.blue, fontWeight: 800 }}>TORNEOS Y COMPETENCIAS</h2>
                    <div className="mx-auto mb-5" style={{ width: '80px', height: '4px', backgroundColor: colors.green }}></div>
                    <p className="mb-5 text-muted">Nuestra participación en los eventos deportivos más importantes de la región.</p>
                    {tournamentPhotos.length > 0 ? (
                        <Carousel className="shadow rounded overflow-hidden">
                            {tournamentPhotos.map((item, i) => (
                                <Carousel.Item key={i}>
                                    <img
                                        className="d-block w-100"
                                        src={item.imageUrl}
                                        alt={item.titulo}
                                        style={{ height: '500px', objectFit: 'cover' }}
                                    />
                                    <Carousel.Caption style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '10px' }}>
                                        <h3>{item.titulo}</h3>
                                        <p>{item.descripcion}</p>
                                    </Carousel.Caption>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    ) : (
                        <div className="text-muted">Próximamente fotos de nuestros torneos.</div>
                    )}
                </Container>
            </section>

            {/* Productos Section */}
            <section id="productos" className="py-5" style={{ backgroundColor: colors.lightBlue }}>
                <Container className="py-5 text-center">
                    <h2 className="mb-2" style={{ color: colors.blue, fontWeight: 800 }}>NUESTROS PRODUCTOS</h2>
                    <div className="mx-auto mb-5" style={{ width: '80px', height: '4px', backgroundColor: colors.green }}></div>
                    <Row>
                        {productos.length > 0 ? productos.map((prod, i) => (
                            <Col md={3} key={i} className="mb-4">
                                <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '15px' }}>
                                    <img src={prod.imagenUrl || 'https://via.placeholder.com/400x500?text=Producto'} alt={prod.nombre} className="img-fluid" style={{ height: '300px', objectFit: 'cover' }} />
                                    <Card.Body>
                                        <Card.Title style={{ color: colors.blue, fontWeight: 700 }}>{prod.nombre}</Card.Title>
                                        <Card.Text style={{ color: colors.green, fontSize: '1.25rem', fontWeight: 800 }}>S/. {prod.precio.toFixed(2)}</Card.Text>
                                        <Button variant="outline-primary" style={{ borderRadius: '20px' }} onClick={() => window.open(`https://wa.me/51941883990?text=Hola, estoy interesado en el producto: ${prod.nombre}`, '_blank')}>Consultar</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )) : (
                            <Col className="text-muted">Consulta sobre nuestros equipos y accesorios.</Col>
                        )}
                    </Row>
                </Container>
            </section>

            {/* Contact Section */}
            <section id="contacto" className="py-5 bg-white">
                <Container className="py-5">
                    <Row>
                        <Col md={6}>
                            <h2 className="mb-4" style={{ color: colors.blue, fontWeight: 800 }}>CONTÁCTENOS</h2>
                            <p className="mb-5">Déjanos tus datos y nos pondremos en contacto contigo para brindarte toda la información necesaria sobre nuestra academia.</p>
                            <div className="mb-3 d-flex align-items-center">
                                <div className="p-3 rounded-circle me-3" style={{ backgroundColor: colors.lightBlue, color: colors.blue }}>
                                    <FontAwesomeIcon icon={faPhone} />
                                </div>
                                <div>
                                    <h6 className="mb-0">Teléfono / WhatsApp</h6>
                                    <p className="mb-0">+51 941 883 990</p>
                                </div>
                            </div>
                            <div className="mb-3 d-flex align-items-center">
                                <div className="p-3 rounded-circle me-3" style={{ backgroundColor: colors.lightBlue, color: colors.blue }}>
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </div>
                                <div>
                                    <h6 className="mb-0">Email</h6>
                                    <p className="mb-0">nvelazco@helpersoft.com.pe</p>
                                </div>
                            </div>
                            <div className="mb-3 d-flex align-items-center">
                                <div className="p-3 rounded-circle me-3" style={{ backgroundColor: colors.lightBlue, color: colors.blue }}>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                </div>
                                <div>
                                    <h6 className="mb-0">Ubicación</h6>
                                    <p className="mb-0">Colegio El Divino Maestro - Puente Piedra</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <Card className="p-4 border-0 shadow" style={{ borderRadius: '20px' }}>
                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Nombres</Form.Label>
                                                <Form.Control name="nombres" value={contactForm.nombres} onChange={handleInputChange} required placeholder="Ingresa tus nombres" style={{ borderRadius: '10px' }} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Apellidos</Form.Label>
                                                <Form.Control name="apellidos" value={contactForm.apellidos} onChange={handleInputChange} required placeholder="Ingresa tus apellidos" style={{ borderRadius: '10px' }} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Correo Electrónico</Form.Label>
                                        <Form.Control name="email" type="email" value={contactForm.email} onChange={handleInputChange} required placeholder="ejemplo@correo.com" style={{ borderRadius: '10px' }} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Celular</Form.Label>
                                        <Form.Control name="celular" value={contactForm.celular} onChange={handleInputChange} required placeholder="Numero de contacto" style={{ borderRadius: '10px' }} />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Mensaje (Opcional)</Form.Label>
                                        <Form.Control name="mensaje" as="textarea" rows={3} value={contactForm.mensaje} onChange={handleInputChange} placeholder="¿Cómo podemos ayudarte?" style={{ borderRadius: '10px' }} />
                                    </Form.Group>
                                    <Button type="submit" className="w-100 py-3" style={{ backgroundColor: colors.blue, border: 'none', borderRadius: '10px', fontWeight: 700 }}>Enviar Información</Button>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Footer & Social Icons */}
            <footer className="py-4 text-center" style={{ backgroundColor: colors.blue, color: 'white' }}>
                <Container>
                    <img src="/logo_academia.jpg" height="40" className="mb-3 rounded-circle bg-white p-1" alt="Footer Logo" />
                    <h5 className="mb-3">HELPER SOFT SPORT</h5>
                    <div className="mb-4">
                        <a href="https://wa.me/51941883990" target="_blank" rel="noreferrer" className="mx-2 text-white" style={{ fontSize: '2rem' }}>
                            <FontAwesomeIcon icon={faWhatsapp} />
                        </a>
                        <a href="https://m.me/apolo.ramos.923" target="_blank" rel="noreferrer" className="mx-2 text-white" style={{ fontSize: '2rem' }}>
                            <FontAwesomeIcon icon={faFacebookMessenger} />
                        </a>
                    </div>
                    <p className="mb-0 opacity-75">© 2026 HELPER SOFT SPORT. Todos los derechos reservados.</p>
                </Container>
            </footer>

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/51941883990"
                target="_blank"
                rel="noreferrer"
                className="position-fixed"
                style={{ bottom: '30px', right: '30px', backgroundColor: '#25D366', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', zIndex: 1000, textDecoration: 'none' }}
            >
                <FontAwesomeIcon icon={faWhatsapp} />
            </a>
        </div>
    );
};

export default LandingPage;
