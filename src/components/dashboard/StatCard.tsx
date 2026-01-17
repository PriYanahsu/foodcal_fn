import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    unit: string;
    icon?: string;
    color?: string; // hex or css var
    progress?: number; // 0-100
}

export function StatCard({ label, value, unit, icon, color = '#2f81f7', progress }: StatCardProps) {
    return (
        <div className="bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-2xl shadow-xl p-6 relative overflow-hidden group">
            {/* Background Glow */}
            <div
                className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl transition-opacity duration-300 group-hover:opacity-20"
                style={{ backgroundColor: color }}
            />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-[var(--text-muted)] text-sm font-medium uppercase tracking-wider">{label}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                        <h3 className="text-3xl font-bold text-white">{value}</h3>
                        <span className="text-sm text-[var(--text-muted)]">{unit}</span>
                    </div>
                </div>
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white/5 border border-white/10"
                >
                    {icon}
                </div>
            </div>

            {/* Progress Bar */}
            {progress !== undefined && (
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                            width: `${Math.min(100, Math.max(0, progress))}%`,
                            backgroundColor: color,
                            boxShadow: `0 0 10px ${color}60`
                        }}
                    />
                </div>
            )}
        </div>
    );
}
