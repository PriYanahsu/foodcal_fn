export const MACROS = [
    { key: 'proteinG' as const, label: 'Protein', unit: 'g', color: 'var(--primary)' },
    { key: 'carbohydrateG' as const, label: 'Carbs', unit: 'g', color: '#f5c542' },
    { key: 'fatG' as const, label: 'Fats', unit: 'g', color: '#ff6b8a' },
];

export const CHIP_POSITIONS = [
    { top: '16%', left: '6%' },
    { top: '26%', right: '5%' },
    { bottom: '30%', left: '8%' },
    { bottom: '20%', right: '7%' },
] as const;

export const DEFAULT_CHIPS = ['Protein source', 'Carbs detected', 'Portion size', 'Fats estimate'];

export const ANALYSIS_STEPS = [
    'Detecting food items…',
    'Identifying ingredients…',
    'Estimating portions…',
    'Calculating macros…',
    'Finalizing prediction…',
] as const;