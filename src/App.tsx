import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/common/AppShell";
import { SplashScreen } from "./components/common/SplashScreen";
import { PageTransition } from "./components/common/PageTransition";
import { HomeView } from "./views/HomeView";
import { ReadingView } from "./views/ReadingView";
import { ScrollView } from "./views/ScrollView";
import { FriendsView } from "./views/FriendsView";
import { ReadingAssistView } from "./views/ReadingAssistView";
import { MileageView } from "./views/MileageView";

const SPLASH_DURATION_MS = 900;

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <AppShell>
      <Routes>
        <Route
          path="/"
          element={
            <PageTransition>
              <HomeView />
            </PageTransition>
          }
        />
        <Route
          path="/reading"
          element={
            <PageTransition>
              <ReadingView />
            </PageTransition>
          }
        />
        <Route
          path="/scroll"
          element={
            <PageTransition>
              <ScrollView />
            </PageTransition>
          }
        />
        <Route
          path="/friends"
          element={
            <PageTransition>
              <FriendsView />
            </PageTransition>
          }
        />
        <Route
          path="/assist"
          element={
            <PageTransition>
              <ReadingAssistView />
            </PageTransition>
          }
        />
        <Route
          path="/mileage"
          element={
            <PageTransition>
              <MileageView />
            </PageTransition>
          }
        />
      </Routes>
    </AppShell>
  );
}

export default App;
