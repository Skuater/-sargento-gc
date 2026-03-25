import { useState } from "react";
import usePlan from "./hooks/usePlan";
import TabHoy from "./components/TabHoy";
import TabSemana from "./components/TabSemana";
import TabProgreso from "./components/TabProgreso";
import TabPlan from "./components/TabPlan";
import TabAjustes from "./components/TabAjustes";

const TABS = [
  { id: "hoy", label: "HOY", icon: "📅" },
  { id: "semana", label: "SEMANA", icon: "📆" },
  { id: "progreso", label: "PROGRESO", icon: "📊" },
  { id: "plan", label: "PLAN", icon: "🗓️" },
  { id: "ajustes", label: "AJUSTES", icon: "⚙️" },
];

export default function App() {
  const [tabActiva, setTabActiva] = useState("hoy");
  const plan = usePlan();

  const renderTab = () => {
    switch (tabActiva) {
      case "hoy":     return <TabHoy plan={plan} />;
      case "semana":  return <TabSemana plan={plan} />;
      case "progreso":return <TabProgreso plan={plan} />;
      case "plan":    return <TabPlan plan={plan} />;
      case "ajustes": return <TabAjustes plan={plan} />;
      default:        return <TabHoy plan={plan} />;
    }
  };

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerTitle}>SARGENTO GC</div>
          <div style={styles.headerSub}>Calendario v9</div>
        </div>
        {plan.semanaActual && (
          <div style={styles.headerRight}>
            <div style={styles.headerSemNum}>{plan.semanaActual}<span style={styles.headerSemOf}>/38</span></div>
            <div style={styles.headerSemLabel}>sem.</div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div style={styles.content}>
        {renderTab()}
      </div>

      {/* Navegación inferior */}
      <div style={styles.navBar}>
        {TABS.map((tab) => {
          const activa = tabActiva === tab.id;
          return (
            <button
              key={tab.id}
              style={{ ...styles.navItem, ...(activa ? styles.navItemActiva : {}) }}
              onClick={() => setTabActiva(tab.id)}
            >
              <span style={styles.navIcon}>{tab.icon}</span>
              <span style={{ ...styles.navLabel, color: activa ? "#5a8adb" : "#555" }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  root: {
    maxWidth: 500,
    margin: "0 auto",
    minHeight: "100vh",
    background: "#0a0a0f",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif",
    position: "relative",
    userSelect: "none",
    WebkitUserSelect: "none",
  },
  header: {
    background: "#0d0d15",
    borderBottom: "1px solid #1a1a24",
    padding: "12px 16px 10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerLeft: {},
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 900,
    letterSpacing: 2,
  },
  headerSub: { color: "#333", fontSize: 9, letterSpacing: 1, marginTop: 1 },
  headerRight: { textAlign: "right" },
  headerSemNum: { color: "#fff", fontSize: 20, fontWeight: 800, lineHeight: 1 },
  headerSemOf: { color: "#444", fontSize: 11, fontWeight: 400 },
  headerSemLabel: { color: "#444", fontSize: 9, letterSpacing: 1 },

  content: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    paddingBottom: 70,
  },

  navBar: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 500,
    background: "#0d0d15",
    borderTop: "1px solid #1a1a24",
    display: "flex",
    zIndex: 20,
    paddingBottom: "env(safe-area-inset-bottom)",
  },
  navItem: {
    flex: 1,
    background: "transparent",
    border: "none",
    padding: "8px 4px 6px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  navItemActiva: {
    borderTop: "2px solid #2d5adb",
  },
  navIcon: { fontSize: 18 },
  navLabel: { fontSize: 8, fontWeight: 700, letterSpacing: 0.5 },
};
