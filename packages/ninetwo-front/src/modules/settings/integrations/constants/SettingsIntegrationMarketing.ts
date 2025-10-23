import { type SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';

export const SETTINGS_INTEGRATION_MARKETING_CATEGORY: SettingsIntegrationCategory =
  {
    key: 'marketing',
    title: 'Marketing & Analytics',
    hyperlink: '/settings/integrations/marketing',
    hyperlinkText: 'Ver todas as plataformas',
    integrations: [
      {
        from: {
          key: 'google-ads',
          image: '/images/integrations/google-ads-logo.webp',
        },
        to: null,
        type: 'Goto',
        text: 'Google Ads',
        link: '/settings/integrations/marketing',
        linkText: 'Configurar',
      },
      {
        from: {
          key: 'google-analytics',
          image: '/images/integrations/google-analytics-logo.png',
        },
        to: null,
        type: 'Goto',
        text: 'Google Analytics',
        link: '/settings/integrations/marketing',
        linkText: 'Configurar',
      },
      {
        from: {
          key: 'meta-ads',
          image: '/images/integrations/meta-logo.png',
        },
        to: null,
        type: 'Goto',
        text: 'Meta Ads',
        link: '/settings/integrations/marketing',
        linkText: 'Configurar',
      },
    ],
  };
