export type KPIConfig = {
  id: string;
  label: string;
  metric: string;
  format?: 'currency' | 'percentage' | 'number';
  color?: string;
  visible: boolean;
  order: number;
};

export type DateRangeConfig = {
  type: 'last7days' | 'last30days' | 'last90days' | 'custom';
  startDate?: string;
  endDate?: string;
};

export type DashboardFilter = {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains';
  value: any;
};

export type DashboardLayout = {
  widgets: Array<{
    id: string;
    type: 'kpi' | 'chart' | 'table';
    x: number;
    y: number;
    w: number;
    h: number;
    config?: Record<string, any>;
  }>;
};

export type MarketingDashboard = {
  id: string;
  name: string;
  description?: string;
  kpiConfig?: KPIConfig[];
  dateRange?: DateRangeConfig;
  filters?: DashboardFilter[];
  isDefault: boolean;
  layout?: DashboardLayout;
  createdAt: Date;
  updatedAt: Date;
};


