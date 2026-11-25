export const API_PATHS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    forgot: '/auth/forgot-password',
    reset: '/auth/reset-password',
    checkUsername: '/auth/check-username',
    checkEmail: '/auth/check-email',
  },
} as const;
