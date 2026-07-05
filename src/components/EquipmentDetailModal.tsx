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
  Clock,
  ExternalLink,
  Camera,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Equipo, MantenimientoItem, HojaDeVidaMantenimiento, Caracteristica } from "../types";

interface EquipmentDetailModalProps {
  equipment: Equipo;
  isEditMode: boolean;
  onClose: () => void;
  onUpdateEquipment: (updatedEquipment: Equipo) => void;
  onZoomImage: (images: string | string[], index?: number) => void;
}

export default function EquipmentDetailModal({
  equipment,
  isEditMode,
  onClose,
  onUpdateEquipment,
  onZoomImage
}: EquipmentDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<"ficha" | "preventivo" | "correctivo" | "hojavida">("ficha");
  const [selectedUnitIdx, setSelectedUnitIdx] = React.useState(0);

  // Photo gallery pagination state
  const [photoPage, setPhotoPage] = React.useState(0);
  const [visitedPages, setVisitedPages] = React.useState<Set<number>>(new Set([0]));

  // Reset page when switching activeTab or equipment changes
  React.useEffect(() => {
    setPhotoPage(0);
    setVisitedPages(new Set([0]));
  }, [equipment, activeTab]);

  const handlePageChange = (newPage: number) => {
    setPhotoPage(newPage);
    setVisitedPages(prev => {
      const next = new Set(prev);
      next.add(newPage);
      return next;
    });
  };
  const infoEquipo = equipment.infoEquipo || {};

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

  // Add Inventory Unit
  const handleAddUnit = () => {
    updateEquip(draft => {
      if (!draft.HojasDeVidaEquipos) {
        draft.HojasDeVidaEquipos = [];
      }
      draft.HojasDeVidaEquipos.push({
        visible: true,
        infoEquipo: {
          "Codigo Inventario Equipo": "INV-" + (draft.HojasDeVidaEquipos.length + 1).toString().padStart(3, "0"),
          "FECHA DE ADQUISICIÓN": new Date().getFullYear().toString(),
          "MODO DE ADQUISICIÓN": "Compra",
          "Ubicación": "Laboratorio",
          "N° de serie": "-",
          "Codigo Patrimonial": "-",
          "Año Fabricación": new Date().getFullYear().toString(),
          "Estado de conservación": "Bueno (B)",
          "Estado de uso": "En uso"
        },
        mantenimientos: [],
        nota: "",
        ultimaActualizacion: { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() },
        HechoPor: "",
        RevisadoPor: ""
      });
    });
  };

  // Remove Inventory Unit
  const handleRemoveUnit = (idx: number) => {
    updateEquip(draft => {
      if (draft.HojasDeVidaEquipos) {
        draft.HojasDeVidaEquipos = draft.HojasDeVidaEquipos.filter((_, i) => i !== idx);
      }
    });
    setSelectedUnitIdx(prev => Math.max(0, prev - 1));
  };

  // Add Log Entry (Hoja de Vida)
  const handleAddLogEntry = (unitIdx: number) => {
    updateEquip(draft => {
      if (!draft.HojasDeVidaEquipos) {
        draft.HojasDeVidaEquipos = [];
      }
      if (draft.HojasDeVidaEquipos.length <= unitIdx) {
        draft.HojasDeVidaEquipos.push({
          visible: true,
          infoEquipo: {
            "Codigo Inventario Equipo": draft.infoEquipo?.["Codigo Inventario Equipo"] || "NUEVO-COD",
            "FECHA DE ADQUISICIÓN": draft.infoEquipo?.["FECHA DE ADQUISICIÓN"] || "2026",
            "MODO DE ADQUISICIÓN": "COMPRA",
            "Ubicación": "Estante Principal",
            "N° de serie": "",
            "Codigo Patrimonial": "",
            "Año Fabricación": "",
            "Estado de conservación": "Bueno (B)",
            "Estado de uso": "En uso"
          },
          mantenimientos: [],
          nota: "Mantenimiento periódico preventivo",
          ultimaActualizacion: { year: 2026, month: 7, day: 2 },
          HechoPor: "Técnico de Turno",
          RevisadoPor: "Responsable del Laboratorio"
        });
      }

      const sheet = draft.HojasDeVidaEquipos[unitIdx];
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
  const handleRemoveLogEntry = (unitIdx: number, logIdx: number) => {
    updateEquip(draft => {
      if (draft.HojasDeVidaEquipos?.[unitIdx]) {
        draft.HojasDeVidaEquipos[unitIdx].mantenimientos = draft.HojasDeVidaEquipos[unitIdx].mantenimientos.filter((_, i) => i !== logIdx);
      }
    });
  };

  // Get cron fields
  const cronKeys = ["enCadaUso", "semanal", "quincenal", "mensual", "bimestral", "trimestral", "semestral", "anual"];

  const hasPreventive = React.useMemo(() => {
    return cronKeys.some(key => {
      const arr = (equipment.ProcedimientoMantenimiento?.mantenimiento?.preventivo as any)?.[key];
      return Array.isArray(arr) && arr.length > 0;
    });
  }, [equipment.ProcedimientoMantenimiento?.mantenimiento?.preventivo]);

  const hasCorrective = React.useMemo(() => {
    return cronKeys.some(key => {
      const arr = (equipment.ProcedimientoMantenimiento?.mantenimiento?.correctivo as any)?.[key];
      return Array.isArray(arr) && arr.length > 0;
    });
  }, [equipment.ProcedimientoMantenimiento?.mantenimiento?.correctivo]);

  const hasHojaVida = React.useMemo(() => {
    return Array.isArray(equipment.HojasDeVidaEquipos) && equipment.HojasDeVidaEquipos.length > 0 && equipment.HojasDeVidaEquipos.some(unit => {
      return (unit.mantenimientos && unit.mantenimientos.length > 0) || unit.nota || unit.HechoPor || unit.RevisadoPor;
    });
  }, [equipment.HojasDeVidaEquipos]);

  React.useEffect(() => {
    if (!isEditMode) {
      if (activeTab === "preventivo" && !hasPreventive) {
        setActiveTab("ficha");
      } else if (activeTab === "correctivo" && !hasCorrective) {
        setActiveTab("ficha");
      } else if (activeTab === "hojavida" && !hasHojaVida) {
        setActiveTab("ficha");
      }
    }
  }, [isEditMode, activeTab, hasPreventive, hasCorrective, hasHojaVida]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Slide Panel */}
      <div className="relative w-full max-w-4xl bg-theme-card h-full shadow-2xl flex flex-col justify-between animate-slide-left z-10">

        {/* Modal Header */}
        <div className="p-6 border-b border-theme-border-light bg-theme-card text-theme-text-primary flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-theme-brand uppercase font-bold">
              Ficha Técnica de Equipamiento
            </span>
            <h2 className="text-xl font-display font-bold text-theme-text-primary tracking-tight">
              {equipment["NOMBRE DEL EQUIPO"]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-text-tertiary hover:text-theme-text-primary hover:bg-theme-hover transition cursor-pointer"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex border-b border-theme-border-light px-6 bg-theme-page/50 text-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab("ficha")}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === "ficha"
              ? "border-theme-brand text-theme-brand"
              : "border-transparent text-theme-text-muted hover:text-theme-text-primary"
              }`}
          >
            <FileText className="w-4 h-4" />
            Especificaciones Técnicas
          </button>
          {(isEditMode || hasPreventive) && (
            <button
              onClick={() => setActiveTab("preventivo")}
              className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === "preventivo"
                ? "border-theme-brand text-theme-brand"
                : "border-transparent text-theme-text-muted hover:text-theme-text-primary"
                }`}
            >
              <Clock className="w-4 h-4" />
              Mantenimiento Preventivo
            </button>
          )}
          {(isEditMode || hasCorrective) && (
            <button
              onClick={() => setActiveTab("correctivo")}
              className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === "correctivo"
                ? "border-theme-brand text-theme-brand"
                : "border-transparent text-theme-text-muted hover:text-theme-text-primary"
                }`}
            >
              <Wrench className="w-4 h-4" />
              Mantenimiento Correctivo
            </button>
          )}
          {(isEditMode || hasHojaVida) && (
            <button
              onClick={() => setActiveTab("hojavida")}
              className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === "hojavida"
                ? "border-theme-brand text-theme-brand"
                : "border-transparent text-theme-text-muted hover:text-theme-text-primary"
                }`}
            >
              <Calendar className="w-4 h-4" />
              Inventario | Hoja de Vida
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* TAB 1: FICHA TÉCNICA */}
          {activeTab === "ficha" && (
            <div className="space-y-8 animate-fade-in">
              {/* Fotografías del Equipo */}
              {(isEditMode || (equipment.Fotografias && equipment.Fotografias.filter(url => url && url !== "https://").length > 0)) && (
                <div className="space-y-4 pt-4 border-t border-theme-border-light">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-theme-text-primary flex items-center gap-2">
                      <Camera className="w-4 h-4 focus:border-theme-brand text-theme-brand" />
                      Fotografías del Equipo
                    </h3>
                    {isEditMode && (
                      <button
                        onClick={() => updateEquip(draft => {
                          draft.Fotografias = [...(draft.Fotografias || []), "https://"];
                        })}
                        className="flex items-center gap-1 bg-theme-brand-light text-theme-brand border border-theme-brand-border hover:bg-theme-brand hover:text-theme-text-primary px-2 py-1 rounded text-xs font-semibold transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Agregar Imagen
                      </button>
                    )}
                  </div>

                  {/* Edit mode url editor */}
                  {isEditMode && (equipment.Fotografias || []).length > 0 && (
                    <div className="space-y-2 bg-theme-page p-3 rounded-lg border border-theme-border-medium">
                      <span className="text-[10px] font-bold text-theme-text-tertiary uppercase tracking-wider block">Enlaces de Imágenes (URLs):</span>
                      {(equipment.Fotografias || []).map((url, imgIdx) => (
                        <div key={imgIdx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            className="flex-1 bg-theme-card border border-theme-border-medium rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                            value={url || ""}
                            onChange={(e) => updateEquip(draft => {
                              if (!draft.Fotografias) draft.Fotografias = [];
                              draft.Fotografias[imgIdx] = e.target.value;
                            })}
                            placeholder="https://ejemplo.com/imagen.jpg"
                          />
                          <button
                            onClick={() => updateEquip(draft => {
                              if (draft.Fotografias) {
                                draft.Fotografias = draft.Fotografias.filter((_, i) => i !== imgIdx);
                              }
                            })}
                            className="p-1 text-theme-text-tertiary hover:text-theme-brand transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Gallery view */}
                  {(() => {
                    const validPhotos = (equipment.Fotografias || []).filter(url => url && url !== "https://");
                    const totalPages = Math.ceil(validPhotos.length / 5);

                    return (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {validPhotos.map((url, photoIdx) => {
                            const pageIdx = Math.floor(photoIdx / 5);
                            const isVisited = visitedPages.has(pageIdx);
                            const isActive = pageIdx === photoPage;

                            if (!isVisited) return null;

                            return (
                              <div
                                key={photoIdx}
                                style={{ display: isActive ? "flex" : "none" }}
                                className="relative group rounded-xl overflow-hidden border border-theme-border-light bg-theme-card shadow-sm aspect-video items-center justify-center p-2 cursor-zoom-in"
                                onClick={() => onZoomImage(validPhotos, photoIdx)}
                              >
                                <img
                                  src={url}
                                  alt={`${equipment["NOMBRE DEL EQUIPO"]} - Foto ${photoIdx + 1}`}
                                  className="object-contain w-full h-full max-h-[140px] group-hover:scale-105 transition duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=400";
                                  }}
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-end p-2">
                                  <span className="text-[10px] text-white font-semibold truncate bg-slate-900/80 px-1.5 py-0.5 rounded">
                                    Ampliar Foto {photoIdx + 1}
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          {validPhotos.length === 0 && (
                            <div className="col-span-full text-center py-6 text-theme-text-tertiary text-xs">
                              No hay fotografías registradas para este equipo.
                            </div>
                          )}
                        </div>

                        {totalPages > 1 && (
                          <div className="flex items-center justify-between border-t border-theme-border-light pt-4 mt-2">
                            <span className="text-xs text-theme-text-muted font-medium">
                              Mostrando {photoPage * 5 + 1} - {Math.min((photoPage + 1) * 5, validPhotos.length)} de {validPhotos.length} fotos
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePageChange(photoPage - 1)}
                                disabled={photoPage === 0}
                                className="px-3 py-1.5 bg-theme-page hover:bg-theme-hover text-theme-text-secondary disabled:opacity-40 disabled:hover:bg-theme-page rounded-lg text-xs font-semibold border border-theme-border-medium transition cursor-pointer flex items-center gap-1"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Anterior
                              </button>
                              <span className="text-xs font-mono font-bold text-theme-text-secondary px-2">
                                {photoPage + 1} / {totalPages}
                              </span>
                              <button
                                onClick={() => handlePageChange(photoPage + 1)}
                                disabled={photoPage === totalPages - 1}
                                className="px-3 py-1.5 bg-theme-page hover:bg-theme-hover text-theme-text-secondary disabled:opacity-40 disabled:hover:bg-theme-page rounded-lg text-xs font-semibold border border-theme-border-medium transition cursor-pointer flex items-center gap-1"
                              >
                                Siguiente
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Info Matrix Grid */}
              {(() => {
                const showPatrimonial = isEditMode || (infoEquipo["Denominacion Patrimonial"] && infoEquipo["Denominacion Patrimonial"] !== "-");
                const showTipo = isEditMode || (infoEquipo["Tipo de equipo:"] && infoEquipo["Tipo de equipo:"] !== "-");
                const showStock = isEditMode || (equipment["Nº DE EQUIPOS"] && equipment["Nº DE EQUIPOS"] !== "0" && equipment["Nº DE EQUIPOS"] !== "-");
                const showUbicacion = isEditMode || (equipment.HojasDeVidaEquipos?.[0]?.infoEquipo?.Ubicación && equipment.HojasDeVidaEquipos[0].infoEquipo.Ubicación !== "-");

                const hasIdentificacion = showPatrimonial || showTipo || showStock || showUbicacion;

                const showMarca = isEditMode || (infoEquipo.Marca && infoEquipo.Marca !== "-");
                const showModelo = isEditMode || (infoEquipo.Modelo && infoEquipo.Modelo !== "-");
                const showFabricante = isEditMode || (infoEquipo.Fabricante && infoEquipo.Fabricante !== "-");

                const hasFabricacion = showMarca || showModelo || showFabricante;

                if (!hasIdentificacion && !hasFabricacion) return null;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-theme-page p-5 rounded-xl border border-theme-border-light">
                    {hasIdentificacion && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-mono font-bold tracking-wider text-theme-text-tertiary uppercase border-b border-theme-border-medium/60 pb-1.5">
                          Identificación del Equipo
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {showPatrimonial && (
                            <div>
                              <span className="text-xs text-theme-text-muted block">Denominación Patrimonial</span>
                              {isEditMode ? (
                                <input
                                  type="text"
                                  className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs font-medium focus:border-theme-brand text-theme-text-secondary focus:outline-none"
                                  value={infoEquipo["Denominacion Patrimonial"] || ""}
                                  onChange={(e) => updateEquip(draft => {
                                    if (!draft.infoEquipo) draft.infoEquipo = {};
                                    draft.infoEquipo["Denominacion Patrimonial"] = e.target.value;
                                  })}
                                />
                              ) : (
                                <strong className="text-theme-text-primary font-medium">{infoEquipo["Denominacion Patrimonial"]}</strong>
                              )}
                            </div>
                          )}
                          {showTipo && (
                            <div>
                              <span className="text-xs text-theme-text-muted block">Tipo de Equipo</span>
                              {isEditMode ? (
                                <input
                                  type="text"
                                  className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs font-medium focus:border-theme-brand text-theme-text-secondary focus:outline-none"
                                  value={infoEquipo["Tipo de equipo:"] || ""}
                                  onChange={(e) => updateEquip(draft => {
                                    if (!draft.infoEquipo) draft.infoEquipo = {};
                                    draft.infoEquipo["Tipo de equipo:"] = e.target.value;
                                  })}
                                />
                              ) : (
                                <strong className="text-theme-text-primary font-medium">{infoEquipo["Tipo de equipo:"]}</strong>
                              )}
                            </div>
                          )}
                          {showStock && (
                            <div>
                              <span className="text-xs text-theme-text-muted block">Nº de Equipos (Stock)</span>
                              {isEditMode ? (
                                <input
                                  type="text"
                                  className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs font-medium focus:border-theme-brand text-theme-text-secondary focus:outline-none"
                                  value={equipment["Nº DE EQUIPOS"] || ""}
                                  onChange={(e) => updateEquip(draft => { draft["Nº DE EQUIPOS"] = e.target.value; })}
                                />
                              ) : (
                                <strong className="text-theme-text-primary font-medium">{equipment["Nº DE EQUIPOS"]} unidades</strong>
                              )}
                            </div>
                          )}
                          {showUbicacion && (
                            <div>
                              <span className="text-xs text-theme-text-muted block">Ubicación de Resguardo</span>
                              {isEditMode ? (
                                <input
                                  type="text"
                                  className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs font-medium focus:border-theme-brand text-theme-text-secondary focus:outline-none"
                                  value={equipment.HojasDeVidaEquipos?.[0]?.infoEquipo?.Ubicación || ""}
                                  onChange={(e) => updateEquip(draft => {
                                    if (!draft.HojasDeVidaEquipos) draft.HojasDeVidaEquipos = [];
                                    if (draft.HojasDeVidaEquipos.length === 0) draft.HojasDeVidaEquipos.push({ visible: true, infoEquipo: { Ubicación: "", "Codigo Inventario Equipo": "", "FECHA DE ADQUISICIÓN": "", "MODO DE ADQUISICIÓN": "" }, mantenimientos: [], nota: "", ultimaActualizacion: { year: 2026, month: 7, day: 2 }, HechoPor: "", RevisadoPor: "" });
                                    draft.HojasDeVidaEquipos[0].infoEquipo.Ubicación = e.target.value;
                                  })}
                                />
                              ) : (
                                <strong className="text-theme-text-primary font-medium">{equipment.HojasDeVidaEquipos?.[0]?.infoEquipo?.Ubicación}</strong>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {hasFabricacion && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-mono font-bold tracking-wider text-theme-text-tertiary uppercase border-b border-theme-border-medium/60 pb-1.5">
                          Fabricación y Modelo
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          {showMarca && (
                            <div>
                              <span className="text-xs text-theme-text-muted block">Marca</span>
                              {isEditMode ? (
                                <input
                                  type="text"
                                  className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs font-medium focus:border-theme-brand text-theme-text-secondary focus:outline-none"
                                  value={infoEquipo.Marca || ""}
                                  onChange={(e) => updateEquip(draft => {
                                    if (!draft.infoEquipo) draft.infoEquipo = {};
                                    draft.infoEquipo.Marca = e.target.value;
                                  })}
                                />
                              ) : (
                                <strong className="text-theme-text-primary font-medium">{infoEquipo.Marca}</strong>
                              )}
                            </div>
                          )}
                          {showModelo && (
                            <div>
                              <span className="text-xs text-theme-text-muted block">Modelo</span>
                              {isEditMode ? (
                                <input
                                  type="text"
                                  className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs font-medium focus:border-theme-brand text-theme-text-secondary focus:outline-none"
                                  value={infoEquipo.Modelo || ""}
                                  onChange={(e) => updateEquip(draft => {
                                    if (!draft.infoEquipo) draft.infoEquipo = {};
                                    draft.infoEquipo.Modelo = e.target.value;
                                  })}
                                />
                              ) : (
                                <strong className="text-theme-text-primary font-medium">{infoEquipo.Modelo}</strong>
                              )}
                            </div>
                          )}
                          {showFabricante && (
                            <div>
                              <span className="text-xs text-theme-text-muted block">Fabricante</span>
                              {isEditMode ? (
                                <input
                                  type="text"
                                  className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs font-medium focus:border-theme-brand text-theme-text-secondary focus:outline-none"
                                  value={infoEquipo.Fabricante || ""}
                                  onChange={(e) => updateEquip(draft => {
                                    if (!draft.infoEquipo) draft.infoEquipo = {};
                                    draft.infoEquipo.Fabricante = e.target.value;
                                  })}
                                />
                              ) : (
                                <strong className="text-theme-text-primary font-medium">{infoEquipo.Fabricante}</strong>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Principle of operation */}
              {(isEditMode || equipment.ProcedimientoMantenimiento?.["Principio de Operacion"]) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-theme-text-primary flex items-center gap-2">
                    <Settings className="w-4 h-4 focus:border-theme-brand text-theme-brand" />
                    Principio de Operación
                  </h3>
                  {isEditMode ? (
                    <textarea
                      rows={4}
                      className="w-full bg-theme-card border border-theme-border-medium rounded px-3 py-2 text-sm focus:border-theme-brand text-theme-text-secondary focus:outline-none font-mono"
                      value={equipment.ProcedimientoMantenimiento?.["Principio de Operacion"] || ""}
                      onChange={(e) => updateEquip(draft => {
                        if (!draft.ProcedimientoMantenimiento) draft.ProcedimientoMantenimiento = { visible: true };
                        draft.ProcedimientoMantenimiento["Principio de Operacion"] = e.target.value;
                      })}
                      placeholder="Principio de funcionamiento en formato Markdown..."
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none text-theme-text-secondary bg-theme-page/50 p-4 rounded-lg border border-theme-border-light leading-relaxed markdown-body">
                      <Markdown>{equipment.ProcedimientoMantenimiento?.["Principio de Operacion"] || "*Sin información registrada.*"}</Markdown>
                    </div>
                  )}
                </div>
              )}

              {/* Required installations */}
              {(isEditMode || equipment.ProcedimientoMantenimiento?.["Instalaciones Requeridas"]) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-theme-text-primary flex items-center gap-2">
                    <Wrench className="w-4 h-4 focus:border-theme-brand text-theme-brand" />
                    Instalaciones Requeridas
                  </h3>
                  {isEditMode ? (
                    <textarea
                      rows={3}
                      className="w-full bg-theme-card border border-theme-border-medium rounded px-3 py-2 text-sm focus:border-theme-brand text-theme-text-secondary focus:outline-none font-mono"
                      value={equipment.ProcedimientoMantenimiento?.["Instalaciones Requeridas"] || ""}
                      onChange={(e) => updateEquip(draft => {
                        if (!draft.ProcedimientoMantenimiento) draft.ProcedimientoMantenimiento = { visible: true };
                        draft.ProcedimientoMantenimiento["Instalaciones Requeridas"] = e.target.value;
                      })}
                      placeholder="Suministros e instalaciones requeridos en Markdown..."
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none text-theme-text-secondary bg-theme-page/50 p-4 rounded-lg border border-theme-border-light leading-relaxed markdown-body">
                      <Markdown>{equipment.ProcedimientoMantenimiento?.["Instalaciones Requeridas"] || "*Sin información registrada.*"}</Markdown>
                    </div>
                  )}
                </div>
              )}

              {/* Parts & Subsystems */}
              {(isEditMode || equipment.ProcedimientoMantenimiento?.Partes) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-theme-text-primary flex items-center gap-2">
                    <FileText className="w-4 h-4 focus:border-theme-brand text-theme-brand" />
                    Partes y Subsistemas
                  </h3>
                  {isEditMode ? (
                    <textarea
                      rows={5}
                      className="w-full bg-theme-card border border-theme-border-medium rounded px-3 py-2 text-sm focus:border-theme-brand text-theme-text-secondary focus:outline-none font-mono"
                      value={equipment.ProcedimientoMantenimiento?.Partes || ""}
                      onChange={(e) => updateEquip(draft => {
                        if (!draft.ProcedimientoMantenimiento) draft.ProcedimientoMantenimiento = { visible: true };
                        draft.ProcedimientoMantenimiento.Partes = e.target.value;
                      })}
                      placeholder="Describa las partes principales usando Markdown..."
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none text-theme-text-secondary bg-theme-page/50 p-4 rounded-lg border border-theme-border-light leading-relaxed markdown-body">
                      <Markdown>{equipment.ProcedimientoMantenimiento?.Partes || "*Sin información registrada.*"}</Markdown>
                    </div>
                  )}
                </div>
              )}

              {/* Key Characteristics list */}
              {(isEditMode || (equipment.caracteristicas && equipment.caracteristicas.length > 0)) && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-theme-text-primary">Características Técnicas Notables</h3>
                    {isEditMode && (
                      <button
                        onClick={handleAddChar}
                        className="flex items-center gap-1 bg-theme-brand-light text-theme-brand border border-theme-brand-border hover:bg-theme-brand hover:text-theme-text-primary px-2 py-1 rounded text-xs font-semibold transition"
                      >
                        <Plus className="w-3 h-3" />
                        Agregar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {equipment.caracteristicas?.map((char, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-theme-page border border-theme-border-light flex justify-between items-start">
                        <div className="space-y-1 flex-1 min-w-0 pr-2">
                          {isEditMode ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs font-bold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                                value={char.Caracteristica}
                                onChange={(e) => updateEquip(draft => { draft.caracteristicas[idx].Caracteristica = e.target.value; })}
                              />
                              <input
                                type="text"
                                className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs text-theme-text-secondary focus:outline-none focus:border-theme-brand"
                                value={char.Descripcion}
                                onChange={(e) => updateEquip(draft => { draft.caracteristicas[idx].Descripcion = e.target.value; })}
                              />
                            </div>
                          ) : (
                            <>
                              <span className="text-xs font-mono tracking-wider text-theme-brand uppercase font-semibold block">{char.Caracteristica}</span>
                              <span className="text-sm text-theme-text-secondary font-medium break-words">{char.Descripcion}</span>
                            </>
                          )}
                        </div>

                        {isEditMode && (
                          <button
                            onClick={() => handleRemoveChar(idx)}
                            className="p-1 text-theme-text-tertiary hover:text-theme-brand transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    {equipment.caracteristicas?.length === 0 && (
                      <div className="col-span-2 text-center py-6 text-theme-text-tertiary text-sm">
                        No hay características registradas.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documentos y Enlaces de Referencia */}
              {(isEditMode || (equipment.documentos && equipment.documentos.length > 0)) && (
                <div className="space-y-3 pt-4 border-t border-theme-border-light">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-theme-text-primary flex items-center gap-2">
                      <FileText className="w-4 h-4 focus:border-theme-brand text-theme-brand" />
                      Documentos y Enlaces de Referencia
                    </h3>
                    {isEditMode && (
                      <button
                        onClick={() => updateEquip(draft => {
                          draft.documentos = [...(draft.documentos || []), { titulo: "Nuevo Documento", url: "https://" }];
                        })}
                        className="flex items-center gap-1 bg-theme-brand-light text-theme-brand border border-theme-brand-border hover:bg-theme-brand hover:text-theme-text-primary px-2 py-1 rounded text-xs font-semibold transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Agregar Enlace
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(equipment.documentos || []).map((doc, idx) => (
                      <div title={doc.titulo || "Documento Técnico"} key={idx} className="p-3.5 rounded-lg bg-theme-page border border-theme-border-light flex justify-between items-start">
                        <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                          {isEditMode ? (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                                value={doc.titulo || ""}
                                onChange={(e) => updateEquip(draft => {
                                  if (!draft.documentos) draft.documentos = [];
                                  if (draft.documentos[idx]) draft.documentos[idx].titulo = e.target.value;
                                })}
                                placeholder="Nombre del documento"
                              />
                              <input
                                type="text"
                                className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 text-xs text-theme-text-muted focus:outline-none font-mono focus:border-theme-brand text-theme-text-secondary"
                                value={doc.url || ""}
                                onChange={(e) => updateEquip(draft => {
                                  if (!draft.documentos) draft.documentos = [];
                                  if (draft.documentos[idx]) draft.documentos[idx].url = e.target.value;
                                })}
                                placeholder="URL del documento"
                              />
                            </div>
                          ) : (
                            <a
                              href={doc.url || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs font-semibold text-theme-brand hover:text-theme-brand transition"
                            >
                              <span className="truncate">{doc.titulo || "Documento sin título"}</span>
                              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                            </a>
                          )}
                        </div>

                        {isEditMode && (
                          <button
                            onClick={() => updateEquip(draft => {
                              if (draft.documentos) {
                                draft.documentos = draft.documentos.filter((_, i) => i !== idx);
                              }
                            })}
                            className="p-1 text-theme-text-tertiary hover:text-theme-brand transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    {(!equipment.documentos || equipment.documentos.length === 0) && (
                      <div className="col-span-2 text-center py-6 text-theme-text-tertiary text-sm">
                        No hay documentos de referencia registrados para este equipo.
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                  <div key={cronKey} className="space-y-3 p-4 rounded-xl border border-theme-border-light bg-theme-page/50">
                    <div className="flex justify-between items-center border-b border-theme-border-light pb-2">
                      <span className="font-display font-bold text-sm text-theme-brand uppercase tracking-wider">
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
                            className={`p-3 bg-theme-card rounded-lg border border-theme-border-light space-y-2 relative ${!item.visible ? "opacity-60 border-dashed border-theme-brand-border" : ""
                              }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              {isEditMode ? (
                                <div className="space-y-1.5 flex-1">
                                  <input
                                    type="text"
                                    className="w-full bg-theme-page border border-theme-border-medium rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                                    value={item.descripcion.title}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.preventivo as any)[cronKey];
                                      arr[itemIdx].descripcion.title = e.target.value;
                                    })}
                                    placeholder="Título de la tarea"
                                  />
                                  <input
                                    type="text"
                                    className="w-full bg-theme-page border border-theme-border-medium rounded px-2 py-0.5 text-[11px] focus:outline-none focus:border-theme-brand text-theme-text-secondary"
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
                                  <h4 className="font-semibold text-theme-text-primary text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-theme-brand"></span>
                                    {item.descripcion.title}
                                  </h4>
                                  <ul className="list-disc pl-5 text-[11px] text-theme-text-muted space-y-0.5">
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
                                    className={`p-1 rounded text-xs border ${item.visible ? "text-theme-brand bg-theme-brand-light border-theme-brand-border hover:text-white hover:bg-theme-brand" : "text-theme-text-muted bg-theme-page hover:bg-theme-hover"
                                      }`}
                                  >
                                    {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  </button>
                                  <button
                                    onClick={() => handleRemoveMaintItem("preventivo", cronKey, itemIdx)}
                                    className="p-1 rounded text-theme-text-muted bg-theme-page border border-theme-border-medium hover:bg-rose-700 hover:text-rose-50 transition text-xs"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Meta params row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-50 text-[10px] font-mono text-theme-text-muted">
                              <div className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-theme-text-tertiary" />
                                <span>Responsable: </span>
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    className="bg-theme-page px-1 rounded border border-theme-border-medium focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                                    value={item.responsable}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.preventivo as any)[cronKey];
                                      arr[itemIdx].responsable = e.target.value;
                                    })}
                                  />
                                ) : (
                                  <span className="text-theme-text-secondary font-medium">{item.responsable}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-theme-text-tertiary" />
                                <span>Costo Referencial: </span>
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    className="bg-theme-page px-1 rounded border border-theme-border-medium w-16 text-center focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                                    value={item["MONTO REF"]?.amount || "-"}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.preventivo as any)[cronKey];
                                      if (!arr[itemIdx]["MONTO REF"]) arr[itemIdx]["MONTO REF"] = { currency: "S/.", amount: "-" };
                                      arr[itemIdx]["MONTO REF"].amount = e.target.value;
                                    })}
                                  />
                                ) : (
                                  <span className="text-theme-text-secondary font-medium">
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
                  <div key={cronKey} className="space-y-3 p-4 rounded-xl border border-theme-border-light bg-theme-page/50">
                    <div className="flex justify-between items-center border-b border-theme-border-light pb-2">
                      <span className="font-display font-bold text-sm text-theme-brand uppercase tracking-wider">
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
                            className={`p-3 bg-theme-card rounded-lg border border-theme-border-light space-y-2 relative $
                              !item.visible ? "opacity-60 border-dashed border-theme-brand-border" : ""
                              }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              {isEditMode ? (
                                <div className="space-y-1.5 flex-1">
                                  <input
                                    type="text"
                                    className="w-full bg-theme-page border border-theme-border-medium rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                                    value={item.descripcion.title}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.correctivo as any)[cronKey];
                                      arr[itemIdx].descripcion.title = e.target.value;
                                    })}
                                    placeholder="Título de la tarea"
                                  />
                                  <input
                                    type="text"
                                    className="w-full bg-theme-page border border-theme-border-medium rounded px-2 py-0.5 text-[11px] focus:outline-none focus:border-theme-brand text-theme-text-secondary"
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
                                  <h4 className="font-semibold text-theme-text-primary text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-theme-brand animate-pulse"></span>
                                    {item.descripcion.title}
                                  </h4>
                                  <ul className="list-disc pl-5 text-[11px] text-theme-text-muted space-y-0.5">
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
                                    className={`p-1 rounded text-xs border ${item.visible ? "text-theme-brand bg-theme-brand-light border-theme-brand-border hover:text-white hover:bg-theme-brand" : "text-theme-text-muted bg-theme-page hover:bg-theme-hover"
                                      }`}
                                  >
                                    {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  </button>
                                  <button
                                    onClick={() => handleRemoveMaintItem("correctivo", cronKey, itemIdx)}
                                    className="p-1 rounded text-theme-text-muted bg-theme-page border border-theme-border-medium hover:bg-rose-700 hover:text-rose-50 transition text-xs"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Meta params row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-50 text-[10px] font-mono text-theme-text-muted">
                              <div className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-theme-text-tertiary" />
                                <span>Responsable: </span>
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    className="bg-theme-page px-1 rounded border border-theme-border-medium focus:border-theme-brand text-theme-text-secondary focus:outline-none"
                                    value={item.responsable}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.correctivo as any)[cronKey];
                                      arr[itemIdx].responsable = e.target.value;
                                    })}
                                  />
                                ) : (
                                  <span className="text-theme-text-secondary font-medium">{item.responsable}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-theme-text-tertiary" />
                                <span>Costo Referencial: </span>
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    className="bg-theme-page px-1 rounded border border-theme-border-medium w-16 text-center focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                                    value={item["MONTO REF"]?.amount || "-"}
                                    onChange={(e) => updateEquip(draft => {
                                      const arr = (draft.ProcedimientoMantenimiento?.mantenimiento?.correctivo as any)[cronKey];
                                      if (!arr[itemIdx]["MONTO REF"]) arr[itemIdx]["MONTO REF"] = { currency: "S/.", amount: "-" };
                                      arr[itemIdx]["MONTO REF"].amount = e.target.value;
                                    })}
                                  />
                                ) : (
                                  <span className="text-theme-text-secondary font-medium">
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

          {/* TAB 4: INVENTARIO / HOJA DE VIDA / HISTORIAL LOGS */}
          {activeTab === "hojavida" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-theme-border-light pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-theme-text-primary">
                    Inventario y Hojas de Vida
                  </h3>
                  <p className="text-xs text-theme-text-muted mt-0.5">Gestión de unidades físicas y su respectivo registro de intervenciones en patrimonio.</p>
                </div>
                {isEditMode && (
                  <button
                    onClick={handleAddUnit}
                    className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded text-xs font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir Unidad
                  </button>
                )}
              </div>

              {/* Unit Tabs Selector */}
              <div className="flex flex-wrap gap-2 border-b border-theme-border-light pb-2">
                {(equipment.HojasDeVidaEquipos || []).map((unit, uIdx) => (
                  <div key={uIdx} className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedUnitIdx(uIdx)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold border transition ${selectedUnitIdx === uIdx
                        ? "focus:outline-none focus:border-theme-brand text-theme-text-primary bg-theme-brand-light"
                        : "bg-theme-page border-theme-border-medium text-theme-text-secondary hover:bg-theme-hover"
                        }`}
                    >
                      {unit.infoEquipo?.["Codigo Inventario Equipo"] || `Unidad ${uIdx + 1}`}
                    </button>
                    {isEditMode && (equipment.HojasDeVidaEquipos || []).length > 1 && (
                      <button
                        onClick={() => handleRemoveUnit(uIdx)}
                        className="p-1 rounded text-theme-brand hover:bg-theme-brand-light"
                        title="Eliminar esta unidad del inventario"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                {(!equipment.HojasDeVidaEquipos || equipment.HojasDeVidaEquipos.length === 0) && (
                  <div className="text-xs text-theme-text-tertiary py-2">No hay unidades físicas registradas en el inventario.</div>
                )}
              </div>

              {/* Selected Unit Details & Logs */}
              {equipment.HojasDeVidaEquipos && equipment.HojasDeVidaEquipos[selectedUnitIdx] && (() => {
                const unit = equipment.HojasDeVidaEquipos[selectedUnitIdx];
                const infoUnit = (unit.infoEquipo || {}) as any;

                return (
                  <div className="space-y-6">
                    {/* Inventory Details Grid */}
                    <div className="p-5 rounded-xl border border-theme-border-medium/60 bg-theme-page/50 space-y-4">
                      <h4 className="text-xs font-mono font-bold tracking-wider text-theme-brand uppercase">
                        Detalles de la Existencia / Unidad del Inventario
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-theme-text-muted block">Código Inventario Equipo</span>
                          {isEditMode ? (
                            <input
                              type="text"
                              className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 focus:outline-none focus:border-theme-brand text-theme-text-secondary font-semibold"
                              value={infoUnit["Codigo Inventario Equipo"] || ""}
                              onChange={(e) => updateEquip(draft => {
                                if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.infoEquipo) {
                                  draft.HojasDeVidaEquipos[selectedUnitIdx].infoEquipo["Codigo Inventario Equipo"] = e.target.value;
                                }
                              })}
                            />
                          ) : (
                            <strong className="text-theme-text-primary font-semibold">{infoUnit["Codigo Inventario Equipo"] || "-"}</strong>
                          )}
                        </div>

                        <div>
                          <span className="text-theme-text-muted block">Código Patrimonial</span>
                          {isEditMode ? (
                            <input
                              type="text"
                              className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 focus:outline-none focus:border-theme-brand text-theme-text-secondary font-semibold"
                              value={infoUnit["Codigo Patrimonial"] || ""}
                              onChange={(e) => updateEquip(draft => {
                                if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.infoEquipo) {
                                  draft.HojasDeVidaEquipos[selectedUnitIdx].infoEquipo["Codigo Patrimonial"] = e.target.value;
                                }
                              })}
                            />
                          ) : (
                            <strong className="text-theme-text-primary font-semibold">{infoUnit["Codigo Patrimonial"] || "-"}</strong>
                          )}
                        </div>

                        <div>
                          <span className="text-theme-text-muted block">N° de Serie</span>
                          {isEditMode ? (
                            <input
                              type="text"
                              className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 focus:outline-none focus:border-theme-brand text-theme-text-secondary font-semibold"
                              value={infoUnit["N° de serie"] || ""}
                              onChange={(e) => updateEquip(draft => {
                                if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.infoEquipo) {
                                  draft.HojasDeVidaEquipos[selectedUnitIdx].infoEquipo["N° de serie"] = e.target.value;
                                }
                              })}
                            />
                          ) : (
                            <strong className="text-theme-text-primary font-semibold">{infoUnit["N° de serie"] || "-"}</strong>
                          )}
                        </div>

                        <div>
                          <span className="text-theme-text-muted block">Ubicación</span>
                          {isEditMode ? (
                            <input
                              type="text"
                              className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 focus:outline-none focus:border-theme-brand text-theme-text-secondary font-semibold"
                              value={infoUnit.Ubicación || ""}
                              onChange={(e) => updateEquip(draft => {
                                if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.infoEquipo) {
                                  draft.HojasDeVidaEquipos[selectedUnitIdx].infoEquipo.Ubicación = e.target.value;
                                }
                              })}
                            />
                          ) : (
                            <strong className="text-theme-text-primary font-semibold">{infoUnit.Ubicación || "-"}</strong>
                          )}
                        </div>

                        <div>
                          <span className="text-theme-text-muted block">Fecha de Adquisición</span>
                          {isEditMode ? (
                            <input
                              type="text"
                              className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 focus:outline-none focus:border-theme-brand text-theme-text-secondary font-semibold"
                              value={infoUnit["FECHA DE ADQUISICIÓN"] || ""}
                              onChange={(e) => updateEquip(draft => {
                                if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.infoEquipo) {
                                  draft.HojasDeVidaEquipos[selectedUnitIdx].infoEquipo["FECHA DE ADQUISICIÓN"] = e.target.value;
                                }
                              })}
                            />
                          ) : (
                            <strong className="text-theme-text-primary font-semibold">{infoUnit["FECHA DE ADQUISICIÓN"] || "-"}</strong>
                          )}
                        </div>

                        <div>
                          <span className="text-theme-text-muted block">Modo de Adquisición</span>
                          {isEditMode ? (
                            <input
                              type="text"
                              className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 focus:outline-none focus:border-theme-brand text-theme-text-secondary font-semibold"
                              value={infoUnit["MODO DE ADQUISICIÓN"] || ""}
                              onChange={(e) => updateEquip(draft => {
                                if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.infoEquipo) {
                                  draft.HojasDeVidaEquipos[selectedUnitIdx].infoEquipo["MODO DE ADQUISICIÓN"] = e.target.value;
                                }
                              })}
                            />
                          ) : (
                            <strong className="text-theme-text-primary font-semibold">{infoUnit["MODO DE ADQUISICIÓN"] || "-"}</strong>
                          )}
                        </div>

                        <div>
                          <span className="text-theme-text-muted block">Año Fabricación</span>
                          {isEditMode ? (
                            <input
                              type="text"
                              className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 focus:outline-none focus:border-theme-brand text-theme-text-secondary font-semibold"
                              value={infoUnit["Año Fabricación"] || ""}
                              onChange={(e) => updateEquip(draft => {
                                if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.infoEquipo) {
                                  draft.HojasDeVidaEquipos[selectedUnitIdx].infoEquipo["Año Fabricación"] = e.target.value;
                                }
                              })}
                            />
                          ) : (
                            <strong className="text-theme-text-primary font-semibold">{infoUnit["Año Fabricación"] || "-"}</strong>
                          )}
                        </div>

                        <div>
                          <span className="text-theme-text-muted block">Estado de Conservación</span>
                          {isEditMode ? (
                            <select
                              className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 focus:outline-none focus:border-theme-brand text-theme-text-secondary font-semibold"
                              value={infoUnit["Estado de conservación"] || ""}
                              onChange={(e) => updateEquip(draft => {
                                if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.infoEquipo) {
                                  draft.HojasDeVidaEquipos[selectedUnitIdx].infoEquipo["Estado de conservación"] = e.target.value;
                                }
                              })}
                            >
                              <option value="">Seleccione...</option>
                              <option value="Bueno (B)">Bueno (B)</option>
                              <option value="Regular (R)">Regular (R)</option>
                              <option value="Malo (M)">Malo (M)</option>
                            </select>
                          ) : (
                            <strong className="text-theme-text-primary font-semibold">{infoUnit["Estado de conservación"] || "-"}</strong>
                          )}
                        </div>

                        <div>
                          <span className="text-theme-text-muted block">Estado de Uso</span>
                          {isEditMode ? (
                            <select
                              className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 focus:outline-none focus:border-theme-brand text-theme-text-secondary font-semibold"
                              value={infoUnit["Estado de uso"] || ""}
                              onChange={(e) => updateEquip(draft => {
                                if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.infoEquipo) {
                                  draft.HojasDeVidaEquipos[selectedUnitIdx].infoEquipo["Estado de uso"] = e.target.value;
                                }
                              })}
                            >
                              <option value="">Seleccione...</option>
                              <option value="En uso">En uso</option>
                              <option value="En desuso">En desuso</option>
                              <option value="En mantenimiento">En mantenimiento</option>
                              <option value="Baja">Baja</option>
                            </select>
                          ) : (
                            <strong className="text-theme-text-primary font-semibold">{infoUnit["Estado de uso"] || "-"}</strong>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mantenimientos / logs history of this unit */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-theme-border-light pb-2">
                        <h4 className="font-display font-semibold text-sm text-theme-text-primary">
                          Historial de Calibración, Mantenimientos y Eventos
                        </h4>
                        {isEditMode && (
                          <button
                            onClick={() => handleAddLogEntry(selectedUnitIdx)}
                            className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded text-xs font-semibold transition"
                          >
                            <Plus className="w-3 h-3" />
                            Registrar Evento
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {(unit.mantenimientos || []).map((log, logIdx) => {
                          const showLog = isEditMode || log.visible !== false;
                          if (!showLog) return null;

                          return (
                            <div
                              key={logIdx}
                              className={`p-4 rounded-xl border border-theme-border-light bg-theme-card shadow-sm space-y-4 relative ${log.visible === false ? "opacity-60 border-dashed border-theme-brand-border bg-theme-brand-light/25" : ""
                                }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-6 h-6 rounded-full bg-theme-brand-light text-theme-brand flex items-center justify-center font-mono font-bold text-xs border border-rose-100">
                                    {log.Nro}
                                  </span>
                                  {isEditMode ? (
                                    <input
                                      type="text"
                                      className="bg-theme-page border border-theme-border-medium rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                                      value={log["Actividad realizada"] || ""}
                                      onChange={(e) => updateEquip(draft => {
                                        if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.mantenimientos?.[logIdx]) {
                                          draft.HojasDeVidaEquipos[selectedUnitIdx].mantenimientos[logIdx]["Actividad realizada"] = e.target.value;
                                        }
                                      })}
                                    />
                                  ) : (
                                    <h4 className="font-semibold text-theme-text-primary text-sm">{log["Actividad realizada"] || "-"}</h4>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-theme-text-tertiary">
                                    {isEditMode ? (
                                      <input
                                        type="date"
                                        className="bg-theme-page border border-theme-border-medium rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                                        value={log.Fecha || ""}
                                        onChange={(e) => updateEquip(draft => {
                                          if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.mantenimientos?.[logIdx]) {
                                            draft.HojasDeVidaEquipos[selectedUnitIdx].mantenimientos[logIdx].Fecha = e.target.value;
                                          }
                                        })}
                                      />
                                    ) : (
                                      log.Fecha || "-"
                                    )}
                                  </span>

                                  {isEditMode && (
                                    <>
                                      <button
                                        onClick={() => updateEquip(draft => {
                                          if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.mantenimientos?.[logIdx]) {
                                            draft.HojasDeVidaEquipos[selectedUnitIdx].mantenimientos[logIdx].visible = draft.HojasDeVidaEquipos[selectedUnitIdx].mantenimientos[logIdx].visible !== false ? false : true;
                                          }
                                        })}
                                        className={`p-1 rounded text-xs border ${log.visible !== false ? "text-theme-brand bg-theme-brand-light border-theme-brand-border hover:text-white hover:bg-theme-brand" : "text-theme-text-muted bg-theme-page hover:bg-theme-hover"
                                          }`}
                                      >
                                        {log.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                      </button>
                                      <button
                                        onClick={() => handleRemoveLogEntry(selectedUnitIdx, logIdx)}
                                        className="p-1 rounded text-theme-text-muted bg-theme-page border border-theme-border-medium hover:bg-rose-700 hover:text-rose-50 transition text-xs"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="text-xs text-theme-text-secondary space-y-2 pl-8">
                                <div>
                                  <span className="text-theme-text-tertiary font-medium block">Observaciones e Informe Técnico</span>
                                  {isEditMode ? (
                                    <textarea
                                      rows={2}
                                      className="w-full bg-theme-page border border-theme-border-medium rounded px-2 py-1 text-xs focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                                      value={log.Observaciones || ""}
                                      onChange={(e) => updateEquip(draft => {
                                        if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.mantenimientos?.[logIdx]) {
                                          draft.HojasDeVidaEquipos[selectedUnitIdx].mantenimientos[logIdx].Observaciones = e.target.value;
                                        }
                                      })}
                                    />
                                  ) : (
                                    <p className="leading-relaxed mt-0.5 text-theme-text-secondary font-medium">{log.Observaciones || "-"}</p>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-x-8 gap-y-1.5 pt-2 border-t border-slate-50 text-[10px] text-theme-text-tertiary font-mono">
                                  <span>
                                    Soporte:{" "}
                                    {isEditMode ? (
                                      <input
                                        type="text"
                                        className="bg-theme-page px-1 rounded border border-theme-border-medium focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                                        value={log.Responsable || ""}
                                        onChange={(e) => updateEquip(draft => {
                                          if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]?.mantenimientos?.[logIdx]) {
                                            draft.HojasDeVidaEquipos[selectedUnitIdx].mantenimientos[logIdx].Responsable = e.target.value;
                                          }
                                        })}
                                      />
                                    ) : (
                                      <strong className="text-theme-text-secondary">{log.Responsable || "-"}</strong>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {(!unit.mantenimientos || unit.mantenimientos.length === 0) && (
                          <div className="text-center py-8 bg-theme-page rounded-xl border border-dashed border-theme-border-medium text-theme-text-tertiary text-xs">
                            No hay registros de calibraciones ni reparaciones técnicas previas para esta unidad.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Elaborated / Approved by signatures */}
                    <div className="p-4 rounded-xl border border-theme-border-light bg-theme-page/70 text-xs text-theme-text-muted space-y-2 mt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span>Elaborado por: </span>
                          {isEditMode ? (
                            <input
                              type="text"
                              className="bg-theme-card px-1.5 py-0.5 rounded border border-theme-border-medium text-xs text-theme-text-secondary w-full focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                              value={unit.HechoPor || ""}
                              onChange={(e) => updateEquip(draft => {
                                if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]) {
                                  draft.HojasDeVidaEquipos[selectedUnitIdx].HechoPor = e.target.value;
                                }
                              })}
                            />
                          ) : (
                            <strong className="text-theme-text-secondary">{unit.HechoPor || "-"}</strong>
                          )}
                        </div>
                        <div>
                          <span>Aprobado por: </span>
                          {isEditMode ? (
                            <input
                              type="text"
                              className="bg-theme-card px-1.5 py-0.5 rounded border border-theme-border-medium text-xs text-theme-text-secondary w-full focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                              value={unit.RevisadoPor || ""}
                              onChange={(e) => updateEquip(draft => {
                                if (draft.HojasDeVidaEquipos?.[selectedUnitIdx]) {
                                  draft.HojasDeVidaEquipos[selectedUnitIdx].RevisadoPor = e.target.value;
                                }
                              })}
                            />
                          ) : (
                            <strong className="text-theme-text-secondary">{unit.RevisadoPor || "-"}</strong>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-theme-border-light bg-theme-page/80 flex justify-end gap-3 text-xs">
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
