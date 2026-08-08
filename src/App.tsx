import { Suspense, lazy, useEffect, useState } from "react";
import type { ComponentType } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/common/AppShell";
import { SplashScreen } from "./components/common/SplashScreen";
import { PageTransition } from "./components/common/PageTransition";

const SPLASH_DURATION_MS = 900;

// Splits each view into its own chunk, loaded on first visit to its route
// instead of all up front. Views use named exports (not default), so this
// just re-wraps the requested export as the default React.lazy expects.
function lazyView<K extends string>(loader: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(() => loader().then((m) => ({ default: m[name] })));
}

const HomeView = lazyView(() => import("./views/HomeView"), "HomeView");
const ReadingHubView = lazyView(() => import("./views/ReadingHubView"), "ReadingHubView");
const ReadingSoloView = lazyView(() => import("./views/ReadingSoloView"), "ReadingSoloView");
const ReadingAiView = lazyView(() => import("./views/ReadingAiView"), "ReadingAiView");
const ReadingLiveView = lazyView(() => import("./views/ReadingLiveView"), "ReadingLiveView");
const ScrollView = lazyView(() => import("./views/ScrollView"), "ScrollView");
const ScrollHubView = lazyView(() => import("./views/ScrollHubView"), "ScrollHubView");
const FriendsView = lazyView(() => import("./views/FriendsView"), "FriendsView");
const LibraryHubView = lazyView(() => import("./views/LibraryHubView"), "LibraryHubView");
const LibraryVocabView = lazyView(() => import("./views/LibraryVocabView"), "LibraryVocabView");
const ReadingTimerView = lazyView(() => import("./views/ReadingTimerView"), "ReadingTimerView");
const MemoView = lazyView(() => import("./views/MemoView"), "MemoView");
const ReadingHistoryView = lazyView(() => import("./views/ReadingHistoryView"), "ReadingHistoryView");
const MileageView = lazyView(() => import("./views/MileageView"), "MileageView");
const EssayDetailView = lazyView(() => import("./views/EssayDetailView"), "EssayDetailView");
const ActivityView = lazyView(() => import("./views/ActivityView"), "ActivityView");
const SettingsView = lazyView(() => import("./views/SettingsView"), "SettingsView");
const AlarmView = lazyView(() => import("./views/AlarmView"), "AlarmView");
const ProfileView = lazyView(() => import("./views/ProfileView"), "ProfileView");
const PurchaseView = lazyView(() => import("./views/PurchaseView"), "PurchaseView");

const ROUTES: { path: string; View: ComponentType }[] = [
  { path: "/", View: HomeView },
  { path: "/reading", View: ReadingHubView },
  { path: "/reading/solo", View: ReadingSoloView },
  { path: "/reading/ai", View: ReadingAiView },
  { path: "/reading/live", View: ReadingLiveView },
  { path: "/scroll", View: ScrollHubView },
  { path: "/scroll/:bookId", View: ScrollView },
  { path: "/friends", View: FriendsView },
  { path: "/assist", View: LibraryHubView },
  { path: "/assist/vocab", View: LibraryVocabView },
  { path: "/assist/timer", View: ReadingTimerView },
  { path: "/assist/memo", View: MemoView },
  { path: "/assist/history", View: ReadingHistoryView },
  { path: "/mileage", View: MileageView },
  { path: "/essay/:id", View: EssayDetailView },
  { path: "/activity", View: ActivityView },
  { path: "/settings", View: SettingsView },
  { path: "/notifications", View: AlarmView },
  { path: "/profile", View: ProfileView },
  { path: "/purchase", View: PurchaseView },
];

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <AppShell>
      <Suspense fallback={<div className="flex-1" />}>
        <Routes>
          {ROUTES.map(({ path, View }) => (
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
        </Routes>
      </Suspense>
    </AppShell>
  );
}

export default App;
