import { useState, useCallback } from 'react';
import { InitialMilieu, DistributionConfig } from '../types';

export const useMilieuManagement = (initialMilieus: InitialMilieu[] = []) => {
    const [milieus, setMilieus] = useState<InitialMilieu[]>(initialMilieus);

    const addMilieu = useCallback(() => {
        const newMilieu: InitialMilieu = {
            name: `New Milieu ${milieus.length + 1}`,
            proportion: 0.1,
            color: '#808080',
            attribute_distributions: {
                bildung: { type: 'beta', alpha: 2.0, beta: 2.0 },
                alter: { type: 'uniform_int', min: 18, max: 65 },
                kognitive_kapazitaet: { type: 'beta', alpha: 2.0, beta: 2.0 },
                vertraeglichkeit: { type: 'beta', alpha: 2.0, beta: 2.0 },
                freedom_preference: { type: 'beta', alpha: 2.0, beta: 2.0 },
                altruism_factor: { type: 'beta', alpha: 2.0, beta: 2.0 }
            }
        };
        setMilieus(prev => [...prev, newMilieu]);
    }, [milieus.length]);

    const removeMilieu = useCallback((index: number) => {
        if (window.confirm('Are you sure you want to delete this milieu?')) {
            setMilieus(prev => prev.filter((_, i) => i !== index));
        }
    }, []);

    const updateMilieu = useCallback((index: number, field: keyof InitialMilieu, value: any) => {
        setMilieus(prev => {
            const updated = [...prev];
            (updated[index] as any)[field] = value;
            return updated;
        });
    }, []);

    const updateDistribution = useCallback((milieuIndex: number, attributeName: string, distribution: DistributionConfig) => {
        setMilieus(prev => {
            const updated = [...prev];
            updated[milieuIndex].attribute_distributions[attributeName] = distribution;
            return updated;
        });
    }, []);

    const normalizeProportions = useCallback(() => {
        const total = milieus.reduce((sum, milieu) => sum + milieu.proportion, 0);
        if (total > 0) {
            const normalized = milieus.map(milieu => ({
                ...milieu,
                proportion: milieu.proportion / total
            }));
            setMilieus(normalized);
        }
    }, [milieus]);

    const validateProportions = useCallback(() => {
        const totalProportion = milieus.reduce((sum, milieu) => sum + milieu.proportion, 0);
        return { 
            isValid: Math.abs(totalProportion - 1.0) <= 0.001, 
            total: totalProportion 
        };
    }, [milieus]);

    return {
        milieus,
        setMilieus,
        addMilieu,
        removeMilieu,
        updateMilieu,
        updateDistribution,
        normalizeProportions,
        validateProportions
    };
};