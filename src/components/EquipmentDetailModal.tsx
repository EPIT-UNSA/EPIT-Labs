/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import Markdown from "react-markdown";
import { 
  X, 
  Settings, 
  Wrench, 
  Calendar, 
  DollarSign, 
  User, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertCircle,
  FileText,
  Clock
} from "lucide-react";
import { Equipo, MantenimientoItem, HojaDeVidaMantenimiento, Caracteristica } from "../types";

interface EquipmentDetailModalProps {
  equipment: Equipo;
  isEditMode: boolean;
  onClose: () => void;
  onUpdateEquipment: (updatedEquipment: Equipo) => void;
}

export default function EquipmentDetailModal({ 
  equipment, 
  isEditMode, 
  onClose, 
  onUpdateEquipment 
}: EquipmentDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<"ficha" | "preventivo" | "correctivo" | "hojavida">("ficha");

  // Local helper to update nested attributes
  const updateEquip = (updater: (draft: Equipo) => void) => {
    const draft = JSON.parse(JSON.stringify(equipment)) as Equipo;
    updater(draft);
    onUpdateEquipment(draft);
  };

  // Add characteristic
  const handleAddChar = () => {
    updateEquip(draft => {
      draft.caracteristicas = [...(draft.caracteristicas || []), { Caracteristica: "Nueva Característica", Descripcion: "Descripción" }];
    });
  };

  // Delete characteristic
  const handleRemoveChar = (idx: number) => {
    updateEquip(draft => {
      draft.caracteristicas = draft.caracteristicas.filter((_, i) => i !== idx);
    });
  };

  // Add maintenance action (preventive/corrective)
  const handleAddMaintItem = (type: "preventivo" | "correctivo", cronKey: string) => {
    const newItem: MantenimientoItem = {
      visible: true,
      descripcion: {
        title: "Nueva Tarea",
        Prioridad: 2,
        contenido: ["Instrucción 1"]
      },
      "MONTO REF": {
        currency: "S/.",
        amount: "-"
      },
      responsable: "Técnico de Laboratorio"
    };

    updateEquip(draft => {
      if (!draft.ProcedimientoMantenimiento) {
        draft.ProcedimientoMantenimiento = { visible: true };
      }
      if (!draft.ProcedimientoMantenimiento.mantenimiento) {
        draft.ProcedimientoMantenimiento.mantenimiento = { visible: true };
      }
      const maint = draft.ProcedimientoMantenimiento.mantenimiento;
      if (!maint[type]) {
        maint[type] = {};
      }
      const cron = maint[type] as any;
      if (!cron[cronKey]) {
        cron[cronKey] = [];
      }
      cron[cronKey].push(newItem);
    });
  };

  // Remove maintenance item
  const handleRemoveMaintItem = (type: "preventivo" | "correctivo", cronKey: string, idx: number) => {
    updateEquip(draft => {
      const cron = draft.ProcedimientoMantenimiento?.mantenimiento?.[type] as any;
      if (cron && cron[cronKey]) {
        cron[cronKey] = cron[cronKey].filter((_: any, i: number) => i !== idx);
      }
    });
  };

  // Add Log Entry (Hoja de Vida)
  const handleAddLogEntry = () => {
    updateEquip(draft => {
      if (!draft.HojasDeVidaEquipos) {
        draft.HojasDeVidaEquipos = [];
      }
      if (draft.HojasDeVidaEquipos.length === 0) {
        draft.HojasDeVidaEquipos.push({
          visible: true,
          infoEquipo: {
            "Codigo Inventario Equipo": draft.infoEquipo["Codigo Inventario Equipo"] || "NUEVO-COD",
            "FECHA DE ADQUISICIÓN": draft.infoEquipo["FECHA DE ADQUISICIÓN"] || "2026",
            "MODO DE ADQUISICIÓN": "COMPRA",
            "Ubicación": "Estante Principal"
          },
          mantenimientos: [],
          nota: "Mantenimiento periódico preventivo",
          ultimaActualizacion: { year: 2026, month: 7, day: 2 },
          HechoPor: "Técnico de Turno",
          RevisadoPor: "Responsable del Laboratorio"
        });
      }
      
      const sheet = draft.HojasDeVidaEquipos[0];
      const newMaint: HojaDeVidaMantenimiento = {
        visible: true,
        Nro: (sheet.mantenimientos?.length || 0) + 1,
        "Actividad realizada": "Mantenimiento rutinario",
        Fecha: new Date().toISOString().split("T")[0],
        Responsable: "Técnico de Laboratorio",
        Observaciones: "Operación de prueba conforme.",
        Fotografias: []
      };
      
      sheet.mantenimientos = [...(sheet.mantenimientos || []), newMaint];
    });
  };

  // Delete Log Entry
  const handleRemoveLogEntry = (idx: number) => {
    updateEquip(draft => {
      if (draft.HojasDeVidaEquipos?.[0]) {
        draft.HojasDeVidaEquipos[0].mantenimientos = draft.HojasDeVidaEquipos[0].mantenimientos.filter((_, i) => i !== idx);
      }
    });
  };

  // Get cron fields
  const cronKeys = ["enCadaUso", "semanal", "quincenal", "mensual", "bimestral", "trimestral", "semestral", "anual"];

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Slide Panel */}
      <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-left z-10">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-white text-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-red-700 uppercase font-bold">
              Ficha Técnica de Equipamiento
            </span>
            <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
              {equipment["NOMBRE DEL EQUIPO"]}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/50 text-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab("ficha")}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "ficha" 
                ? "border-rose-900 text-rose-900" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            Especificaciones Técnicas
          </button>
          <button
            onClick={() => setActiveTab("preventivo")}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "preventivo" 
                ? "border-rose-900 text-rose-900" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            Mantenimiento Preventivo
          </button>
          <button
            onClick={() => setActiveTab("correctivo")}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "correctivo" 
                ? "border-rose-900 text-rose-900" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Wrench className="w-4 h-4" />
            Mantenimiento Correctivo
          </button>
          <button
            onClick={() => setActiveTab("hojavida")}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "hojavida" 
                ? "border-rose-900 text-rose-900" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Historial (Hoja de Vida)
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* TAB 1: FICHA TÉCNICA */}
          {activeTab === "ficha" && (
            <div className="space-y-8 animate-fade-in">
              {/* Info Matrix Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase border-b border-slate-200/60 pb-1.5">
                    Identificación del Equipo
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 block">Denominación Patrimonial</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-medium focus:border-rose-900 focus:outline-none"
                          value={equipment.infoEquipo["Denominacion Patrimonial"] || ""}
                          onChange={(e) => updateEquip(draft => { draft.infoEquipo["Denominacion Patrimonial"] = e.target.value; })}
                        />
                      ) : (
                        <strong className="text-slate-800 font-medium">{equipment.infoEquipo["Denominacion Patrimonial"] || "-"}</strong>
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Tipo de Equipo</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-medium focus:border-rose-900 focus:outline-none"
                          value={equipment.infoEquipo["Tipo de equipo:"] || ""}
                          onChange={(e) => updateEquip(draft => { draft.infoEquipo["Tipo de equipo:"] = e.target.value; })}
                        />
                      ) : (
                        <strong className="text-slate-800 font-medium">{equipment.infoEquipo["Tipo de equipo:"] || "-"}</strong>
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Nº de Equipos (Stock)</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-medium focus:border-rose-900 focus:outline-none"
                          value={equipment["Nº DE EQUIPOS"]}
                          onChange={(e) => updateEquip(draft => { draft["Nº DE EQUIPOS"] = e.target.value; })}
                        />
                      ) : (
                        <strong className="text-slate-800 font-medium">{equipment["Nº DE EQUIPOS"]} unidades</strong>
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Ubicación de Resguardo</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-medium focus:border-rose-900 focus:outline-none"
                          value={equipment.HojasDeVidaEquipos?.[0]?.infoEquipo?.Ubicación || ""}
                          onChange={(e) => updateEquip(draft => { 
                            if (!draft.HojasDeVidaEquipos) draft.HojasDeVidaEquipos = [];
                            if (draft.HojasDeVidaEquipos.length === 0) draft.HojasDeVidaEquipos.push({ visible: true, infoEquipo: { Ubicación: "", "Codigo Inventario Equipo": "", "FECHA DE ADQUISICIÓN": "", "MODO DE ADQUISICIÓN": "" }, mantenimientos: [], nota: "", ultimaActualizacion: { year: 2026, month: 7, day: 2 }, HechoPor: "", RevisadoPor: "" });
                            draft.HojasDeVidaEquipos[0].infoEquipo.Ubicación = e.target.value;
                          })}
                        />
                      ) : (
                        <strong className="text-slate-800 font-medium">{equipment.HojasDeVidaEquipos?.[0]?.infoEquipo?.Ubicación || "-"}</strong>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase border-b border-slate-200/60 pb-1.5">
                    Fabricación y Modelo
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 block">Marca</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-medium focus:border-rose-900 focus:outline-none"
                          value={equipment.infoEquipo.Marca || ""}
                          onChange={(e) => updateEquip(draft => { draft.infoEquipo.Marca = e.target.value; })}
                        />
                      ) : (
                        <strong className="text-slate-800 font-medium">{equipment.infoEquipo.Marca || "-"}</strong>
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Modelo</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-medium focus:border-rose-900 focus:outline-none"
                          value={equipment.infoEquipo.Modelo || ""}
                          onChange={(e) => updateEquip(draft => { draft.infoEquipo.Modelo = e.target.value; })}
                        />
                      ) : (
                        <strong className="text-slate-800 font-medium">{equipment.infoEquipo.Modelo || "-"}</strong>
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Fabricante</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-medium focus:border-rose-900 focus:outline-none"
                          value={equipment.infoEquipo.Fabricante || ""}
                          onChange={(e) => updateEquip(draft => { draft.infoEquipo.Fabricante = e.target.value; })}
                        />
                      ) : (
                        <strong className="text-slate-800 font-medium">{equipment.infoEquipo.Fabricante || "-"}</strong>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Principle of operation */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-rose-800" />
                  Principio de Operación
                </h3>
                {isEditMode ? (
                  <textarea
                    rows={4}
                    className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:border-rose-900 focus:outline-none font-mono"
                    value={equipment.ProcedimientoMantenimiento?.["Principio de Operacion"] || ""}
                    onChange={(e) => updateEquip(draft => {
                      if (!draft.ProcedimientoMantenimiento) draft.ProcedimientoMantenimiento = { visible: true };
                      draft.ProcedimientoMantenimiento["Principio de Operacion"] = e.target.value;
                    })}
                    placeholder="Principio de funcionamiento en formato Markdown..."
                  />
                ) : (
                  <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50/50 p-4 rounded-lg border border-slate-100 leading-relaxed markdown-body">
                    <Markdown>{equipment.ProcedimientoMantenimiento?.["Principio de Operacion"] || "*Sin información registrada.*"}</Markdown>
                  </div>
                )}
              </div>

              {/* Required installations */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-rose-800" />
                  Instalaciones Requeridas
                </h3>
                {isEditMode ? (
                  <textarea
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:border-rose-900 focus:outline-none font-mono"
                    value={equipment.ProcedimientoMantenimiento?.["Instalaciones Requeridas"] || ""}
                    onChange={(e) => updateEquip(draft => {
                      if (!draft.ProcedimientoMantenimiento) draft.ProcedimientoMantenimiento = { visible: true };
                      draft.ProcedimientoMantenimiento["Instalaciones Requeridas"] = e.target.value;
                    })}
                    placeholder="Suministros e instalaciones requeridos en Markdown..."
                  />
                ) : (
                  <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50/50 p-4 rounded-lg border border-slate-100 leading-relaxed markdown-body">
                    <Markdown>{equipment.ProcedimientoMantenimiento?.["Instalaciones Requeridas"] || "*Sin información registrada.*"}</Markdown>
                  </div>
                )}
              </div>

              {/* Parts & Subsystems */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-800" />
                  Partes y Subsistemas
                </h3>
                {isEditMode ? (
                  <textarea
                    rows={5}
                    className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:border-rose-900 focus:outline-none font-mono"
                    value={equipment.ProcedimientoMantenimiento?.Partes || ""}
                    onChange={(e) => updateEquip(draft => {
                      if (!draft.ProcedimientoMantenimiento) draft.ProcedimientoMantenimiento = { visible: true };
                      draft.ProcedimientoMantenimiento.Partes = e.target.value;
                    })}
                    placeholder="Describa las partes principales usando Markdown..."
                  />
                ) : (
                  <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50/50 p-4 rounded-lg border border-slate-100 leading-relaxed markdown-body">
                    <Markdown>{equipment.ProcedimientoMantenimiento?.Partes || "*Sin información registrada.*"}</Markdown>
                  </div>
                )}
              </div>

              {/* Key Characteristics list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-800">Características Técnicas Notables</h3>
                  {isEditMode && (
                    <button
                      onClick={handleAddChar}
                      className="flex items-center gap-1 bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100 px-2 py-1 rounded text-xs font-semibold transition"
                    >
                      <Plus className="w-3 h-3" />
                      Agregar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipment.caracteristicas?.map((char, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-start">
                      <div className="space-y-1 flex-1 min-w-0 pr-2">
                        {isEditMode ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none"
                              value={char.Caracteristica}
                              onChange={(e) => updateEquip(draft => { draft.caracteristicas[idx].Caracteristica = e.target.value; })}
                            />
                            <input
                              type="text"
                              className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-600 focus:outline-none"
                              value={char.Descripcion}
                              onChange={(e) => updateEquip(draft => { draft.caracteristicas[idx].Descripcion = e.target.value; })}
                            />
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-mono tracking-wider text-rose-900 uppercase font-semibold block">{char.Caracteristica}</span>
                            <span className="text-sm text-slate-700 font-medium break-words">{char.Descripcion}</span>
                          </>
                        )}
                      </div>
                      
                      {isEditMode && (
                        <button
                          onClick={() => handleRemoveChar(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  {equipment.caracteristicas?.length === 0 && (
                    <div className="col-span-2 text-center py-6 text-slate-400 text-sm">
                      No hay características registradas.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANTENIMIENTO PREVENTIVO */}
          {activeTab === "preventivo" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-100 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Cronograma Preventivo:</strong> Las tareas detalladas a continuación son mandatorios según la Guía de Gestión Tecnológica de Equipamiento Científico de la EPIT.
                </p>
              </div>

              {cronKeys.map(cronKey => {
                const list = (equipment.ProcedimientoMantenimiento?.mantenimiento?.preventivo as any)?.[cronKey] || [];
                const showCron = isEditMode || list.length > 0;
                if (!showCron) return null;

                return (
                  <div key={cronKey} className="space-y-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="font-display font-bold text-sm text-rose-950 uppercase tracking-wider">
                        Intervalo: {cronKey.replace(/([A-Z])/g, " $1")}
                      </span>
                      {isEditMode && (
                        <button
                          onClick={() => handleAddMaintItem("preventivo", cronKey)}
                          className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-semibold transition"
                        >
                          <Plus className="w-3 h-3" />
                          Agregar Tarea
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {list.map((item: MantenimientoItem, itemIdx: number) => {
                        const showItem = isEditMode || item.visible;
                        if (!showItem) return null;

                        return (
                          <div 
                            key={itemIdx} 
                            className={`p-3 bg-white rounded-lg border border-slate-100 space-y-2 relative ${
                              !item.visible ? "opacity-60 border-dashed border-red-200" : ""
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              {isEditMode ? (
                                <div className="space-y-1.5 flex-1">
                                  <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none"
                                    value={item.descripcion.title}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.preventivo as any)[cronKey];
                                      arr[itemIdx].descripcion.title = e.target.value;
                                    })}
                                    placeholder="Título de la tarea"
                                  />
                                  <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[11px] focus:outline-none"
                                    value={item.descripcion.contenido.join("\n")}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.preventivo as any)[cronKey];
                                      arr[itemIdx].descripcion.contenido = e.target.value.split("\n");
                                    })}
                                    placeholder="Instrucciones (una por línea)"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-1 flex-1">
                                  <h4 className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-800"></span>
                                    {item.descripcion.title}
                                  </h4>
                                  <ul className="list-disc pl-5 text-[11px] text-slate-500 space-y-0.5">
                                    {item.descripcion.contenido.map((b, bidx) => (
                                      <li key={bidx}>{b}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {isEditMode && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.preventivo as any)[cronKey];
                                      arr[itemIdx].visible = !arr[itemIdx].visible;
                                    })}
                                    className={`p-1 rounded text-xs border ${
                                      item.visible ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-500 bg-slate-50"
                                    }`}
                                  >
                                    {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  </button>
                                  <button
                                    onClick={() => handleRemoveMaintItem("preventivo", cronKey, itemIdx)}
                                    className="p-1 rounded text-red-600 bg-red-50 border border-red-100 hover:bg-red-100"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Meta params row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-50 text-[10px] font-mono text-slate-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>Responsable: </span>
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    className="bg-slate-50 px-1 rounded border border-slate-200"
                                    value={item.responsable}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.preventivo as any)[cronKey];
                                      arr[itemIdx].responsable = e.target.value;
                                    })}
                                  />
                                ) : (
                                  <span className="text-slate-700 font-medium">{item.responsable}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                <span>Costo Referencial: </span>
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    className="bg-slate-50 px-1 rounded border border-slate-200 w-16 text-center"
                                    value={item["MONTO REF"]?.amount || "-"}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.preventivo as any)[cronKey];
                                      if (!arr[itemIdx]["MONTO REF"]) arr[itemIdx]["MONTO REF"] = { currency: "S/.", amount: "-" };
                                      arr[itemIdx]["MONTO REF"].amount = e.target.value;
                                    })}
                                  />
                                ) : (
                                  <span className="text-slate-700 font-medium">
                                    {item["MONTO REF"]?.currency || "S/."} {item["MONTO REF"]?.amount || "-"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: MANTENIMIENTO CORRECTIVO */}
          {activeTab === "correctivo" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-100 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Acción Correctiva:</strong> Protocolos aplicables únicamente en caso de anomalías, fallas o pérdida de calibración del instrumento.
                </p>
              </div>

              {cronKeys.map(cronKey => {
                const list = (equipment.ProcedimientoMantenimiento?.mantenimiento?.correctivo as any)?.[cronKey] || [];
                const showCron = isEditMode || list.length > 0;
                if (!showCron) return null;

                return (
                  <div key={cronKey} className="space-y-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="font-display font-bold text-sm text-rose-950 uppercase tracking-wider">
                        Protocolo ante fallas: {cronKey.replace(/([A-Z])/g, " $1")}
                      </span>
                      {isEditMode && (
                        <button
                          onClick={() => handleAddMaintItem("correctivo", cronKey)}
                          className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-semibold transition"
                        >
                          <Plus className="w-3 h-3" />
                          Agregar Tarea
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {list.map((item: MantenimientoItem, itemIdx: number) => {
                        const showItem = isEditMode || item.visible;
                        if (!showItem) return null;

                        return (
                          <div 
                            key={itemIdx} 
                            className={`p-3 bg-white rounded-lg border border-slate-100 space-y-2 relative ${
                              !item.visible ? "opacity-60 border-dashed border-red-200" : ""
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              {isEditMode ? (
                                <div className="space-y-1.5 flex-1">
                                  <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none"
                                    value={item.descripcion.title}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.correctivo as any)[cronKey];
                                      arr[itemIdx].descripcion.title = e.target.value;
                                    })}
                                    placeholder="Título de la tarea"
                                  />
                                  <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[11px] focus:outline-none"
                                    value={item.descripcion.contenido.join("\n")}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.correctivo as any)[cronKey];
                                      arr[itemIdx].descripcion.contenido = e.target.value.split("\n");
                                    })}
                                    placeholder="Instrucciones (una por línea)"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-1 flex-1">
                                  <h4 className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                                    {item.descripcion.title}
                                  </h4>
                                  <ul className="list-disc pl-5 text-[11px] text-slate-500 space-y-0.5">
                                    {item.descripcion.contenido.map((b, bidx) => (
                                      <li key={bidx}>{b}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {isEditMode && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.correctivo as any)[cronKey];
                                      arr[itemIdx].visible = !arr[itemIdx].visible;
                                    })}
                                    className={`p-1 rounded text-xs border ${
                                      item.visible ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-500 bg-slate-50"
                                    }`}
                                  >
                                    {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  </button>
                                  <button
                                    onClick={() => handleRemoveMaintItem("correctivo", cronKey, itemIdx)}
                                    className="p-1 rounded text-red-600 bg-red-50 border border-red-100 hover:bg-red-100"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Meta params row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-50 text-[10px] font-mono text-slate-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>Responsable: </span>
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    className="bg-slate-50 px-1 rounded border border-slate-200"
                                    value={item.responsable}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.correctivo as any)[cronKey];
                                      arr[itemIdx].responsable = e.target.value;
                                    })}
                                  />
                                ) : (
                                  <span className="text-slate-700 font-medium">{item.responsable}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                <span>Costo Referencial: </span>
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    className="bg-slate-50 px-1 rounded border border-slate-200 w-16 text-center"
                                    value={item["MONTO REF"]?.amount || "-"}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.correctivo as any)[cronKey];
                                      if (!arr[itemIdx]["MONTO REF"]) arr[itemIdx]["MONTO REF"] = { currency: "S/.", amount: "-" };
                                      arr[itemIdx]["MONTO REF"].amount = e.target.value;
                                    })}
                                  />
                                ) : (
                                  <span className="text-slate-700 font-medium">
                                    {item["MONTO REF"]?.currency || "S/."} {item["MONTO REF"]?.amount || "-"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: HOJA DE VIDA / HISTORIAL LOGS */}
          {activeTab === "hojavida" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-800">
                    Registro de Eventos y Calibración
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Historial de intervenciones registradas en patrimonio.</p>
                </div>
                {isEditMode && (
                  <button
                    onClick={handleAddLogEntry}
                    className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded text-xs font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Registrar Evento
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {equipment.HojasDeVidaEquipos?.[0]?.mantenimientos?.map((log, logIdx) => {
                  const showLog = isEditMode || log.visible;
                  if (!showLog) return null;

                  return (
                    <div 
                      key={logIdx} 
                      className={`p-4 rounded-xl border border-slate-100 bg-white shadow-sm space-y-4 relative ${
                        !log.visible ? "opacity-60 border-dashed border-red-200 bg-red-50/25" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-rose-50 text-rose-900 flex items-center justify-center font-mono font-bold text-xs border border-rose-100">
                            {log.Nro}
                          </span>
                          {isEditMode ? (
                            <input
                              type="text"
                              className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none"
                              value={log["Actividad realizada"]}
                              onChange={(e) => updateEquip(draft => {
                                draft.HojasDeVidaEquipos![0].mantenimientos[logIdx]["Actividad realizada"] = e.target.value;
                              })}
                            />
                          ) : (
                            <h4 className="font-semibold text-slate-800 text-sm">{log["Actividad realizada"]}</h4>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {isEditMode ? (
                              <input
                                type="date"
                                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                                value={log.Fecha}
                                onChange={(e) => updateEquip(draft => {
                                  draft.HojasDeVidaEquipos![0].mantenimientos[logIdx].Fecha = e.target.value;
                                })}
                              />
                            ) : (
                              log.Fecha
                            )}
                          </span>

                          {isEditMode && (
                            <>
                              <button
                                onClick={() => updateEquip(draft => {
                                  draft.HojasDeVidaEquipos![0].mantenimientos[logIdx].visible = !draft.HojasDeVidaEquipos![0].mantenimientos[logIdx].visible;
                                })}
                                className={`p-1 rounded text-xs border ${
                                  log.visible ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-500 bg-slate-50"
                                }`}
                              >
                                {log.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => handleRemoveLogEntry(logIdx)}
                                className="p-1 rounded text-red-600 bg-red-50 border border-red-100 hover:bg-red-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-2 pl-8">
                        <div>
                          <span className="text-slate-400 font-medium block">Observaciones e Informe Técnico</span>
                          {isEditMode ? (
                            <textarea
                              rows={2}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-rose-900"
                              value={log.Observaciones}
                              onChange={(e) => updateEquip(draft => {
                                draft.HojasDeVidaEquipos![0].mantenimientos[logIdx].Observaciones = e.target.value;
                              })}
                            />
                          ) : (
                            <p className="leading-relaxed mt-0.5 text-slate-700 font-medium">{log.Observaciones}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-8 gap-y-1.5 pt-2 border-t border-slate-50 text-[10px] text-slate-400 font-mono">
                          <span>
                            Soporte:{" "}
                            {isEditMode ? (
                              <input
                                type="text"
                                className="bg-slate-50 px-1 rounded border border-slate-200"
                                value={log.Responsable}
                                onChange={(e) => updateEquip(draft => {
                                  draft.HojasDeVidaEquipos![0].mantenimientos[logIdx].Responsable = e.target.value;
                                })}
                              />
                            ) : (
                              <strong className="text-slate-600">{log.Responsable}</strong>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(!equipment.HojasDeVidaEquipos?.[0]?.mantenimientos || equipment.HojasDeVidaEquipos[0].mantenimientos.length === 0) && (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                    No hay registros de calibraciones ni reparaciones técnicas previas.
                  </div>
                )}
              </div>

              {equipment.HojasDeVidaEquipos?.[0] && (
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 text-xs text-slate-500 space-y-2 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span>Elaborado por: </span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-xs text-slate-700 w-full"
                          value={equipment.HojasDeVidaEquipos[0].HechoPor}
                          onChange={(e) => updateEquip(draft => { draft.HojasDeVidaEquipos![0].HechoPor = e.target.value; })}
                        />
                      ) : (
                        <strong className="text-slate-700">{equipment.HojasDeVidaEquipos[0].HechoPor}</strong>
                      )}
                    </div>
                    <div>
                      <span>Aprobado por: </span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-xs text-slate-700 w-full"
                          value={equipment.HojasDeVidaEquipos[0].RevisadoPor}
                          onChange={(e) => updateEquip(draft => { draft.HojasDeVidaEquipos![0].RevisadoPor = e.target.value; })}
                        />
                      ) : (
                        <strong className="text-slate-700">{equipment.HojasDeVidaEquipos[0].RevisadoPor}</strong>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Aceptar y Volver
          </button>
        </div>
      </div>
    </div>
  );
}
