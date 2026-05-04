import Service from '@ember/service';

const TENANT_THEMES = {
  acme: {
    '--color-primary-50': '#eef2ff',
    '--color-primary-100': '#e0e7ff',
    '--color-primary-200': '#c7d2fe',
    '--color-primary-300': '#a5b4fc',
    '--color-primary-400': '#818cf8',
    '--color-primary-500': '#6366f1',
    '--color-primary-600': '#4f46e5',
    '--color-primary-700': '#4338ca',
    '--color-primary-800': '#3730a3',
    '--color-primary-900': '#1e1b4b',
    '--color-sidebar-active': '#6366f1',
  },
  globex: {
    '--color-primary-50': '#ecfdf5',
    '--color-primary-100': '#d1fae5',
    '--color-primary-200': '#a7f3d0',
    '--color-primary-300': '#6ee7b7',
    '--color-primary-400': '#34d399',
    '--color-primary-500': '#10b981',
    '--color-primary-600': '#059669',
    '--color-primary-700': '#047857',
    '--color-primary-800': '#065f46',
    '--color-primary-900': '#064e3b',
    '--color-sidebar-active': '#10b981',
  },
  initech: {
    '--color-primary-50': '#fffbeb',
    '--color-primary-100': '#fef3c7',
    '--color-primary-200': '#fde68a',
    '--color-primary-300': '#fcd34d',
    '--color-primary-400': '#fbbf24',
    '--color-primary-500': '#f59e0b',
    '--color-primary-600': '#d97706',
    '--color-primary-700': '#b45309',
    '--color-primary-800': '#92400e',
    '--color-primary-900': '#78350f',
    '--color-sidebar-active': '#f59e0b',
  },
};

const DEFAULT_THEME = TENANT_THEMES.acme;

export default class TenantThemeService extends Service {
  apply(subdomain) {
    console.debug('TenantThemeService: Applying theme for', subdomain);
    const theme = TENANT_THEMES[subdomain] || DEFAULT_THEME;
    this._applyTheme(theme);
  }

  reset() {
    console.debug('TenantThemeService: Resetting theme');
    this._applyTheme(DEFAULT_THEME);
  }

  _applyTheme(theme) {
    const root = document.documentElement;
    Object.entries(theme).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }
}
