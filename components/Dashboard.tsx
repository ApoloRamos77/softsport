
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface DashboardStats {
  topStats: {
    totalAlumnos: number;
    alumnosActivos: number;
    totalRepresentantes: number;
    partidosJugados: number;
    entrenamientos: number;
  };
  financialStats: {
    montoFacturado: number;
    montoRecaudado: number;
    montoPendiente: number;
    montoExonerado: number;
  };
  summaryData: {
    proximosPartidos: any[];
    cumpleaneros: any[];
    alumnosDeBaja: any[];
    alumnosRecientes: any[];
  };
}

interface FinancialChartData {
  month: string;
  ingresos: number;
  egresos: number;
}

const Dashboard: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [financialChart, setFinancialChart] = useState<FinancialChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodosVencidos, setPeriodosVencidos] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, chartData, vencidosData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getFinancialChart(),
        apiService.getPeriodosVencidos().catch(() => ({ totalCount: 0, data: [] }))
      ]);
      setStats(statsData);
      setFinancialChart(chartData);
      setPeriodosVencidos(vencidosData.totalCount || 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Cargando datos del dashboard...</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const topStats = [
    {
      label: 'Total Alumnos',
      value: stats.topStats.totalAlumnos.toString(),
      sub: `${stats.topStats.alumnosActivos} activos`,
      icon: 'fa-user-friends',
      color: 'text-blue-500'
    },
    {
      label: 'Representantes',
      value: stats.topStats.totalRepresentantes.toString(),
      sub: 'Registrados',
      icon: 'fa-user-tie',
      color: 'text-indigo-400'
    },
    {
      label: 'Partidos Jugados',
      value: stats.topStats.partidosJugados.toString(),
      sub: '',
      icon: 'fa-trophy',
      color: 'text-yellow-500'
    },
    {
      label: 'Entrenamientos',
      value: stats.topStats.entrenamientos.toString(),
      sub: '',
      icon: 'fa-running',
      color: 'text-emerald-400'
    },
  ];

  const financialStats = [
    {
      label: 'Monto Facturado',
      value: formatCurrency(stats.financialStats.montoFacturado),
      sub: 'Total facturado',
      icon: 'fa-file-invoice-dollar',
      color: 'text-blue-500'
    },
    {
      label: 'Monto Recaudado',
      value: formatCurrency(stats.financialStats.montoRecaudado),
      sub: 'Total recaudado',
      icon: 'fa-hand-holding-usd',
      color: 'text-green-500'
    },
    {
      label: 'Monto Pendiente',
      value: formatCurrency(stats.financialStats.montoPendiente),
      sub: 'Saldo pendiente',
      icon: 'fa-exclamation-circle',
      color: 'text-orange-500'
    },
    {
      label: 'Monto Exonerado',
      value: formatCurrency(stats.financialStats.montoExonerado),
      sub: 'Por becas activas',
      icon: 'fa-medal',
      color: 'text-indigo-400'
    },
  ];

  const getMaxValue = () => {
    const allValues = financialChart.flatMap(d => [d.ingresos, d.egresos]);
    return Math.max(...allValues, 1);
  };

  const maxValue = getMaxValue();

  const summaryCards = [
    {
      title: 'Próximos Partidos',
      icon: 'fa-calendar-check',
      content: stats.summaryData.proximosPartidos.length > 0
        ? stats.summaryData.proximosPartidos.map(p =>
          `${new Date(p.gameDate).toLocaleDateString()} - ${p.opponent}`
        ).join(', ')
        : 'No hay partidos próximos',
      count: stats.summaryData.proximosPartidos.length
    },
    {
      title: 'Próximos Entrenamientos',
      icon: 'fa-running',
      content: 'No hay entrenamientos próximos',
      count: 0
    },
    {
      title: 'Cumpleañeros del Mes',
      icon: 'fa-birthday-cake',
      content: stats.summaryData.cumpleaneros.length > 0
        ? stats.summaryData.cumpleaneros.map(c =>
          `${c.nombre} ${c.apellido}`
        ).join(', ')
        : 'No hay cumpleañeros este mes',
      count: stats.summaryData.cumpleaneros.length
    },
    {
      title: 'Alumnos de Baja',
      icon: 'fa-user-minus',
      content: stats.summaryData.alumnosDeBaja.length > 0
        ? `${stats.summaryData.alumnosDeBaja.length} alumno(s) suspendido(s)`
        : 'No hay alumnos suspendidos',
      count: stats.summaryData.alumnosDeBaja.length
    },
    {
      title: 'Alumnos Recientes',
      icon: 'fa-user-plus',
      content: stats.summaryData.alumnosRecientes.length > 0
        ? `${stats.summaryData.alumnosRecientes.length} nuevo(s) en los últimos 30 días`
        : 'No hay alumnos recientes',
      count: stats.summaryData.alumnosRecientes.length
    },
    {
      title: 'Períodos Vencidos',
      icon: 'fa-calendar-times',
      content: periodosVencidos > 0
        ? `${periodosVencidos} mensualidad(es) sin pagar vencida(s)`
        : 'No hay mensualidades vencidas',
      count: periodosVencidos,
      action: periodosVencidos > 0 ? () => onNavigate?.('periodos') : undefined,
      isAlert: periodosVencidos > 0
    },
    {
      title: 'Notificaciones del Sistema',
      icon: 'fa-bell',
      content: 'No hay notificaciones recientes',
      count: 0
    },
  ];

  return (
    <div>
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-end">
          <select className="form-select form-select-sm" style={{ width: '250px' }}>
            <option>Todas las temporadas</option>
          </select>
        </div>
      </div>

      <div className="row g-3">
        {topStats.map((stat, i) => (
          <div key={i} className="col-lg-3 col-md-6 col-12">
            <div className={`small-box ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-info' : i === 2 ? 'bg-warning' : 'bg-success'} text-white`}>
              <div className="inner">
                <h3 className="mb-0">{stat.value}</h3>
                <p className="mb-0">{stat.label}</p>
                {stat.sub && <small className="d-block mt-1">{stat.sub}</small>}
              </div>
              <div className="icon">
                <i className={`fas ${stat.icon}`}></i>
              </div>
              <a href="#" className="small-box-footer" onClick={(e) => e.preventDefault()}>
                Ver más <i className="fas fa-arrow-circle-right"></i>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mt-2">
        {financialStats.map((stat, i) => (
          <div key={i} className="col-lg-3 col-md-6 col-12">
            <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body p-3 d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-secondary small fw-bold mb-1 text-uppercase" style={{ fontSize: '10px' }}>{stat.label}</p>
                  <h3 className={`fw-bold mb-0 font-monospace ${i === 0 ? 'text-primary' :
                    i === 1 ? 'text-success' :
                      i === 2 ? 'text-warning' :
                        'text-info'
                    }`}>{stat.value}</h3>
                  <small className="text-secondary opacity-50" style={{ fontSize: '10px' }}>{stat.sub}</small>
                </div>
                <div className={`p-3 rounded bg-opacity-10 ${i === 0 ? 'bg-primary' :
                  i === 1 ? 'bg-success' :
                    i === 2 ? 'bg-warning' :
                      'bg-info'
                  }`}>
                  <i className={`fas ${stat.icon} fa-2x ${i === 0 ? 'text-primary' :
                    i === 1 ? 'text-success' :
                      i === 2 ? 'text-warning' :
                        'text-info'
                    }`}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mt-3">
        <div className="col-lg-6">
          <div className="card card-primary card-outline">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-chart-bar me-2"></i>
                Ingresos vs Egresos
              </h3>
            </div>
            <div className="card-body">
              <div className="position-relative" style={{ height: '250px' }}>
                {financialChart.length > 0 ? (
                  <div className="d-flex justify-content-around h-100 px-3">
                    {financialChart.slice(-6).map((data, i) => {
                      const ingresosHeight = (data.ingresos / maxValue) * 100;
                      const egresosHeight = (data.egresos / maxValue) * 100;
                      return (
                        <div key={i} className="d-flex flex-column align-items-center gap-1 flex-fill h-100">
                          <div className="d-flex gap-1 w-100 justify-content-center align-items-end flex-grow-1">
                            <div
                              className="bg-success rounded-top"
                              style={{ height: `${ingresosHeight}%`, width: '12px' }}
                              title={`Ingresos: ${formatCurrency(data.ingresos)}`}
                            ></div>
                            <div
                              className="bg-danger rounded-top"
                              style={{ height: `${egresosHeight}%`, width: '12px' }}
                              title={`Egresos: ${formatCurrency(data.egresos)}`}
                            ></div>
                          </div>
                          <small className="text-muted">{data.month.split(' ')[0]}</small>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <p className="text-muted">No hay datos disponibles</p>
                  </div>
                )}
              </div>
              <div className="d-flex gap-3 mt-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-success" style={{ width: '12px', height: '12px', borderRadius: '2px' }}></div>
                  <small>Ingresos</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-danger" style={{ width: '12px', height: '12px', borderRadius: '2px' }}></div>
                  <small>Egresos</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card card-info card-outline">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-chart-line me-2"></i>
                Llegada de Alumnos
              </h3>
            </div>
            <div className="card-body" style={{ height: '250px' }}>
              <div className="d-flex align-items-center justify-content-center h-100 flex-column">
                <i className="fas fa-chart-area fa-3x text-muted opacity-25 mb-3"></i>
                <p className="text-muted mb-0">Próximamente disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-3">
        {summaryCards.map((card: any, i) => (
          <div key={i} className="col-lg-6">
            <div className={`card card-outline ${card.isAlert ? 'card-danger border-danger' : 'card-secondary'}`}>
              <div className="card-header">
                <h3 className="card-title">
                  <i className={`fas ${card.icon} me-2 ${card.isAlert ? 'text-danger' : ''}`}></i>
                  {card.title}
                </h3>
                {card.count > 0 && (
                  <span className={`badge ${card.isAlert ? 'bg-danger' : 'bg-primary'} float-end`}>{card.count}</span>
                )}
              </div>
              <div className="card-body">
                <p className={`mb-0 ${card.count > 0 ? (card.isAlert ? 'text-danger fw-bold' : '') : 'text-muted fst-italic'}`}>
                  {card.content}
                </p>
                {card.action && (
                  <button className="btn btn-sm btn-outline-danger mt-2" onClick={card.action}>
                    <i className="fas fa-arrow-right me-1"></i>Ver períodos vencidos
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;