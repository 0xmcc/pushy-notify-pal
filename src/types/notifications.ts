export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    [key: string]: any;
  };
}

export interface SafariSubscription {
  token: string;
  pushId: string;
} 