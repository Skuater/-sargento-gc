import { useState } from "react";
import { SEMANAS, DIAS_SEMANA, TIPO_SEMANA, MODULOS } from "../data/planData";
import { getFechaDia, getSemanaNum, getDiaSemanaIndex } from "../hooks/usePlan";

const TIPO_COLOR = {
  [TIPO_SEMANA.NORMAL]: { bg: "#1a2a1a", border: "#2d5a2d", text: "#5adb5a", label: "NORMAL" },
  [TIPO_SEMANA.ALTA]: { bg: "#2a1a1a", border: "#5a2d2d", text: "#db5a5a", label: "ALTA CARGA" },
  [TIPO_SEMANA.TRANS]: { bg: "#1a1a2a", border: "#2d2d5a", text: "#5a8adb", label: "TRANSICIÓN" },
  [TIPO_SEMANA.ALIVIO]: { bg: "#1e1a2a", border: "#3d2d5a", text: "#9a7adb", label: "ALIVIO" },
  [TIPO_SEMANA.FESTIVO]: { bg: "#2a2a1a", border: "#5a5a2d", text: "#dbdb5a", label: "FESTIVO" },
  [TIPO_SEMANA.DESCANSO]: { bg: "#1a1a1a", border: "#333", text: "#888", label: "DESCANSO" },
  [TIPO_SEMANA.SPRINT]: { bg: "#2a1a0a", border: "#5a3a0a", text: "#f0a030", label: "SPRINT FINAL" },
};

export default function TabHoy({ plan }) {
  const {
    hoy, semanaActual, dataSemanaActual, diaActualIdx,
    paginasLog, bloqueBLog, ankiLog,
    registrarPaginas, registrarBloqueB, registrarAnki,
    fechaInicio,
  } = plan;

  const [inputPaginas, setInputPaginas] = useState("");
  const [guardado, setGuardado] = useState(false);

  if (!fechaInicio) {
    return (
      <div style={styles.noConfig}>
        <div style={styles.noConfigIcon}>⚙️</div>
        <div style={styles.noConfigTitle}>Configura tu fecha de inicio</div>
        <div style={styles.noConfigText}>
          Ve a la pestaña <strong>Ajustes</strong> e introduce la fecha de inicio de tu plan para activar el seguimiento diario.
        </div>
      </div>
    );
  }

  if (!semanaActual || !dataSemanaActual) {
    const semActualNum = getSemanaNum(hoy, fechaInicio);
    if (semActualNum === null) {
      const inicioDate = new Date(fechaInicio);
      const hoyDate = new Date(hoy);
      if (hoyDate < inicioDate) {
        const diasFaltan = Math.ceil((inicioDate - hoyDate) / (1000 * 60 * 60 * 24));
        return (
          <div style={styles.noConfig}>
            <div style={styles.noConfigIcon}>⏳</div>
            <div style={styles.noConfigTitle}>El plan empieza en {diasFaltan} días</div>
            <div style={styles.noConfigText}>
              Fecha de inicio: <strong>{formatFecha(fechaInicio)}</strong>.<br />
              Aprovecha para preparar el entorno de estudio y repasar el protocolo.
            </div>
          </div>
        );
      }
      return (
        <div style={styles.noConfig}>
          <div style={styles.noConfigIcon}>🎖️</div>
          <div style={styles.noConfigTitle}>¡Plan completado!</div>
          <div style={styles.noConfigText}>El 1 de junio de 2027 fue el examen. A por el galón de Sargento.</div>
        </div>
      );
    }
  }

  const sem = dataSemanaActual;
  const tipoConfig = TIPO_COLOR[sem.tipo] || TIPO_COLOR[TIPO_SEMANA.NORMAL];
  const paginasHoy = sem.diasPaginas[diaActualIdx] || 0;
  const registradoHoy = paginasLog[hoy];
  const bloqueBHoy = bloqueBLog[hoy] || false;
  const ankiHoy = ankiLog[hoy] || false;
  const esDomingo = diaActualIdx === 6;
  const esSabado = diaActualIdx === 5;
  const esViernes = diaActualIdx === 4;

  function handleGuardarPaginas() {
    const num = parseInt(inputPaginas, 10);
    if (isNaN(num) || num < 0) return;
    registrarPaginas(hoy, num);
    setInputPaginas("");
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  function formatFecha(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  const hayTest = sem.test && esViernes;
  const hayTestLunes = sem.test && sem.test.dia === 1 && diaActualIdx === 0;

  return (
    <div style={styles.container}>
      {/* Cabecera fecha y semana */}
      <div style={{ ...styles.header, background: tipoConfig.bg, borderColor: tipoConfig.border }}>
        <div style={styles.headerTop}>
          <div>
            <div style={styles.fechaLabel}>{DIAS_SEMANA[diaActualIdx]}, {formatFecha(hoy)}</div>
            <div style={{ ...styles.tipoLabel, color: tipoConfig.text }}>
              SEMANA {semanaActual} · {tipoConfig.label} · FASE {sem.fase}
            </div>
          </div>
          <div style={{ ...styles.semCircle, borderColor: tipoConfig.border, color: tipoConfig.text }}>
            {semanaActual}<span style={styles.semOf}>/38</span>
          </div>
        </div>
        <div style={styles.moduloTemas}>
          📚 {sem.modulos} — {sem.temas}
        </div>
      </div>

      {/* Día especial - sábado */}
      {esSabado && (
        <div style={styles.diaEspecial}>
          <div style={styles.diaEspecialIcon}>🔋</div>
          <div>
            <div style={styles.diaEspecialTitle}>DESCANSO TOTAL</div>
            <div style={styles.diaEspecialText}>Los sábados son sagrados. Sin estudio, sin culpa. Recarga.</div>
          </div>
        </div>
      )}

      {/* Día especial - domingo */}
      {esDomingo && !esSabado && (
        <div style={{ ...styles.diaEspecial, background: "#1e1a2a", borderColor: "#3d2d5a" }}>
          <div style={styles.diaEspecialIcon}>🔄</div>
          <div>
            <div style={{ ...styles.diaEspecialTitle, color: "#9a7adb" }}>REPASO ESPACIADO — 2h</div>
            <div style={styles.diaEspecialText}>{sem.bloqueB}</div>
          </div>
        </div>
      )}

      {/* Bloque A — páginas */}
      {!esSabado && !esDomingo && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span style={styles.cardIcon}>📖</span> BLOQUE A — Materia nueva
          </div>
          <div style={styles.paginasTarget}>
            <span style={styles.paginasNum}>{paginasHoy}</span>
            <span style={styles.paginasLabel}> páginas planificadas hoy</span>
          </div>
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              type="number"
              min="0"
              max="50"
              placeholder="¿Cuántas páginas hiciste?"
              value={inputPaginas}
              onChange={(e) => setInputPaginas(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGuardarPaginas()}
            />
            <button style={styles.btn} onClick={handleGuardarPaginas}>
              Guardar
            </button>
          </div>
          {registradoHoy !== undefined && (
            <div style={{
              ...styles.registradoBadge,
              background: registradoHoy >= paginasHoy ? "#1a3a1a" : "#3a1a1a",
              borderColor: registradoHoy >= paginasHoy ? "#2d6a2d" : "#6a2d2d",
              color: registradoHoy >= paginasHoy ? "#5adb5a" : "#db5a5a",
            }}>
              {registradoHoy >= paginasHoy ? "✓" : "⚠"} Registrado: <strong>{registradoHoy}p</strong>
              {registradoHoy < paginasHoy && ` — faltan ${paginasHoy - registradoHoy}p`}
            </div>
          )}
          {guardado && <div style={styles.guardadoMsg}>✓ Guardado</div>}
        </div>
      )}

      {/* Bloque B */}
      {!esSabado && (
        <div style={styles.card}>
          <div style={styles.cardTitleRow}>
            <div>
              <div style={styles.cardTitle}>
                <span style={styles.cardIcon}>🔄</span> BLOQUE B — Repaso espaciado
                {!esDomingo && <span style={styles.cardSub}> · 1h</span>}
                {esDomingo && <span style={styles.cardSub}> · 2h</span>}
              </div>
              <div style={styles.bloqueBDesc}>{sem.bloqueB}</div>
            </div>
            <button
              style={{ ...styles.checkBtn, ...(bloqueBHoy ? styles.checkBtnDone : {}) }}
              onClick={() => registrarBloqueB(hoy, !bloqueBHoy)}
            >
              {bloqueBHoy ? "✓" : "○"}
            </button>
          </div>
        </div>
      )}

      {/* Anki */}
      {!esSabado && (
        <div style={styles.card}>
          <div style={styles.cardTitleRow}>
            <div>
              <div style={styles.cardTitle}>
                <span style={styles.cardIcon}>🃏</span> ANKI
                <span style={styles.cardSub}> · 30 min durante la lectura</span>
              </div>
              <div style={styles.bloqueBDesc}>
                {esDomingo
                  ? "Tarjetas falladas del módulo de la semana"
                  : "Crea flashcards MIENTRAS lees — no al final del tema"}
              </div>
            </div>
            <button
              style={{ ...styles.checkBtn, ...(ankiHoy ? styles.checkBtnDone : {}) }}
              onClick={() => registrarAnki(hoy, !ankiHoy)}
            >
              {ankiHoy ? "✓" : "○"}
            </button>
          </div>
        </div>
      )}

      {/* Test / Simulacro */}
      {(hayTest || hayTestLunes) && sem.test && (
        <div style={styles.cardTest}>
          <div style={styles.cardTitle}>
            <span style={styles.cardIcon}>📝</span> {sem.test.tipo}
          </div>
          <div style={styles.testInfo}>
            <div style={styles.testNum}>{sem.test.preguntas}<span style={styles.testLabel}> preguntas</span></div>
            <div style={styles.testMeta}>
              Meta: <strong>{sem.test.meta === "SIM24" ? "7,5/10 (obj. 8,0)" : sem.test.meta === "SPRINT" ? "7,5/10 (obj. 8,0)" : "7,0/10 (obj. 7,5)"}</strong>
            </div>
          </div>
          <div style={styles.testHint}>Ve a la pestaña PROGRESO para registrar el resultado.</div>
        </div>
      )}

      {/* Consejo de la semana */}
      <div style={styles.consejo}>
        <div style={styles.consejoIcon}>💡</div>
        <div style={styles.consejoText}>{sem.consejo}</div>
      </div>
    </div>
  );
}

function formatFecha(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`;
}

const styles = {
  container: { padding: "0 0 16px" },
  header: {
    margin: "12px 12px 0",
    borderRadius: 12,
    border: "1px solid",
    padding: "14px 16px",
  },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  fechaLabel: { color: "#ccc", fontSize: 13, marginBottom: 2 },
  tipoLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 1 },
  semCircle: {
    border: "2px solid",
    borderRadius: 8,
    padding: "4px 10px",
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1,
    textAlign: "center",
  },
  semOf: { fontSize: 10, fontWeight: 400, color: "#888" },
  moduloTemas: { color: "#aaa", fontSize: 12, marginTop: 4 },

  noConfig: {
    margin: "40px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  noConfigIcon: { fontSize: 48 },
  noConfigTitle: { color: "#fff", fontSize: 18, fontWeight: 700 },
  noConfigText: { color: "#888", fontSize: 14, lineHeight: 1.5 },

  diaEspecial: {
    margin: "12px 12px 0",
    background: "#1a2a1a",
    border: "1px solid #2d5a2d",
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  diaEspecialIcon: { fontSize: 28 },
  diaEspecialTitle: { color: "#5adb5a", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 4 },
  diaEspecialText: { color: "#aaa", fontSize: 13, lineHeight: 1.4 },

  card: {
    margin: "12px 12px 0",
    background: "#13131a",
    border: "1px solid #222",
    borderRadius: 12,
    padding: "14px 16px",
  },
  cardTitle: { color: "#ddd", fontSize: 13, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 },
  cardSub: { color: "#666", fontWeight: 400, fontSize: 12 },
  cardIcon: { fontSize: 16 },
  cardTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },

  paginasTarget: { marginBottom: 10 },
  paginasNum: { fontSize: 32, fontWeight: 800, color: "#fff" },
  paginasLabel: { fontSize: 13, color: "#888" },

  inputRow: { display: "flex", gap: 8, marginBottom: 8 },
  input: {
    flex: 1,
    background: "#1a1a24",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#fff",
    fontSize: 15,
    padding: "10px 12px",
    outline: "none",
    WebkitAppearance: "none",
  },
  btn: {
    background: "#2d5adb",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    padding: "10px 16px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  registradoBadge: {
    borderRadius: 8,
    border: "1px solid",
    padding: "8px 12px",
    fontSize: 13,
    marginTop: 4,
  },
  guardadoMsg: { color: "#5adb5a", fontSize: 12, marginTop: 6, textAlign: "center" },

  bloqueBDesc: { color: "#888", fontSize: 12, lineHeight: 1.4 },

  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "2px solid #333",
    background: "transparent",
    color: "#666",
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginLeft: 8,
  },
  checkBtnDone: {
    border: "2px solid #2d8a2d",
    background: "#1a3a1a",
    color: "#5adb5a",
  },

  cardTest: {
    margin: "12px 12px 0",
    background: "#1a1508",
    border: "1px solid #5a3a0a",
    borderRadius: 12,
    padding: "14px 16px",
  },
  testInfo: { display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8 },
  testNum: { fontSize: 28, fontWeight: 800, color: "#f0a030" },
  testLabel: { fontSize: 13, color: "#888" },
  testMeta: { color: "#ccc", fontSize: 13 },
  testHint: { color: "#666", fontSize: 11, marginTop: 4 },

  consejo: {
    margin: "12px 12px 0",
    background: "#0f0f1a",
    border: "1px solid #1a1a33",
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  },
  consejoIcon: { fontSize: 18, flexShrink: 0 },
  consejoText: { color: "#888", fontSize: 12, lineHeight: 1.6, fontStyle: "italic" },
};
