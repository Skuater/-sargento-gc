import { useState } from "react";
import { PLAN_CONFIG, SEMANAS, MODULOS, PROTOCOLO_REPASO } from "../data/planData";

const METAS_FASE = {
  "F1-F2": { minimo: 7.0, objetivo: 7.5 },
  "SIM24": { minimo: 7.5, objetivo: 8.0 },
  "F3": { minimo: 7.5, objetivo: 8.0 },
  "SPRINT": { minimo: 7.5, objetivo: 8.0 },
};

export default function TabProgreso({ plan }) {
  const { paginasReales, paginasPlanificadas, semanaActual, simulacros, registrarSimulacro, eliminarSimulacro, fechaInicio, diasColchonConsumidos } = plan;

  const [showFormSim, setShowFormSim] = useState(false);
  const [formSim, setFormSim] = useState({ tipo: "", preguntas: "", nota: "", notasBlancoInseguridad: "", metaFase: "F1-F2" });
  const [simExpandido, setSimExpandido] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const porcentaje = Math.min(100, (paginasReales / PLAN_CONFIG.totalPaginas) * 100);
  const porcentajePlan = Math.min(100, (paginasPlanificadas / PLAN_CONFIG.totalPaginas) * 100);
  const colchonRestante = PLAN_CONFIG.colchonDias - diasColchonConsumidos;

  // Determinar módulos activos/completados
  const modulosStatus = Object.entries(MODULOS).map(([id, mod]) => {
    // Buscamos semanas que incluyen este módulo
    const semsDelMod = SEMANAS.filter(s => s.modulos.includes(id));
    if (semsDelMod.length === 0) return { id, mod, estado: "pendiente" };
    const ultimaSem = Math.max(...semsDelMod.map(s => s.sem));
    if (!semanaActual) return { id, mod, estado: "pendiente" };
    if (semanaActual > ultimaSem) return { id, mod, estado: "completado" };
    const primeraSem = Math.min(...semsDelMod.map(s => s.sem));
    if (semanaActual >= primeraSem) return { id, mod, estado: "activo" };
    return { id, mod, estado: "pendiente" };
  });

  function handleGuardarSim() {
    const nota = parseFloat(formSim.nota);
    if (!formSim.tipo || isNaN(nota)) return;
    const meta = METAS_FASE[formSim.metaFase];
    registrarSimulacro({
      fecha: new Date().toISOString().split("T")[0],
      tipo: formSim.tipo,
      preguntas: parseInt(formSim.preguntas) || 0,
      nota,
      notasBlancoInseguridad: parseInt(formSim.notasBlancoInseguridad) || 0,
      metaFase: formSim.metaFase,
      metaMinimo: meta.minimo,
      metaObjetivo: meta.objetivo,
    });
    setFormSim({ tipo: "", preguntas: "", nota: "", notasBlancoInseguridad: "", metaFase: "F1-F2" });
    setShowFormSim(false);
  }

  function superaMeta(sim) {
    return sim.nota >= sim.metaMinimo;
  }

  function superaObjetivo(sim) {
    return sim.nota >= sim.metaObjetivo;
  }

  // Detectar qué módulo es el más relevante para un simulacro
  function getProtocoRepasoSim(sim) {
    // Si el tipo de simulacro menciona un módulo, usar ese
    const mxMatch = sim.tipo.match(/MX\d/);
    if (mxMatch) {
      return PROTOCOLO_REPASO[mxMatch[0]] || null;
    }
    // Si es simulacro de fase, mostrar todos los módulos relevantes
    if (sim.tipo.includes("F1")) return PROTOCOLO_REPASO["MX1"];
    if (sim.tipo.includes("F2")) return PROTOCOLO_REPASO["MX6"];
    if (sim.tipo.includes("F3")) return PROTOCOLO_REPASO["MX8"];
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Barra progreso total */}
      <div style={styles.progCard}>
        <div style={styles.progHeader}>
          <div>
            <div style={styles.progTitle}>TEMARIO ESTUDIADO</div>
            <div style={styles.progNums}>
              <span style={styles.progNum}>{paginasReales}</span>
              <span style={styles.progDe}> / {PLAN_CONFIG.totalPaginas}p</span>
            </div>
          </div>
          <div style={styles.progPct}>{porcentaje.toFixed(1)}%</div>
        </div>
        <div style={styles.barWrap}>
          <div style={{ ...styles.barFill, width: `${porcentaje}%`, background: "#2d5adb", zIndex: 2 }} />
          <div style={{ ...styles.barFill, width: `${porcentajePlan}%`, background: "#1a2a4a", zIndex: 1, position: "absolute", top: 0, left: 0 }} />
        </div>
        <div style={styles.barLeyenda}>
          <span style={{ color: "#2d5adb" }}>■ Real: {paginasReales}p</span>
          <span style={{ color: "#1a4a8a" }}>■ Plan hoy: {paginasPlanificadas}p</span>
        </div>
        {paginasReales < paginasPlanificadas && (
          <div style={styles.desfaseWarn}>
            ⚠ Desfase: {paginasPlanificadas - paginasReales}p por debajo del plan
          </div>
        )}
        {paginasReales >= paginasPlanificadas && paginasReales > 0 && (
          <div style={styles.desfaseOk}>✓ Al día con el plan</div>
        )}
      </div>

      {/* Colchón */}
      <div style={styles.colchonCard}>
        <div style={styles.colchonRow}>
          <div>
            <div style={styles.colchonTitle}>🛡 COLCHÓN DISPONIBLE</div>
            <div style={styles.colchonDesc}>Días de margen ante imprevistos</div>
          </div>
          <div style={styles.colchonNums}>
            <span style={{ ...styles.colchonNum, color: colchonRestante > 15 ? "#5adb5a" : colchonRestante > 5 ? "#dbdb5a" : "#db5a5a" }}>
              {colchonRestante}
            </span>
            <span style={styles.colchonDe}> / {PLAN_CONFIG.colchonDias}</span>
          </div>
        </div>
        <div style={styles.colchonBarBg}>
          <div style={{
            ...styles.colchonBarFill,
            width: `${(colchonRestante / PLAN_CONFIG.colchonDias) * 100}%`,
            background: colchonRestante > 15 ? "#2d8a2d" : colchonRestante > 5 ? "#8a8a2d" : "#8a2d2d",
          }} />
        </div>
      </div>

      {/* Módulos */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>MÓDULOS MX1-MX8</div>
        <div style={styles.modulosGrid}>
          {modulosStatus.map(({ id, mod, estado }) => (
            <div key={id} style={{ ...styles.modCard, ...(estado === "activo" ? styles.modActivo : estado === "completado" ? styles.modCompletado : styles.modPendiente) }}>
              <div style={styles.modId}>{id}</div>
              <div style={styles.modPregs}>{mod.preguntas}p</div>
              <div style={styles.modEstado}>
                {estado === "completado" ? "✓" : estado === "activo" ? "▶" : "○"}
              </div>
              <div style={styles.modTemas}>{mod.temas.join(", ")}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulacros */}
      <div style={styles.section}>
        <div style={styles.sectionHeaderRow}>
          <div style={styles.sectionTitle}>SIMULACROS</div>
          <button style={styles.addBtn} onClick={() => setShowFormSim(!showFormSim)}>
            {showFormSim ? "Cancelar" : "+ Registrar"}
          </button>
        </div>

        {/* Matemática del aprobado */}
        <div style={styles.matematicaCard}>
          <div style={styles.matematicaTitle}>📊 Matemática del aprobado</div>
          <div style={styles.matematicaGrid}>
            <div style={styles.matItem}><span style={styles.matNum}>39</span><span style={styles.matLabel}>pts fijos</span></div>
            <div style={styles.matItem}><span style={styles.matNum}>64</span><span style={styles.matLabel}>pts test</span></div>
            <div style={styles.matItem}><span style={styles.matNum}>75%</span><span style={styles.matLabel}>acierto</span></div>
            <div style={styles.matItem}><span style={styles.matNum}>21</span><span style={styles.matLabel}>margen</span></div>
          </div>
          <div style={styles.matematicaHint}>
            Temas excluidos: T3 · T4 · T11.2 · T17 → dejar EN BLANCO en examen (0 puntos, sin penalización)
          </div>
        </div>

        {/* Metas por fase */}
        <div style={styles.metasCard}>
          <div style={styles.metasTitle}>Metas de simulacro por fase</div>
          <div style={styles.metasFila}><span style={styles.metaFaseLabel}>F1-F2</span><span style={styles.metaMin}>Mín 7,0</span><span style={styles.metaObj}>Obj 7,5</span></div>
          <div style={styles.metasFila}><span style={styles.metaFaseLabel}>Sem 24</span><span style={styles.metaMin}>Mín 7,5</span><span style={styles.metaObj}>Obj 8,0</span></div>
          <div style={styles.metasFila}><span style={styles.metaFaseLabel}>F3</span><span style={styles.metaMin}>Mín 7,5</span><span style={styles.metaObj}>Obj 8,0</span></div>
          <div style={styles.metasFila}><span style={styles.metaFaseLabel}>Sprint</span><span style={styles.metaMin}>Mín 7,5</span><span style={styles.metaObj}>Obj 8,0</span></div>
        </div>

        {/* Formulario nuevo simulacro */}
        {showFormSim && (
          <div style={styles.formCard}>
            <div style={styles.formTitle}>Registrar simulacro</div>
            <input style={styles.formInput} placeholder="Tipo (ej: Simulacro F1, TEST MX1...)" value={formSim.tipo} onChange={e => setFormSim(f => ({ ...f, tipo: e.target.value }))} />
            <div style={styles.formRow}>
              <input style={styles.formInputHalf} type="number" placeholder="Preguntas" value={formSim.preguntas} onChange={e => setFormSim(f => ({ ...f, preguntas: e.target.value }))} />
              <input style={styles.formInputHalf} type="number" step="0.1" min="0" max="10" placeholder="Nota (0-10)" value={formSim.nota} onChange={e => setFormSim(f => ({ ...f, nota: e.target.value }))} />
            </div>
            <input style={styles.formInput} type="number" placeholder="Preguntas en blanco por inseguridad" value={formSim.notasBlancoInseguridad} onChange={e => setFormSim(f => ({ ...f, notasBlancoInseguridad: e.target.value }))} />
            <select style={styles.formSelect} value={formSim.metaFase} onChange={e => setFormSim(f => ({ ...f, metaFase: e.target.value }))}>
              <option value="F1-F2">Fase 1-2 (mín 7,0)</option>
              <option value="SIM24">Gran Sim sem 24 (mín 7,5)</option>
              <option value="F3">Fase 3 (mín 7,5)</option>
              <option value="SPRINT">Sprint Final (mín 7,5)</option>
            </select>
            <button style={styles.formBtn} onClick={handleGuardarSim}>Guardar simulacro</button>
          </div>
        )}

        {/* Lista simulacros */}
        {simulacros.length === 0 && !showFormSim && (
          <div style={styles.simVacio}>Sin simulacros registrados. ¡Registra el primero!</div>
        )}
        {[...simulacros].reverse().map((sim) => {
          const ok = superaMeta(sim);
          const obj = superaObjetivo(sim);
          const protocolo = !ok ? getProtocoRepasoSim(sim) : null;
          const expandido = simExpandido === sim.id;

          return (
            <div key={sim.id} style={{ ...styles.simCard, borderColor: ok ? (obj ? "#2d5a2d" : "#5a5a2d") : "#5a2d2d" }}>
              <div style={styles.simHeader} onClick={() => setSimExpandido(expandido ? null : sim.id)}>
                <div>
                  <div style={styles.simTipo}>{sim.tipo}</div>
                  <div style={styles.simMeta}>
                    {sim.preguntas}p · Fase: {sim.metaFase} · Mín: {sim.metaMinimo}
                    {sim.notasBlancoInseguridad > 0 && ` · ✗blancos: ${sim.notasBlancoInseguridad}`}
                  </div>
                  <div style={styles.simFecha}>{sim.fecha}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ ...styles.simNota, color: ok ? (obj ? "#5adb5a" : "#dbdb5a") : "#db5a5a" }}>
                    {sim.nota.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 10, color: ok ? (obj ? "#5adb5a" : "#dbdb5a") : "#db5a5a" }}>
                    {obj ? "✓ OBJETIVO" : ok ? "✓ MÍNIMO" : "✗ BAJO META"}
                  </div>
                </div>
              </div>

              {/* Protocolo de repaso si no superó meta */}
              {!ok && protocolo && expandido && (
                <div style={styles.protocoloBox}>
                  <div style={styles.protocoloTitle}>📋 Plan de mejora para el próximo simulacro:</div>
                  {protocolo.map((paso, i) => (
                    <div key={i} style={styles.protocoloPaso}>
                      <span style={styles.protocoloNum}>{i + 1}</span>
                      <span>{paso}</span>
                    </div>
                  ))}
                </div>
              )}
              {!ok && !expandido && (
                <div style={styles.simExpandBtn}>
                  Toca para ver plan de mejora ↓
                </div>
              )}

              {expandido && (
                <div style={styles.simActions}>
                  {confirmDelete === sim.id ? (
                    <div style={styles.confirmRow}>
                      <span style={styles.confirmText}>¿Eliminar?</span>
                      <button style={styles.confirmYes} onClick={() => { eliminarSimulacro(sim.id); setConfirmDelete(null); }}>Sí</button>
                      <button style={styles.confirmNo} onClick={() => setConfirmDelete(null)}>No</button>
                    </div>
                  ) : (
                    <button style={styles.deleteBtn} onClick={() => setConfirmDelete(sim.id)}>🗑 Eliminar</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "12px 12px 16px" },

  progCard: { background: "#13131a", border: "1px solid #222", borderRadius: 12, padding: "14px 16px", marginBottom: 10 },
  progHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  progTitle: { color: "#888", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 4 },
  progNums: {},
  progNum: { fontSize: 28, fontWeight: 800, color: "#fff" },
  progDe: { fontSize: 14, color: "#666" },
  progPct: { fontSize: 32, fontWeight: 800, color: "#2d5adb" },
  barWrap: { height: 8, background: "#1a1a24", borderRadius: 4, overflow: "hidden", position: "relative", marginBottom: 6 },
  barFill: { height: "100%", borderRadius: 4, transition: "width 0.5s" },
  barLeyenda: { display: "flex", gap: 16, fontSize: 10, color: "#666" },
  desfaseWarn: { marginTop: 8, color: "#dbdb5a", fontSize: 12, background: "#1a1a08", border: "1px solid #5a5a2d", borderRadius: 6, padding: "6px 10px" },
  desfaseOk: { marginTop: 8, color: "#5adb5a", fontSize: 12, background: "#0f1a0f", border: "1px solid #2d5a2d", borderRadius: 6, padding: "6px 10px" },

  colchonCard: { background: "#13131a", border: "1px solid #222", borderRadius: 12, padding: "14px 16px", marginBottom: 10 },
  colchonRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  colchonTitle: { color: "#ddd", fontSize: 13, fontWeight: 700 },
  colchonDesc: { color: "#666", fontSize: 11 },
  colchonNums: { textAlign: "right" },
  colchonNum: { fontSize: 28, fontWeight: 800 },
  colchonDe: { fontSize: 14, color: "#666" },
  colchonBarBg: { height: 6, background: "#1a1a24", borderRadius: 3, overflow: "hidden" },
  colchonBarFill: { height: "100%", borderRadius: 3, transition: "width 0.5s" },

  section: { marginBottom: 12 },
  sectionTitle: { color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 },
  sectionHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  addBtn: {
    background: "#2d5adb",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    padding: "6px 12px",
    cursor: "pointer",
  },

  modulosGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 },
  modCard: {
    borderRadius: 8,
    border: "1px solid",
    padding: "8px 6px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  modPendiente: { background: "#0f0f0f", borderColor: "#1a1a1a", opacity: 0.5 },
  modActivo: { background: "#1a1a2a", borderColor: "#2d5adb" },
  modCompletado: { background: "#0f1f0f", borderColor: "#2d5a2d" },
  modId: { color: "#fff", fontSize: 13, fontWeight: 800 },
  modPregs: { color: "#888", fontSize: 10 },
  modEstado: { fontSize: 14 },
  modTemas: { color: "#555", fontSize: 8, lineHeight: 1.2 },

  matematicaCard: {
    background: "#0f0f18",
    border: "1px solid #1a1a33",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 10,
  },
  matematicaTitle: { color: "#888", fontSize: 11, fontWeight: 700, marginBottom: 8 },
  matematicaGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 8 },
  matItem: { textAlign: "center", display: "flex", flexDirection: "column", gap: 2 },
  matNum: { fontSize: 20, fontWeight: 800, color: "#fff" },
  matLabel: { fontSize: 9, color: "#666" },
  matematicaHint: { color: "#db5a5a", fontSize: 11, lineHeight: 1.4 },

  metasCard: {
    background: "#13131a",
    border: "1px solid #222",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 10,
  },
  metasTitle: { color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 },
  metasFila: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  metaFaseLabel: { color: "#aaa", fontSize: 12, fontWeight: 700, width: 60 },
  metaMin: { color: "#dbdb5a", fontSize: 12, background: "#1a1a08", border: "1px solid #3a3a18", borderRadius: 4, padding: "2px 8px" },
  metaObj: { color: "#5adb5a", fontSize: 12, background: "#0f1a0f", border: "1px solid #1a3a1a", borderRadius: 4, padding: "2px 8px" },

  formCard: {
    background: "#13131a",
    border: "1px solid #2d5adb",
    borderRadius: 10,
    padding: "14px",
    marginBottom: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  formTitle: { color: "#fff", fontSize: 13, fontWeight: 700 },
  formInput: {
    background: "#1a1a24",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    padding: "10px 12px",
    outline: "none",
  },
  formRow: { display: "flex", gap: 8 },
  formInputHalf: {
    flex: 1,
    background: "#1a1a24",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    padding: "10px 12px",
    outline: "none",
  },
  formSelect: {
    background: "#1a1a24",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    padding: "10px 12px",
    outline: "none",
  },
  formBtn: {
    background: "#2d5adb",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    padding: "12px",
    cursor: "pointer",
  },

  simVacio: { color: "#555", fontSize: 13, textAlign: "center", padding: "24px 0" },
  simCard: {
    background: "#13131a",
    border: "1px solid",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 8,
    cursor: "pointer",
  },
  simHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  simTipo: { color: "#ddd", fontSize: 13, fontWeight: 700 },
  simMeta: { color: "#666", fontSize: 11, marginTop: 2 },
  simFecha: { color: "#555", fontSize: 10, marginTop: 2 },
  simNota: { fontSize: 28, fontWeight: 800 },

  simExpandBtn: { color: "#555", fontSize: 11, textAlign: "center", marginTop: 6 },
  simActions: { marginTop: 10, borderTop: "1px solid #1a1a24", paddingTop: 8 },
  deleteBtn: {
    background: "transparent",
    border: "1px solid #3a1a1a",
    borderRadius: 6,
    color: "#db5a5a",
    fontSize: 12,
    padding: "6px 12px",
    cursor: "pointer",
  },
  confirmRow: { display: "flex", alignItems: "center", gap: 8 },
  confirmText: { color: "#db5a5a", fontSize: 12 },
  confirmYes: {
    background: "#3a1a1a",
    border: "1px solid #db5a5a",
    borderRadius: 6,
    color: "#db5a5a",
    fontSize: 12,
    padding: "4px 12px",
    cursor: "pointer",
  },
  confirmNo: {
    background: "#1a1a24",
    border: "1px solid #333",
    borderRadius: 6,
    color: "#888",
    fontSize: 12,
    padding: "4px 12px",
    cursor: "pointer",
  },

  protocoloBox: {
    marginTop: 10,
    background: "#1a1008",
    border: "1px solid #3a2a08",
    borderRadius: 8,
    padding: "10px 12px",
  },
  protocoloTitle: { color: "#f0a030", fontSize: 11, fontWeight: 700, marginBottom: 8 },
  protocoloPaso: { display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6, color: "#ccc", fontSize: 12, lineHeight: 1.4 },
  protocoloNum: {
    background: "#2a1a08",
    border: "1px solid #5a3a08",
    borderRadius: 4,
    color: "#f0a030",
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 6px",
    flexShrink: 0,
  },
};
