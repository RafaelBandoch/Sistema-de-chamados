import React, { useState, useEffect, useContext, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const NotificationBell = () => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Polling a cada 30 segundos
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        setIsOpen(false);
        if (notification.ticket_id) {
            navigate(`/chamado/${notification.ticket_id}#historico`);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="notification-container" ref={dropdownRef}>
            <button 
                className="notification-bell-btn" 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notificações"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="notification-badge pulse-animation">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown animate-fade-in">
                    <div className="notification-header">
                        <h4>Notificações</h4>
                        {unreadCount > 0 && (
                            <button className="btn-text text-sm text-primary" onClick={markAllAsRead}>
                                <Check size={14} style={{ marginRight: '4px' }} />
                                Marcar todas lidas
                            </button>
                        )}
                    </div>
                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="notification-empty">
                                <p className="text-muted">Nenhuma notificação encontrada.</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-content">
                                        <p>{notification.message}</p>
                                        <span className="notification-time">
                                            {new Date(notification.created_at).toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                    {!notification.is_read && (
                                        <button 
                                            className="notification-mark-read"
                                            onClick={(e) => markAsRead(notification.id, e)}
                                            title="Marcar como lida"
                                        >
                                            <span className="dot"></span>
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
