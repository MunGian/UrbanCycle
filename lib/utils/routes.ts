export const Route = {
  SignUpPage: "/auth/signup",
  LoginPage: "/auth/login",
  ResetPasswordPage: "/auth/resetPassword",
  HomePage: "/(tabs)/home",
  MessagePage: "/(tabs)/messages",
  ProfilePage: "/(tabs)/profile",
  ReportPage: "/(tabs)/report",
  CartPage: "/pages/cart" as const,
} as const satisfies Record<string, `/${string}`>;
