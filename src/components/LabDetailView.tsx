/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Building2,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Cpu,
  Laptop,
  User,
  Phone,
  FileCode,
  Sliders,
  ExternalLink,
  FileText,
  Camera,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Lab, Equipo, Software, PersonalTecnico, Responsable } from "../types";

interface LabDetailViewProps {
  lab: Lab;
  labIndex: number;
  subSection: "info" | "equipos" | "software";
  isEditMode: boolean;
  onUpdate: (path: (string | number)[], value: any) => void;
  onNavigate: (path: string) => void;
  onOpenEquipment: (equipmentIndex: number) => void;
  onZoomImage: (images: string | string[], index?: number) => void;
}

export default function LabDetailView({
  lab,
  labIndex,
  subSection,
  isEditMode,
  onUpdate,
  onNavigate,
  onOpenEquipment,
  onZoomImage
}: LabDetailViewProps) {
  const info = (lab.infoAmbiente || {}) as any;

  // Equipment Search & Filters local states
  const [equipSearch, setEquipSearch] = React.useState("");
  const [equipBrandFilter, setEquipBrandFilter] = React.useState("todas");
  const [equipTypeFilter, setEquipTypeFilter] = React.useState("todos");

  // Software Search local state
  const [softSearch, setSoftSearch] = React.useState("");

  // Photo gallery pagination state
  const [photoPage, setPhotoPage] = React.useState(0);
  const [visitedPages, setVisitedPages] = React.useState<Set<number>>(new Set([0]));

  React.useEffect(() => {
    setPhotoPage(0);
    setVisitedPages(new Set([0]));
  }, [labIndex]);

  const handlePageChange = (newPage: number) => {
    setPhotoPage(newPage);
    setVisitedPages(prev => {
      const next = new Set(prev);
      next.add(newPage);
      return next;
    });
  };

  // Tabs for lab section
  const tabs = React.useMemo(() => {
    const list = [
      { id: "info", label: "ℹ️ Ambiente" }
    ];

    const equipCount = lab.equipos?.filter(e => isEditMode || e.visible !== false).length || 0;
    if (isEditMode || equipCount > 0) {
      list.push({ id: "equipos", label: `🛠️ Equipos e Instrumentos (${equipCount})` });
    }

    const softCount = lab.software?.filter(s => isEditMode || s.visible !== false).length || 0;
    if (isEditMode || softCount > 0) {
      list.push({ id: "software", label: `💻 Software y Licencias (${softCount})` });
    }

    return list;
  }, [lab.equipos, lab.software, isEditMode]);

  // Fallback redirect if current tab is hidden in read mode
  React.useEffect(() => {
    if (!isEditMode) {
      if (subSection === "equipos" && (!lab.equipos || lab.equipos.filter(e => e.visible !== false).length === 0)) {
        onNavigate(`/lab/${info["CÓDIGO DE LABORATORIO O TALLER"]}/info`);
      } else if (subSection === "software" && (!lab.software || lab.software.filter(s => s.visible !== false).length === 0)) {
        onNavigate(`/lab/${info["CÓDIGO DE LABORATORIO O TALLER"]}/info`);
      }
    }
  }, [subSection, lab.equipos, lab.software, isEditMode, info, onNavigate]);

  // Helper to get unique equipment brands
  const equipmentBrands = React.useMemo(() => {
    const brands = new Set<string>();
    lab.equipos?.forEach(eq => {
      if (eq.infoEquipo?.Marca) brands.add(eq.infoEquipo.Marca);
    });
    return Array.from(brands);
  }, [lab.equipos]);

  // Helper to get unique equipment types
  const equipmentTypes = React.useMemo(() => {
    const types = new Set<string>();
    lab.equipos?.forEach(eq => {
      if (eq.infoEquipo?.["Tipo de equipo:"]) types.add(eq.infoEquipo["Tipo de equipo:"]);
    });
    return Array.from(types);
  }, [lab.equipos]);

  // Filtered Equipment List
  const filteredEquipos = React.useMemo(() => {
    return (lab.equipos || []).map((eq, idx) => ({ eq, idx })).filter(({ eq }) => {
      const isVisible = isEditMode || eq.visible !== false;
      const matchesSearch = eq["NOMBRE DEL EQUIPO"]?.toLowerCase().includes(equipSearch.toLowerCase()) ||
        eq.infoEquipo?.Modelo?.toLowerCase().includes(equipSearch.toLowerCase()) ||
        eq.infoEquipo?.["Codigo Inventario Equipo"]?.toLowerCase().includes(equipSearch.toLowerCase());

      const matchesBrand = equipBrandFilter === "todas" || eq.infoEquipo?.Marca === equipBrandFilter;
      const matchesType = equipTypeFilter === "todos" || eq.infoEquipo?.["Tipo de equipo:"] === equipTypeFilter;

      return isVisible && matchesSearch && matchesBrand && matchesType;
    });
  }, [lab.equipos, isEditMode, equipSearch, equipBrandFilter, equipTypeFilter]);

  // Filtered Software List
  const filteredSoftware = React.useMemo(() => {
    return (lab.software || []).map((sw, idx) => ({ sw, idx })).filter(({ sw }) => {
      const isVisible = isEditMode || sw.visible !== false;
      const matchesSearch = sw["NOMBRE DEL SOFTWARE"]?.toLowerCase().includes(softSearch.toLowerCase()) ||
        sw["TIPO DE LICENCIA"]?.toLowerCase().includes(softSearch.toLowerCase());

      return isVisible && matchesSearch;
    });
  }, [lab.software, isEditMode, softSearch]);

  // Add Equipment action
  const handleAddEquipment = () => {
    const newEquip: Equipo = {
      visible: true,
      "Nº DE EQUIPOS": "1",
      "NOMBRE DEL EQUIPO": "Nuevo Instrumento de Medición",
      COMENTARIOS: "Ingrese una descripción básica del equipo.",
      infoEquipo: {
        "Denominacion Patrimonial": "SISTEMA DE PRUEBA",
        "Tipo de equipo:": "Equipo de Medida",
        Fabricante: "Importador / Fabricante",
        Marca: "Generica",
        Modelo: "NEW-MODEL"
      },
      Fotografias: ["https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&q=80&w=400"],
      caracteristicas: [
        { Caracteristica: "Resolución", Descripcion: "10 bits" }
      ],
      ProcedimientoMantenimiento: {
        visible: true,
        "Principio de Operacion": "Describir el principio de operación aquí...",
        "Instalaciones Requeridas": "Describir las instalaciones aquí...",
        Partes: "### Partes Principales:\n\n1. Parte A\n2. Parte B",
        mantenimiento: {
          visible: true,
          preventivo: { enCadaUso: [], semanal: [], mensual: [], anual: [] },
          correctivo: { enCadaUso: [], semanal: [], mensual: [], anual: [] }
        }
      },
      HojasDeVidaEquipos: [
        {
          visible: true,
          infoEquipo: {
            "Codigo Inventario Equipo": "INV-NEW",
            "FECHA DE ADQUISICIÓN": "2026",
            "MODO DE ADQUISICIÓN": "COMPRA",
            Ubicación: "Mesa 01"
          },
          mantenimientos: [],
          nota: "Mantenimientos rústicos",
          ultimaActualizacion: { year: 2026, month: 7, day: 2 },
          HechoPor: "Técnico de Turno",
          RevisadoPor: "Director"
        }
      ]
    };

    const updated = [...(lab.equipos || []), newEquip];
    onUpdate(["labs", labIndex, "equipos"], updated);
  };

  // Delete Equipment action
  const handleRemoveEquipment = (indexToDelete: number) => {
    const updated = (lab.equipos || []).filter((_, idx) => idx !== indexToDelete);
    onUpdate(["labs", labIndex, "equipos"], updated);
  };

  // Add Software action
  const handleAddSoftware = () => {
    const newSoft: Software = {
      visible: true,
      "Nº DE LICENCIAS": "10",
      VERSIÓN: "1.0",
      "NOMBRE DEL SOFTWARE": "Nuevo Programa de Simulación",
      "TIPO DE LICENCIA": "Licencia Educativa",
      Fotografias: ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400"],
      COMENTARIOS: "Ingresa comentarios del licenciamiento del software."
    };

    const updated = [...(lab.software || []), newSoft];
    onUpdate(["labs", labIndex, "software"], updated);
  };

  // Delete Software action
  const handleRemoveSoftware = (indexToDelete: number) => {
    const updated = (lab.software || []).filter((_, idx) => idx !== indexToDelete);
    onUpdate(["labs", labIndex, "software"], updated);
  };

  return (
    <div className="space-y-8 animate-fade-in">

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-theme-brand to-theme-brand-hover border border-theme-border-medium/10 text-white shadow p-6 md:p-8 transition-colors duration-200">
        <div className="absolute inset-0">
          <img
            src={info.Fotografias?.[0] || "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800"}
            alt={info["NOMBRE DEL LABORATORIO O TALLER"]}
            className="w-full h-full object-cover cursor-zoom-in"
            referrerPolicy="no-referrer"
            onClick={() => onZoomImage(info.Fotografias?.[0] || "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800")}
          />
        </div>
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Lab meta header info */}
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-white bg-theme-card/20 border border-white/10 px-2.5 py-0.5 rounded uppercase tracking-wider">
              {info["CÓDIGO DE LABORATORIO O TALLER"]}
            </span>
            <span className="text-xs text-theme-text-tertiary">•</span>
            <span className="text-xs font-bold tracking-wider uppercase text-slate-300 font-mono">
              {info["TIPO DE LABORATORIO O TALLER"]}
            </span>
          </div>

          {isEditMode ? (
            <textarea
              className="w-full bg-theme-card/10 border border-white/20 rounded px-3 py-1.5 text-xl md:text-2xl font-display font-bold text-white focus:outline-none focus:border-white/50"
              rows={2}
              value={info["NOMBRE DEL LABORATORIO O TALLER"] || ""}
              onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "NOMBRE DEL LABORATORIO O TALLER"], e.target.value)}
            />
          ) : (
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white leading-tight">
              {info["NOMBRE DEL LABORATORIO O TALLER"] || ""}
            </h1>
          )}

          <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-sans flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-theme-brand flex-shrink-0" />
            {info["REFERENCIA DE UBICACIÓN"] || ""}
          </p>
        </div>
      </div>

      {/* Navigation tabs inside specific lab */}
      <div className="flex border-b border-theme-border-medium overflow-x-auto gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onNavigate(`/lab/${info["CÓDIGO DE LABORATORIO O TALLER"] || ""}/${tab.id}`)}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition duration-200 whitespace-nowrap cursor-pointer ${
              subSection === tab.id
              ? "border-theme-brand text-theme-brand font-bold"
              : "border-transparent text-theme-text-muted hover:text-theme-text-primary"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: INFORMACIÓN DE AMBIENTE */}
      {subSection === "info" && (() => {
        const showCodAmbiente = isEditMode || (info["CODIGO PATRIMONIO AMBIENTE"] && info["CODIGO PATRIMONIO AMBIENTE"] !== "-");
        const showAforo = isEditMode || (info.AFORO && info.AFORO !== "-");
        const showArea = isEditMode || (info["ÁREA (m2)"] && info["ÁREA (m2)"] !== "-");
        const showInternet = isEditMode || (info["SERVICIO DE INTERNET (SI/NO)"] && info["SERVICIO DE INTERNET (SI/NO)"] !== "-");

        const hasMetrics = showCodAmbiente || showAforo || showArea || showInternet;

        const hasDescription = isEditMode || (info.COMENTARIOS && info.COMENTARIOS !== "Sin descripción asignada." && info.COMENTARIOS !== "-");
        const hasPhotos = isEditMode || (info.Fotografias && info.Fotografias.filter((url: string) => url && url !== "https://").length > 0);
        const hasPrograms = isEditMode || (info["PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"] && info["PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"].length > 0);
        const hasDocs = isEditMode || (info.documentos && info.documentos.length > 0);

        const hasResponsible = info["RESPONSABLE DEL LABORATORIO O TALLER"] && (isEditMode || (info["RESPONSABLE DEL LABORATORIO O TALLER"].visible !== false && (info["RESPONSABLE DEL LABORATORIO O TALLER"].NOMBRE || info["RESPONSABLE DEL LABORATORIO O TALLER"]["NUMERO DE CONTACTO"])));
        const hasTech = isEditMode || (info["PERSONAL TÉCNICO"] && info["PERSONAL TÉCNICO"].some(tech => tech.visible !== false && (tech.NOMBRE || tech["NUMERO DE CONTACTO"])));
        const hasVerifier = info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"] && (isEditMode || (info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"].visible !== false && (info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"].NOMBRE || info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"]["NUMERO DE CONTACTO"])));

        const hasRightSidebar = hasResponsible || hasTech || hasVerifier;

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* Main info panel */}
            <div className={hasRightSidebar ? "lg:col-span-8 space-y-6" : "lg:col-span-12 space-y-6"}>

              {/* Galería de Fotos del Ambiente */}
              {hasPhotos && (
                <div className="bg-theme-card rounded-xl p-6 border border-theme-border-light shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-theme-border-light pb-3">
                    <h3 className="text-sm font-semibold text-theme-text-primary flex items-center gap-2">
                      <Camera className="w-4 h-4 focus:border-theme-brand text-theme-brand" />
                      Galería del Ambiente
                    </h3>
                    {isEditMode && (
                      <button
                        onClick={() => {
                          const updated = [...(info.Fotografias || []), "https://"];
                          onUpdate(["labs", labIndex, "infoAmbiente", "Fotografias"], updated);
                        }}
                        className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-2 py-1 rounded text-xs font-semibold transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Agregar
                      </button>
                    )}
                  </div>

                  {/* Edit URL mode */}
                  {isEditMode && (info.Fotografias || []).length > 0 && (
                    <div className="space-y-2 bg-theme-page p-3 rounded-lg border border-theme-border-medium">
                      <span className="text-[10px] font-bold text-theme-text-tertiary uppercase tracking-wider block">Enlaces de Fotos (URLs):</span>
                      {(info.Fotografias || []).map((url: string, imgIdx: number) => (
                        <div key={imgIdx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            className="flex-1 bg-theme-card border border-theme-border-medium rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                            value={url || ""}
                            onChange={(e) => {
                              const updated = [...(info.Fotografias || [])];
                              updated[imgIdx] = e.target.value;
                              onUpdate(["labs", labIndex, "infoAmbiente", "Fotografias"], updated);
                            }}
                            placeholder="https://ejemplo.com/foto.jpg"
                          />
                          <button
                            onClick={() => {
                              const updated = (info.Fotografias || []).filter((_: any, i: number) => i !== imgIdx);
                              onUpdate(["labs", labIndex, "infoAmbiente", "Fotografias"], updated);
                            }}
                            className="p-1 text-theme-text-tertiary hover:text-theme-brand transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Photos Grid */}
                  {(() => {
                    const validPhotos = (info.Fotografias || []).filter((url: string) => url && url !== "https://");
                    const totalPages = Math.ceil(validPhotos.length / 5);

                    return (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {validPhotos.map((url: string, photoIdx: number) => {
                            const pageIdx = Math.floor(photoIdx / 5);
                            const isVisited = visitedPages.has(pageIdx);
                            const isActive = pageIdx === photoPage;

                            if (!isVisited) return null;

                            return (
                              <div
                                key={photoIdx}
                                style={{ display: isActive ? "flex" : "none" }}
                                className="relative group rounded-xl overflow-hidden border border-theme-border-light bg-theme-page shadow-sm aspect-video items-center justify-center p-1 cursor-zoom-in"
                                onClick={() => onZoomImage(validPhotos, photoIdx)}
                              >
                                <img
                                  src={url}
                                  alt={`Ambiente - Foto ${photoIdx + 1}`}
                                  className="object-cover w-full h-full rounded-lg group-hover:scale-105 transition duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=400";
                                  }}
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-end p-2 rounded-xl">
                                  <span className="text-[10px] text-white font-semibold truncate bg-slate-900/80 px-1.5 py-0.5 rounded">
                                    Ampliar Foto {photoIdx + 1}
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          {validPhotos.length === 0 && (
                            <div className="col-span-full text-center py-6 text-theme-text-tertiary text-xs">
                              No hay fotografías registradas de este ambiente.
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

              {/* Environment Metrics Grid */}
              {hasMetrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-theme-page p-5 rounded-xl border border-theme-border-light">
                  {showCodAmbiente && (
                    <div>
                      <span className="text-[11px] text-theme-text-tertiary font-medium block">Código Ambiente</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                          value={info["CODIGO PATRIMONIO AMBIENTE"] || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "CODIGO PATRIMONIO AMBIENTE"], e.target.value)}
                        />
                      ) : (
                        <strong className="text-theme-text-primary font-mono text-sm">{info["CODIGO PATRIMONIO AMBIENTE"]}</strong>
                      )}
                    </div>
                  )}
                  {showAforo && (
                    <div>
                      <span className="text-[11px] text-theme-text-tertiary font-medium block">Capacidad Aforo</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                          value={info.AFORO || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "AFORO"], e.target.value)}
                        />
                      ) : (
                        <strong className="text-theme-text-primary text-sm">{info.AFORO} personas</strong>
                      )}
                    </div>
                  )}
                  {showArea && (
                    <div>
                      <span className="text-[11px] text-theme-text-tertiary font-medium block">Área Física (m²)</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                          value={info["ÁREA (m2)"] || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "ÁREA (m2)"], e.target.value)}
                        />
                      ) : (
                        <strong className="text-theme-text-primary text-sm">{info["ÁREA (m2)"]}</strong>
                      )}
                    </div>
                  )}
                  {showInternet && (
                    <div>
                      <span className="text-[11px] text-theme-text-tertiary font-medium block">Acceso a Internet</span>
                      {isEditMode ? (
                        <select
                          className="w-full bg-theme-card border border-theme-border-medium rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none focus:border-theme-brand focus:border-theme-brand text-theme-text-primary"
                          value={info["SERVICIO DE INTERNET (SI/NO)"] || "Sí"}
                          onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "SERVICIO DE INTERNET (SI/NO)"], e.target.value)}
                        >
                          <option value="Sí">Sí</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <strong className="text-theme-text-primary text-sm flex items-center gap-1">
                          {info["SERVICIO DE INTERNET (SI/NO)"]?.toLowerCase() === "sí" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          {info["SERVICIO DE INTERNET (SI/NO)"]}
                        </strong>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Description Card */}
              {hasDescription && (
                <div className="bg-theme-card rounded-xl p-6 border border-theme-border-light shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-theme-text-primary">Descripción General del Ambiente</h3>
                  {isEditMode ? (
                    <textarea
                      rows={4}
                      className="w-full bg-theme-page border border-theme-border-medium rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-theme-brand text-theme-text-primary"
                      value={info.COMENTARIOS || ""}
                      onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "COMENTARIOS"], e.target.value)}
                    />
                  ) : (
                    <p className="text-theme-text-secondary text-sm leading-relaxed whitespace-pre-line">
                      {info.COMENTARIOS || "Sin descripción asignada."}
                    </p>
                  )}
                </div>
              )}


              {/* Program details */}
              {hasPrograms && (
                <div className="bg-theme-card rounded-xl p-6 border border-theme-border-light shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-theme-text-primary">Programas de Estudios Vinculados</h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {info["PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"]?.map((prog, pidx) => (
                      <span key={pidx} className="px-3 py-1 bg-theme-hover rounded text-xs font-mono font-bold text-theme-text-secondary">
                        Programa: {prog}
                      </span>
                    ))}
                    <span className="px-3 py-1 bg-theme-brand-light focus:border-theme-brand text-theme-text-primary rounded text-xs font-semibold">
                      Cantidad: {info["CANTIDAD DE PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"]} Programa
                    </span>
                  </div>
                </div>
              )}

              {/* Documentos y Enlaces del Ambiente */}
              {hasDocs && (
                <div className="bg-theme-card rounded-xl p-6 border border-theme-border-light shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-theme-border-light pb-3">
                    <h3 className="text-sm font-semibold text-theme-text-primary flex items-center gap-2">
                      <FileText className="w-4 h-4 focus:border-theme-brand text-theme-brand" />
                      Documentos del Ambiente
                    </h3>
                    {isEditMode && (
                      <button
                        onClick={() => {
                          const updated = [...(info.documentos || []), { titulo: "Nuevo Documento", url: "https://" }];
                          onUpdate(["labs", labIndex, "infoAmbiente", "documentos"], updated);
                        }}
                        className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-2 py-1 rounded text-xs font-semibold transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Agregar
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {(info.documentos || []).map((doc: any, idx: number) => (
                      <div title={doc.titulo || "Documento Técnico"} key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-theme-page border border-theme-border-medium transition group">
                        <div className="flex-1 min-w-0 pr-4">
                          {isEditMode ? (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                                value={doc.titulo || ""}
                                onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "documentos", idx, "titulo"], e.target.value)}
                                placeholder="Nombre del documento"
                              />
                              <input
                                type="text"
                                className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-[10px] text-theme-text-muted focus:outline-none font-mono focus:border-theme-brand"
                                value={doc.url || ""}
                                onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "documentos", idx, "url"], e.target.value)}
                                placeholder="Enlace URL"
                              />
                            </div>
                          ) : (
                            <a
                              href={doc.url || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs font-semibold text-theme-text-primary hover:text-theme-brand group"
                            >
                              <FileText className="w-4 h-4 text-theme-text-tertiary group-hover:text-theme-brand flex-shrink-0" />
                              <span className="truncate">{doc.titulo || "Documento sin título"}</span>
                              <ExternalLink className="w-3 h-3 text-theme-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          )}
                        </div>
                        {isEditMode && (
                          <button
                            onClick={() => {
                              const updated = (info.documentos || []).filter((_: any, dIdx: number) => dIdx !== idx);
                              onUpdate(["labs", labIndex, "infoAmbiente", "documentos"], updated);
                            }}
                            className="p-1 text-theme-text-tertiary hover:text-theme-brand rounded transition hover:bg-theme-brand-light"
                            title="Eliminar documento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    {(!info.documentos || info.documentos.length === 0) && (
                      <div className="text-center py-6 text-theme-text-tertiary text-xs">
                        No hay documentos del ambiente registrados.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar: responsible personnel */}
            {hasRightSidebar && (
              <div className="lg:col-span-4 space-y-6">
                {/* Encargado Docente */}
                {hasResponsible && (
                  <div
                    className={`bg-theme-card rounded-xl p-5 border border-theme-border-light shadow-sm space-y-4 relative ${
                      info["RESPONSABLE DEL LABORATORIO O TALLER"]?.visible === false ? "opacity-60 border-dashed" : ""
                      }`}
                  >
                    <div className="flex justify-between items-center border-b border-theme-border-light pb-2">
                      <span className="text-xs font-bold font-mono text-theme-text-tertiary uppercase tracking-wide">
                        Responsable de Turno
                      </span>
                      {isEditMode && (
                        <button
                          onClick={() => onUpdate(["labs", labIndex, "infoAmbiente", "RESPONSABLE DEL LABORATORIO O TALLER", "visible"], info["RESPONSABLE DEL LABORATORIO O TALLER"]?.visible !== false ? false : true)}
                          className="p-1 rounded text-xs border bg-theme-page text-theme-text-muted hover:bg-theme-hover"
                        >
                          {info["RESPONSABLE DEL LABORATORIO O TALLER"]?.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    <div className="flex gap-3.5 items-center">
                      <div className="w-10 h-10 rounded-full bg-theme-brand-light border border-theme-brand-border text-theme-brand flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {isEditMode ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              className="w-full bg-theme-page border border-theme-border-medium rounded px-2 py-0.5 text-xs font-semibold focus:border-theme-brand text-theme-text-primary"
                              value={info["RESPONSABLE DEL LABORATORIO O TALLER"].NOMBRE || ""}
                              onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "RESPONSABLE DEL LABORATORIO O TALLER", "NOMBRE"], e.target.value)}
                            />
                            <input
                              type="text"
                              className="w-full bg-theme-page border border-theme-border-medium rounded px-2 py-0.5 text-[10px] focus:border-theme-brand text-theme-text-secondary"
                              value={info["RESPONSABLE DEL LABORATORIO O TALLER"]["NUMERO DE CONTACTO"] || ""}
                              onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "RESPONSABLE DEL LABORATORIO O TALLER", "NUMERO DE CONTACTO"], e.target.value)}
                            />
                          </div>
                        ) : (
                          <>
                            {info["RESPONSABLE DEL LABORATORIO O TALLER"].NOMBRE && (
                              <h4 className="text-sm font-semibold text-theme-text-primary truncate">
                                {info["RESPONSABLE DEL LABORATORIO O TALLER"].NOMBRE}
                              </h4>
                            )}
                            {info["RESPONSABLE DEL LABORATORIO O TALLER"]["NUMERO DE CONTACTO"] && (
                              <span className="text-xs text-theme-text-muted flex items-center gap-1 mt-0.5 font-mono">
                                <Phone className="w-3 h-3 text-theme-brand" />
                                {info["RESPONSABLE DEL LABORATORIO O TALLER"]["NUMERO DE CONTACTO"]}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Técnico Encargado list */}
                {hasTech && (
                  <div className="bg-theme-card rounded-xl p-5 border border-theme-border-light shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-theme-border-light pb-2">
                      <span className="text-xs font-bold font-mono text-theme-text-tertiary uppercase tracking-wide">
                        Soporte Técnico
                      </span>
                      {isEditMode && (
                        <button
                          onClick={() => {
                            const newT: PersonalTecnico = { visible: true, NOMBRE: "Nuevo Técnico", "NUMERO DE CONTACTO": "Contacto", "CORREO": "correo@unsa.edu.pe" };
                            const updated = [...(info["PERSONAL TÉCNICO"] || []), newT];
                            onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL TÉCNICO"], updated);
                          }}
                          className="p-1 rounded text-[10px] border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-0.5 font-semibold cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Añadir
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {info["PERSONAL TÉCNICO"]?.map((tech, techIdx) => {
                        const showTech = isEditMode || tech.visible !== false;
                        if (!showTech) return null;

                        return (
                          <div
                            key={techIdx}
                            className={`flex gap-3 items-center justify-between p-2.5 rounded-lg bg-theme-page/70 border border-theme-border-light relative ${
                              tech.visible === false ? "opacity-60 border-dashed" : ""
                              }`}
                          >
                            <div className="flex gap-2.5 items-center min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-full bg-theme-hover flex items-center justify-center text-theme-text-muted">
                                <User className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                {isEditMode ? (
                                  <div className="space-y-1">
                                    <input
                                      type="text"
                                      className="w-full bg-theme-card border border-theme-border-medium rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                                      value={tech.NOMBRE || ""}
                                      onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL TÉCNICO", techIdx, "NOMBRE"], e.target.value)}
                                    />
                                    <input
                                      type="text"
                                      className="w-full bg-theme-card border border-theme-border-medium rounded px-1.5 py-0.5 text-[9px] focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                                      value={tech["NUMERO DE CONTACTO"] || ""}
                                      onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL TÉCNICO", techIdx, "NUMERO DE CONTACTO"], e.target.value)}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    {tech.NOMBRE && <h4 className="text-xs font-semibold text-theme-text-primary truncate">{tech.NOMBRE}</h4>}
                                    {tech["NUMERO DE CONTACTO"] && (
                                      <p className="text-[10px] text-theme-text-muted flex items-center gap-0.5 font-mono focus:border-theme-brand text-theme-text-secondary">
                                        <Phone className="w-2.5 h-2.5 text-theme-brand" />
                                        {tech["NUMERO DE CONTACTO"]}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {isEditMode && (
                              <div className="flex items-center gap-0.5">
                                <button
                                  onClick={() => onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL TÉCNICO", techIdx, "visible"], !tech.visible)}
                                  className="p-1 text-theme-text-tertiary hover:text-theme-text-secondary"
                                >
                                  {tech.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                </button>
                                <button
                                  onClick={() => {
                                    const updated = info["PERSONAL TÉCNICO"]?.filter((_, tIdx) => tIdx !== techIdx);
                                    onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL TÉCNICO"], updated);
                                  }}
                                  className="p-1 text-theme-text-tertiary hover:text-theme-brand"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Verificador de CBC III */}
                {hasVerifier && (
                  <div
                    className={`bg-theme-card rounded-xl p-5 border border-theme-border-light shadow-sm space-y-4 relative ${
                      info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"]?.visible === false ? "opacity-60 border-dashed" : ""
                      }`}
                  >
                    <div className="flex justify-between items-center border-b border-theme-border-light pb-2">
                      <span className="text-[10px] font-bold font-mono text-theme-text-tertiary uppercase tracking-wide">
                        Verificador CBC III (Calidad)
                      </span>
                      {isEditMode && (
                        <button
                          onClick={() => onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL ASIGNADO PARA VERIFICAR LA CBC III", "visible"], info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"]?.visible !== false ? false : true)}
                          className="p-1 rounded text-xs border bg-theme-page text-theme-text-muted"
                        >
                          {info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"]?.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    <div className="flex gap-3.5 items-center">
                      <div className="w-9 h-9 rounded-full bg-theme-brand-light text-theme-brand flex items-center justify-center">
                        <User className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {isEditMode ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              className="w-full bg-theme-page border border-theme-border-medium rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                              value={info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"].NOMBRE || ""}
                              onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL ASIGNADO PARA VERIFICAR LA CBC III", "NOMBRE"], e.target.value)}
                            />
                            <input
                              type="text"
                              className="w-full bg-theme-page border border-theme-border-medium rounded px-2 py-0.5 text-[10px] focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                              value={info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"]["NUMERO DE CONTACTO"] || ""}
                              onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL ASIGNADO PARA VERIFICAR LA CBC III", "NUMERO DE CONTACTO"], e.target.value)}
                            />
                          </div>
                        ) : (
                          <>
                            {info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"].NOMBRE && (
                              <h4 className="text-xs font-semibold text-theme-text-primary truncate">
                                {info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"].NOMBRE}
                              </h4>
                            )}
                            {info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"]["NUMERO DE CONTACTO"] && (
                              <span className="text-[11px] text-theme-text-muted flex items-center gap-1 mt-0.5 font-mono">
                                <Phone className="w-2.5 h-2.5 text-theme-brand" />
                                {info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"]["NUMERO DE CONTACTO"]}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB 2: EQUIPOS E INSTRUMENTOS */}
      {subSection === "equipos" && (
        <div className="space-y-6 animate-fade-in">

          {/* Filters Bar */}
          <div className="bg-theme-page p-4 rounded-xl border border-theme-border-light flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-theme-text-tertiary" />
              <input
                type="text"
                className="w-full bg-theme-card border border-theme-border-medium rounded-lg pl-9 pr-3 py-2 text-xs text-theme-text-secondary placeholder-slate-400 focus:outline-none focus:border-theme-brand text-theme-text-primary transition"
                placeholder="Buscar por equipo, modelo, patrimonio..."
                value={equipSearch}
                onChange={(e) => setEquipSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Brand Select */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-theme-text-tertiary">Marca:</span>
                <select
                  className="bg-theme-card border border-theme-border-medium px-2 py-1.5 rounded-lg focus:outline-none focus:border-theme-brand text-theme-text-secondary font-medium"
                  value={equipBrandFilter}
                  onChange={(e) => setEquipBrandFilter(e.target.value)}
                >
                  <option value="todas">Todas</option>
                  {equipmentBrands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Type Select */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-theme-text-tertiary">Tipo:</span>
                <select
                  className="bg-theme-card border border-theme-border-medium px-2 py-1.5 rounded-lg focus:outline-none focus:border-theme-brand text-theme-text-secondary font-medium"
                  value={equipTypeFilter}
                  onChange={(e) => setEquipTypeFilter(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  {equipmentTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {isEditMode && (
                <button
                  onClick={handleAddEquipment}
                  className="ml-auto md:ml-0 flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir Equipo
                </button>
              )}
            </div>
          </div>

          {/* Equipments list grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEquipos.map(({ eq, idx }) => (
              <div
                key={idx}
                className={`bg-theme-card rounded-xl border border-theme-border-light shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition relative ${
                  eq.visible === false ? "opacity-60 ring-2 ring-theme-brand-border border-dashed" : ""
                  }`}
              >
                {eq.visible === false && (
                  <div className="absolute top-3 left-3 z-10 text-[10px] font-mono font-bold text-theme-brand bg-theme-brand-light px-2 py-0.5 rounded shadow">
                    OCULTO
                  </div>
                )}

                <div className="p-5 space-y-4">
                  {/* Photo & title */}
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-lg bg-theme-hover overflow-hidden flex-shrink-0 border border-theme-border-light">
                      <img
                        src={eq.Fotografias?.[0] || "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&q=80&w=150"}
                        alt={eq["NOMBRE DEL EQUIPO"]}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      {isEditMode ? (
                        <>
                          <span className="text-[10px] font-mono tracking-widest text-theme-text-tertiary block uppercase">
                            Código: {eq.HojasDeVidaEquipos?.[0]?.infoEquipo?.["Codigo Inventario Equipo"] || "N/A"}
                          </span>
                          <input
                            type="text"
                            className="w-full bg-theme-page border border-theme-border-medium rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                            value={eq["NOMBRE DEL EQUIPO"] || ""}
                            onChange={(e) => onUpdate(["labs", labIndex, "equipos", idx, "NOMBRE DEL EQUIPO"], e.target.value)}
                          />
                        </>
                      ) : (
                        <>
                          {eq.HojasDeVidaEquipos?.[0]?.infoEquipo?.["Codigo Inventario Equipo"] &&
                            eq.HojasDeVidaEquipos[0].infoEquipo["Codigo Inventario Equipo"] !== "-" &&
                            eq.HojasDeVidaEquipos[0].infoEquipo["Codigo Inventario Equipo"] !== "N/A" && (
                              <span className="text-[10px] font-mono tracking-widest text-theme-text-tertiary block uppercase">
                                Código: {eq.HojasDeVidaEquipos[0].infoEquipo["Codigo Inventario Equipo"]}
                              </span>
                            )}
                          <h3 className="font-semibold text-theme-text-primary text-sm leading-tight break-words truncate group-hover:text-theme-brand">
                            {eq["NOMBRE DEL EQUIPO"]}
                          </h3>
                        </>
                      )}

                      {isEditMode ? (
                        <div className="text-xs text-theme-text-muted font-mono">
                          Marca: <span className="font-semibold text-theme-text-secondary">{eq.infoEquipo?.Marca || "N/A"}</span>
                          {" • "}
                          Modelo: <span className="font-semibold text-theme-text-secondary">{eq.infoEquipo?.Modelo || "N/A"}</span>
                        </div>
                      ) : (
                        (() => {
                          const hasBrand = eq.infoEquipo?.Marca && eq.infoEquipo.Marca !== "-" && eq.infoEquipo.Marca !== "N/A";
                          const hasModel = eq.infoEquipo?.Modelo && eq.infoEquipo.Modelo !== "-" && eq.infoEquipo.Modelo !== "N/A";
                          if (!hasBrand && !hasModel) return null;
                          return (
                            <div className="text-xs text-theme-text-muted font-mono">
                              {hasBrand && <>Marca: <span className="font-semibold text-theme-text-secondary">{eq.infoEquipo!.Marca}</span></>}
                              {hasBrand && hasModel && " • "}
                              {hasModel && <>Modelo: <span className="font-semibold text-theme-text-secondary">{eq.infoEquipo!.Modelo}</span></>}
                            </div>
                          );
                        })()
                      )}
                    </div>

                    {isEditMode && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => onUpdate(["labs", labIndex, "equipos", idx, "visible"], !eq.visible)}
                          className="p-1 rounded text-theme-text-tertiary hover:text-theme-text-secondary transition"
                          title="Alternar Visibilidad"
                        >
                          {eq.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleRemoveEquipment(idx)}
                          className="p-1 rounded text-theme-text-tertiary hover:text-theme-brand transition"
                          title="Eliminar equipo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {(isEditMode || (eq.COMENTARIOS && eq.COMENTARIOS !== "Sin descripción registrada." && eq.COMENTARIOS !== "-")) && (
                    <p className="text-xs text-theme-text-muted leading-relaxed line-clamp-2 pt-1 border-t border-slate-50">
                      {eq.COMENTARIOS || "Sin descripción registrada."}
                    </p>
                  )}
                </div>

                <div className="px-5 pb-5 pt-1">
                  <button
                    onClick={() => onOpenEquipment(idx)}
                    className="w-full py-2 bg-theme-brand-light text-theme-brand border border-theme-border-medium hover:bg-theme-brand hover:text-white hover:border-theme-brand rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    Ver Ficha y Calibraciones
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredEquipos.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-theme-page rounded-2xl border border-dashed border-theme-border-medium text-theme-text-tertiary text-sm">
                No se encontraron equipos bajo los criterios de búsqueda.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SOFTWARE Y LICENCIAS */}
      {subSection === "software" && (
        <div className="space-y-6 animate-fade-in">

          {/* Filters Bar */}
          <div className="bg-theme-page p-4 rounded-xl border border-theme-border-light flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-theme-text-tertiary" />
              <input
                type="text"
                className="w-full bg-theme-card border border-theme-border-medium rounded-lg pl-9 pr-3 py-2 text-xs text-theme-text-secondary placeholder-slate-400 focus:outline-none focus:border-theme-brand text-theme-text-secondary transition"
                placeholder="Buscar software..."
                value={softSearch}
                onChange={(e) => setSoftSearch(e.target.value)}
              />
            </div>

            {isEditMode && (
              <button
                onClick={handleAddSoftware}
                className="w-full sm:w-auto flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir Software
              </button>
            )}
          </div>

          {/* Software list grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSoftware.map(({ sw, idx }) => (
              <div
                key={idx}
                className={`bg-theme-card rounded-xl border border-theme-border-light shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition relative ${
                  sw.visible === false ? "opacity-60 ring-2 ring-theme-brand-border border-dashed" : ""
                  }`}
              >
                {sw.visible === false && (
                  <div className="absolute top-3 left-3 z-10 text-[10px] font-mono font-bold text-theme-brand bg-theme-brand-light px-2 py-0.5 rounded shadow">
                    OCULTO
                  </div>
                )}

                <div className="p-5 flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-lg bg-theme-page overflow-hidden flex-shrink-0 border border-theme-border-light flex items-center justify-center text-theme-brand">
                    <FileCode className="w-8 h-8" />
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-theme-text-tertiary uppercase block">
                      Software Licenciado
                    </span>
                    {isEditMode ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          className="w-full bg-theme-page border border-theme-border-medium rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                          value={sw["NOMBRE DEL SOFTWARE"] || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "NOMBRE DEL SOFTWARE"], e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            className="w-full bg-theme-page border border-theme-border-medium rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                            value={sw.VERSIÓN || ""}
                            onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "VERSIÓN"], e.target.value)}
                            placeholder="Versión"
                          />
                          <input
                            type="text"
                            className="w-full bg-theme-page border border-theme-border-medium rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                            value={sw["Nº DE LICENCIAS"] || ""}
                            onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "Nº DE LICENCIAS"], e.target.value)}
                            placeholder="Nº Licencias"
                          />
                        </div>
                        <input
                          type="text"
                          className="w-full bg-theme-page border border-theme-border-medium rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                          value={sw["TIPO DE LICENCIA"] || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "TIPO DE LICENCIA"], e.target.value)}
                          placeholder="Tipo Licencia"
                        />
                        <textarea
                          rows={2}
                          className="w-full bg-theme-page border border-theme-border-medium rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                          value={sw.COMENTARIOS || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "COMENTARIOS"], e.target.value)}
                          placeholder="Comentarios"
                        />

                        {/* Software Documents Editor */}
                        <div className="mt-3 pt-2 border-t border-theme-border-light space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-theme-text-tertiary uppercase tracking-wider">Documentos:</span>
                            <button
                              onClick={() => {
                                const docs = [...(sw.documentos || []), { titulo: "Nuevo Documento", url: "https://" }];
                                onUpdate(["labs", labIndex, "software", idx, "documentos"], docs);
                              }}
                              className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold hover:bg-emerald-100 transition"
                            >
                              + Añadir
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {(sw.documentos || []).map((doc: any, dIdx: number) => (
                              <div key={dIdx} className="flex gap-1.5 items-center">
                                <input
                                  type="text"
                                  className="flex-1 bg-theme-page border border-theme-border-medium rounded px-1.5 py-0.5 text-[10px] font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                                  value={doc.titulo || ""}
                                  onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "documentos", dIdx, "titulo"], e.target.value)}
                                  placeholder="Título"
                                />
                                <input
                                  type="text"
                                  className="flex-1 bg-theme-page border border-theme-border-medium rounded px-1.5 py-0.5 text-[10px] font-mono focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                                  value={doc.url || ""}
                                  onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "documentos", dIdx, "url"], e.target.value)}
                                  placeholder="URL"
                                />
                                <button
                                  onClick={() => {
                                    const docs = (sw.documentos || []).filter((_: any, i: number) => i !== dIdx);
                                    onUpdate(["labs", labIndex, "software", idx, "documentos"], docs);
                                  }}
                                  className="text-theme-text-tertiary hover:text-theme-brand p-0.5 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-theme-text-primary text-sm leading-tight break-words">
                          {sw["NOMBRE DEL SOFTWARE"]}
                        </h3>
                        {(sw.VERSIÓN || sw["Nº DE LICENCIAS"]) && (
                          <p className="text-xs text-theme-text-muted font-mono pt-0.5">
                            {sw.VERSIÓN && sw.VERSIÓN !== "-" && sw.VERSIÓN !== "N/A" && (
                              <>Versión: <span className="font-semibold text-theme-text-secondary">{sw.VERSIÓN}</span></>
                            )}
                            {sw.VERSIÓN && sw.VERSIÓN !== "-" && sw.VERSIÓN !== "N/A" && sw["Nº DE LICENCIAS"] && sw["Nº DE LICENCIAS"] !== "-" && " • "}
                            {sw["Nº DE LICENCIAS"] && sw["Nº DE LICENCIAS"] !== "-" && (
                              <>Licencias: <span className="font-semibold text-theme-text-secondary">{sw["Nº DE LICENCIAS"]}</span></>
                            )}
                          </p>
                        )}
                        {sw["TIPO DE LICENCIA"] && sw["TIPO DE LICENCIA"] !== "-" && sw["TIPO DE LICENCIA"] !== "N/A" && (
                          <p className="text-xs font-semibold text-theme-brand font-mono bg-theme-brand-light px-2 py-0.5 rounded inline-block mt-1">
                            {sw["TIPO DE LICENCIA"]}
                          </p>
                        )}
                        {sw.COMENTARIOS && sw.COMENTARIOS !== "Sin comentarios." && sw.COMENTARIOS !== "-" && (
                          <p className="text-xs text-theme-text-muted leading-relaxed pt-2 border-t border-slate-50 mt-2">
                            {sw.COMENTARIOS}
                          </p>
                        )}

                        {/* Software Documents */}
                        {sw.documentos && sw.documentos.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-theme-border-light space-y-1.5">
                            <span className="text-[10px] font-bold text-theme-text-tertiary uppercase tracking-wider block">Documentos del Software:</span>
                            <div className="flex flex-wrap gap-2">
                              {sw.documentos.map((doc: any, dIdx: number) => (
                                <a
                                  key={dIdx}
                                  href={doc.url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-theme-brand hover:text-white bg-theme-brand-light hover:bg-theme-brand px-2 py-1 rounded transition"
                                >
                                  <FileText className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate max-w-[120px]">{doc.titulo || "Documento"}</span>
                                  <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {isEditMode && (
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => onUpdate(["labs", labIndex, "software", idx, "visible"], !sw.visible)}
                        className="p-1 rounded text-theme-text-tertiary hover:text-theme-text-secondary transition"
                        title="Alternar Visibilidad"
                      >
                        {sw.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleRemoveSoftware(idx)}
                        className="p-1 rounded text-theme-text-tertiary hover:text-theme-brand transition"
                        title="Eliminar software"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredSoftware.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-theme-page rounded-2xl border border-dashed border-theme-border-medium text-theme-text-tertiary text-sm">
                No se encontraron paquetes de software cargados.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
