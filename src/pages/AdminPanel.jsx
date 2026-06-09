import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, ShieldAlert, Plus } from 'lucide-react';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' ou 'logs'
    
    // Create User Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('solicitante');
    const [showForm, setShowForm] = useState(false);

    const fetchData = async () => {
        try {
            const [usersRes, logsRes] = await Promise.all([
                api.get('/users'),
                api.get('/audit')
            ]);
            setUsers(usersRes.data);
            setLogs(logsRes.data);
        } catch (error) {
            console.error('Erro ao buscar dados do painel admin', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', { name, email, password, role });
            alert('Usuário criado com sucesso!');
            setShowForm(false);
            setName(''); setEmail(''); setPassword(''); setRole('solicitante');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Erro ao criar usuário');
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="mb-4">Painel Administrativo</h2>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} /> Gestão de Usuários
                </button>
                <button 
                    className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('logs')}
                >
                    <ShieldAlert size={18} /> Logs de Auditoria
                </button>
            </div>

            {activeTab === 'users' && (
                <div>
                    <div className="flex-between mb-4">
                        <h3>Usuários do Sistema</h3>
                        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                            <Plus size={18} /> Novo Usuário
                        </button>
                    </div>

                    {showForm && (
                        <div className="glass-panel mb-4 animate-fade-in" style={{ padding: '1.5rem' }}>
                            <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label className="text-sm text-muted mb-2" style={{ display: 'block' }}>Nome Completo</label>
                                    <input required type="text" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm text-muted mb-2" style={{ display: 'block' }}>E-mail</label>
                                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm text-muted mb-2" style={{ display: 'block' }}>Senha</label>
                                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm text-muted mb-2" style={{ display: 'block' }}>Perfil de Acesso</label>
                                    <select required value={role} onChange={e => setRole(e.target.value)}>
                                        <option value="solicitante">Solicitante</option>
                                        <option value="tecnico">Técnico</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary">Cadastrar Usuário</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="glass-panel" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>ID</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Nome</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>E-mail</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Perfil</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>{u.id}</td>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{u.name}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className="status-badge status-aguardando" style={{ textTransform: 'capitalize' }}>
                                                {u.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div>
                    <h3 className="mb-4">Logs de Auditoria de Segurança</h3>
                    <div className="glass-panel" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Data/Hora</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Usuário (ID)</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Ação</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Detalhes</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            {format(new Date(log.created_at), "dd/MM/yy HH:mm:ss")}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {log.user_name ? `${log.user_name} (#${log.user_id})` : 'Sistema'}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{log.action}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{log.details}</td>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{log.ip_address}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
