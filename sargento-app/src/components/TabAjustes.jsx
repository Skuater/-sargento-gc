import { useState } from "react";
import { PLAN_CONFIG } from "../data/planData";

export default function TabAjustes({ plan }) {
  const { fechaInicio, setFechaInicio, diasHastaExamen, resetAll } = plan;
  const [inputFecha, setInputFecha] = useState(fechaInicio || "");
  const [guardado, setGuardado] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetHecho, setResetHecho] = useState(false);

  function handleGuardar() {
    if (!inputFecha) return;
    setFechaInicio(inputFecha);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  function handleReset() {
    resetAll();
    setInputFecha("");
    setConfirmReset(false);
    setResetHecho(true);
    setTimeout(() => setResetHecho(false), 3000);
  }

  const fechaExamen = new Date("2027-06-01");
  const hoyDate = new Date();
  const semanasRestantes = Math.max(0, Math.ceil((fechaExamen - hoyDate) / (1000 * 60 * 60 * 24 * 7)));

  return (
    <div style={styles.container}>
      {/* Cuenta atrás */}
      <div style={styles.cuentaAtrasCard}>
        <div style={styles.cuentaAtrasLabel}>DÍAS HASTA EL EXAMEN</div>
        <div style={styles.cuentaAtrasNum}>{diasHastaExamen}</div>
        <div style={styles.cuentaAtrasDate}>1 junio 2027 · Ascenso a Sargento GC</div>
        <div style={styles.cuentaAtrasWeeks}>{semanasRestantes} semanas · {diasHastaExamen} días</div>
        <div style={styles.galón}>🎖</div>
      </div>

      {/* Fecha de inicio */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>📅 Fecha de inicio del plan</div>
        <div style={styles.cardDesc}>
          El plan empieza la semana del <strong>14 de septiembre de 2026</strong>.
          Introduce esa fecha para que la app calcule automáticamente en qué semana estás cada día.
        </div>
        <input
          style={styles.input}
          type="date"
          value={inputFecha}
          min="2026-09-01"
          max="2027-06-01"
          onChange={(e) => setInputFecha(e.target.value)}
        />
        <button style={styles.btn} onClick={handleGuardar}>
          Guardar fecha de inicio
        </button>
        {fechaInicio && (
          <div style={styles.fechaActual}>
            Fecha actual guardada: <strong>{fechaInicio}</strong>
          </div>
        )}
        {guardado && <div style={styles.guardadoMsg}>✓ Fecha guardada correctamente</div>}
      </div>

      {/* Protocolo de imprevistos */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>🛡 Protocolo de imprevistos</div>
        <div style={styles.protocoloItem}>
          <div style={{ ...styles.protocoloBadge, background: "#1a2a1a", borderColor: "#2d5a2d", color: "#5adb5a" }}>
            1-2 días
          </div>
          <div style={styles.protocoloText}>
            No recuperar páginas. Continuar desde donde toca al volver.
          </div>
        </div>
        <div style={styles.protocoloItem}>
          <div style={{ ...styles.protocoloBadge, background: "#2a2a1a", borderColor: "#5a5a2d", color: "#dbdb5a" }}>
            3-5 días
          </div>
          <div style={styles.protocoloText}>
            Semana siguiente Bloque A a 8p/día. Bloque B se mantiene. Recuperas energía, no páginas.
          </div>
        </div>
        <div style={styles.protocoloItem}>
          <div style={{ ...styles.protocoloBadge, background: "#2a1a1a", borderColor: "#5a2d2d", color: "#db5a5a" }}>
            +10 días
          </div>
          <div style={styles.protocoloText}>
            Reducir interleaving en Fase 3. Priorizar temas con ratio &gt;0,09. Usar días comodín.
          </div>
        </div>
        <div style={styles.reglaDOro}>
          <strong>Regla de oro:</strong> El plan absorbe días malos. Lo que no absorbe es abandonar.
        </div>
      </div>

      {/* Jerarquía Bloque B */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>🔄 Jerarquía Bloque B en saturación</div>
        <div style={styles.cardDesc}>
          Si el Bloque B está saturado y no puedes hacer todos los ciclos de repaso, siempre aplica este orden:
        </div>
        <div style={styles.jerarquiaRow}>
          <div style={styles.jerarquiaItem}>
            <div style={styles.jerarquiaPrioridad}>1º</div>
            <div style={{ ...styles.jerarquiaCiclo, color: "#db5a5a" }}>R3</div>
            <div style={styles.jerarquiaDesc}>Irrecuperable si se pierde</div>
          </div>
          <div style={styles.jerarquiaArrow}>›</div>
          <div style={styles.jerarquiaItem}>
            <div style={styles.jerarquiaPrioridad}>2º</div>
            <div style={{ ...styles.jerarquiaCiclo, color: "#dbdb5a" }}>R2</div>
            <div style={styles.jerarquiaDesc}>Consolidación</div>
          </div>
          <div style={styles.jerarquiaArrow}>›</div>
          <div style={styles.jerarquiaItem}>
            <div style={styles.jerarquiaPrioridad}>3º</div>
            <div style={{ ...styles.jerarquiaCiclo, color: "#5adb5a" }}>R1</div>
            <div style={styles.jerarquiaDesc}>Recuperable</div>
          </div>
        </div>
        <div style={styles.jerarquiaHint}>
          Recorta siempre el ciclo más reciente (R1), nunca el más antiguo (R3). La calidad de R3 es irreemplazable.
        </div>
      </div>

      {/* Temas de alta rentabilidad */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>⭐ Temas de alta rentabilidad</div>
        <div style={styles.temasGrid}>
          <div style={styles.temaItem}>
            <div style={styles.temaNombre}>T5</div>
            <div style={{ ...styles.temaRatio, color: "#5adb5a" }}>0,33 p/p</div>
            <div style={styles.temaDesc}>El más rentable del temario</div>
          </div>
          <div style={styles.temaItem}>
            <div style={styles.temaNombre}>T14</div>
            <div style={{ ...styles.temaRatio, color: "#5adb5a" }}>0,100 p/p</div>
            <div style={styles.temaDesc}>8 preg · 38% del margen de error</div>
          </div>
          <div style={styles.temaItem}>
            <div style={styles.temaNombre}>T23</div>
            <div style={{ ...styles.temaRatio, color: "#5a8adb" }}>Estatuto GC</div>
            <div style={styles.temaDesc}>Materia que vives cada día</div>
          </div>
          <div style={styles.temaItem}>
            <div style={styles.temaNombre}>T24</div>
            <div style={{ ...styles.temaRatio, color: "#5a8adb" }}>Régimen GC</div>
            <div style={styles.temaDesc}>Tabla sanciones = 70% pregs</div>
          </div>
        </div>
      </div>

      {/* Info versión */}
      <div style={styles.versionCard}>
        <div style={styles.versionTitle}>Sargento GC · Calendario {PLAN_CONFIG.version}</div>
        <div style={styles.versionInfo}>14 sep 2026 → 1 jun 2027 · 38 semanas</div>
        <div style={styles.versionInfo}>Datos guardados localmente en este dispositivo</div>
      </div>

      {/* Reset */}
      <div style={styles.resetSection}>
        {!confirmReset ? (
          <button style={styles.resetBtn} onClick={() => setConfirmReset(true)}>
            🗑 Borrar todos los datos
          </button>
        ) : (
          <div style={styles.resetConfirm}>
            <div style={styles.resetConfirmText}>
              ¿Seguro? Se borrarán todos los registros de páginas, simulacros y configuración.
            </div>
            <div style={styles.resetBtnRow}>
              <button style={styles.resetYes} onClick={handleReset}>Sí, borrar todo</button>
              <button style={styles.resetNo} onClick={() => setConfirmReset(false)}>Cancelar</button>
            </div>
          </div>
        )}
        {resetHecho && <div style={styles.resetMsg}>✓ Datos borrados</div>}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "12px 12px 24px" },

  cuentaAtrasCard: {
    background: "linear-gradient(135deg, #0a0a18 0%, #0f0f2a 100%)",
    border: "1px solid #1a1a3a",
    borderRadius: 16,
    padding: "24px 20px",
    textAlign: "center",
    marginBottom: 12,
    position: "relative",
    overflow: "hidden",
  },
  cuentaAtrasLabel: {
    color: "#555",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    marginBottom: 8,
  },
  cuentaAtrasNum: {
    fontSize: 72,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1,
    marginBottom: 8,
    fontVariantNumeric: "tabular-nums",
  },
  cuentaAtrasDate: { color: "#aaa", fontSize: 13, marginBottom: 4 },
  cuentaAtrasWeeks: { color: "#555", fontSize: 12 },
  galón: {
    position: "absolute",
    bottom: -10,
    right: 10,
    fontSize: 80,
    opacity: 0.06,
    userSelect: "none",
  },

  card: {
    background: "#13131a",
    border: "1px solid #222",
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 10,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardTitle: { color: "#ddd", fontSize: 13, fontWeight: 700 },
  cardDesc: { color: "#888", fontSize: 12, lineHeight: 1.5 },

  input: {
    background: "#1a1a24",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#fff",
    fontSize: 15,
    padding: "10px 12px",
    outline: "none",
    colorScheme: "dark",
  },
  btn: {
    background: "#2d5adb",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    padding: "12px",
    cursor: "pointer",
  },
  fechaActual: { color: "#666", fontSize: 12 },
  guardadoMsg: { color: "#5adb5a", fontSize: 12, textAlign: "center" },

  protocoloItem: { display: "flex", gap: 10, alignItems: "flex-start" },
  protocoloBadge: {
    borderRadius: 6,
    border: "1px solid",
    padding: "3px 8px",
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  protocoloText: { color: "#aaa", fontSize: 12, lineHeight: 1.5 },
  reglaDOro: {
    background: "#0f0f18",
    border: "1px solid #1a1a33",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#888",
    fontSize: 12,
    lineHeight: 1.5,
    fontStyle: "italic",
  },

  jerarquiaRow: { display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 0" },
  jerarquiaItem: { textAlign: "center", display: "flex", flexDirection: "column", gap: 2 },
  jerarquiaPrioridad: { color: "#555", fontSize: 9, fontWeight: 700 },
  jerarquiaCiclo: { fontSize: 28, fontWeight: 900 },
  jerarquiaDesc: { color: "#555", fontSize: 9, lineHeight: 1.3 },
  jerarquiaArrow: { color: "#333", fontSize: 24, fontWeight: 300 },
  jerarquiaHint: { color: "#666", fontSize: 11, lineHeight: 1.5, fontStyle: "italic" },

  temasGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  temaItem: {
    background: "#0f0f18",
    border: "1px solid #1a1a2a",
    borderRadius: 8,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  temaNombre: { color: "#fff", fontSize: 16, fontWeight: 800 },
  temaRatio: { fontSize: 12, fontWeight: 700 },
  temaDesc: { color: "#666", fontSize: 10, lineHeight: 1.3 },

  versionCard: {
    background: "#0a0a0f",
    border: "1px solid #111",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 16,
    textAlign: "center",
  },
  versionTitle: { color: "#444", fontSize: 12, fontWeight: 700, marginBottom: 2 },
  versionInfo: { color: "#333", fontSize: 10 },

  resetSection: { paddingBottom: 8 },
  resetBtn: {
    background: "transparent",
    border: "1px solid #2a1a1a",
    borderRadius: 8,
    color: "#5a3a3a",
    fontSize: 13,
    padding: "10px",
    cursor: "pointer",
    width: "100%",
  },
  resetConfirm: {
    background: "#1a0f0f",
    border: "1px solid #3a1a1a",
    borderRadius: 8,
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  resetConfirmText: { color: "#db5a5a", fontSize: 13, lineHeight: 1.5 },
  resetBtnRow: { display: "flex", gap: 8 },
  resetYes: {
    flex: 1,
    background: "#3a1a1a",
    border: "1px solid #5a2d2d",
    borderRadius: 6,
    color: "#db5a5a",
    fontSize: 13,
    fontWeight: 700,
    padding: "10px",
    cursor: "pointer",
  },
  resetNo: {
    flex: 1,
    background: "#1a1a24",
    border: "1px solid #2a2a3a",
    borderRadius: 6,
    color: "#888",
    fontSize: 13,
    padding: "10px",
    cursor: "pointer",
  },
  resetMsg: { color: "#5adb5a", fontSize: 12, textAlign: "center", marginTop: 8 },
};
