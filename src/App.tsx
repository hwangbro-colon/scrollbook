import { Suspense, lazy, useEffect, useState } from "react";
import type { ComponentType } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/common/AppShell";
import { SplashScreen } from "./components/common/SplashScreen";
import { PageTransition } from "./components/common/PageTransition";
import { PhoneFrame } from "./components/common/PhoneFrame";
import { SignupLoginView } from "./views/SignupLoginView";
import { useOnboardingStore } from "./store/onboardingStore";

const SPLASH_DURATION_MS = 900;

// Splits each view into its own chunk, loaded on first visit to its route
// instead of all up front. Views use named exports (not default), so this
// just re-wraps the requested export as the default React.lazy expects.
function lazyView<K extends string>(loader: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(() => loader().then((m) => ({ default: m[name] })));
}

// 스크롤 기능만 다루는 이번 프로토타입 스코프의 4탭 + 설정 + 완독모드. 낭독/
// 그룹/독서보조/마일리지·쿠폰·구매 화면은 전부 범위 밖 — App.tsx에서 더 이상
// import/라우팅하지 않을 뿐, 파일 자체는 src/views에 남겨둠(나중에 범위가
// 넓어지면 참고용).
const HomeScrollView = lazyView(() => import("./views/HomeScrollView"), "HomeScrollView");
const LibraryView = lazyView(() => import("./views/LibraryView"), "LibraryView");
const ExpansionView = lazyView(() => import("./views/ExpansionView"), "ExpansionView");
const ProfileView = lazyView(() => import("./views/ProfileView"), "ProfileView");
const SettingsView = lazyView(() => import("./views/SettingsView"), "SettingsView");
const ReadFullView = lazyView(() => import("./views/ReadFullView"), "ReadFullView");

// 하단 탭바가 있는 4탭 화면들.
const TAB_ROUTES: { path: string; View: ComponentType }[] = [
  { path: "/", View: HomeScrollView },
  { path: "/library", View: LibraryView },
  { path: "/expansion", View: ExpansionView },
  { path: "/profile", View: ProfileView },
  { path: "/settings", View: SettingsView },
];

// 완독모드는 탭이 아니라 여기(AppShell 바깥)에 둔다 — 몰입형으로 탭바 없이
// 풀스크린으로 보여야 하고, 피드의 CTA에서든 책장에서든 동일하게 진입해야 하기 때문.
function TabsLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const loggedIn = useOnboardingStore((s) => s.loggedIn);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  // 온보딩 순서: 스플래시(흰 배경, 로고) → 회원가입/로그인 → 탭 앱.
  // 로그인 이후 나오는 "북북 사용법" 팝업은 여기가 아니라 HomeScrollView 안에서
  // hasSeenTutorial로 처리(스펙: "북북 홈 진입 시" 표시되는 것이라 홈 화면 소관).
  let content;
  if (showSplash) {
    content = <SplashScreen />;
  } else if (!loggedIn) {
    content = <SignupLoginView />;
  } else {
    content = (
      <Suspense fallback={<div className="flex-1" />}>
        <Routes>
          <Route element={<TabsLayout />}>
            {TAB_ROUTES.map(({ path, View }) => (
              <Route
                key={path}
                path={path}
                element={
                  <PageTransition>
                    <View />
                  </PageTransition>
                }
              />
            ))}
          </Route>
          <Route
            path="/read/:bookId"
            element={
              <PageTransition>
                <ReadFullView />
              </PageTransition>
            }
          />
        </Routes>
      </Suspense>
    );
  }

  return <PhoneFrame>{content}</PhoneFrame>;
}

export default App;
