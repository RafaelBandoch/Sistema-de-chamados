import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [comment, setComment] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [technicians, setTechnicians] = useState([]);

    const fetchTicket = async () => {
        try {
            const response = await api.get(`/tickets/${id}`);
            setTicket(response.data);
            setNewStatus(response.data.status);
            setAssignedTo(response.data.assigned_to || '');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao carregar chamado.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        if (user.role === 'admin') {
            try {
                const response = await api.get('/users');
                setTechnicians(response.data.filter(u => u.role === 'tecnico'));
            } catch (error) {
                console.error('Erro ao carregar técnicos');
            }
        }
    };

    useEffect(() => {
        fetchTicket();
        fetchTechnicians();
    }, [id]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/tickets/${id}/history`, { comment });
            setComment('');
            fetchTicket();
        } catch (err) {
            alert('Erro ao adicionar comentário.');
        }
    };

    const handleUpdateStatus = async () => {
        try {
            await api.put(`/tickets/${id}`, { status: newStatus, assigned_to: assignedTo ? parseInt(assignedTo) : null });
            alert('Chamado atualizado com sucesso.');
            fetchTicket();
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao atualizar chamado.');
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Tem certeza que deseja cancelar este chamado?')) {
            try {
                await api.delete(`/tickets/${id}`);
                navigate('/');
            } catch (err) {
                alert(err.response?.data?.message || 'Erro ao cancelar chamado.');
            }
        }
    };

    if (loading) return <div>Carregando...</div>;
    if (error) return <div className="text-danger">{error}</div>;
    if (!ticket) return <div>Chamado não encontrado.</div>;

    const canEditStatus = user.role === 'admin' || user.role === 'tecnico';
    const canCancel = user.role === 'solicitante' && ticket.status !== 'resolvido' && ticket.status !== 'cancelado';

    return (
        <div className="animate-fade-in">
            <button className="btn btn-secondary mb-4" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} /> Voltar
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Detalhes Principais */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div className="flex-between mb-4">
                            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>#{ticket.id} - {ticket.title}</h2>
                            <span className={`status-badge status-${ticket.status.replace(' ', '-')}`}>{ticket.status}</span>
                        </div>
                        
                        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{ticket.description}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <div><strong>Solicitante:</strong> {ticket.requester_name}</div>
                            <div><strong>Técnico:</strong> {ticket.assigned_name || 'Não atribuído'}</div>
                            <div><strong>Abertura:</strong> {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}</div>
                        </div>

                        {canCancel && (
                            <div className="mt-4">
                                <button className="btn btn-danger" onClick={handleCancel}>Cancelar Chamado</button>
                            </div>
                        )}
                    </div>

                    {/* Histórico */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 className="mb-4 flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                            <MessageSquare size={20} /> Histórico e Observações
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {ticket.history.map(item => (
                                <div key={item.id} style={{ padding: '1rem', borderLeft: `4px solid var(--${item.action === 'observacao' ? 'primary' : 'info'})`, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '0 8px 8px 0' }}>
                                    <div className="flex-between mb-2">
                                        <span style={{ fontWeight: 600 }}>{item.user_name}</span>
                                        <span className="text-sm text-muted">{format(new Date(item.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}</span>
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-main)' }}>{item.comment}</p>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddComment}>
                            <textarea 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Adicione uma observação ao chamado..."
                                rows="3"
                                required
                            />
                            <button type="submit" className="btn btn-primary mt-4">Adicionar Observação</button>
                        </form>
                    </div>

                </div>

                {/* Painel de Controle Lateral */}
                {canEditStatus && (
                    <div>
                        <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
                            <h3 className="mb-4">Controle</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Atualizar Status</label>
                                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                        <option value="aberto">Aberto</option>
                                        <option value="em andamento">Em Andamento</option>
                                        <option value="aguardando">Aguardando</option>
                                        <option value="resolvido">Resolvido</option>
                                        {user.role === 'admin' && <option value="cancelado">Cancelado</option>}
                                    </select>
                                </div>

                                {user.role === 'admin' && (
                                    <div>
                                        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Atribuir Técnico</label>
                                        <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                                            <option value="">Não atribuído</option>
                                            {technicians.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button className="btn btn-primary" onClick={handleUpdateStatus} style={{ width: '100%' }}>
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetails;
