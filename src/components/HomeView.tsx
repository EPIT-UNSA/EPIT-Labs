/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Building2,
  Users,
  FileText,
  Phone,
  ExternalLink,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Cpu,
  Laptop,
  BookOpen,
  Camera,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { EpitData, Lab, Documento, Director } from "../types";

interface HomeViewProps {
  data: EpitData;
  isEditMode: boolean;
  onUpdate: (path: (string | number)[], value: any) => void;
  onNavigate: (path: string) => void;
  onZoomImage: (images: string | string[], index?: number) => void;
}

export default function HomeView({ data, isEditMode, onUpdate, onNavigate, onZoomImage }: HomeViewProps) {
  // Photo gallery pagination state
  const [photoPage, setPhotoPage] = React.useState(0);
  const [visitedPages, setVisitedPages] = React.useState<Set<number>>(new Set([0]));

  const handlePageChange = (newPage: number) => {
    setPhotoPage(newPage);
    setVisitedPages(prev => {
      const next = new Set(prev);
      next.add(newPage);
      return next;
    });
  };

  const handleAddSchoolPhoto = () => {
    const newPhotos = [...(data.Fotografias || []), "https://"];
    onUpdate(["Fotografias"], newPhotos);
  };

  const handleUpdateSchoolPhoto = (index: number, value: string) => {
    const newPhotos = [...(data.Fotografias || [])];
    newPhotos[index] = value;
    onUpdate(["Fotografias"], newPhotos);
  };

  const handleDeleteSchoolPhoto = (index: number) => {
    const newPhotos = (data.Fotografias || []).filter((_, i) => i !== index);
    onUpdate(["Fotografias"], newPhotos);
  };

  // Count active stats
  const stats = React.useMemo(() => {
    const visibleLabs = (data.labs || []).filter(l => isEditMode || l.visible !== false);
    let totalEquipos = 0;
    let totalSoftware = 0;

    visibleLabs.forEach(lab => {
      const eqList = (lab.equipos || []).filter(e => isEditMode || e.visible !== false);
      totalEquipos += eqList.reduce((acc, eq) => acc + (parseInt(eq["Nº DE EQUIPOS"]) || 1), 0);

      const swList = (lab.software || []).filter(s => isEditMode || s.visible !== false);
      totalSoftware += swList.reduce((acc, sw) => acc + (parseInt(sw["Nº DE LICENCIAS"]) || 1), 0);
    });

    return {
      labsCount: visibleLabs.length,
      equiposCount: totalEquipos,
      softwareCount: totalSoftware,
    };
  }, [data, isEditMode]);

  // Handle director update
  const handleDirectorChange = (index: number, key: keyof Director, value: any) => {
    onUpdate(["DIRECTOR DEL PROGRAMA DE ESTUDIOS", index, key], value);
  };

  // Add document
  const handleAddDocument = () => {
    const newDocs = [...data.documentos, { titulo: "Nuevo Documento", url: "https://" }];
    onUpdate(["documentos"], newDocs);
  };

  // Delete document
  const handleDeleteDocument = (index: number) => {
    const newDocs = data.documentos.filter((_, i) => i !== index);
    onUpdate(["documentos"], newDocs);
  };

  const hasAuthorities = React.useMemo(() => {
    if (isEditMode) return true;
    const hasDirector = Array.isArray(data["DIRECTOR DEL PROGRAMA DE ESTUDIOS"]) && data["DIRECTOR DEL PROGRAMA DE ESTUDIOS"].some(director => director.visible !== false);
    const hasDept = data["DEPARTAMENTO ACADÉMICO"] && data["DEPARTAMENTO ACADÉMICO"].visible !== false;
    return !!(hasDirector || hasDept);
  }, [data, isEditMode]);

  const hasDocuments = React.useMemo(() => {
    if (isEditMode) return true;
    return Array.isArray(data.documentos) && data.documentos.length > 0;
  }, [data.documentos, isEditMode]);

  const hasVisibleLabs = React.useMemo(() => {
    if (isEditMode) return true;
    return (data.labs || []).some(lab => lab.visible !== false);
  }, [data.labs, isEditMode]);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Institutional Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-theme-brand to-theme-brand-hover p-8 md:p-12 text-white shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40"></div>
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-theme-white uppercase">
            {data["ABREVIATURA UNIVERSIDAD"]} • {data["ABREVIATURA PROGRAMA DE ESTUDIOS"]}
          </div>

          {isEditMode ? (
            <div className="space-y-3">
              <input
                type="text"
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-2xl md:text-3xl font-display font-bold text-white focus:outline-none focus:border-white/50"
                value={data["NOMBRE DE LA UNIVERSIDAD"]}
                onChange={(e) => onUpdate(["NOMBRE DE LA UNIVERSIDAD"], e.target.value)}
                placeholder="Nombre de la Universidad"
              />
              <input
                type="text"
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-white/50"
                value={data["ESCUELA"]}
                onChange={(e) => onUpdate(["ESCUELA"], e.target.value)}
                placeholder="Nombre de la Escuela/Programa"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white leading-tight">
                {data["NOMBRE DE LA UNIVERSIDAD"]}
              </h1>
              <p className="text-lg md:text-xl font-medium text-white">
                {data["ESCUELA"]} ({data["ABREVIATURA PROGRAMA DE ESTUDIOS"]})
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs md:text-sm text-white/90 font-mono">
            <span>CÓDIGO PROGRAMA: {data["CODIGO PROGRAMA"]}</span>
            <span>•</span>
            <span>CÓDIGO LOCAL: {data["CODIGO LOCAL"]}</span>
          </div>
        </div>
      </div>

      {/* Laboratories & Computer Workshop Gallery */}
      {hasVisibleLabs && (
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-theme-text-primary border-b border-theme-border-medium pb-3">
            Ambientes de Aprendizaje
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {(data.labs || []).map((lab, labIdx) => {
              const showLab = isEditMode || lab.visible !== false;
              if (!showLab) return null;

              const info = (lab.infoAmbiente || {}) as any;
              const isComputerWorkshop = info["TIPO DE LABORATORIO O TALLER"]?.toLowerCase().includes("taller") || info["CÓDIGO DE LABORATORIO O TALLER"]?.includes("TC");

              return (
                <div
                  key={labIdx}
                  className={`bg-theme-card rounded-xl overflow-hidden border border-theme-border-medium shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-lg group relative ${lab.visible === false ? "opacity-60 ring-2 ring-theme-brand-border ring-offset-2 border-dashed" : ""
                    }`}
                >
                  {lab.visible === false && (
                    <div className="absolute top-3 left-3 z-20 text-xs font-mono font-bold text-theme-brand bg-theme-brand-light px-2 py-1 rounded shadow flex items-center gap-1">
                      <EyeOff className="w-3.5 h-3.5" /> OCULTO EN MODO PÚBLICO
                    </div>
                  )}

                  {/* Cover Image */}
                  <div className="relative h-48 bg-theme-page overflow-hidden">
                    <img
                      src={info.Fotografias?.[0] || "https://images.unsplash.com/photo-1602052577122-f73b9710adba?auto=format&fit=crop&q=80&w=600"}
                      alt={info["NOMBRE DEL LABORATORIO O TALLER"] || ""}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105 cursor-zoom-in hover:opacity-90"
                      referrerPolicy="no-referrer"
                      onClick={() => onZoomImage(info.Fotografias?.[0] || "https://images.unsplash.com/photo-1602052577122-f73b9710adba?auto=format&fit=crop&q=80&w=600")}
                    />
                    <div className="absolute inset-0 bg-black/40"></div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      {isEditMode && (
                        <button
                          onClick={() => onUpdate(["labs", labIdx, "visible"], !lab.visible)}
                          className={`p-1.5 rounded-md text-xs transition shadow-sm cursor-pointer ${lab.visible !== false
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                              : "bg-amber-600 hover:bg-amber-500 text-white"
                            }`}
                          title="Alternar Visibilidad"
                        >
                          {lab.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md tracking-wider uppercase text-white shadow-sm ${isComputerWorkshop ? "bg-theme-text-primary" : "bg-theme-brand"
                        }`}>
                        {info["TIPO DE LABORATORIO O TALLER"] || "Enseñanza"}
                      </span>
                    </div>

                    {/* Code & Title on image */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="font-mono text-xs font-semibold tracking-wider text-white">
                        {info["CÓDIGO DE LABORATORIO O TALLER"] || ""}
                      </div>
                      <h3 className="font-display font-bold text-lg leading-snug line-clamp-2 mt-0.5">
                        {info["NOMBRE DEL LABORATORIO O TALLER"] || ""}
                      </h3>
                    </div>
                  </div>

                  {/* Details Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    {isEditMode ? (
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[10px] font-mono font-bold text-theme-text-tertiary block uppercase">Nombre del Ambiente</label>
                          <input
                            type="text"
                            className="w-full bg-theme-page border border-theme-border-medium rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                            value={info["NOMBRE DEL LABORATORIO O TALLER"] || ""}
                            onChange={(e) => onUpdate(["labs", labIdx, "infoAmbiente", "NOMBRE DEL LABORATORIO O TALLER"], e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-mono font-bold text-theme-text-tertiary block uppercase">Aforo</label>
                            <input
                              type="text"
                              className="w-full bg-theme-page border border-theme-border-medium rounded px-2 py-1 text-xs focus:outline-none focus:border-theme-brand text-theme-text-primary"
                              value={info.AFORO || ""}
                              onChange={(e) => onUpdate(["labs", labIdx, "infoAmbiente", "AFORO"], e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono font-bold text-theme-text-tertiary block uppercase">Área</label>
                            <input
                              type="text"
                              className="w-full bg-theme-page border border-theme-border-medium rounded px-2 py-1 text-xs focus:outline-none focus:border-theme-brand text-theme-text-primary"
                              value={info["ÁREA (m2)"] || ""}
                              onChange={(e) => onUpdate(["labs", labIdx, "infoAmbiente", "ÁREA (m2)"], e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm font-mono text-theme-text-secondary">
                        <div>
                          <span className="text-theme-text-tertiary text-xs block font-sans">Capacidad</span>
                          <strong className="text-theme-text-primary font-semibold">{info.AFORO || "0"} personas</strong>
                        </div>
                        <div>
                          <span className="text-theme-text-tertiary text-xs block font-sans">Área Física</span>
                          <strong className="text-theme-text-primary font-semibold">{info["ÁREA (m2)"] || ""}</strong>
                        </div>
                        <div className="col-span-2 border-t border-theme-border-light pt-2 text-xs text-theme-text-muted line-clamp-2">
                          {info.COMENTARIOS || "Sin descripción de ambiente."}
                        </div>
                      </div>
                    )}

                    {/* Navigation trigger button */}
                    <button
                      onClick={() => onNavigate(`/lab/${info["CÓDIGO DE LABORATORIO O TALLER"] || ""}`)}
                      className="w-full mt-2 py-2.5 text-center text-xs font-semibold text-theme-brand border border-theme-brand-border rounded-lg bg-theme-brand-light/50 hover:bg-theme-brand hover:text-white hover:border-theme-brand transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Ver Ficha Técnica de Wiki
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resource Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-theme-card rounded-xl p-6 border border-theme-border-medium shadow-sm flex items-center gap-5 transition-all duration-300 hover:shadow-md hover:border-theme-border-medium/80">
          <div className="p-3.5 bg-theme-brand-light rounded-lg text-theme-brand transition-colors duration-200">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-theme-text-primary font-sans tracking-tight">{stats.labsCount}</div>
            <div className="text-xs font-bold text-theme-text-tertiary uppercase tracking-widest font-mono">Ambientes</div>
          </div>
        </div>

        <div className="bg-theme-card rounded-xl p-6 border border-theme-border-medium shadow-sm flex items-center gap-5 transition-all duration-300 hover:shadow-md hover:border-theme-border-medium/80">
          <div className="p-3.5 bg-blue-20 dark:bg-blue-950/40 rounded-lg text-blue-700 dark:text-blue-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-theme-text-primary font-sans tracking-tight">{stats.equiposCount}</div>
            <div className="text-xs font-bold text-theme-text-tertiary uppercase tracking-widest font-mono">Equipos</div>
          </div>
        </div>

        <div className="bg-theme-card rounded-xl p-6 border border-theme-border-medium shadow-sm flex items-center gap-5 transition-all duration-300 hover:shadow-md hover:border-theme-border-medium/80">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-700 dark:text-amber-400">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-theme-text-primary font-sans tracking-tight">{stats.softwareCount}</div>
            <div className="text-xs font-bold text-theme-text-tertiary uppercase tracking-widest font-mono">Software</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Management Info vs Documents */}
      {(hasAuthorities || hasDocuments) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Management & Directorate Card */}
          {hasAuthorities && (
            <div className={`${hasDocuments ? "lg:col-span-7" : "lg:col-span-12"} bg-theme-card rounded-xl p-6 border border-theme-border-medium shadow-sm space-y-6`}>
              <h2 className="text-lg font-display font-semibold text-theme-text-primary border-b border-theme-border-light pb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-theme-brand" />
                Autoridades y Gestión del Programa
              </h2>

              {/* Director de la Escuela */}
              {data["DIRECTOR DEL PROGRAMA DE ESTUDIOS"]?.map((director, idx) => {
                const showDirector = isEditMode || director.visible !== false;
                if (!showDirector) return null;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg bg-theme-page/70 border border-theme-border-medium space-y-3 relative ${director.visible === false ? "opacity-60 border-dashed border-theme-brand-border" : ""
                      }`}
                  >
                    {director.visible === false && (
                      <span className="absolute top-2 right-2 text-xs font-mono font-bold text-theme-brand bg-theme-brand-light px-2 py-0.5 rounded">
                        OCULTO
                      </span>
                    )}

                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-semibold tracking-wider text-theme-brand uppercase">
                          Dirección del Programa de Estudios
                        </h3>
                        <p className="text-xs text-theme-text-muted font-mono mt-0.5">Gestión: {director.Periodo}</p>
                      </div>
                      {isEditMode && (
                        <button
                          onClick={() => handleDirectorChange(idx, "visible", !director.visible)}
                          className={`p-1.5 rounded border text-xs transition cursor-pointer ${director.visible !== false
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                              : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                            }`}
                          title="Alternar Visibilidad"
                        >
                          {director.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      )}
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-full bg-theme-page overflow-hidden flex-shrink-0 border-2 border-theme-border-medium shadow-sm">
                        <img
                          src={director.Fotografias?.[0] || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120"}
                          alt={director.NOMBRE}
                          className="w-full h-full object-cover cursor-zoom-in hover:opacity-90 transition"
                          referrerPolicy="no-referrer"
                          onClick={() => onZoomImage(director.Fotografias?.[0] || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120")}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        {isEditMode ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                              value={director.NOMBRE || ""}
                              onChange={(e) => handleDirectorChange(idx, "NOMBRE", e.target.value)}
                              placeholder="Nombre del Director"
                            />
                            <input
                              type="text"
                              className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 text-sm focus:outline-none focus:border-theme-brand text-theme-text-primary"
                              value={director["NUMERO DE CONTACTO"] || ""}
                              onChange={(e) => handleDirectorChange(idx, "NUMERO DE CONTACTO", e.target.value)}
                              placeholder="Contacto"
                            />
                          </div>
                        ) : (
                          <>
                            <h4 className="font-semibold text-theme-text-primary text-base">{director.NOMBRE}</h4>
                            {director["NUMERO DE CONTACTO"] && director["NUMERO DE CONTACTO"] !== "-" && (
                              <div className="flex gap-4 text-xs text-theme-text-muted font-medium">
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-theme-brand" />
                                  {director["NUMERO DE CONTACTO"]}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Departamento Académico */}
              {data["DEPARTAMENTO ACADÉMICO"] && (isEditMode || data["DEPARTAMENTO ACADÉMICO"].visible !== false) && (
                <div
                  className={`p-4 rounded-lg bg-theme-page/70 border border-theme-border-medium space-y-4 relative ${data["DEPARTAMENTO ACADÉMICO"].visible === false ? "opacity-60 border-dashed border-theme-brand-border" : ""
                    }`}
                >
                  {data["DEPARTAMENTO ACADÉMICO"].visible === false && (
                    <span className="absolute top-2 right-2 text-xs font-mono font-bold text-theme-brand bg-theme-brand-light px-2 py-0.5 rounded">
                      OCULTO
                    </span>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold tracking-wider text-theme-brand uppercase">
                        Departamento Académico de Adscripción
                      </h3>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="mt-1 w-full bg-theme-card border border-theme-border-medium rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:border-theme-brand text-theme-text-secondary"
                          value={data["DEPARTAMENTO ACADÉMICO"].NOMBRE || ""}
                          onChange={(e) => onUpdate(["DEPARTAMENTO ACADÉMICO", "NOMBRE"], e.target.value)}
                        />
                      ) : (
                        <p className="text-theme-text-secondary text-sm font-medium mt-0.5">{data["DEPARTAMENTO ACADÉMICO"].NOMBRE}</p>
                      )}
                    </div>
                    {isEditMode && (
                      <button
                        onClick={() => onUpdate(["DEPARTAMENTO ACADÉMICO", "visible"], !data["DEPARTAMENTO ACADÉMICO"].visible)}
                        className={`p-1.5 rounded border text-xs transition cursor-pointer ${data["DEPARTAMENTO ACADÉMICO"].visible !== false
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                          }`}
                      >
                        {data["DEPARTAMENTO ACADÉMICO"].visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {data["DEPARTAMENTO ACADÉMICO"].Director?.map((dirDept, idx) => {
                    const showDeptDir = isEditMode || dirDept.visible !== false;
                    if (!showDeptDir) return null;

                    return (
                      <div key={idx} className="flex gap-4 items-center pt-2 border-t border-theme-border-medium">
                        <div className="w-12 h-12 rounded-full bg-theme-page overflow-hidden flex-shrink-0 border-2 border-theme-border-medium shadow-sm">
                          <img
                            src={dirDept.Fotografias?.[0] || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120"}
                            alt={dirDept.Nombre}
                            className="w-full h-full object-cover cursor-zoom-in hover:opacity-90 transition"
                            referrerPolicy="no-referrer"
                            onClick={() => onZoomImage(dirDept.Fotografias?.[0] || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120")}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-medium text-theme-text-tertiary font-mono uppercase">Director de Departamento</p>
                          {isEditMode ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-theme-brand text-theme-text-primary"
                                value={dirDept.Nombre || ""}
                                onChange={(e) => onUpdate(["DEPARTAMENTO ACADÉMICO", "Director", idx, "Nombre"], e.target.value)}
                                placeholder="Nombre Director"
                              />
                              <input
                                type="text"
                                className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs focus:outline-none focus:border-theme-brand text-theme-text-primary"
                                value={dirDept["NUMERO DE CONTACTO"] || ""}
                                onChange={(e) => onUpdate(["DEPARTAMENTO ACADÉMICO", "Director", idx, "NUMERO DE CONTACTO"], e.target.value)}
                                placeholder="Contacto"
                              />
                            </div>
                          ) : (
                            <>
                              <h4 className="font-semibold text-theme-text-primary text-sm">{dirDept.Nombre}</h4>
                              {dirDept["NUMERO DE CONTACTO"] && dirDept["NUMERO DE CONTACTO"] !== "-" && (
                                <span className="flex items-center gap-1 text-xs text-theme-text-muted font-medium">
                                  <Phone className="w-3 h-3 text-theme-brand" />
                                  {dirDept["NUMERO DE CONTACTO"]}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Regulatory Documents Box */}
          {hasDocuments && (
            <div className={`${hasAuthorities ? "lg:col-span-5" : "lg:col-span-12"} bg-theme-card rounded-xl p-6 border border-theme-border-medium shadow-sm space-y-4 flex flex-col justify-between`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-theme-border-medium pb-3">
                  <h2 className="text-lg font-display font-semibold text-theme-text-primary flex items-center gap-2">
                    <FileText className="w-5 h-5 text-theme-brand" />
                    Documentos Técnicos y SST
                  </h2>
                  {isEditMode && (
                    <button
                      onClick={handleAddDocument}
                      className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-2 py-1 rounded text-xs font-semibold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {(data.documentos || []).map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-theme-hover border border-theme-border-light transition-colors duration-200 group"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        {isEditMode ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-sm font-semibold text-theme-text-secondary focus:outline-none focus:border-theme-brand"
                              value={doc.titulo || ""}
                              onChange={(e) => onUpdate(["documentos", idx, "titulo"], e.target.value)}
                              placeholder="Nombre del documento"
                            />
                            <input
                              type="text"
                              className="w-full bg-theme-card border border-theme-border-medium rounded px-2 py-0.5 text-xs text-theme-text-muted focus:outline-none focus:border-theme-brand font-mono"
                              value={doc.url || ""}
                              onChange={(e) => onUpdate(["documentos", idx, "url"], e.target.value)}
                              placeholder="Enlace URL"
                            />
                          </div>
                        ) : (
                          <a
                            href={doc.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-medium text-theme-text-secondary hover:text-theme-brand group transition-colors duration-200"
                          >
                            <BookOpen className="w-4 h-4 text-theme-text-tertiary group-hover:text-theme-brand flex-shrink-0" />
                            <span className="truncate">{doc.titulo || ""}</span>
                            <ExternalLink className="w-3 h-3 text-theme-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        )}
                      </div>

                      {isEditMode && (
                        <button
                          onClick={() => handleDeleteDocument(idx)}
                          className="p-1 text-theme-text-tertiary hover:text-theme-brand-hover rounded transition hover:bg-theme-brand-light cursor-pointer"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {data.documentos?.length === 0 && (
                    <div className="text-center py-6 text-theme-text-tertiary text-sm">
                      No hay documentos técnicos registrados.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-theme-brand-light/40 rounded-lg p-4 border border-theme-brand-border/50 text-xs text-theme-text-secondary leading-relaxed mt-4 transition-colors duration-200">
                <strong>Nota de Acceso Técnico:</strong> La consulta y descarga de planos de evacuación o reglamentos de SST está sujeta a credenciales del dominio institucional de la UNSA.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Galería de la Escuela/Universidad */}
      {(isEditMode || (data.Fotografias && data.Fotografias.filter(url => url && url !== "https://").length > 0)) && (
        <div className="bg-theme-card rounded-xl p-6 border border-theme-border-medium shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-theme-border-light pb-3">
            <h2 className="text-lg font-display font-semibold text-theme-text-primary flex items-center gap-2">
              <Camera className="w-5 h-5 text-theme-brand" />
              Galería de la Escuela Profesional
            </h2>
            {isEditMode && (
              <button
                onClick={handleAddSchoolPhoto}
                className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-2 py-1 rounded text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Foto
              </button>
            )}
          </div>

          {/* Edit URLs input list (Visible only in Edit Mode) */}
          {isEditMode && (data.Fotografias || []).length > 0 && (
            <div className="space-y-2 bg-theme-page p-4 rounded-lg border border-theme-border-medium max-h-60 overflow-y-auto">
              <span className="text-[10px] font-bold text-theme-text-tertiary uppercase tracking-wider block">Enlaces de Fotos de la Escuela (URLs):</span>
              {(data.Fotografias || []).map((url, imgIdx) => (
                <div key={imgIdx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="flex-1 bg-theme-card border border-theme-border-medium rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-theme-brand text-theme-text-primary"
                    value={url || ""}
                    onChange={(e) => handleUpdateSchoolPhoto(imgIdx, e.target.value)}
                    placeholder="https://ejemplo.com/escuela-foto.jpg"
                  />
                  <button
                    onClick={() => handleDeleteSchoolPhoto(imgIdx)}
                    className="p-1 text-theme-text-tertiary hover:text-theme-brand-hover transition cursor-pointer"
                    title="Eliminar Foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Photos Grid with Pagination */}
          {(() => {
            const validPhotos = (data.Fotografias || []).filter(url => url && url !== "https://");
            const totalPages = Math.ceil(validPhotos.length / 5);

            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {validPhotos.map((url, photoIdx) => {
                    const pageIdx = Math.floor(photoIdx / 5);
                    const isVisited = visitedPages.has(pageIdx);
                    const isActive = pageIdx === photoPage;

                    if (!isVisited) return null;

                    return (
                      <div
                        key={photoIdx}
                        style={{ display: isActive ? "flex" : "none" }}
                        className="relative group rounded-xl overflow-hidden border border-theme-border-medium bg-theme-page shadow-sm aspect-video items-center justify-center p-1 cursor-zoom-in hover:shadow-md transition duration-300"
                        onClick={() => onZoomImage(validPhotos, photoIdx)}
                      >
                        <img
                          src={url}
                          alt={`Escuela - Foto ${photoIdx + 1}`}
                          className="object-cover w-full h-full rounded-lg group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=400";
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
                    <div className="col-span-full text-center py-8 text-theme-text-tertiary text-xs">
                      No hay fotografías registradas de la escuela/universidad.
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
                      <span className="text-xs font-mono font-bold text-theme-text-muted px-2">
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
    </div>
  );
}
