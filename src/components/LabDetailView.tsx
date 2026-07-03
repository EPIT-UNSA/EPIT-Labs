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
  FileText
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
}

export default function LabDetailView({ 
  lab, 
  labIndex, 
  subSection, 
  isEditMode, 
  onUpdate, 
  onNavigate,
  onOpenEquipment 
}: LabDetailViewProps) {
  const info = (lab.infoAmbiente || {}) as any;

  // Equipment Search & Filters local states
  const [equipSearch, setEquipSearch] = React.useState("");
  const [equipBrandFilter, setEquipBrandFilter] = React.useState("todas");
  const [equipTypeFilter, setEquipTypeFilter] = React.useState("todos");

  // Software Search local state
  const [softSearch, setSoftSearch] = React.useState("");

  // Tabs for lab section
  const tabs = [
    { id: "info", label: "ℹ️ Ambiente" },
    { id: "equipos", label: `🛠️ Equipos e Instrumentos (${lab.equipos?.filter(e => isEditMode || e.visible !== false).length || 0})` },
    { id: "software", label: `💻 Software y Licencias (${lab.software?.filter(s => isEditMode || s.visible !== false).length || 0})` }
  ];

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
      
      {/* Lab Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-200/10 text-white shadow p-6 md:p-8">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={info.Fotografias?.[0] || "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800"} 
            alt={info["NOMBRE DEL LABORATORIO O TALLER"]} 
            className="w-full h-full object-cover filter blur-sm"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/40"></div>
        
        {/* Lab meta header info */}
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-red-400 bg-red-950/40 border border-red-900/40 px-2.5 py-0.5 rounded uppercase tracking-wider">
              {info["CÓDIGO DE LABORATORIO O TALLER"]}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-bold tracking-wider uppercase text-slate-300 font-mono">
              {info["TIPO DE LABORATORIO O TALLER"]}
            </span>
          </div>

          {isEditMode ? (
            <textarea
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-1.5 text-xl md:text-2xl font-display font-bold text-white focus:outline-none focus:border-white/50"
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
            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
            {info["REFERENCIA DE UBICACIÓN"] || ""}
          </p>
        </div>
      </div>

      {/* Navigation tabs inside specific lab */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onNavigate(`/lab/${info["CÓDIGO DE LABORATORIO O TALLER"] || ""}/${tab.id}`)}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition duration-200 whitespace-nowrap cursor-pointer ${
              subSection === tab.id 
                ? "border-red-700 text-red-700 font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: INFORMACIÓN DE AMBIENTE */}
      {subSection === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Main info panel */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Environment Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Código Ambiente</span>
                {isEditMode ? (
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none"
                    value={info["CODIGO PATRIMONIO AMBIENTE"] || ""}
                    onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "CODIGO PATRIMONIO AMBIENTE"], e.target.value)}
                  />
                ) : (
                  <strong className="text-slate-800 font-mono text-sm">{info["CODIGO PATRIMONIO AMBIENTE"]}</strong>
                )}
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Capacidad Aforo</span>
                {isEditMode ? (
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none"
                    value={info.AFORO || ""}
                    onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "AFORO"], e.target.value)}
                  />
                ) : (
                  <strong className="text-slate-800 text-sm">{info.AFORO} personas</strong>
                )}
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Área Física (m²)</span>
                {isEditMode ? (
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none"
                    value={info["ÁREA (m2)"] || ""}
                    onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "ÁREA (m2)"], e.target.value)}
                  />
                ) : (
                  <strong className="text-slate-800 text-sm">{info["ÁREA (m2)"]}</strong>
                )}
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Acceso a Internet</span>
                {isEditMode ? (
                  <select
                    className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none"
                    value={info["SERVICIO DE INTERNET (SI/NO)"] || "Sí"}
                    onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "SERVICIO DE INTERNET (SI/NO)"], e.target.value)}
                  >
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                ) : (
                  <strong className="text-slate-800 text-sm flex items-center gap-1">
                    {info["SERVICIO DE INTERNET (SI/NO)"]?.toLowerCase() === "sí" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    {info["SERVICIO DE INTERNET (SI/NO)"]}
                  </strong>
                )}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Descripción General del Ambiente</h3>
              {isEditMode ? (
                <textarea
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-900"
                  value={info.COMENTARIOS || ""}
                  onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "COMENTARIOS"], e.target.value)}
                />
              ) : (
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {info.COMENTARIOS || "Sin descripción asignada."}
                </p>
              )}
            </div>

            {/* Program details */}
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Programas de Estudios Vinculados</h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {info["PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"]?.map((prog, pidx) => (
                  <span key={pidx} className="px-3 py-1 bg-slate-100 rounded text-xs font-mono font-bold text-slate-700">
                    Programa: {prog}
                  </span>
                ))}
                <span className="px-3 py-1 bg-rose-50 text-rose-800 rounded text-xs font-semibold">
                  Cantidad: {info["CANTIDAD DE PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"]} Programa
                </span>
              </div>
            </div>

            {/* Documentos y Enlaces del Ambiente */}
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-800" />
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
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-50 transition group">
                    <div className="flex-1 min-w-0 pr-4">
                      {isEditMode ? (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold text-slate-700 focus:outline-none"
                            value={doc.titulo || ""}
                            onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "documentos", idx, "titulo"], e.target.value)}
                            placeholder="Nombre del documento"
                          />
                          <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-500 focus:outline-none font-mono"
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
                          className="flex items-center gap-2 text-xs font-semibold text-rose-900 hover:text-rose-700 group"
                        >
                          <FileText className="w-4 h-4 text-slate-400 group-hover:text-rose-900 flex-shrink-0" />
                          <span className="truncate">{doc.titulo || "Documento sin título"}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}
                    </div>
                    {isEditMode && (
                      <button
                        onClick={() => {
                          const updated = (info.documentos || []).filter((_: any, dIdx: number) => dIdx !== idx);
                          onUpdate(["labs", labIndex, "infoAmbiente", "documentos"], updated);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition hover:bg-red-50"
                        title="Eliminar documento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {(!info.documentos || info.documentos.length === 0) && (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No hay documentos del ambiente registrados.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar: responsible personnel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Encargado Docente */}
            {info["RESPONSABLE DEL LABORATORIO O TALLER"] && (isEditMode || info["RESPONSABLE DEL LABORATORIO O TALLER"].visible !== false) && (
              <div 
                className={`bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-4 relative ${
                  info["RESPONSABLE DEL LABORATORIO O TALLER"].visible === false ? "opacity-60 border-dashed" : ""
                }`}
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wide">
                    Responsable de Turno
                  </span>
                  {isEditMode && (
                    <button
                      onClick={() => onUpdate(["labs", labIndex, "infoAmbiente", "RESPONSABLE DEL LABORATORIO O TALLER", "visible"], info["RESPONSABLE DEL LABORATORIO O TALLER"]?.visible !== false ? false : true)}
                      className="p-1 rounded text-xs border bg-slate-50 text-slate-500 hover:bg-slate-100"
                    >
                      {info["RESPONSABLE DEL LABORATORIO O TALLER"]?.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <div className="flex gap-3.5 items-center">
                  <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditMode ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold"
                          value={info["RESPONSABLE DEL LABORATORIO O TALLER"].NOMBRE || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "RESPONSABLE DEL LABORATORIO O TALLER", "NOMBRE"], e.target.value)}
                        />
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[10px]"
                          value={info["RESPONSABLE DEL LABORATORIO O TALLER"]["NUMERO DE CONTACTO"] || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "RESPONSABLE DEL LABORATORIO O TALLER", "NUMERO DE CONTACTO"], e.target.value)}
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-semibold text-slate-800 truncate">
                          {info["RESPONSABLE DEL LABORATORIO O TALLER"].NOMBRE}
                        </h4>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-rose-800" />
                          {info["RESPONSABLE DEL LABORATORIO O TALLER"]["NUMERO DE CONTACTO"]}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Técnico Encargado list */}
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wide">
                  Soporte Técnico
                </span>
                {isEditMode && (
                  <button
                    onClick={() => {
                      const newT: PersonalTecnico = { visible: true, NOMBRE: "Nuevo Técnico", "NUMERO DE CONTACTO": "Contacto" };
                      const updated = [...(info["PERSONAL TÉCNICO"] || []), newT];
                      onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL TÉCNICO"], updated);
                    }}
                    className="p-1 rounded text-[10px] border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-0.5 font-semibold"
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
                      className={`flex gap-3 items-center justify-between p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 relative ${
                        tech.visible === false ? "opacity-60 border-dashed" : ""
                      }`}
                    >
                      <div className="flex gap-2.5 items-center min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          {isEditMode ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold"
                                value={tech.NOMBRE || ""}
                                onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL TÉCNICO", techIdx, "NOMBRE"], e.target.value)}
                              />
                              <input
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9px]"
                                value={tech["NUMERO DE CONTACTO"] || ""}
                                onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL TÉCNICO", techIdx, "NUMERO DE CONTACTO"], e.target.value)}
                              />
                            </div>
                          ) : (
                            <>
                              <h4 className="text-xs font-semibold text-slate-800 truncate">{tech.NOMBRE}</h4>
                              <p className="text-[10px] text-slate-500 flex items-center gap-0.5 font-mono">
                                <Phone className="w-2.5 h-2.5 text-rose-800" />
                                {tech["NUMERO DE CONTACTO"]}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {isEditMode && (
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL TÉCNICO", techIdx, "visible"], !tech.visible)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            {tech.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => {
                              const updated = info["PERSONAL TÉCNICO"]?.filter((_, tIdx) => tIdx !== techIdx);
                              onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL TÉCNICO"], updated);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600"
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

            {/* Verificador de CBC III */}
            {info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"] && (isEditMode || info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"].visible !== false) && (
              <div 
                className={`bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-4 relative ${
                  info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"].visible === false ? "opacity-60 border-dashed" : ""
                }`}
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wide">
                    Verificador CBC III (Calidad)
                  </span>
                  {isEditMode && (
                    <button
                      onClick={() => onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL ASIGNADO PARA VERIFICAR LA CBC III", "visible"], info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"]?.visible !== false ? false : true)}
                      className="p-1 rounded text-xs border bg-slate-50 text-slate-500"
                    >
                      {info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"]?.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <div className="flex gap-3.5 items-center">
                  <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-800 flex items-center justify-center">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditMode ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold"
                          value={info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"].NOMBRE || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL ASIGNADO PARA VERIFICAR LA CBC III", "NOMBRE"], e.target.value)}
                        />
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[10px]"
                          value={info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"]["NUMERO DE CONTACTO"] || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "infoAmbiente", "PERSONAL ASIGNADO PARA VERIFICAR LA CBC III", "NUMERO DE CONTACTO"], e.target.value)}
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="text-xs font-semibold text-slate-800 truncate">
                          {info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"].NOMBRE}
                        </h4>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-2.5 h-2.5 text-rose-800" />
                          {info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"]["NUMERO DE CONTACTO"]}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EQUIPOS E INSTRUMENTOS */}
      {subSection === "equipos" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Filters Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-rose-900 transition"
                placeholder="Buscar por equipo, modelo, patrimonio..."
                value={equipSearch}
                onChange={(e) => setEquipSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Brand Select */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400">Marca:</span>
                <select
                  className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg focus:outline-none text-slate-700 font-medium"
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
                <span className="text-slate-400">Tipo:</span>
                <select
                  className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg focus:outline-none text-slate-700 font-medium"
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
                className={`bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition relative ${
                  eq.visible === false ? "opacity-60 ring-2 ring-red-100 border-dashed" : ""
                }`}
              >
                {eq.visible === false && (
                  <div className="absolute top-3 left-3 z-10 text-[10px] font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded shadow">
                    OCULTO
                  </div>
                )}

                <div className="p-5 space-y-4">
                  {/* Photo & title */}
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                      <img 
                        src={eq.Fotografias?.[0] || "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&q=80&w=150"} 
                        alt={eq["NOMBRE DEL EQUIPO"]} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase">
                        Código: {eq.HojasDeVidaEquipos?.[0]?.infoEquipo?.["Codigo Inventario Equipo"] || "N/A"}
                      </span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none"
                          value={eq["NOMBRE DEL EQUIPO"] || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "equipos", idx, "NOMBRE DEL EQUIPO"], e.target.value)}
                        />
                      ) : (
                        <h3 className="font-semibold text-slate-800 text-sm leading-tight break-words truncate group-hover:text-rose-900">
                          {eq["NOMBRE DEL EQUIPO"]}
                        </h3>
                      )}
                      
                      <div className="text-xs text-slate-500 font-mono">
                        Marca: <span className="font-semibold text-slate-700">{eq.infoEquipo?.Marca || "N/A"}</span>
                        {" • "}
                        Modelo: <span className="font-semibold text-slate-700">{eq.infoEquipo?.Modelo || "N/A"}</span>
                      </div>
                    </div>

                    {isEditMode && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => onUpdate(["labs", labIndex, "equipos", idx, "visible"], !eq.visible)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 transition"
                          title="Alternar Visibilidad"
                        >
                          {eq.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleRemoveEquipment(idx)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 transition"
                          title="Eliminar equipo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 pt-1 border-t border-slate-50">
                    {eq.COMENTARIOS || "Sin descripción registrada."}
                  </p>
                </div>

                <div className="px-5 pb-5 pt-1">
                  <button
                    onClick={() => onOpenEquipment(idx)}
                    className="w-full py-2 bg-rose-50 text-rose-900 border border-rose-100 hover:bg-rose-900 hover:text-white hover:border-rose-900 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    Ver Ficha y Calibraciones
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredEquipos.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
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
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-rose-900 transition"
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
                className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition relative ${
                  sw.visible === false ? "opacity-60 ring-2 ring-red-100 border-dashed" : ""
                }`}
              >
                {sw.visible === false && (
                  <div className="absolute top-3 left-3 z-10 text-[10px] font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded shadow">
                    OCULTO
                  </div>
                )}

                <div className="p-5 flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-lg bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100 flex items-center justify-center text-rose-800">
                    <FileCode className="w-8 h-8" />
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase block">
                      Software Licenciado
                    </span>
                    {isEditMode ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold"
                          value={sw["NOMBRE DEL SOFTWARE"] || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "NOMBRE DEL SOFTWARE"], e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                            value={sw.VERSIÓN || ""}
                            onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "VERSIÓN"], e.target.value)}
                            placeholder="Versión"
                          />
                          <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                            value={sw["Nº DE LICENCIAS"] || ""}
                            onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "Nº DE LICENCIAS"], e.target.value)}
                            placeholder="Nº Licencias"
                          />
                        </div>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                          value={sw["TIPO DE LICENCIA"] || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "TIPO DE LICENCIA"], e.target.value)}
                          placeholder="Tipo Licencia"
                        />
                        <textarea
                          rows={2}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                          value={sw.COMENTARIOS || ""}
                          onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "COMENTARIOS"], e.target.value)}
                          placeholder="Comentarios"
                        />

                        {/* Software Documents Editor */}
                        <div className="mt-3 pt-2 border-t border-slate-100 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Documentos:</span>
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
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-semibold focus:outline-none"
                                  value={doc.titulo || ""}
                                  onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "documentos", dIdx, "titulo"], e.target.value)}
                                  placeholder="Título"
                                />
                                <input
                                  type="text"
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono focus:outline-none"
                                  value={doc.url || ""}
                                  onChange={(e) => onUpdate(["labs", labIndex, "software", idx, "documentos", dIdx, "url"], e.target.value)}
                                  placeholder="URL"
                                />
                                <button
                                  onClick={() => {
                                    const docs = (sw.documentos || []).filter((_: any, i: number) => i !== dIdx);
                                    onUpdate(["labs", labIndex, "software", idx, "documentos"], docs);
                                  }}
                                  className="text-slate-400 hover:text-red-600 p-0.5 transition"
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
                        <h3 className="font-semibold text-slate-800 text-sm leading-tight break-words">
                          {sw["NOMBRE DEL SOFTWARE"]}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono pt-0.5">
                          Versión: <span className="font-semibold text-slate-700">{sw.VERSIÓN}</span>
                          {" • "}
                          Licencias: <span className="font-semibold text-slate-700">{sw["Nº DE LICENCIAS"]}</span>
                        </p>
                        <p className="text-xs font-semibold text-rose-900 font-mono bg-rose-50 px-2 py-0.5 rounded inline-block">
                          {sw["TIPO DE LICENCIA"]}
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-50">
                          {sw.COMENTARIOS || "Sin comentarios."}
                        </p>

                        {/* Software Documents */}
                        {sw.documentos && sw.documentos.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Documentos del Software:</span>
                            <div className="flex flex-wrap gap-2">
                              {sw.documentos.map((doc: any, dIdx: number) => (
                                <a
                                  key={dIdx}
                                  href={doc.url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-900 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition"
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
                        className="p-1 rounded text-slate-400 hover:text-slate-600 transition"
                        title="Alternar Visibilidad"
                      >
                        {sw.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleRemoveSoftware(idx)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 transition"
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
              <div className="col-span-2 text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                No se encontraron paquetes de software cargados.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
