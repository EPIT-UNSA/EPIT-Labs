/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Director {
  visible: boolean;
  NOMBRE?: string;
  Nombre?: string; // Standardize name keys
  "NUMERO DE CONTACTO"?: string;
  Periodo?: string;
  Fotografias?: string[];
}

export interface DepartamentoAcademico {
  visible: boolean;
  NOMBRE: string;
  Director?: Director[];
}

export interface Documento {
  titulo: string;
  url: string;
}

export interface Responsable {
  visible: boolean;
  NOMBRE: string;
  "NUMERO DE CONTACTO": string;
}

export interface PersonalTecnico {
  visible: boolean;
  NOMBRE: string;
  "NUMERO DE CONTACTO": string;
}

export interface InfoAmbiente {
  "NUMERO DE LABORATORIO O TALLER": string;
  "CÓDIGO DE LABORATORIO O TALLER": string;
  "NOMBRE DEL LABORATORIO O TALLER": string;
  "TIPO DE LABORATORIO O TALLER": string;
  "CODIGO PATRIMONIO AMBIENTE": string;
  "REFERENCIA DE UBICACIÓN": string;
  "PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER": string[];
  "CANTIDAD DE PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER": string;
  "SERVICIO DE INTERNET (SI/NO)": string;
  "ÁREA (m2)": string;
  AFORO: string;
  COMENTARIOS: string;
  Fotografias?: string[];
  "RESPONSABLE DEL LABORATORIO O TALLER"?: Responsable;
  "PERSONAL TÉCNICO"?: PersonalTecnico[];
  "PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"?: Responsable;
  documentos?: Documento[];
}

export interface InfoEquipo {
  "Denominacion Patrimonial"?: string;
  "Tipo de equipo:"?: string;
  Fabricante?: string;
  Marca?: string;
  Modelo?: string;
  // Hoja de Vida info
  "Codigo Inventario Equipo"?: string;
  "FECHA DE ADQUISICIÓN"?: string;
  "MODO DE ADQUISICIÓN"?: string;
  Ubicación?: string;
}

export interface Caracteristica {
  Caracteristica: string;
  Descripcion: string;
}

export interface MantenimientoItem {
  visible: boolean;
  descripcion: {
    title: string;
    Prioridad: number;
    contenido: string[];
  };
  "MONTO REF"?: {
    currency: string;
    amount: string;
  };
  responsable: string;
}

export interface MantenimientoCron {
  enCadaUso?: MantenimientoItem[];
  semanal?: MantenimientoItem[];
  quincenal?: MantenimientoItem[];
  mensual?: MantenimientoItem[];
  bimestral?: MantenimientoItem[];
  trimestral?: MantenimientoItem[];
  semestral?: MantenimientoItem[];
  anual?: MantenimientoItem[];
}

export interface MantenimientoInfo {
  visible: boolean;
  preventivo?: MantenimientoCron;
  correctivo?: MantenimientoCron;
}

export interface ProcedimientoMantenimiento {
  visible: boolean;
  "Principio de Operacion"?: string;
  "Instalaciones Requeridas"?: string;
  Partes?: string;
  mantenimiento?: MantenimientoInfo;
}

export interface HojaDeVidaMantenimiento {
  visible: boolean;
  Nro: number;
  "Actividad realizada": string;
  Fecha: string;
  Responsable: string;
  Observaciones: string;
  Fotografias?: string[];
}

export interface HojaDeVidaEquipo {
  visible: boolean;
  infoEquipo: {
    "Codigo Inventario Equipo": string;
    "FECHA DE ADQUISICIÓN": string;
    "MODO DE ADQUISICIÓN": string;
    Ubicación: string;
    "N° de serie"?: string;
    "Codigo Patrimonial"?: string;
    "Año Fabricación"?: string;
    "Estado de conservación"?: string;
    "Estado de uso"?: string;
  };
  mantenimientos: HojaDeVidaMantenimiento[];
  nota: string;
  ultimaActualizacion: {
    year: number;
    month: number;
    day: number;
  };
  HechoPor: string;
  RevisadoPor: string;
}

export interface Equipo {
  visible: boolean;
  "Nº DE EQUIPOS": string;
  "NOMBRE DEL EQUIPO": string;
  COMENTARIOS: string;
  infoEquipo: InfoEquipo;
  Fotografias: string[];
  caracteristicas: Caracteristica[];
  ProcedimientoMantenimiento?: ProcedimientoMantenimiento;
  HojasDeVidaEquipos?: HojaDeVidaEquipo[];
  documentos?: Documento[];
}

export interface Software {
  visible: boolean;
  "Nº DE LICENCIAS": string;
  VERSIÓN: string;
  "NOMBRE DEL SOFTWARE": string;
  "TIPO DE LICENCIA": string;
  Fotografias: string[];
  COMENTARIOS: string;
  documentos?: Documento[];
}

export interface Lab {
  visible: boolean;
  infoAmbiente: InfoAmbiente;
  equipos: Equipo[];
  software: Software[];
}

export interface Contacto {
  visible: boolean;
  enlaces: Documento[];
}

export interface EpitData {
  "NOMBRE DE LA UNIVERSIDAD": string;
  "ABREVIATURA UNIVERSIDAD": string;
  FACULTAD: string;
  ESCUELA: string;
  "PROGRAMA DE ESTUDIOS": string;
  "ABREVIATURA PROGRAMA DE ESTUDIOS": string;
  "CODIGO PROGRAMA": string;
  "DIRECTOR DEL PROGRAMA DE ESTUDIOS": Director[];
  "DEPARTAMENTO ACADÉMICO": DepartamentoAcademico;
  "CODIGO LOCAL": string;
  Fotografias: string[];
  documentos: Documento[];
  labs: Lab[];
  contacto: Contacto;
}
