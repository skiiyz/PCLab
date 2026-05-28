import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "EN" | "RU" | "CN" | "GE" | "JA" | "SP";

export const LANGS: Lang[] = ["EN", "RU", "CN", "GE", "JA", "SP"];

type Dict = Record<string, string>;

const T: Record<Lang, Dict> = {
  EN: {
    "nav.build": "Build",
    "nav.github": "GitHub",
    "nav.login": "Log In",
    "nav.signup": "Sign Up",
    "nav.logout": "Log Out",
    "hero.title1": "Build your own PC",
    "hero.title2": "from scratch",
    "hero.sub": "Build your own PC and compare it. For every budget and taste.",
    "hero.cta": "Start",
    "build.title": "Build your PC",
    "build.subtitle": "Pick a part for each category. Prices are sourced from",
    "build.your": "Your build",
    "build.total": "Total",
    "build.warnings": "Compatibility warnings",
    "build.ok": "All selected parts are compatible.",
    "auth.email": "Email",
    "auth.username": "Username",
    "auth.password": "Password",
    "auth.signup": "Create account",
    "auth.login": "Sign in",
    "auth.haveAccount": "Already have an account?",
    "auth.noAccount": "Don't have an account?",
  },
  RU: {
    "nav.build": "Сборка",
    "nav.github": "GitHub",
    "nav.login": "Войти",
    "nav.signup": "Регистрация",
    "nav.logout": "Выйти",
    "hero.title1": "Соберите свой ПК",
    "hero.title2": "с нуля",
    "hero.sub": "Соберите свой ПК и сравните его. Для любого бюджета и вкуса.",
    "hero.cta": "Начать",
    "build.title": "Соберите ПК",
    "build.subtitle": "Выберите комплектующее для каждой категории. Цены взяты с",
    "build.your": "Ваша сборка",
    "build.total": "Итого",
    "build.warnings": "Проблемы совместимости",
    "build.ok": "Все выбранные комплектующие совместимы.",
    "auth.email": "Эл. почта",
    "auth.username": "Имя пользователя",
    "auth.password": "Пароль",
    "auth.signup": "Создать аккаунт",
    "auth.login": "Войти",
    "auth.haveAccount": "Уже есть аккаунт?",
    "auth.noAccount": "Нет аккаунта?",
  },
  CN: {
    "nav.build": "组装",
    "nav.github": "GitHub",
    "nav.login": "登录",
    "nav.signup": "注册",
    "nav.logout": "退出",
    "hero.title1": "从零开始",
    "hero.title2": "组装你的电脑",
    "hero.sub": "组装并比较你的电脑。适合任何预算与品味。",
    "hero.cta": "开始",
    "build.title": "组装电脑",
    "build.subtitle": "为每个类别选择一个部件。价格来源于",
    "build.your": "你的配置",
    "build.total": "总计",
    "build.warnings": "兼容性警告",
    "build.ok": "所选部件均相互兼容。",
    "auth.email": "邮箱",
    "auth.username": "用户名",
    "auth.password": "密码",
    "auth.signup": "创建账户",
    "auth.login": "登录",
    "auth.haveAccount": "已经有账户？",
    "auth.noAccount": "还没有账户？",
  },
  GE: {
    "nav.build": "Bauen",
    "nav.github": "GitHub",
    "nav.login": "Anmelden",
    "nav.signup": "Registrieren",
    "nav.logout": "Abmelden",
    "hero.title1": "Baue deinen PC",
    "hero.title2": "von Grund auf",
    "hero.sub": "Baue deinen PC und vergleiche ihn. Für jedes Budget und jeden Geschmack.",
    "hero.cta": "Starten",
    "build.title": "Baue deinen PC",
    "build.subtitle": "Wähle ein Teil pro Kategorie. Preise stammen von",
    "build.your": "Dein Build",
    "build.total": "Gesamt",
    "build.warnings": "Kompatibilitätswarnungen",
    "build.ok": "Alle ausgewählten Teile sind kompatibel.",
    "auth.email": "E-Mail",
    "auth.username": "Benutzername",
    "auth.password": "Passwort",
    "auth.signup": "Konto erstellen",
    "auth.login": "Anmelden",
    "auth.haveAccount": "Schon ein Konto?",
    "auth.noAccount": "Noch kein Konto?",
  },
  JA: {
    "nav.build": "ビルド",
    "nav.github": "GitHub",
    "nav.login": "ログイン",
    "nav.signup": "登録",
    "nav.logout": "ログアウト",
    "hero.title1": "自分だけのPCを",
    "hero.title2": "ゼロから組む",
    "hero.sub": "自分のPCを組み立てて比較しよう。あらゆる予算と好みに。",
    "hero.cta": "スタート",
    "build.title": "PCを組み立てる",
    "build.subtitle": "各カテゴリのパーツを選んでください。価格の出典は",
    "build.your": "あなたの構成",
    "build.total": "合計",
    "build.warnings": "互換性の警告",
    "build.ok": "選択したパーツはすべて互換性があります。",
    "auth.email": "メール",
    "auth.username": "ユーザー名",
    "auth.password": "パスワード",
    "auth.signup": "アカウントを作成",
    "auth.login": "サインイン",
    "auth.haveAccount": "すでにアカウントをお持ちですか？",
    "auth.noAccount": "アカウントをお持ちでないですか？",
  },
  SP: {
    "nav.build": "Construir",
    "nav.github": "GitHub",
    "nav.login": "Entrar",
    "nav.signup": "Registrarse",
    "nav.logout": "Salir",
    "hero.title1": "Arma tu propio PC",
    "hero.title2": "desde cero",
    "hero.sub": "Arma tu PC y compáralo. Para todo presupuesto y gusto.",
    "hero.cta": "Empezar",
    "build.title": "Arma tu PC",
    "build.subtitle": "Elige una pieza para cada categoría. Precios obtenidos de",
    "build.your": "Tu build",
    "build.total": "Total",
    "build.warnings": "Avisos de compatibilidad",
    "build.ok": "Todas las piezas seleccionadas son compatibles.",
    "auth.email": "Correo",
    "auth.username": "Usuario",
    "auth.password": "Contraseña",
    "auth.signup": "Crear cuenta",
    "auth.login": "Entrar",
    "auth.haveAccount": "¿Ya tienes cuenta?",
    "auth.noAccount": "¿No tienes cuenta?",
  },
};

const I18nContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string }>({
  lang: "EN",
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("EN");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (stored && LANGS.includes(stored)) setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  };

  const t = (key: string) => T[lang][key] ?? T.EN[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);