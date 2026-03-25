import { useState } from "react";
import { SEMANAS, DIAS_SEMANA, DIAS_CORTOS, TIPO_SEMANA } from "../data/planData";
import { getFechaDia, getFechaInicioSemana } from "../hooks/usePlan";

const TIPO_COLOR = {
  [TIPO_SEMANA.NORMAL]: { dot: "#5adb5a", label: "NORMAL" },
  [TIPO_SEMANA.ALTA]: { dot: "#db5a5a", label: "ALTA" },
  [TIPO_SEMANA.TRANS]: { dot: "#5a8adb", label: "TRANS." },
  [TIPO_SEMANA.ALIVIO]: { dot: "#9a7adb", label: "ALIVIO" },
  [TIPO_SEMANA.FESTIVO]: { dot: "#dbdb5a", label: "FESTIVO" },
  [TIPO_SEMANA.DESCANSO]: { dot: "#666", label: "DESCANSO" },
  [TIPO_SEMANA.SPRINT]: { dot: "#f0a030", label: "SPRINT" },
};

export default function TabSemana({ plan }) {
  const { fechaInicio, semanaActual, hoy, paginasLog, bloqueBLog } = plan;
  const [semVista, setSemVista] = useState(semanaActual || 1);

  if (!fechaInicio) {
    return (
      <div style={styles.noConfig}>
        <div style={styles.noConfigIcon}>⚙️</div>
        <div style={styles.noConfigText}>Configura la fecha de inicio en Ajustes.</div>
      </div>
    );
  }

  const sem = SEMANAS[Math.min(Math.max(semVista, 1), 38) - 1];
  const tipoConf = TIPO_COLOR[sem.tipo] || TIPO_COLOR[TIPO_SEMANA.NORMAL];
  const esActual = semVista === semanaActual;

  const paginasSemana = sem.diasPaginas.reduce((a, b) => a + b, 0);
  let paginasHechas = 0;
  let diasCompletados = 0;

  const diasData = DIAS_SEMANA.map((nombre, idx) => {
    const fechaDia = getFechaDia(semVista, idx, fechaInicio);
    const planificadas = sem.diasPaginas[idx] || 0;
    const hechas = paginasLog[fechaDia] !== undefined ? Number(paginasLog[fechaDia]) : null;
    const bBCompleto = bloqueBLog[fechaDia] || false;
    const esPasado = fechaDia < hoy;
    const esHoy = fechaDia === hoy;

    if (hechas !== null) paginasHechas += hechas;
    if (hechas !== null && planificadas > 0 && hechas >= planificadas) diasCompletados++;

    return { nombre, corto: DIAS_CORTOS[idx], fecha: fechaDia, planificadas, hechas, bBCompleto, esPasado, esHoy, idx };
  });

  function navSem(delta) {
    setSemVista((v) => Math.min(Math.max(v + delta, 1), 38));
  }

  function formatFechaCorta(iso) {
    if (!iso) return "";
    const [, m, d] = iso.split("-");
    return `${parseInt(d)}/${parseInt(m)}`;
  }

  return (
    <div style={styles.container}>
      {/* Navegación semanas */}
      <div style={styles.navRow}>
        <button style={styles.navBtn} onClick={() => navSem(-1)} disabled={semVista <= 1}>‹</button>
        <div style={styles.navCenter}>
          <div style={styles.navSemNum}>
            SEMANA {semVista}
            {esActual && <span style={styles.actualBadge}>HOY</span>}
          </div>
          <div style={{ color: tipoConf.dot, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
            {tipoConf.label} · FASE {sem.fase}
          </div>
        </div>
        <button style={styles.navBtn} onClick={() => navSem(1)} disabled={semVista >= 38}>›</button>
      </div>

      {/* Resumen módulo */}
      <div style={styles.moduloCard}>
        <div style={styles.moduloTitle}>📚 {sem.modulos}</div>
        <div style={styles.moduloTemas}>{sem.temas}</div>
        {sem.test && (
          <div style={styles.testBadge}>
            📝 {sem.test.tipo} — {sem.test.preguntas}p
          </div>
        )}
      </div>

      {/* Progreso semanal */}
      <div style={styles.progCard}>
        <div style={styles.progRow}>
          <div>
            <div style={styles.progNum}>{paginasHechas}<span style={styles.progDe}>/{paginasSemana}p</span></div>
            <div style={styles.progLabel}>páginas esta semana</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={styles.progNum}>{diasCompletados}<span style={styles.progDe}>/{sem.diasPaginas.filter(p => p > 0).length}</span></div>
            <div style={styles.progLabel}>días completos</div>
          </div>
        </div>
        <div style={styles.progBarBg}>
          <div style={{
            ...styles.progBarFill,
            width: paginasSemana > 0 ? `${Math.min(100, (paginasHechas / paginasSemana) * 100)}%` : "0%",
            background: paginasHechas >= paginasSemana ? "#5adb5a" : "#2d5adb",
          }} />
        </div>
      </div>

      {/* Tabla días */}
      <div style={styles.diasGrid}>
        {diasData.map((dia) => {
          const completado = dia.hechas !== null && dia.planificadas > 0 && dia.hechas >= dia.planificadas;
          const parcial = dia.hechas !== null && dia.planificadas > 0 && dia.hechas > 0 && dia.hechas < dia.planificadas;
          const sinPlan = dia.planificadas === 0;

          let cardStyle = { ...styles.diaCard };
          if (dia.esHoy) cardStyle = { ...cardStyle, ...styles.diaCardHoy };
          else if (completado) cardStyle = { ...cardStyle, ...styles.diaCardOk };
          else if (parcial) cardStyle = { ...cardStyle, ...styles.diaCardParcial };
          else if (sinPlan && !dia.esHoy) cardStyle = { ...cardStyle, ...styles.diaCardRest };

          return (
            <div key={dia.idx} style={cardStyle}>
              <div style={styles.diaNombre}>{dia.corto}</div>
              <div style={styles.diaFecha}>{formatFechaCorta(dia.fecha)}</div>
              <div style={styles.diaPlan}>
                {sinPlan ? (
                  <span style={{ color: "#444" }}>—</span>
                ) : (
                  <span style={{ color: "#fff", fontWeight: 700 }}>{dia.planificadas}p</span>
                )}
              </div>
              {dia.hechas !== null && dia.planificadas > 0 && (
                <div style={{ fontSize: 11, color: completado ? "#5adb5a" : parcial ? "#dbdb5a" : "#db5a5a" }}>
                  {dia.hechas}p hechas
                </div>
              )}
              {dia.esHoy && (
                <div style={styles.hoyDot} />
              )}
            </div>
          );
        })}
      </div>

      {/* Bloque B de la semana */}
      <div style={styles.bloqueBCard}>
        <div style={styles.bloqueBTitle}>🔄 BLOQUE B — Repaso espaciado</div>
        <div style={styles.bloqueBDesc}>{sem.bloqueB}</div>
      </div>

      {/* Consejo */}
      <div style={styles.consejo}>
        <span style={styles.consejoIcon}>💡</span>
        <span style={styles.consejoText}>{sem.consejo}</span>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "12px 12px 16px" },
  noConfig: { textAlign: "center", padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  noConfigIcon: { fontSize: 40 },
  noConfigText: { color: "#888", fontSize: 14 },

  navRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  navBtn: {
    background: "#1a1a24",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#aaa",
    fontSize: 24,
    width: 40,
    height: 40,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  navCenter: { textAlign: "center" },
  navSemNum: { color: "#fff", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" },
  actualBadge: {
    background: "#2d5adb",
    color: "#fff",
    fontSize: 9,
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: 4,
    letterSpacing: 1,
  },

  moduloCard: {
    background: "#13131a",
    border: "1px solid #222",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 10,
  },
  moduloTitle: { color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 2 },
  moduloTemas: { color: "#888", fontSize: 12 },
  testBadge: {
    marginTop: 8,
    background: "#1a1508",
    border: "1px solid #5a3a0a",
    borderRadius: 6,
    padding: "5px 10px",
    color: "#f0a030",
    fontSize: 12,
    display: "inline-block",
  },

  progCard: {
    background: "#13131a",
    border: "1px solid #222",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 10,
  },
  progRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  progNum: { fontSize: 24, fontWeight: 800, color: "#fff" },
  progDe: { fontSize: 13, color: "#666", fontWeight: 400 },
  progLabel: { color: "#666", fontSize: 11 },
  progBarBg: { height: 6, background: "#1a1a2a", borderRadius: 3, overflow: "hidden" },
  progBarFill: { height: "100%", borderRadius: 3, transition: "width 0.4s" },

  diasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
    marginBottom: 10,
  },
  diaCard: {
    background: "#13131a",
    border: "1px solid #1a1a24",
    borderRadius: 8,
    padding: "8px 4px",
    textAlign: "center",
    position: "relative",
    minHeight: 72,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  diaCardHoy: {
    background: "#1a1a2e",
    border: "1px solid #2d5adb",
  },
  diaCardOk: {
    background: "#0f1f0f",
    border: "1px solid #2d5a2d",
  },
  diaCardParcial: {
    background: "#1f1f0f",
    border: "1px solid #5a5a2d",
  },
  diaCardRest: {
    background: "#0f0f0f",
    border: "1px solid #111",
    opacity: 0.5,
  },
  diaNombre: { color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 },
  diaFecha: { color: "#444", fontSize: 9 },
  diaPlan: { fontSize: 13, fontWeight: 700, color: "#aaa" },
  hoyDot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: "#2d5adb",
    position: "absolute",
    bottom: 4,
    left: "50%",
    transform: "translateX(-50%)",
  },

  bloqueBCard: {
    background: "#13131a",
    border: "1px solid #222",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 10,
  },
  bloqueBTitle: { color: "#9a7adb", fontSize: 12, fontWeight: 700, marginBottom: 4 },
  bloqueBDesc: { color: "#888", fontSize: 12, lineHeight: 1.5 },

  consejo: {
    background: "#0f0f1a",
    border: "1px solid #1a1a33",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
  },
  consejoIcon: { fontSize: 16, flexShrink: 0 },
  consejoText: { color: "#777", fontSize: 12, lineHeight: 1.6, fontStyle: "italic" },
};
