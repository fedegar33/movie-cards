import { Agentation } from "agentation";
import { DialRoot } from "dialkit";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "dialkit/styles.css";
import "./index.css";
import App from "./App.tsx";

// biome-ignore lint/style/noNonNullAssertion: just being flexible in this case :)
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<DialRoot position="top-right" />
		<App />
		{import.meta.env.DEV && <Agentation />}
	</StrictMode>,
);
