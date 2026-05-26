// rule-engine/operator-engine.ts
export const OperatorEngine: Record<string, (actualValue: any, expectedValue: any) => boolean> = {
    'EQUALS': (a, b) => String(a) === String(b),
    'NOT_EQUALS': (a, b) => String(a) !== String(b),
    'GREATER_THAN': (a, b) => Number(a) > Number(b),
    'GREATER_THAN_OR_EQUAL': (a, b) => Number(a) >= Number(b),
    'LESS_THAN': (a, b) => Number(a) < Number(b),
    'LESS_THAN_OR_EQUAL': (a, b) => Number(a) <= Number(b),
    'INCLUDES': (a: any[], b) => a.includes(b),
    'IS_TRUE': (a) => a === true || a === 'true'
};