import React from 'react';

type BadgeVariant = 'green' | 'blue' | 'red' | 'amber' | 'gray' | 'purple';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ variant, children, dot = false }) => {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'green' ? 'bg-green-500' :
            variant === 'blue' ? 'bg-blue-500' :
            variant === 'red' ? 'bg-red-500' :
            variant === 'amber' ? 'bg-amber-500' :
            variant === 'purple' ? 'bg-purple-500' :
            'bg-slate-400'
          }`}
        />
      )}
      {children}
    </span>
  );
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Actif':
      return <Badge variant="green" dot>{status}</Badge>;
    case 'Inactif':
      return <Badge variant="red" dot>{status}</Badge>;
    case 'Disponible':
      return <Badge variant="green" dot>{status}</Badge>;
    case 'Attribué':
      return <Badge variant="blue" dot>{status}</Badge>;
    case 'Indisponible':
      return <Badge variant="red" dot>{status}</Badge>;
    default:
      return <Badge variant="gray">{status}</Badge>;
  }
};

export const getProviderBadge = (provider: string) => {
  switch (provider) {
    case 'Maroc Telecom':
      return <Badge variant="blue">{provider}</Badge>;
    case 'Orange Maroc':
      return <Badge variant="amber">{provider}</Badge>;
    case 'Inwi':
      return <Badge variant="purple">{provider}</Badge>;
    default:
      return <Badge variant="gray">{provider}</Badge>;
  }
};

export default Badge;
