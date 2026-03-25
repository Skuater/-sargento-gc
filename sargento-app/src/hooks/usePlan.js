import { useState, useEffect, useCallback } from "react";
import { SEMANAS, PLAN_CONFIG } from "../data/planData";

const STORAGE_KEY = "sargento_gc_v9";

const defaultState = {
  fechaInicio: null,       // ISO string "2026-09-14"
  paginasLog: {},          // { "2026-09-14": 12, ... }
  simulacros: [],          // [{ fecha, semana, tipo, preguntas, nota, metaFase, notasBlancoInseguridad }]
  bloqueBLog: {},          // { "2026-09-14": true }
  ankiLog: {},             // { "2026-09-14": true }
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// Devuelve el número de semana del plan (1-38) dado una fecha ISO y la fechaInicio ISO
export function getSemanaNum(fechaISO, fechaInicio) {
  if (!fechaInicio) return null;
  const inicio = new Date(fechaInicio);
  const fecha = new Date(fechaISO);
  const diffMs = fecha - inicio;
  if (diffMs < 0) return null;
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const semNum = Math.floor(diffDias / 7) + 1;
  if (semNum < 1 || semNum > 38) return null;
  return semNum;
}

// Devuelve el índice del día dentro de la semana (0=lunes ... 6=domingo)
export function getDiaSemanaIndex(fechaISO) {
  const d = new Date(fechaISO);
  // getDay(): 0=domingo, 1=lunes...6=sábado
  const day = d.getDay();
  return day === 0 ? 6 : day - 1; // convertir a lun=0...dom=6
}

// Devuelve fecha ISO de hoy
export function hoyISO() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

// Devuelve la fecha ISO del inicio de la semana del plan número `semNum` dado `fechaInicio`
export function getFechaInicioSemana(semNum, fechaInicio) {
  if (!fechaInicio || semNum < 1 || semNum > 38) return null;
  const inicio = new Date(fechaInicio);
  const offset = (semNum - 1) * 7;
  const fecha = new Date(inicio.getTime() + offset * 24 * 60 * 60 * 1000);
  return fecha.toISOString().split("T")[0];
}

// Devuelve fecha ISO de un día concreto (diaIndex 0-6) dentro de una semana
export function getFechaDia(semNum, diaIndex, fechaInicio) {
  const inicioSemana = getFechaInicioSemana(semNum, fechaInicio);
  if (!inicioSemana) return null;
  const d = new Date(inicioSemana);
  d.setDate(d.getDate() + diaIndex);
  return d.toISOString().split("T")[0];
}

// Calcula páginas planificadas totales hasta hoy
export function getPaginasPlanificadasHasta(fechaISO, fechaInicio) {
  if (!fechaInicio) return 0;
  let total = 0;
  const semActual = getSemanaNum(fechaISO, fechaInicio);
  if (!semActual) return 0;
  const diaIdx = getDiaSemanaIndex(fechaISO);

  for (let s = 0; s < SEMANAS.length; s++) {
    const sem = SEMANAS[s];
    const semNum = sem.sem;
    if (semNum < semActual) {
      total += sem.diasPaginas.reduce((a, b) => a + b, 0);
    } else if (semNum === semActual) {
      for (let d = 0; d <= diaIdx; d++) {
        total += sem.diasPaginas[d] || 0;
      }
      break;
    }
  }
  return total;
}

export default function usePlan() {
  const [state, setState] = useState(load);

  useEffect(() => {
    save(state);
  }, [state]);

  const setFechaInicio = useCallback((fecha) => {
    setState((s) => ({ ...s, fechaInicio: fecha }));
  }, []);

  const registrarPaginas = useCallback((fechaISO, paginas) => {
    setState((s) => ({
      ...s,
      paginasLog: { ...s.paginasLog, [fechaISO]: paginas },
    }));
  }, []);

  const registrarBloqueB = useCallback((fechaISO, completado) => {
    setState((s) => ({
      ...s,
      bloqueBLog: { ...s.bloqueBLog, [fechaISO]: completado },
    }));
  }, []);

  const registrarAnki = useCallback((fechaISO, completado) => {
    setState((s) => ({
      ...s,
      ankiLog: { ...s.ankiLog, [fechaISO]: completado },
    }));
  }, []);

  const registrarSimulacro = useCallback((simulacro) => {
    setState((s) => ({
      ...s,
      simulacros: [...s.simulacros, { ...simulacro, id: Date.now() }],
    }));
  }, []);

  const eliminarSimulacro = useCallback((id) => {
    setState((s) => ({
      ...s,
      simulacros: s.simulacros.filter((sim) => sim.id !== id),
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState);
  }, []);

  // Datos derivados
  const hoy = hoyISO();
  const semanaActual = state.fechaInicio ? getSemanaNum(hoy, state.fechaInicio) : null;
  const dataSemanaActual = semanaActual ? SEMANAS[semanaActual - 1] : null;
  const diaActualIdx = getDiaSemanaIndex(hoy);

  // Páginas reales completadas (suma de paginasLog)
  const paginasReales = Object.values(state.paginasLog).reduce((a, b) => a + (Number(b) || 0), 0);

  // Páginas planificadas hasta hoy
  const paginasPlanificadas = state.fechaInicio ? getPaginasPlanificadasHasta(hoy, state.fechaInicio) : 0;

  // Días de colchón consumidos (días con 0 páginas cuando había planificadas)
  const diasColchonConsumidos = state.fechaInicio
    ? (() => {
        let perdidos = 0;
        if (!semanaActual) return 0;
        for (let s = 1; s <= (semanaActual || 0); s++) {
          const sem = SEMANAS[s - 1];
          const maxDia = s < semanaActual ? 6 : diaActualIdx;
          for (let d = 0; d <= maxDia; d++) {
            if (sem.diasPaginas[d] > 0) {
              const fechaDia = getFechaDia(s, d, state.fechaInicio);
              const registrado = state.paginasLog[fechaDia];
              if (registrado === undefined || registrado === null) continue;
              if (Number(registrado) === 0) perdidos++;
            }
          }
        }
        return perdidos;
      })()
    : 0;

  // Días hasta el examen
  const fechaExamen = new Date("2027-06-01");
  const hoyDate = new Date();
  const diasHastaExamen = Math.max(0, Math.ceil((fechaExamen - hoyDate) / (1000 * 60 * 60 * 24)));

  return {
    // Estado
    fechaInicio: state.fechaInicio,
    paginasLog: state.paginasLog,
    bloqueBLog: state.bloqueBLog,
    ankiLog: state.ankiLog,
    simulacros: state.simulacros,

    // Acciones
    setFechaInicio,
    registrarPaginas,
    registrarBloqueB,
    registrarAnki,
    registrarSimulacro,
    eliminarSimulacro,
    resetAll,

    // Derivados
    hoy,
    semanaActual,
    dataSemanaActual,
    diaActualIdx,
    paginasReales,
    paginasPlanificadas,
    diasColchonConsumidos,
    diasHastaExamen,
  };
}
