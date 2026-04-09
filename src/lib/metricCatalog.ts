// ═══════════════════════════════════════════════════════════════════════════
// METRIC CATALOG V2 — Référentiel complet avec plages de référence
// Sources : HAS, FFAB, OMS, ESC 2021, sociétés savantes françaises
// Usage : Backend (extraction mapping) + Frontend (affichage + interprétation)
// ═══════════════════════════════════════════════════════════════════════════

export type ExamType =
  | "BLOOD_HEMATOLOGY" | "BLOOD_HEMOSTASIS" | "BLOOD_BIOCHEMISTRY"
  | "BLOOD_HEPATIC" | "BLOOD_LIPID" | "BLOOD_IRON" | "BLOOD_VITAMINS"
  | "BLOOD_ENDOCRINE" | "BLOOD_IMMUNOLOGY" | "BLOOD_HEMOGLOBINOPATHY"
  | "STOOL" | "URINE"
  | "BIA" | "DXA_BODY" | "DXA_BONE" | "CALORIMETRY"
  | "ECG" | "EFFORT_TEST" | "EFR" | "PSG"
  | "ECHO_CARDIAC" | "GASTRO" | "PSYCHIATRY_SCALES" | "ANTHROPOMETRY"
  | "OTHER";

export interface ReferenceRange {
  min?: number;
  max?: number;
  sex?: "MALE" | "FEMALE";
  ageMin?: number;
  ageMax?: number;
  label?: string;
}

export interface MetricDef {
  key: string;
  label: string;
  unit: string;
  examType: ExamType;
  category: string;
  loinc?: string;
  aliases: string[];
  ranges: ReferenceRange[];
  criticalLow?: number;
  criticalHigh?: number;
}

// ─── Interpret a value against its reference ranges ─────────────────────────

export function interpretValue(
  value: number,
  metric: MetricDef,
  sex?: "MALE" | "FEMALE",
  age?: number
): { color: "green" | "orange" | "red" | "gray"; label: string; rangeStr: string } {
  const matching = metric.ranges.filter(r => {
    if (r.sex && sex && r.sex !== sex) return false;
    if (r.ageMin != null && age != null && age < r.ageMin) return false;
    if (r.ageMax != null && age != null && age > r.ageMax) return false;
    return true;
  }).sort((a, b) => {
    const aS = (a.sex ? 2 : 0) + (a.ageMin != null ? 1 : 0);
    const bS = (b.sex ? 2 : 0) + (b.ageMin != null ? 1 : 0);
    return bS - aS;
  });

  const r = matching[0];
  if (!r) return { color: "gray", label: "—", rangeStr: "" };

  const rangeStr =
    r.min != null && r.max != null ? `${r.min}–${r.max}` :
    r.min != null ? `≥ ${r.min}` :
    r.max != null ? `≤ ${r.max}` : "";

  if (metric.criticalLow != null && value < metric.criticalLow)
    return { color: "red", label: "Critique ↓", rangeStr };
  if (metric.criticalHigh != null && value > metric.criticalHigh)
    return { color: "red", label: "Critique ↑", rangeStr };

  const inRange =
    (r.min == null || value >= r.min) && (r.max == null || value <= r.max);
  if (inRange) return { color: "green", label: r.label ?? "Normal", rangeStr };

  if (r.min != null && value < r.min) {
    const pct = (r.min - value) / r.min;
    return pct > 0.15
      ? { color: "red", label: "Bas ↓", rangeStr }
      : { color: "orange", label: "Limite basse", rangeStr };
  }
  if (r.max != null && value > r.max) {
    const pct = (value - r.max) / r.max;
    return pct > 0.15
      ? { color: "red", label: "Élevé ↑", rangeStr }
      : { color: "orange", label: "Limite haute", rangeStr };
  }
  return { color: "gray", label: "—", rangeStr };
}

// ─── CATALOG ────────────────────────────────────────────────────────────────

export const METRIC_CATALOG: MetricDef[] = [
  // ══ HÉMATOLOGIE ══
  { key: "rbc_t_l", label: "Hématies", unit: "T/L", examType: "BLOOD_HEMATOLOGY", category: "NFS", aliases: ["hématies","globules rouges","érythrocytes","rbc"], ranges: [{min:3.93,max:5.09,sex:"FEMALE"},{min:4.27,max:5.70,sex:"MALE"}] },
  { key: "hemoglobin_g_dl", label: "Hémoglobine", unit: "g/dL", examType: "BLOOD_HEMATOLOGY", category: "NFS", aliases: ["hémoglobine","hb","hemoglobine"], ranges: [{min:11.5,max:14.9,sex:"FEMALE"},{min:13.0,max:17.0,sex:"MALE"}], criticalLow: 7, criticalHigh: 20 },
  { key: "hematocrit_percent", label: "Hématocrite", unit: "%", examType: "BLOOD_HEMATOLOGY", category: "NFS", aliases: ["hématocrite","ht","hematocrite"], ranges: [{min:34.4,max:43.9,sex:"FEMALE"},{min:38.8,max:50,sex:"MALE"}] },
  { key: "mcv_fl", label: "VGM", unit: "fL", examType: "BLOOD_HEMATOLOGY", category: "NFS", aliases: ["vgm","volume globulaire moyen","v.g.m.","v.g.m"], ranges: [{min:80,max:100}] },
  { key: "mch_pg", label: "TCMH", unit: "pg", examType: "BLOOD_HEMATOLOGY", category: "NFS", aliases: ["tcmh","t.c.m.h.","t.c.m.h"], ranges: [{min:26,max:33}] },
  { key: "mchc_g_dl", label: "CCMH", unit: "g/dL", examType: "BLOOD_HEMATOLOGY", category: "NFS", aliases: ["ccmh","c.c.m.h.","c.c.m.h"], ranges: [{min:31.5,max:36}] },
  { key: "rdw_percent", label: "IDR", unit: "%", examType: "BLOOD_HEMATOLOGY", category: "NFS", aliases: ["idr","i.d.r.","rdw","indice de distribution des rouges"], ranges: [{min:11.5,max:14.5}] },
  { key: "leucocytes_g_l", label: "Leucocytes", unit: "G/L", examType: "BLOOD_HEMATOLOGY", category: "NFS", aliases: ["leucocytes","globules blancs","gb"], ranges: [{min:4,max:11}], criticalLow: 1, criticalHigh: 30 },
  { key: "neutrophils_g_l", label: "PNN", unit: "G/L", examType: "BLOOD_HEMATOLOGY", category: "Formule", aliases: ["polynucléaires neutrophiles","pnn","neutrophiles"], ranges: [{min:1.75,max:7.5}], criticalLow: 0.5 },
  { key: "eosinophils_g_l", label: "Éosinophiles", unit: "G/L", examType: "BLOOD_HEMATOLOGY", category: "Formule", aliases: ["polynucléaires éosinophiles","éosinophiles","eosinophiles"], ranges: [{min:0.04,max:0.55}] },
  { key: "basophils_g_l", label: "Basophiles", unit: "G/L", examType: "BLOOD_HEMATOLOGY", category: "Formule", aliases: ["polynucléaires basophiles","basophiles"], ranges: [{max:0.1}] },
  { key: "lymphocytes_g_l", label: "Lymphocytes", unit: "G/L", examType: "BLOOD_HEMATOLOGY", category: "Formule", aliases: ["lymphocytes"], ranges: [{min:1,max:4}] },
  { key: "monocytes_g_l", label: "Monocytes", unit: "G/L", examType: "BLOOD_HEMATOLOGY", category: "Formule", aliases: ["monocytes"], ranges: [{min:0.2,max:0.8}] },
  { key: "platelets_g_l", label: "Plaquettes", unit: "G/L", examType: "BLOOD_HEMATOLOGY", category: "NFS", aliases: ["plaquettes","thrombocytes"], ranges: [{min:150,max:450}], criticalLow: 50, criticalHigh: 1000 },
  { key: "reticulocytes_g_l", label: "Réticulocytes", unit: "G/L", examType: "BLOOD_HEMATOLOGY", category: "NFS", aliases: ["réticulocytes","reticulocytes"], ranges: [{min:0.02,max:0.1}] },
  { key: "esr_mm_h", label: "VS", unit: "mm/h", examType: "BLOOD_HEMATOLOGY", category: "Inflammation", aliases: ["vs","vitesse de sédimentation","v.s."], ranges: [{max:20,sex:"FEMALE"},{max:10,sex:"MALE"}] },

  // ══ HÉMOSTASE ══
  { key: "prothrombin_percent", label: "TP", unit: "%", examType: "BLOOD_HEMOSTASIS", category: "Hémostase", aliases: ["tp","taux de prothrombine"], ranges: [{min:70,max:100}], criticalLow: 40 },
  { key: "inr_ratio", label: "INR", unit: "", examType: "BLOOD_HEMOSTASIS", category: "Hémostase", aliases: ["inr","i.n.r.","i.n.r"], ranges: [{min:0.8,max:1.2}], criticalHigh: 5 },
  { key: "aptt_ratio", label: "TCA Rapport", unit: "", examType: "BLOOD_HEMOSTASIS", category: "Hémostase", aliases: ["tca rapport","tca rapport patient/témoin","tca"], ranges: [{max:1.2}] },
  { key: "aptt_patient_sec", label: "TCA Patient", unit: "sec", examType: "BLOOD_HEMOSTASIS", category: "Hémostase", aliases: ["tca temps du patient","tca patient"], ranges: [{min:25,max:35}] },
  { key: "fibrinogen_g_l", label: "Fibrinogène", unit: "g/L", examType: "BLOOD_HEMOSTASIS", category: "Hémostase", aliases: ["fibrinogène","fibrinogene"], ranges: [{min:2,max:4}], criticalLow: 1 },
  { key: "d_dimers_ug_l", label: "D-dimères", unit: "µg/L", examType: "BLOOD_HEMOSTASIS", category: "Hémostase", aliases: ["d-dimères","d-dimeres","d dimères"], ranges: [{max:500}] },

  // ══ BIOCHIMIE ══
  { key: "fasting_glycemia_mmol", label: "Glycémie à jeun", unit: "mmol/L", examType: "BLOOD_BIOCHEMISTRY", category: "Glucides", aliases: ["glycémie à jeun","glycémie a jeun","glycémie","glycemie"], ranges: [{min:3.9,max:6.1}], criticalLow: 2.8, criticalHigh: 11.1 },
  { key: "fasting_glycemia_g_l", label: "Glycémie à jeun (g/L)", unit: "g/L", examType: "BLOOD_BIOCHEMISTRY", category: "Glucides", aliases: ["glycémie g/l"], ranges: [{min:0.7,max:1.1}], criticalLow: 0.5, criticalHigh: 2.0 },
  { key: "hba1c_percent", label: "HbA1c", unit: "%", examType: "BLOOD_BIOCHEMISTRY", category: "Glucides", aliases: ["hba1c","hémoglobine glyquée","hemoglobine glyquee"], ranges: [{max:5.7,label:"Normal"}] },
  { key: "fasting_insulin_uui_ml", label: "Insulinémie à jeun", unit: "µUI/mL", examType: "BLOOD_BIOCHEMISTRY", category: "Glucides", aliases: ["insulinémie","insulinemie","insuline à jeun","insuline"], ranges: [{min:2,max:25}] },
  { key: "homa_ir", label: "HOMA-IR", unit: "", examType: "BLOOD_BIOCHEMISTRY", category: "Glucides", aliases: ["homa-ir","homa ir","homa"], ranges: [{max:2.5}] },
  { key: "sodium_mmol", label: "Sodium", unit: "mmol/L", examType: "BLOOD_BIOCHEMISTRY", category: "Ionogramme", aliases: ["sodium","na","na+","natrémie","natremie"], ranges: [{min:136,max:145}], criticalLow: 120, criticalHigh: 155 },
  { key: "potassium_mmol", label: "Potassium", unit: "mmol/L", examType: "BLOOD_BIOCHEMISTRY", category: "Ionogramme", aliases: ["potassium","k","k+","kaliémie","kaliemie"], ranges: [{min:3.5,max:5}], criticalLow: 2.5, criticalHigh: 6.5 },
  { key: "chloride_mmol", label: "Chlore", unit: "mmol/L", examType: "BLOOD_BIOCHEMISTRY", category: "Ionogramme", aliases: ["chlore","cl","cl-","chlorémie"], ranges: [{min:98,max:106}] },
  { key: "bicarbonate_mmol", label: "Bicarbonates", unit: "mmol/L", examType: "BLOOD_BIOCHEMISTRY", category: "Ionogramme", aliases: ["bicarbonates","co2 total","réserve alcaline"], ranges: [{min:22,max:29}] },
  { key: "calcium_mmol", label: "Calcium total", unit: "mmol/L", examType: "BLOOD_BIOCHEMISTRY", category: "Ionogramme", aliases: ["calcium","calcium total","ca","calcémie","calcemie"], ranges: [{min:2.15,max:2.55}], criticalLow: 1.75, criticalHigh: 3 },
  { key: "corrected_calcium_mmol", label: "Calcium corrigé", unit: "mmol/L", examType: "BLOOD_BIOCHEMISTRY", category: "Ionogramme", aliases: ["calcium corrigé","calcium corrige"], ranges: [{min:2.15,max:2.55}] },
  { key: "ionized_calcium_mmol", label: "Calcium ionisé", unit: "mmol/L", examType: "BLOOD_BIOCHEMISTRY", category: "Ionogramme", aliases: ["calcium ionisé","calcium ionise","ca++","ca2+"], ranges: [{min:1.12,max:1.32}] },
  { key: "phosphorus_mmol", label: "Phosphore", unit: "mmol/L", examType: "BLOOD_BIOCHEMISTRY", category: "Ionogramme", aliases: ["phosphore","phosphatémie","phosphatemie","phosphate"], ranges: [{min:0.8,max:1.5}], criticalLow: 0.3 },
  { key: "magnesium_mmol", label: "Magnésium", unit: "mmol/L", examType: "BLOOD_BIOCHEMISTRY", category: "Ionogramme", aliases: ["magnésium","magnesium","mg","magnésémie"], ranges: [{min:0.75,max:1}] },
  { key: "creatinine_umol", label: "Créatinine", unit: "µmol/L", examType: "BLOOD_BIOCHEMISTRY", category: "Rénal", aliases: ["créatinine","creatinine"], ranges: [{min:45,max:90,sex:"FEMALE"},{min:60,max:110,sex:"MALE"}] },
  { key: "gfr_ml_min", label: "DFG estimé", unit: "mL/min/1.73m²", examType: "BLOOD_BIOCHEMISTRY", category: "Rénal", aliases: ["dfg","dfg estimé","estimation du dfg","dfg ckd-epi","débit de filtration glomérulaire"], ranges: [{min:90}], criticalLow: 15 },
  { key: "urea_mmol", label: "Urée", unit: "mmol/L", examType: "BLOOD_BIOCHEMISTRY", category: "Rénal", aliases: ["urée","uree"], ranges: [{min:2.5,max:7.5}] },
  { key: "uric_acid_umol", label: "Acide urique", unit: "µmol/L", examType: "BLOOD_BIOCHEMISTRY", category: "Rénal", aliases: ["acide urique","uricémie"], ranges: [{min:150,max:360,sex:"FEMALE"},{min:200,max:420,sex:"MALE"}] },
  { key: "total_protein_g_l", label: "Protéines totales", unit: "g/L", examType: "BLOOD_BIOCHEMISTRY", category: "Protéines", aliases: ["protéines totales","proteines totales","protides totaux","protidémie"], ranges: [{min:66,max:83}] },
  { key: "albumin_g_l", label: "Albumine", unit: "g/L", examType: "BLOOD_BIOCHEMISTRY", category: "Protéines", aliases: ["albumine","albuminémie"], ranges: [{min:35,max:50}], criticalLow: 20 },
  { key: "prealbumin_g_l", label: "Préalbumine", unit: "g/L", examType: "BLOOD_BIOCHEMISTRY", category: "Protéines", aliases: ["préalbumine","prealbumine","transthyrétine"], ranges: [{min:0.2,max:0.4}] },

  // ══ HÉPATIQUE ══
  { key: "asat_ui_l", label: "ASAT", unit: "UI/L", examType: "BLOOD_HEPATIC", category: "Hépatique", aliases: ["asat","sgot","transaminases sgot","transaminases s.g.o.t","transaminases s.g.o.t/asat","tgo"], ranges: [{min:5,max:34,sex:"FEMALE"},{min:5,max:40,sex:"MALE"}] },
  { key: "alat_ui_l", label: "ALAT", unit: "UI/L", examType: "BLOOD_HEPATIC", category: "Hépatique", aliases: ["alat","sgpt","transaminases sgpt","transaminases s.g.p.t","transaminases s.g.p.t/alat","tgp"], ranges: [{max:55}] },
  { key: "ggt_ui_l", label: "GGT", unit: "UI/L", examType: "BLOOD_HEPATIC", category: "Hépatique", aliases: ["ggt","gamma-gt","gamma gt","gamma-glutamyl transférase","gamma-glutamyl transferase"], ranges: [{min:6,max:40,sex:"FEMALE"},{min:8,max:61,sex:"MALE"}] },
  { key: "alp_ui_l", label: "PAL", unit: "UI/L", examType: "BLOOD_HEPATIC", category: "Hépatique", aliases: ["pal","phosphatases alcalines"], ranges: [{min:35,max:105,sex:"FEMALE"},{min:40,max:130,sex:"MALE"}] },
  { key: "bilirubin_total_umol", label: "Bilirubine totale", unit: "µmol/L", examType: "BLOOD_HEPATIC", category: "Hépatique", aliases: ["bilirubine totale","bilirubine"], ranges: [{min:5,max:21}] },
  { key: "bilirubin_direct_umol", label: "Bilirubine conjuguée", unit: "µmol/L", examType: "BLOOD_HEPATIC", category: "Hépatique", aliases: ["bilirubine conjuguée","bilirubine directe"], ranges: [{max:5}] },
  { key: "ldh_ui_l", label: "LDH", unit: "UI/L", examType: "BLOOD_HEPATIC", category: "Hépatique", aliases: ["ldh","lactate déshydrogénase"], ranges: [{min:120,max:246}] },
  { key: "ammonia_umol", label: "Ammoniémie", unit: "µmol/L", examType: "BLOOD_HEPATIC", category: "Hépatique", aliases: ["ammoniémie","ammoniemie"], ranges: [{min:10,max:50}], criticalHigh: 100 },

  // ══ LIPIDIQUE ══
  { key: "total_cholesterol_mmol", label: "Cholestérol total", unit: "mmol/L", examType: "BLOOD_LIPID", category: "Lipides", aliases: ["cholestérol total","cholesterol total","cholestérol","cholesterol"], ranges: [{max:5.2,label:"Souhaitable"}] },
  { key: "ldl_mmol", label: "LDL", unit: "mmol/L", examType: "BLOOD_LIPID", category: "Lipides", aliases: ["ldl","ldl-cholestérol","ldl cholestérol","cholestérol ldl","calcul du cholestérol ldl"], ranges: [{max:3.4,label:"Souhaitable"}] },
  { key: "hdl_mmol", label: "HDL", unit: "mmol/L", examType: "BLOOD_LIPID", category: "Lipides", aliases: ["hdl","hdl-cholestérol","hdl cholestérol","cholestérol hdl"], ranges: [{min:1.03}] },
  { key: "triglycerides_mmol", label: "Triglycérides", unit: "mmol/L", examType: "BLOOD_LIPID", category: "Lipides", aliases: ["triglycérides","triglycerides","tg"], ranges: [{max:1.7}] },
  { key: "non_hdl_cholesterol_mmol", label: "Cholestérol non-HDL", unit: "mmol/L", examType: "BLOOD_LIPID", category: "Lipides", aliases: ["cholestérol non-hdl","cholesterol non-hdl","non-hdl","calcul du cholestérol non-hdl"], ranges: [{max:3.8}] },

  // ══ MARTIAL ══
  { key: "iron_umol", label: "Fer sérique", unit: "µmol/L", examType: "BLOOD_IRON", category: "Martial", aliases: ["fer","fer sérique","fer serique","sidérémie"], ranges: [{min:9,max:30,sex:"FEMALE"},{min:12,max:30,sex:"MALE"}] },
  { key: "ferritin_ug_l", label: "Ferritine", unit: "µg/L", examType: "BLOOD_IRON", category: "Martial", aliases: ["ferritine","ferritinémie"], ranges: [{min:15,max:150,sex:"FEMALE"},{min:30,max:400,sex:"MALE"}] },
  { key: "transferrin_g_l", label: "Transferrine", unit: "g/L", examType: "BLOOD_IRON", category: "Martial", aliases: ["transferrine","sidérophiline"], ranges: [{min:2,max:3.6}] },
  { key: "transferrin_saturation_percent", label: "CST", unit: "%", examType: "BLOOD_IRON", category: "Martial", aliases: ["cst","coefficient de saturation de la transferrine","coefficient saturation transferrine"], ranges: [{min:16,max:45}] },

  // ══ VITAMINES ══
  { key: "vitamin_d_ng_ml", label: "Vitamine D", unit: "ng/mL", examType: "BLOOD_VITAMINS", category: "Vitamines", aliases: ["vitamine d","25-oh vitamine d","25oh vitamine d","25-hydroxyvitamine d"], ranges: [{min:30,max:100}] },
  { key: "vitamin_b12_pg_ml", label: "Vitamine B12", unit: "pg/mL", examType: "BLOOD_VITAMINS", category: "Vitamines", aliases: ["vitamine b12","b12","cobalamine"], ranges: [{min:200,max:900}] },
  { key: "folates_nmol", label: "Folates", unit: "nmol/L", examType: "BLOOD_VITAMINS", category: "Vitamines", aliases: ["folates","acide folique","vitamine b9","b9"], ranges: [{min:7,max:45}] },
  { key: "zinc_umol", label: "Zinc", unit: "µmol/L", examType: "BLOOD_VITAMINS", category: "Oligoéléments", aliases: ["zinc"], ranges: [{min:11,max:23}] },
  { key: "vitamin_b1_nmol", label: "Vitamine B1", unit: "nmol/L", examType: "BLOOD_VITAMINS", category: "Vitamines", aliases: ["vitamine b1","thiamine"], ranges: [{min:66,max:200}] },
  { key: "copper_umol", label: "Cuivre", unit: "µmol/L", examType: "BLOOD_VITAMINS", category: "Oligoéléments", aliases: ["cuivre"], ranges: [{min:12,max:24,sex:"FEMALE"},{min:11,max:22,sex:"MALE"}] },

  // ══ ENDOCRINO ══
  { key: "tsh_mui_l", label: "TSH", unit: "mUI/L", examType: "BLOOD_ENDOCRINE", category: "Thyroïde", aliases: ["tsh","tsh ultra-sensible","tsh us","t.s.h.","t.s.h. ultra-sensible"], ranges: [{min:0.35,max:4.94}] },
  { key: "ft4_pmol", label: "T4 libre", unit: "pmol/L", examType: "BLOOD_ENDOCRINE", category: "Thyroïde", aliases: ["t4 libre","t4l","ft4"], ranges: [{min:12,max:22}] },
  { key: "ft3_pmol", label: "T3 libre", unit: "pmol/L", examType: "BLOOD_ENDOCRINE", category: "Thyroïde", aliases: ["t3 libre","t3l","ft3"], ranges: [{min:3.1,max:6.8}] },
  { key: "cortisol_nmol", label: "Cortisol (8h)", unit: "nmol/L", examType: "BLOOD_ENDOCRINE", category: "Surrénales", aliases: ["cortisol","cortisol 8h","cortisolémie"], ranges: [{min:170,max:540}] },
  { key: "lh_ui_l", label: "LH", unit: "UI/L", examType: "BLOOD_ENDOCRINE", category: "Gonadotropines", aliases: ["lh","hormone lutéinisante"], ranges: [{min:2,max:15,sex:"FEMALE",label:"Phase folliculaire"}] },
  { key: "fsh_ui_l", label: "FSH", unit: "UI/L", examType: "BLOOD_ENDOCRINE", category: "Gonadotropines", aliases: ["fsh","hormone folliculostimulante"], ranges: [{min:3,max:10,sex:"FEMALE",label:"Phase folliculaire"}] },
  { key: "estradiol_pmol", label: "Estradiol", unit: "pmol/L", examType: "BLOOD_ENDOCRINE", category: "Stéroïdes sexuels", aliases: ["estradiol","oestradiol","e2"], ranges: [{min:70,max:530,sex:"FEMALE",label:"Phase folliculaire"}] },
  { key: "testosterone_total_nmol", label: "Testostérone totale", unit: "nmol/L", examType: "BLOOD_ENDOCRINE", category: "Stéroïdes sexuels", aliases: ["testostérone","testosterone","testostérone totale"], ranges: [{min:8.6,max:29,sex:"MALE"},{max:2,sex:"FEMALE"}] },
  { key: "prolactin_ng_ml", label: "Prolactine", unit: "ng/mL", examType: "BLOOD_ENDOCRINE", category: "Hypophyse", aliases: ["prolactine","prl"], ranges: [{max:25,sex:"FEMALE"},{max:15,sex:"MALE"}] },
  { key: "amh_ng_ml", label: "AMH", unit: "ng/mL", examType: "BLOOD_ENDOCRINE", category: "Ovarien", aliases: ["amh","hormone anti-müllérienne","hormone anti-mullerienne"], ranges: [{min:1,max:10,sex:"FEMALE"}] },
  { key: "leptin_ng_ml", label: "Leptine", unit: "ng/mL", examType: "BLOOD_ENDOCRINE", category: "Adipokines", aliases: ["leptine","leptinémie"], ranges: [{min:3.7,max:11.1,sex:"FEMALE"}] },
  { key: "igf1_ng_ml", label: "IGF-1", unit: "ng/mL", examType: "BLOOD_ENDOCRINE", category: "Croissance", aliases: ["igf-1","igf1","somatomédine c"], ranges: [] },

  // ══ IMMUNOLOGIE ══
  { key: "crp_mg_l", label: "CRP", unit: "mg/L", examType: "BLOOD_IMMUNOLOGY", category: "Inflammation", aliases: ["crp","protéine c réactive","proteine c reactive","protéine c réactive (crp)"], ranges: [{max:5}], criticalHigh: 100 },
  { key: "pct_ng_ml", label: "Procalcitonine", unit: "ng/mL", examType: "BLOOD_IMMUNOLOGY", category: "Inflammation", aliases: ["procalcitonine","pct"], ranges: [{max:0.1}], criticalHigh: 2 },
  { key: "iga_total_g_l", label: "IgA totales", unit: "g/L", examType: "BLOOD_IMMUNOLOGY", category: "Immunoglobulines", aliases: ["iga totales","iga","immunoglobulines a"], ranges: [{min:0.7,max:4}] },
  { key: "igg_total_g_l", label: "IgG totales", unit: "g/L", examType: "BLOOD_IMMUNOLOGY", category: "Immunoglobulines", aliases: ["igg totales","igg","immunoglobulines g"], ranges: [{min:7,max:16}] },
  { key: "igm_total_g_l", label: "IgM totales", unit: "g/L", examType: "BLOOD_IMMUNOLOGY", category: "Immunoglobulines", aliases: ["igm totales","igm","immunoglobulines m"], ranges: [{min:0.4,max:2.3}] },
  { key: "anti_ccp_ui_ml", label: "Anti-CCP", unit: "UI/mL", examType: "BLOOD_IMMUNOLOGY", category: "Auto-immunité", aliases: ["anti-ccp","anticorps anti-peptides cycliques citrullinés"], ranges: [{max:5}] },
  { key: "rheumatoid_factor_ui_ml", label: "Facteur rhumatoïde", unit: "UI/mL", examType: "BLOOD_IMMUNOLOGY", category: "Auto-immunité", aliases: ["facteur rhumatoïde","facteurs rhumatoïdes","fr","latex","waaler rose","igm anti-igg"], ranges: [{max:20}] },
  { key: "ana_titer", label: "AAN", unit: "", examType: "BLOOD_IMMUNOLOGY", category: "Auto-immunité", aliases: ["aan","anticorps anti-nucléaires","anticorps antinucléaires","ana"], ranges: [{max:80,label:"Négatif"}] },
  { key: "anca_titer", label: "ANCA", unit: "", examType: "BLOOD_IMMUNOLOGY", category: "Auto-immunité", aliases: ["anca","anticorps anti-cytoplasme des polynucléaires neutrophiles"], ranges: [{max:20,label:"Négatif"}] },
  { key: "complement_c3_g_l", label: "C3", unit: "g/L", examType: "BLOOD_IMMUNOLOGY", category: "Complément", aliases: ["c3","complément c3"], ranges: [{min:0.9,max:1.8}] },
  { key: "complement_c4_g_l", label: "C4", unit: "g/L", examType: "BLOOD_IMMUNOLOGY", category: "Complément", aliases: ["c4","complément c4"], ranges: [{min:0.1,max:0.4}] },
  // EPP
  { key: "albumin_electro_percent", label: "Albumine (EPP)", unit: "%", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["albumine %","albumine epp"], ranges: [{min:55.8,max:66.1}] },
  { key: "alpha1_globulin_percent", label: "Alpha-1 globulines", unit: "%", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["alpha 1 globulines","alpha1 globulines","α1 globulines"], ranges: [{min:2.9,max:4.9}] },
  { key: "alpha2_globulin_percent", label: "Alpha-2 globulines", unit: "%", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["alpha 2 globulines","alpha2 globulines","α2 globulines"], ranges: [{min:7.1,max:11.8}] },
  { key: "beta1_globulin_percent", label: "Bêta-1 globulines", unit: "%", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["bêta 1 globulines","beta 1 globulines","β1 globulines"], ranges: [{min:4.7,max:7.2}] },
  { key: "beta2_globulin_percent", label: "Bêta-2 globulines", unit: "%", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["bêta 2 globulines","beta 2 globulines","β2 globulines"], ranges: [{min:3.2,max:6.5}] },
  { key: "gamma_globulin_percent", label: "Gamma globulines", unit: "%", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["gamma globulines","γ globulines","gammaglobulines"], ranges: [{min:11.1,max:18.8}] },

  // ══ MÉTABOLIQUE ══
  { key: "haptoglobin_g_l", label: "Haptoglobine", unit: "g/L", examType: "BLOOD_HEMOGLOBINOPATHY", category: "Hémolyse", aliases: ["haptoglobine"], ranges: [{min:0.3,max:2}] },
  { key: "lactate_mmol", label: "Lactates", unit: "mmol/L", examType: "BLOOD_HEMOGLOBINOPATHY", category: "Métabolique", aliases: ["lactates","acide lactique"], ranges: [{min:0.5,max:2.2}], criticalHigh: 5 },
  { key: "amylase_ui_l", label: "Amylase", unit: "UI/L", examType: "BLOOD_HEMOGLOBINOPATHY", category: "Pancréas", aliases: ["amylase"], ranges: [{min:28,max:100}] },
  { key: "lipase_ui_l", label: "Lipase", unit: "UI/L", examType: "BLOOD_HEMOGLOBINOPATHY", category: "Pancréas", aliases: ["lipase"], ranges: [{max:60}], criticalHigh: 180 },

  // ══ SELLES ══
  { key: "fecal_calprotectin_ug_g", label: "Calprotectine fécale", unit: "µg/g", examType: "STOOL", category: "Inflammation", aliases: ["calprotectine fécale","calprotectine"], ranges: [{max:50}], criticalHigh: 500 },

  // ══ URINES ══
  { key: "proteinuria_mg_24h", label: "Protéinurie 24h", unit: "mg/24h", examType: "URINE", category: "Rénal", aliases: ["protéinurie","proteinurie"], ranges: [{max:150}] },
  { key: "microalbuminuria_mg_l", label: "Microalbuminurie", unit: "mg/L", examType: "URINE", category: "Rénal", aliases: ["microalbuminurie"], ranges: [{max:20}] },

  // ══ BIA ══
  { key: "bia_fat_mass_percent", label: "Masse grasse %", unit: "%", examType: "BIA", category: "Composition corporelle", aliases: ["masse grasse %","% masse grasse"], ranges: [{min:20,max:30,sex:"FEMALE"},{min:10,max:20,sex:"MALE"}] },
  { key: "bia_phase_angle", label: "Angle de phase", unit: "°", examType: "BIA", category: "Intégrité cellulaire", aliases: ["angle de phase","phase angle"], ranges: [{min:5,max:7}], criticalLow: 4 },
  { key: "bia_ffmi", label: "FFMI", unit: "kg/m²", examType: "BIA", category: "Index", aliases: ["ffmi","fat free mass index"], ranges: [{min:15,sex:"FEMALE"},{min:17,sex:"MALE"}] },

  // ══ DXA ══
  { key: "dxa_tscore_spine", label: "T-score rachis", unit: "DS", examType: "DXA_BONE", category: "Densité osseuse", aliases: ["t-score rachis","t-score l1-l4"], ranges: [{min:-1}] },
  { key: "dxa_zscore_spine", label: "Z-score rachis", unit: "DS", examType: "DXA_BONE", category: "Densité osseuse", aliases: ["z-score rachis","z-score l1-l4"], ranges: [{min:-2}] },

  // ══ CALORIMÉTRIE ══
  { key: "calori_rq", label: "Quotient respiratoire", unit: "", examType: "CALORIMETRY", category: "Métabolisme", aliases: ["qr","rq","quotient respiratoire"], ranges: [{min:0.7,max:1}] },

  // ══ ECG ══
  { key: "ecg_qtc_ms", label: "QTc", unit: "ms", examType: "ECG", category: "Repolarisation", aliases: ["qtc","qt corrigé","qtc bazett"], ranges: [{max:440,sex:"MALE"},{max:460,sex:"FEMALE"}], criticalHigh: 500 },
  { key: "ecg_pr_ms", label: "Intervalle PR", unit: "ms", examType: "ECG", category: "Conduction", aliases: ["intervalle pr","pr"], ranges: [{min:120,max:200}] },
  { key: "ecg_qrs_ms", label: "QRS", unit: "ms", examType: "ECG", category: "Conduction", aliases: ["durée qrs","qrs"], ranges: [{max:120}] },

  // ══ ANTHROPOMÉTRIE ══
  { key: "weight_kg", label: "Poids", unit: "kg", examType: "ANTHROPOMETRY", category: "Mesures", aliases: ["poids"], ranges: [] },
  { key: "height_cm", label: "Taille", unit: "cm", examType: "ANTHROPOMETRY", category: "Mesures", aliases: ["taille"], ranges: [] },
  { key: "bmi", label: "IMC", unit: "kg/m²", examType: "ANTHROPOMETRY", category: "Mesures", aliases: ["imc","bmi","indice de masse corporelle"], ranges: [{min:18.5,max:25}] },
  { key: "waist_circumference_cm", label: "Tour de taille", unit: "cm", examType: "ANTHROPOMETRY", category: "Mesures", aliases: ["tour de taille","périmètre abdominal"], ranges: [{max:80,sex:"FEMALE"},{max:94,sex:"MALE"}] },
  { key: "heart_rate_bpm", label: "FC repos", unit: "bpm", examType: "ANTHROPOMETRY", category: "Vitaux", aliases: ["fc repos","fréquence cardiaque","fc","pouls"], ranges: [{min:60,max:100}], criticalLow: 40, criticalHigh: 150 },
  { key: "systolic_bp_mmhg", label: "TA systolique", unit: "mmHg", examType: "ANTHROPOMETRY", category: "Vitaux", aliases: ["ta systolique","pression artérielle systolique","pas"], ranges: [{max:140}], criticalHigh: 180 },
  { key: "diastolic_bp_mmhg", label: "TA diastolique", unit: "mmHg", examType: "ANTHROPOMETRY", category: "Vitaux", aliases: ["ta diastolique","pression artérielle diastolique","pad"], ranges: [{max:90}], criticalHigh: 120 },
  { key: "spo2_percent", label: "SpO2", unit: "%", examType: "ANTHROPOMETRY", category: "Vitaux", aliases: ["spo2","saturation en oxygène"], ranges: [{min:95,max:100}], criticalLow: 90 },
  { key: "temperature_c", label: "Température", unit: "°C", examType: "ANTHROPOMETRY", category: "Vitaux", aliases: ["température","temperature"], ranges: [{min:36,max:37.5}], criticalLow: 35, criticalHigh: 40 },

  // ══ PSYCHIATRIE ══
  { key: "phq9_score", label: "PHQ-9", unit: "", examType: "PSYCHIATRY_SCALES", category: "Dépression", aliases: ["phq-9","phq9"], ranges: [{max:4,label:"Minimal"}] },
  { key: "gad7_score", label: "GAD-7", unit: "", examType: "PSYCHIATRY_SCALES", category: "Anxiété", aliases: ["gad-7","gad7"], ranges: [{max:4,label:"Minimal"}] },
  { key: "eat26_score", label: "EAT-26", unit: "", examType: "PSYCHIATRY_SCALES", category: "TCA", aliases: ["eat-26","eat26"], ranges: [{max:20,label:"Normal"}] },
  { key: "scoff_score", label: "SCOFF", unit: "", examType: "PSYCHIATRY_SCALES", category: "TCA", aliases: ["scoff"], ranges: [{max:1,label:"Négatif"}] },

  // ══ GASTRO ══
  { key: "fibroscan_kpa", label: "FibroScan", unit: "kPa", examType: "GASTRO", category: "Fibrose hépatique", aliases: ["fibroscan","élastographie hépatique"], ranges: [{max:7,label:"F0-F1"}], criticalHigh: 12 },

  // ══ ÉCHO CARDIAQUE ══
  { key: "echo_lvef_percent", label: "FEVG", unit: "%", examType: "ECHO_CARDIAC", category: "Fonction systolique", aliases: ["fevg","fraction d'éjection","lvef"], ranges: [{min:55,max:70}], criticalLow: 35 },

  // ══ PSG ══
  { key: "psg_ahi", label: "IAH", unit: "/h", examType: "PSG", category: "Apnées", aliases: ["iah","index d'apnées-hypopnées","ahi"], ranges: [{max:5,label:"Normal adulte"}] },

  // ══ EFR ══
  { key: "efr_tiffeneau_percent", label: "VEMS/CVF", unit: "%", examType: "EFR", category: "Spirométrie", aliases: ["vems/cvf","rapport de tiffeneau","tiffeneau"], ranges: [{min:70}] },
];

// ─── BUILD MAPS ─────────────────────────────────────────────────────────────

export const ALIAS_TO_KEY: Record<string, string> = {};
for (const m of METRIC_CATALOG) {
  for (const a of m.aliases) ALIAS_TO_KEY[a.toLowerCase()] = m.key;
  ALIAS_TO_KEY[m.label.toLowerCase()] = m.key;
}

export const KEY_TO_METRIC: Record<string, MetricDef> = {};
for (const m of METRIC_CATALOG) KEY_TO_METRIC[m.key] = m;

export const ALL_BIO_KEYS = new Set(METRIC_CATALOG.map(m => m.key));

export const EXAM_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  BLOOD_HEMATOLOGY: { label: "Hématologie", icon: "🩸" },
  BLOOD_HEMOSTASIS: { label: "Hémostase", icon: "🩸" },
  BLOOD_BIOCHEMISTRY: { label: "Biochimie", icon: "🧪" },
  BLOOD_HEPATIC: { label: "Bilan hépatique", icon: "🧪" },
  BLOOD_LIPID: { label: "Bilan lipidique", icon: "🧪" },
  BLOOD_IRON: { label: "Bilan martial", icon: "🧪" },
  BLOOD_VITAMINS: { label: "Vitamines & oligoéléments", icon: "💊" },
  BLOOD_ENDOCRINE: { label: "Endocrinologie", icon: "⚗️" },
  BLOOD_IMMUNOLOGY: { label: "Immunologie", icon: "🛡️" },
  BLOOD_HEMOGLOBINOPATHY: { label: "Métabolique", icon: "🩸" },
  STOOL: { label: "Selles", icon: "🧫" },
  URINE: { label: "Urines", icon: "🧫" },
  BIA: { label: "Impédancemétrie (BIA)", icon: "⚡" },
  DXA_BODY: { label: "DXA — Composition corporelle", icon: "🦴" },
  DXA_BONE: { label: "Densitométrie osseuse", icon: "🦴" },
  CALORIMETRY: { label: "Calorimétrie", icon: "🔥" },
  ECG: { label: "ECG", icon: "❤️" },
  EFFORT_TEST: { label: "Épreuve d'effort", icon: "🏃" },
  EFR: { label: "EFR", icon: "🫁" },
  PSG: { label: "Polysomnographie", icon: "😴" },
  ECHO_CARDIAC: { label: "Écho cardiaque", icon: "❤️" },
  GASTRO: { label: "Gastro-entérologie", icon: "🫄" },
  PSYCHIATRY_SCALES: { label: "Échelles psychiatriques", icon: "🧠" },
  ANTHROPOMETRY: { label: "Anthropométrie", icon: "📏" },
  OTHER: { label: "Autres", icon: "📋" },
};
