import React from 'react';
import { Building, Monitor, Droplets, LayoutGrid } from 'lucide-react';

const categories = [
    {
        id: 'predial',
        title: 'Manutenção Predial',
        description: 'Vazamentos, lâmpadas, portas, pintura ou infraestrutura física.',
        icon: Building
    },
    {
        id: 'equipamento',
        title: 'Equipamentos',
        description: 'Ar-condicionado, projetores, computadores ou maquinários.',
        icon: Monitor
    },
    {
        id: 'limpeza',
        title: 'Limpeza e Conservação',
        description: 'Solicitação de limpeza pesada ou remoção de materiais.',
        icon: Droplets
    },
    {
        id: 'outros',
        title: 'Outros',
        description: 'Qualquer outro problema que não se enquadre nas opções.',
        icon: LayoutGrid
    }
];

const TicketCategorySelector = ({ selectedCategory, onSelect }) => {
    return (
        <div className="category-grid">
            {categories.map((cat, index) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                
                return (
                    <div 
                        key={cat.id} 
                        className={`category-card animate-slide-up delay-${index * 100} ${isSelected ? 'selected' : ''}`}
                        onClick={() => onSelect(cat.id)}
                    >
                        <div className="category-icon-wrapper">
                            <Icon size={32} />
                        </div>
                        <div className="category-title">{cat.title}</div>
                        <div className="category-desc">{cat.description}</div>
                    </div>
                );
            })}
        </div>
    );
};

export const getCategoryTitle = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.title : 'Outros';
};

export default TicketCategorySelector;
