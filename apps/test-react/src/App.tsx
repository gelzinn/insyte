import { useTrack } from "@insyte/track/react";
import "./App.css";

export default function App() {
  const track = useTrack();

  return (
    <main className="demo">
      <span className="badge">React + Vite</span>
      <h1>@insyte/track demo</h1>
      <p>
        Aceite os cookies, abra o console e clique no botão para ver o evento de
        analytics.
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
        Disparar evento
      </button>
    </main>
  );
}
