import { useState } from "react";
import { SEMANAS, TIPO_SEMANA, DIAS_SEMANA } from "../data/planData";
import { getFechaInicioSemana, getFechaDia } from "../hooks/usePlan";

const TIPO_COLOR = {
  [TIPO_SEMANA.NORMAL]: { bg: "#13131a", border: "#1a1a24", dot: "#5adb5a", label: "NORMAL" },
  [TIPO_SEMANA.ALTA]: { bg: "#1a0f0f", border: "#2a1a1a", dot: "#db5a5a", label: "ALTA" },
  [TIPO_SEMANA.TRANS]: { bg: "#0f0f1a", border: "#1a1a2a", dot: "#5a8adb", label: "TRANS." },
  [TIPO_SEMANA.ALIVIO]: { bg: "#120f1a", border: "#1e1428", dot: "#9a7adb", label: "ALIVIO" },
  [TIPO_SEMANA.FESTIVO]: { bg: "#1a1a0f", border: "#2a2a1a", dot: "#dbdb5a", label: "FESTIVO" },
  [TIPO_SEMANA.DESCANSO]: { bg: "#0f0f0f", border: "#1a1a1a", dot: "#555", label: "DESC." },
  [TIPO_SEMANA.SPRINT]: { bg: "#1a0f00", border: "#2a1800", dot: "#f0a030", label: "SPRINT" },
};

const FASES = ["F1", "F2", "NAVIDAD", "F3", "F4", "SPRINT", "EXAMEN"];
const FASE_NOMBRES = {
  "F1": "FASE 1 — Base",
  "F2": "FASE 2 — Ampliación",
  "NAVIDAD": "NAVIDAD — Descanso activo",
  "F3": "FASE 3 — Profundización",
  "F4": "FASE 4 — Cierre y repasos",
  "SPRINT": "SPRINT FINAL",
  "EXAMEN": "EXAMEN",
};

export default function TabPlan({ plan }) {
  const { fechaInicio, semanaActual, paginasLog } = plan;
  const [semExpandida, setSemExpandida] = useState(null);
  const [filtroFase, setFiltroFase] = useState(null);

  function toggleSem(num) {
    setSemExpandida(v => v === num ? null : num);
  }

  function formatFecha(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${parseInt(d)} ${meses[parseInt(m) - 1]}`;
  }

  const semanasAgrupadas = {};
  SEMANAS.forEach(sem => {
    if (!semanasAgrupadas[sem.fase]) semanasAgrupadas[sem.fase] = [];
    semanasAgrupadas[sem.fase].push(sem);
  });

  const fasesOrdenadas = FASES.filter(f => semanasAgrupadas[f]);

  const semanasVisibles = filtroFase
    ? SEMANAS.filter(s => s.fase === filtroFase)
    : SEMANAS;

  return (
    <div style={styles.container}>
      {/* Info cabecera */}
      <div style={styles.infoCard}>
        <div style={styles.infoRow}>
          <div style={styles.infoItem}><span style={styles.infoNum}>38</span><span style={styles.infoLabel}>semanas</span></div>
          <div style={styles.infoItem}><span style={styles.infoNum}>1.645</span><span style={styles.infoLabel}>páginas</span></div>
          <div style={styles.infoItem}><span style={styles.infoNum}>8</span><span style={styles.infoLabel}>módulos</span></div>
          <div style={styles.infoItem}><span style={styles.infoNum}>~40</span><span style={styles.infoLabel}>días colchón</span></div>
        </div>
        <div style={styles.excluidos}>
          🚫 Temas excluidos (dejar EN BLANCO en examen): <strong>T3 · T4 · T11.2 · T17</strong>
        </div>
      </div>

      {/* Filtro por fase */}
      <div style={styles.filtroScroll}>
        <button
          style={{ ...styles.filtroBtn, ...(filtroFase === null ? styles.filtroBtnActivo : {}) }}
          onClick={() => setFiltroFase(null)}
        >
          Todas
        </button>
        {fasesOrdenadas.map(fase => (
          <button
            key={fase}
            style={{ ...styles.filtroBtn, ...(filtroFase === fase ? styles.filtroBtnActivo : {}) }}
            onClick={() => setFiltroFase(filtroFase === fase ? null : fase)}
          >
            {fase}
          </button>
        ))}
      </div>

      {/* Lista de semanas */}
      {semanasVisibles.map((sem) => {
        const tipoConf = TIPO_COLOR[sem.tipo] || TIPO_COLOR[TIPO_SEMANA.NORMAL];
        const esActual = semanaActual === sem.sem;
        const esExpandida = semExpandida === sem.sem;
        const fechaIniciSem = fechaInicio ? getFechaInicioSemana(sem.sem, fechaInicio) : null;

        // Calcular páginas hechas esta semana
        let paginasHechas = 0;
        if (fechaInicio) {
          for (let d = 0; d < 7; d++) {
            const f = getFechaDia(sem.sem, d, fechaInicio);
            if (f && paginasLog[f] !== undefined) {
              paginasHechas += Number(paginasLog[f]);
            }
          }
        }
        const paginasPlan = sem.diasPaginas.reduce((a, b) => a + b, 0);

        return (
          <div key={sem.sem} style={{ marginBottom: 6 }}>
            {/* Cabecera de fase si es la primera de su fase */}
            {!filtroFase && semanasAgrupadas[sem.fase]?.[0]?.sem === sem.sem && (
              <div style={styles.faseHeader}>{FASE_NOMBRES[sem.fase]}</div>
            )}

            <div
              style={{
                ...styles.semCard,
                background: tipoConf.bg,
                borderColor: esActual ? "#2d5adb" : tipoConf.border,
                borderWidth: esActual ? 2 : 1,
              }}
              onClick={() => toggleSem(sem.sem)}
            >
              <div style={styles.semRow}>
                <div style={styles.semLeft}>
                  <div style={{ ...styles.semDot, background: tipoConf.dot }} />
                  <div>
                    <div style={styles.semNum}>
                      SEM {sem.sem}
                      {esActual && <span style={styles.semActualBadge}>HOY</span>}
                      <span style={{ ...styles.semTipoLabel, color: tipoConf.dot }}>{tipoConf.label}</span>
                    </div>
                    {fechaIniciSem && (
                      <div style={styles.semFecha}>{formatFecha(fechaIniciSem)}</div>
                    )}
                  </div>
                </div>
                <div style={styles.semRight}>
                  <div style={styles.semModulo}>{sem.modulos}</div>
                  {paginasPlan > 0 && (
                    <div style={styles.semPags}>
                      {fechaInicio && paginasHechas > 0 ? (
                        <span style={{ color: paginasHechas >= paginasPlan ? "#5adb5a" : "#dbdb5a" }}>
                          {paginasHechas}/{paginasPlan}p
                        </span>
                      ) : (
                        <span style={{ color: "#555" }}>{paginasPlan}p</span>
                      )}
                    </div>
                  )}
                  {sem.test && <span style={styles.semTestDot}>📝</span>}
                </div>
              </div>

              {/* Detalle expandido */}
              {esExpandida && (
                <div style={styles.semDetalle}>
                  <div style={styles.detalleItem}>
                    <span style={styles.detalleLabel}>Temas</span>
                    <span style={styles.detalleVal}>{sem.temas}</span>
                  </div>
                  <div style={styles.detalleItem}>
                    <span style={styles.detalleLabel}>Ritmo</span>
                    <span style={styles.detalleVal}>{sem.ritmo}</span>
                  </div>
                  <div style={styles.detalleItem}>
                    <span style={styles.detalleLabel}>Bloque B</span>
                    <span style={styles.detalleVal}>{sem.bloqueB}</span>
                  </div>
                  {sem.test && (
                    <div style={styles.testDetalle}>
                      📝 {sem.test.tipo} — {sem.test.preguntas} preguntas
                      <span style={styles.testMetaSpan}>
                        Meta: {sem.test.meta === "SIM24" || sem.test.meta === "SPRINT" ? "mín 7,5 / obj 8,0" : "mín 7,0 / obj 7,5"}
                      </span>
                    </div>
                  )}
                  {/* Días de la semana */}
                  <div style={styles.diasRow}>
                    {DIAS_SEMANA.map((dia, idx) => {
                      const fechaDia = fechaInicio ? getFechaDia(sem.sem, idx, fechaInicio) : null;
                      const plan = sem.diasPaginas[idx] || 0;
                      const hecho = fechaDia && paginasLog[fechaDia] !== undefined ? Number(paginasLog[fechaDia]) : null;
                      const cortos = ["L", "M", "X", "J", "V", "S", "D"];
                      return (
                        <div key={idx} style={styles.diaMinCard}>
                          <div style={styles.diaMinNom}>{cortos[idx]}</div>
                          <div style={{ ...styles.diaMinPlan, color: plan === 0 ? "#333" : "#888" }}>
                            {plan === 0 ? "—" : `${plan}p`}
                          </div>
                          {hecho !== null && plan > 0 && (
                            <div style={{ fontSize: 9, color: hecho >= plan ? "#5adb5a" : "#db5a5a" }}>
                              {hecho}p
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={styles.consejo}>{sem.consejo}</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: { padding: "12px 12px 16px" },

  infoCard: {
    background: "#13131a",
    border: "1px solid #222",
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 10,
  },
  infoRow: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  infoItem: { textAlign: "center", display: "flex", flexDirection: "column", gap: 2 },
  infoNum: { fontSize: 18, fontWeight: 800, color: "#fff" },
  infoLabel: { fontSize: 9, color: "#666" },
  excluidos: { color: "#db5a5a", fontSize: 11, lineHeight: 1.4 },

  filtroScroll: {
    display: "flex",
    gap: 6,
    overflowX: "auto",
    paddingBottom: 4,
    marginBottom: 10,
    scrollbarWidth: "none",
  },
  filtroBtn: {
    background: "#13131a",
    border: "1px solid #222",
    borderRadius: 6,
    color: "#888",
    fontSize: 11,
    fontWeight: 700,
    padding: "5px 12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  filtroBtnActivo: {
    background: "#1a1a2e",
    border: "1px solid #2d5adb",
    color: "#5a8adb",
  },

  faseHeader: {
    color: "#555",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    padding: "10px 4px 4px",
  },

  semCard: {
    borderRadius: 10,
    border: "1px solid",
    padding: "10px 12px",
    cursor: "pointer",
  },
  semRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  semLeft: { display: "flex", alignItems: "center", gap: 8 },
  semDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  semNum: { color: "#ddd", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 },
  semActualBadge: {
    background: "#2d5adb",
    color: "#fff",
    fontSize: 9,
    fontWeight: 700,
    padding: "1px 5px",
    borderRadius: 3,
    letterSpacing: 1,
  },
  semTipoLabel: { fontSize: 9, fontWeight: 700, letterSpacing: 1 },
  semFecha: { color: "#555", fontSize: 10, marginTop: 2 },
  semRight: { display: "flex", alignItems: "center", gap: 8 },
  semModulo: { color: "#666", fontSize: 12, fontWeight: 700 },
  semPags: { fontSize: 12, fontWeight: 700 },
  semTestDot: { fontSize: 14 },

  semDetalle: {
    marginTop: 10,
    borderTop: "1px solid #1a1a24",
    paddingTop: 10,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  detalleItem: { display: "flex", gap: 8, alignItems: "flex-start" },
  detalleLabel: { color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, minWidth: 56, flexShrink: 0 },
  detalleVal: { color: "#aaa", fontSize: 11, lineHeight: 1.4 },

  testDetalle: {
    background: "#1a1508",
    border: "1px solid #3a2a08",
    borderRadius: 6,
    padding: "6px 10px",
    color: "#f0a030",
    fontSize: 11,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  testMetaSpan: { color: "#888", fontSize: 10 },

  diasRow: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginTop: 4 },
  diaMinCard: {
    background: "#0f0f18",
    borderRadius: 4,
    padding: "4px 2px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 1,
    alignItems: "center",
  },
  diaMinNom: { color: "#555", fontSize: 8, fontWeight: 700 },
  diaMinPlan: { fontSize: 10, fontWeight: 700 },

  consejo: {
    color: "#666",
    fontSize: 11,
    lineHeight: 1.5,
    fontStyle: "italic",
    borderTop: "1px solid #1a1a24",
    paddingTop: 6,
    marginTop: 2,
  },
};
