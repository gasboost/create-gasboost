import { LocalSetupTutorial } from "./LocalSetupTutorial";
import { RemoteSetupTutorial } from "./RemoteSetupTutorial";

export function App() {
  if (import.meta.env.DEV) {
    return <LocalSetupTutorial />;
    return <RemoteSetupTutorial />;
  }
}
