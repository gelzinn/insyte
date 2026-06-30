import { useTrack } from "@insyte/track/react";
import "./App.css";

export default function App() {
  const track = useTrack();

  return (
    <main className="demo">
      <span className="badge">React + Vite</span>
      <h1>@insyte/track demo</h1>
      <p>
        Accept cookies, open the console, and click the button to see the analytics
        event.
      </p>
      <button
        type="button"
        className="demo-button"
        onClick={() =>
          track("demo_button_clicked", {
            framework: "react",
            source: "test-react",
          })
        }
      >
        Track event
      </button>
    </main>
  );
}
