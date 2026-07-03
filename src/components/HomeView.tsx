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
  BookOpen 
} from "lucide-react";
import { EpitData, Lab, Documento, Director } from "../types";

interface HomeViewProps {
  data: EpitData;
  isEditMode: boolean;
  onUpdate: (path: (string | number)[], value: any) => void;
  onNavigate: (path: string) => void;
}

export default function HomeView({ data, isEditMode, onUpdate, onNavigate }: HomeViewProps) {
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

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Institutional Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900 to-rose-950 p-8 md:p-12 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40"></div>
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-rose-200 uppercase">
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
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-1 text-sm text-rose-100 focus:outline-none focus:border-white/50"
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
              <p className="text-lg md:text-xl font-medium text-rose-200">
                {data["ESCUELA"]} ({data["ABREVIATURA PROGRAMA DE ESTUDIOS"]})
              </p>
            </div>
          )}
          
          <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs md:text-sm text-rose-200/90 font-mono">
            <span>CÓDIGO PROGRAMA: {data["CODIGO PROGRAMA"]}</span>
            <span>•</span>
            <span>CÓDIGO LOCAL: {data["CODIGO LOCAL"]}</span>
          </div>
        </div>
      </div>

      {/* Resource Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 transition-all duration-300 hover:shadow-md hover:border-slate-300">
          <div className="p-3.5 bg-red-50 rounded-lg text-red-700">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-slate-800 font-sans tracking-tight">{stats.labsCount}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Ambientes</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 transition-all duration-300 hover:shadow-md hover:border-slate-300">
          <div className="p-3.5 bg-blue-50 rounded-lg text-blue-700">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-slate-800 font-sans tracking-tight">{stats.equiposCount}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Equipos</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 transition-all duration-300 hover:shadow-md hover:border-slate-300">
          <div className="p-3.5 bg-amber-50 rounded-lg text-amber-700">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-slate-800 font-sans tracking-tight">{stats.softwareCount}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Software</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Management Info vs Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Management & Directorate Card */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-display font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-700" />
            Autoridades y Gestión del Programa
          </h2>
          
          {/* Director de la Escuela */}
          {data["DIRECTOR DEL PROGRAMA DE ESTUDIOS"]?.map((director, idx) => {
            const showDirector = isEditMode || director.visible !== false;
            if (!showDirector) return null;

            return (
              <div 
                key={idx} 
                className={`p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-3 relative ${
                  director.visible === false ? "opacity-60 border-dashed border-red-200" : ""
                }`}
              >
                {director.visible === false && (
                  <span className="absolute top-2 right-2 text-xs font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    OCULTO
                  </span>
                )}
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold tracking-wider text-red-700 uppercase">
                      Dirección del Programa de Estudios
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Gestión: {director.Periodo}</p>
                  </div>
                  {isEditMode && (
                    <button
                      onClick={() => handleDirectorChange(idx, "visible", !director.visible)}
                      className={`p-1.5 rounded border text-xs transition ${
                        director.visible !== false 
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
                  <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                    <img 
                      src={director.Fotografias?.[0] || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120"} 
                      alt={director.NOMBRE}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    {isEditMode ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:border-rose-800"
                          value={director.NOMBRE || ""}
                          onChange={(e) => handleDirectorChange(idx, "NOMBRE", e.target.value)}
                          placeholder="Nombre del Director"
                        />
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-rose-800"
                          value={director["NUMERO DE CONTACTO"] || ""}
                          onChange={(e) => handleDirectorChange(idx, "NUMERO DE CONTACTO", e.target.value)}
                          placeholder="Contacto"
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold text-slate-800 text-base">{director.NOMBRE}</h4>
                        <div className="flex gap-4 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-red-700" />
                            {director["NUMERO DE CONTACTO"]}
                          </span>
                        </div>
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
              className={`p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-4 relative ${
                data["DEPARTAMENTO ACADÉMICO"].visible === false ? "opacity-60 border-dashed border-red-200" : ""
              }`}
            >
              {data["DEPARTAMENTO ACADÉMICO"].visible === false && (
                <span className="absolute top-2 right-2 text-xs font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                  OCULTO
                </span>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold tracking-wider text-red-700 uppercase">
                    Departamento Académico de Adscripción
                  </h3>
                  {isEditMode ? (
                    <input
                      type="text"
                      className="mt-1 w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:border-rose-800"
                      value={data["DEPARTAMENTO ACADÉMICO"].NOMBRE || ""}
                      onChange={(e) => onUpdate(["DEPARTAMENTO ACADÉMICO", "NOMBRE"], e.target.value)}
                    />
                  ) : (
                    <p className="text-slate-700 text-sm font-medium mt-0.5">{data["DEPARTAMENTO ACADÉMICO"].NOMBRE}</p>
                  )}
                </div>
                {isEditMode && (
                  <button
                    onClick={() => onUpdate(["DEPARTAMENTO ACADÉMICO", "visible"], !data["DEPARTAMENTO ACADÉMICO"].visible)}
                    className={`p-1.5 rounded border text-xs transition ${
                      data["DEPARTAMENTO ACADÉMICO"].visible !== false 
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
                  <div key={idx} className="flex gap-4 items-center pt-2 border-t border-slate-200">
                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                      <img 
                        src={dirDept.Fotografias?.[0] || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120"} 
                        alt={dirDept.Nombre}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium text-slate-400 font-mono uppercase">Director de Departamento</p>
                      {isEditMode ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-rose-800"
                            value={dirDept.Nombre || ""}
                            onChange={(e) => onUpdate(["DEPARTAMENTO ACADÉMICO", "Director", idx, "Nombre"], e.target.value)}
                            placeholder="Nombre Director"
                          />
                          <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-rose-800"
                            value={dirDept["NUMERO DE CONTACTO"] || ""}
                            onChange={(e) => onUpdate(["DEPARTAMENTO ACADÉMICO", "Director", idx, "NUMERO DE CONTACTO"], e.target.value)}
                            placeholder="Contacto"
                          />
                        </div>
                      ) : (
                        <>
                          <h4 className="font-semibold text-slate-800 text-sm">{dirDept.Nombre}</h4>
                          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <Phone className="w-3 h-3 text-red-700" />
                            {dirDept["NUMERO DE CONTACTO"]}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Regulatory Documents Box */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-lg font-display font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-700" />
                Documentos Técnicos y SST
              </h2>
              {isEditMode && (
                <button
                  onClick={handleAddDocument}
                  className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-2 py-1 rounded text-xs font-semibold transition"
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
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-50 transition group"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    {isEditMode ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-rose-800"
                          value={doc.titulo || ""}
                          onChange={(e) => onUpdate(["documentos", idx, "titulo"], e.target.value)}
                          placeholder="Nombre del documento"
                        />
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-500 focus:outline-none focus:border-rose-800 font-mono"
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
                        className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-red-700 group"
                      >
                        <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-red-700 flex-shrink-0" />
                        <span className="truncate">{doc.titulo || ""}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}
                  </div>
                  
                  {isEditMode && (
                    <button
                      onClick={() => handleDeleteDocument(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition hover:bg-red-50"
                      title="Eliminar documento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {data.documentos?.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm">
                  No hay documentos técnicos registrados.
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-red-50/40 rounded-lg p-4 border border-red-200/50 text-xs text-slate-600 leading-relaxed mt-4">
            <strong>Nota de Acceso Técnico:</strong> La consulta y descarga de planos de evacuación o reglamentos de SST está sujeta a credenciales del dominio institucional de la UNSA.
          </div>
        </div>
      </div>

      {/* Laboratories & Computer Workshop Gallery */}
      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-slate-800 border-b border-slate-200 pb-3">
          Galería de Ambientes de Aprendizaje
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
                className={`bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-lg group relative ${
                  lab.visible === false ? "opacity-60 ring-2 ring-red-200 ring-offset-2 border-dashed" : ""
                }`}
              >
                {lab.visible === false && (
                  <div className="absolute top-3 left-3 z-20 text-xs font-mono font-bold text-red-700 bg-red-100 px-2 py-1 rounded shadow flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5" /> OCULTO EN MODO PÚBLICO
                  </div>
                )}

                {/* Cover Image */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img 
                    src={info.Fotografias?.[0] || "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=600"} 
                    alt={info["NOMBRE DEL LABORATORIO O TALLER"] || ""}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                    {isEditMode && (
                      <button
                        onClick={() => onUpdate(["labs", labIdx, "visible"], !lab.visible)}
                        className={`p-1.5 rounded-md text-xs transition shadow-sm ${
                          lab.visible !== false 
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                            : "bg-amber-600 hover:bg-amber-500 text-white"
                        }`}
                        title="Alternar Visibilidad"
                      >
                        {lab.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md tracking-wider uppercase text-white shadow-sm ${
                      isComputerWorkshop ? "bg-slate-800" : "bg-rose-900"
                    }`}>
                      {info["TIPO DE LABORATORIO O TALLER"] || "Enseñanza"}
                    </span>
                  </div>

                  {/* Code & Title on image */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="font-mono text-xs font-semibold tracking-wider text-rose-300">
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
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Nombre del Ambiente</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-rose-800"
                          value={info["NOMBRE DEL LABORATORIO O TALLER"] || ""}
                          onChange={(e) => onUpdate(["labs", labIdx, "infoAmbiente", "NOMBRE DEL LABORATORIO O TALLER"], e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Aforo</label>
                          <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-rose-800"
                            value={info.AFORO || ""}
                            onChange={(e) => onUpdate(["labs", labIdx, "infoAmbiente", "AFORO"], e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Área</label>
                          <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-rose-800"
                            value={info["ÁREA (m2)"] || ""}
                            onChange={(e) => onUpdate(["labs", labIdx, "infoAmbiente", "ÁREA (m2)"], e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 text-sm font-mono text-slate-600">
                      <div>
                        <span className="text-slate-400 text-xs block font-sans">Capacidad</span>
                        <strong className="text-slate-800 font-semibold">{info.AFORO || "0"} personas</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs block font-sans">Área Física</span>
                        <strong className="text-slate-800 font-semibold">{info["ÁREA (m2)"] || ""}</strong>
                      </div>
                      <div className="col-span-2 border-t border-slate-100 pt-2 text-xs text-slate-500 line-clamp-2">
                        {info.COMENTARIOS || "Sin descripción de ambiente."}
                      </div>
                    </div>
                  )}

                  {/* Navigation trigger button */}
                  <button
                    onClick={() => onNavigate(`/lab/${info["CÓDIGO DE LABORATORIO O TALLER"] || ""}`)}
                    className="w-full mt-2 py-2.5 text-center text-xs font-semibold text-rose-900 border border-rose-200 rounded-lg bg-rose-50/50 hover:bg-rose-900 hover:text-white hover:border-rose-900 transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer"
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
    </div>
  );
}
