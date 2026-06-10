import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TicketCategorySelector, { getCategoryTitle } from '../components/TicketCategorySelector';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [category, setCategory] = useState(null);
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
        if (!category) {
            alert('Por favor, selecione uma categoria primeiro.');
            return;
        }
        setSubmitLoading(true);
        try {
            await api.post('/tickets', { title, description, category });
            setTitle('');
            setDescription('');
            setCategory(null);
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
                <div className="animate-fade-in mb-4">
                    <h3 className="mb-4">1. Qual o assunto do seu chamado?</h3>
                    <TicketCategorySelector 
                        selectedCategory={category} 
                        onSelect={(cat) => setCategory(cat)} 
                    />

                    {category && (
                        <div className="glass-panel animate-slide-up" style={{ padding: '1.5rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <h3>2. Detalhes do Chamado</h3>
                                <span className="badge-category">{getCategoryTitle(category)}</span>
                            </div>
                            
                            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Título do Problema</label>
                                    <input 
                                        type="text" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        placeholder="Ex: Sistema lento ao gerar relatórios"
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Descrição Detalhada</label>
                                    <textarea 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                        rows="4"
                                        placeholder="Descreva o problema com o máximo de detalhes possível para facilitar o atendimento..."
                                        required 
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => {
                                        setShowForm(false);
                                        setCategory(null);
                                    }}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                                        {submitLoading ? 'Enviando...' : 'Abrir Chamado'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
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
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Assunto</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Categoria</th>
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
                                        <span className="badge-category">{getCategoryTitle(ticket.category)}</span>
                                    </td>
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
