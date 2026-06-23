import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, ShieldAlert, Plus, Check, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AdminPanel = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' ou 'logs'
    
    // Create/Edit User Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('solicitante');
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);

    const passwordChecks = [
        { label: 'No mínimo 8 caracteres', test: (pwd) => pwd.length >= 8 },
        { label: 'Pelo menos uma letra maiúscula', test: (pwd) => /[A-Z]/.test(pwd) },
        { label: 'Pelo menos uma letra minúscula', test: (pwd) => /[a-z]/.test(pwd) },
        { label: 'Pelo menos um número', test: (pwd) => /[0-9]/.test(pwd) },
        { label: 'Pelo menos um caractere especial (ex: @, #, $)', test: (pwd) => /[^A-Za-z0-9]/.test(pwd) },
    ];

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

    const handleOpenCreateForm = () => {
        setEditingUser(null);
        setName('');
        setEmail('');
        setPassword('');
        setRole('solicitante');
        setFormError(null);
        setShowForm(true);
    };

    const handleOpenEditForm = (user) => {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
        setPassword('');
        setRole(user.role);
        setFormError(null);
        setShowForm(true);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setFormError(null);
        try {
            await api.post('/users', { name, email, password, role });
            alert('Usuário criado com sucesso!');
            setShowForm(false);
            setName(''); setEmail(''); setPassword(''); setRole('solicitante');
            fetchData();
        } catch (error) {
            const data = error.response?.data;
            if (data?.errors && Array.isArray(data.errors)) {
                setFormError(data.errors);
            } else {
                setFormError(data?.message || 'Erro ao criar usuário');
            }
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setFormError(null);
        try {
            const payload = { name, email, role };
            if (password && password.trim() !== '') {
                payload.password = password;
            }
            await api.put(`/users/${editingUser.id}`, payload);
            alert('Usuário atualizado com sucesso!');
            setShowForm(false);
            setEditingUser(null);
            setName(''); setEmail(''); setPassword(''); setRole('solicitante');
            fetchData();
        } catch (error) {
            const data = error.response?.data;
            if (data?.errors && Array.isArray(data.errors)) {
                setFormError(data.errors);
            } else {
                setFormError(data?.message || 'Erro ao atualizar usuário');
            }
        }
    };

    const handleDeleteUser = async (user) => {
        const warning = `Tem certeza que deseja excluir o usuário ${user.name}?\n\nATENÇÃO: Todos os chamados criados por este usuário serão excluídos permanentemente e os chamados atribuídos a ele ficarão sem técnico. Esta ação não pode ser desfeita.`;
        if (window.confirm(warning)) {
            try {
                await api.delete(`/users/${user.id}`);
                alert('Usuário excluído com sucesso!');
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Erro ao excluir usuário');
            }
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
                        <button className="btn btn-primary" onClick={() => { if (showForm) { setShowForm(false); setEditingUser(null); } else { handleOpenCreateForm(); } }}>
                            <Plus size={18} /> Novo Usuário
                        </button>
                    </div>

                    {showForm && (
                        <div className="glass-panel mb-4 animate-fade-in" style={{ padding: '1.5rem' }}>
                            <h4 className="mb-4">{editingUser ? `Editar Usuário: ${editingUser.name}` : 'Novo Usuário'}</h4>
                            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {formError && (
                                    <div className="animate-fade-in" style={{ gridColumn: 'span 2', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                            <AlertCircle size={18} />
                                            <span>Não foi possível {editingUser ? 'atualizar' : 'cadastrar'} o usuário:</span>
                                        </div>
                                        {Array.isArray(formError) ? (
                                            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                                {formError.map((err, idx) => (
                                                    <li key={idx}>{err}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span>{formError}</span>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm text-muted mb-2" style={{ display: 'block' }}>Nome Completo</label>
                                    <input required type="text" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm text-muted mb-2" style={{ display: 'block' }}>E-mail</label>
                                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm text-muted mb-2" style={{ display: 'block' }}>Senha {editingUser && '(deixe em branco para não alterar)'}</label>
                                    <input required={!editingUser} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={editingUser ? '••••••••' : ''} />
                                    {password.length > 0 && (
                                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <p className="text-xs text-muted mb-1" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Requisitos da Senha:</p>
                                            {passwordChecks.map((check, idx) => {
                                                const isValid = check.test(password);
                                                return (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: isValid ? 'var(--secondary)' : 'var(--text-muted)' }}>
                                                        {isValid ? <Check size={12} strokeWidth={3} /> : <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid var(--text-muted)', display: 'inline-block' }} />}
                                                        <span>{check.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
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
                                    <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingUser(null); setFormError(null); }}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary">{editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}</button>
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
                                    <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Ações</th>
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
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button 
                                                    className="btn btn-secondary" 
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                    onClick={() => handleOpenEditForm(u)}
                                                    title="Editar Usuário"
                                                >
                                                    <Edit2 size={14} /> Editar
                                                </button>
                                                <button 
                                                    className="btn btn-danger" 
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                    onClick={() => handleDeleteUser(u)}
                                                    disabled={currentUser && u.id === currentUser.id}
                                                    title={currentUser && u.id === currentUser.id ? "Você não pode excluir a sua própria conta" : "Excluir Usuário"}
                                                >
                                                    <Trash2 size={14} /> Excluir
                                                </button>
                                            </div>
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
