export const runtimeConfig = {
  "features": {
    "pageA": true,
    "pageB": true,
    "pageC": false,
    "pageD": true,
    "moduleA": true,
    "moduleB": false,
    "moduleC": true,
    "moduleD": true,
    "moduleE": false
  },
  "runtime": {
    "themeColor": "#52c41a",
    "apiBase": "https://api.example.com/app2"
  }
} as const;
