import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    glass?: boolean;
}

export const Card = ({ children, glass = true, className = '', ...props }: CardProps) => {
    const glassStyle = glass
        ? 'bg-[#111319] backdrop-blur-md border border-white/[0.08] shadow-xl'
        : 'bg-[#0C0D12] border border-white/[0.08]';

    return (
        <div
            className={`rounded-2xl p-6 ${glassStyle} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
