import React from 'react';
import type { ParameterKey, ParameterSummary } from '../../types/sensor';
import { ParameterCard } from './ParameterCard';

interface ParameterGridProps {
  parameters?: Record<ParameterKey, ParameterSummary>;
  isLoading?: boolean;
  isStale?: boolean;
}

export const ParameterGrid: React.FC<ParameterGridProps> = ({
  parameters,
  isLoading = false,
  isStale = false
}) => {
  // 4 primary parameters in accordance with requirements
  const primaryKeys: ParameterKey[] = ['ph', 'temperature', 'salinity', 'dissolvedOxygen'];

  return (
    <div className="parameters-grid">
      {primaryKeys.map((key) => (
        <ParameterCard
          key={key}
          paramKey={key}
          data={parameters ? parameters[key] : undefined}
          isLoading={isLoading}
          isStale={isStale}
        />
      ))}
    </div>
  );
};
