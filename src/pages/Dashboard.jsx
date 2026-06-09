import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/tickets');
            setTickets(response.data);
        } catch (error) {
            console.error('Erro ao buscar chamados:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            await api.post('/tickets', { title, description });
            setTitle('');
            setDescription('');
            setShowForm(false);
            fetchTickets(); // Recarrega a lista
        } catch (error) {
            alert('Erro ao criar chamado.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div>
            <div className="flex-between mb-4">
                <h2>Meus Chamados</h2>
                {(user.role === 'solicitante' || user.role === 'admin') && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        <PlusCircle size={20} /> Novo Chamado
                    </button>
                )}
            </div>

            {showForm && (
                <div className="glass-panel animate-fade-in mb-4" style={{ padding: '1.5rem' }}>
                    <h3>Abrir Novo Chamado</h3>
                    <form onSubmit={handleCreateTicket} className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted mb-4" style={{ display: 'block', marginBottom: '0.5rem' }}>Título do Problema</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                placeholder="Ex: Ar condicionado vazando na sala 3"
                                required 
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted mb-4" style={{ display: 'block', marginBottom: '0.5rem' }}>Descrição Detalhada</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                rows="4"
                                placeholder="Descreva o problema com o máximo de detalhes possível..."
                                required 
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                                {submitLoading ? 'Enviando...' : 'Criar Chamado'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando chamados...</div>
                ) : tickets.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Nenhum chamado encontrado.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>ID</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Título</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Status</th>
                                {user.role !== 'solicitante' && <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Solicitante</th>}
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Técnico</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Data</th>
                                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>#{ticket.id}</td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{ticket.title}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`status-badge status-${ticket.status.replace(' ', '-')}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    {user.role !== 'solicitante' && <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{ticket.requester_name}</td>}
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{ticket.assigned_name || 'Não atribuído'}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {format(new Date(ticket.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <Link to={`/chamado/${ticket.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                            <Search size={16} /> Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
