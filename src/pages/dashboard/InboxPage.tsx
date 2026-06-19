import { useState, useEffect } from 'react'
import { PageHeader } from '../../components/dashboard/PageHeader'
import { apiClient } from '../../api/client'

type Denuncia = {
  id_denuncia_ciudadana: number
  id_tipo_delito: number
  fecha_delito: string
  hora_delito: string
  descripcion: string
  estado: string
}

export function InboxPage() {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDenuncias = async () => {
    try {
      const res = await apiClient.get('/denuncias/pendientes')
      if (res.data && res.data.success) {
        setDenuncias(res.data.data)
      }
    } catch (err) {
      console.error("Error al cargar denuncias pendientes", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDenuncias()
  }, [])

  const handleAction = async (id: number, action: 'aprobar' | 'rechazar') => {
    try {
      await apiClient.post(`/denuncias/${action}/${id}`)
      // Actualizar la lista local
      setDenuncias(prev => prev.filter(d => d.id_denuncia_ciudadana !== id))
    } catch (err) {
      console.error(`Error al ${action} denuncia`, err)
      alert(`No se pudo ${action} la denuncia. Consulte la consola para más detalles.`)
    }
  }

  return (
    <>
      <PageHeader
        title="Bandeja de Entrada - Reportes Ciudadanos"
        subtitle="Módulo de Cuarentena: Valide o descarte incidentes para alimentar el histórico oficial"
      />
      <div className="dash-content">
        <div className="dash-card">
          <div className="dash-table-wrap">
            <table className="dash-table" data-testid="inbox-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Fecha/Hora</th>
                  <th>Estado</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Cargando denuncias...</td></tr>
                ) : denuncias.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No hay reportes ciudadanos pendientes en cuarentena.</td></tr>
                ) : (
                  denuncias.map((d) => (
                    <tr key={d.id_denuncia_ciudadana}>
                      <td>#{d.id_denuncia_ciudadana}</td>
                      <td>
                        <span className={`dash-badge ${d.id_tipo_delito === 1 ? 'dash-badge--error' : 'dash-badge--warning'}`}>
                          {d.id_tipo_delito === 1 ? 'Robo Agravado' : 'Hurto Simple'}
                        </span>
                      </td>
                      <td>{d.fecha_delito} {d.hora_delito}</td>
                      <td>
                        <span className="dash-badge dash-badge--warning">
                          {d.estado || 'PENDIENTE'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'normal', overflowWrap: 'break-word' }}>
                        {d.descripcion}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="dash-btn dash-btn--primary"
                            onClick={() => handleAction(d.id_denuncia_ciudadana, 'aprobar')}
                            title="Validar y transferir a la DB oficial"
                            data-testid="inbox-approve-btn"
                          >
                            Aprobar
                          </button>
                          <button 
                            className="dash-btn dash-btn--danger"
                            onClick={() => handleAction(d.id_denuncia_ciudadana, 'rechazar')}
                            style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}
                            title="Descartar reporte falso"
                            data-testid="inbox-reject-btn"
                          >
                            Descartar
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
    </>
  )
}
