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
  { key: "tca_temps_du_t_moin", label: "TCA Témoin", unit: "sec", examType: "BLOOD_HEMOSTASIS", category: "Hémostase", aliases: ["tca témoin","tca temps du témoin"], ranges: [{min:28,max:38}] },
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
  { key: "facteurs_rhumato_des_igm_anti_igg_animales", label: "FR IgM", unit: "UI/mL", examType: "BLOOD_IMMUNOLOGY", category: "Auto-immunité", aliases: ["facteurs rhumatoïdes igm","fr igm anti-igg","facteurs rhumatoïdes des igm"], ranges: [{max:20}] },
  { key: "ana_titer", label: "AAN", unit: "", examType: "BLOOD_IMMUNOLOGY", category: "Auto-immunité", aliases: ["aan","anticorps anti-nucléaires","anticorps antinucléaires","ana"], ranges: [{max:80,label:"Négatif"}] },
  { key: "anca_titer", label: "ANCA", unit: "", examType: "BLOOD_IMMUNOLOGY", category: "Auto-immunité", aliases: ["anca","anticorps anti-cytoplasme des polynucléaires neutrophiles"], ranges: [{max:20,label:"Négatif"}] },
  { key: "complement_c3_g_l", label: "C3", unit: "g/L", examType: "BLOOD_IMMUNOLOGY", category: "Complément", aliases: ["c3","complément c3"], ranges: [{min:0.9,max:1.8}] },
  { key: "complement_c4_g_l", label: "C4", unit: "g/L", examType: "BLOOD_IMMUNOLOGY", category: "Complément", aliases: ["c4","complément c4"], ranges: [{min:0.1,max:0.4}] },
  // EPP
  { key: "albumin_electro_percent", label: "Albumine (EPP)", unit: "%", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["albumine %","albumine epp"], ranges: [{min:55.8,max:66.1}] },
  { key: "electrophor_se_albumine", label: "Albumine EPP", unit: "g/L", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["albumine epp g/l","albumine electrophorèse g/l"], ranges: [{min:35,max:50}] },
  { key: "alpha1_globulin_percent", label: "Alpha-1 globulines", unit: "%", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["alpha 1 globulines","alpha1 globulines","α1 globulines"], ranges: [{min:2.9,max:4.9}] },
  { key: "electrophor_se_alpha_1_globulines", label: "Alpha-1 globulines", unit: "g/L", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["alpha-1 globulines g/l"], ranges: [{min:1.3,max:3.9}] },
  { key: "alpha2_globulin_percent", label: "Alpha-2 globulines", unit: "%", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["alpha 2 globulines","alpha2 globulines","α2 globulines"], ranges: [{min:7.1,max:11.8}] },
  { key: "electrophor_se_alpha_2_globulines", label: "Alpha-2 globulines", unit: "g/L", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["alpha-2 globulines g/l"], ranges: [{min:4.0,max:9.0}] },
  { key: "beta1_globulin_percent", label: "Bêta-1 globulines", unit: "%", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["bêta 1 globulines","beta 1 globulines","β1 globulines"], ranges: [{min:4.7,max:7.2}] },
  { key: "electrophor_se_b_ta_1_globulines", label: "Bêta-1 globulines", unit: "g/L", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["bêta-1 globulines g/l","beta-1 globulines g/l"], ranges: [{min:2.5,max:5.5}] },
  { key: "beta2_globulin_percent", label: "Bêta-2 globulines", unit: "%", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["bêta 2 globulines","beta 2 globulines","β2 globulines"], ranges: [{min:3.2,max:6.5}] },
  { key: "electrophor_se_b_ta_2_globulines", label: "Bêta-2 globulines", unit: "g/L", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["bêta-2 globulines g/l","beta-2 globulines g/l"], ranges: [{min:1.5,max:4.0}] },
  { key: "gamma_globulin_percent", label: "Gamma globulines", unit: "%", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["gamma globulines","γ globulines","gammaglobulines"], ranges: [{min:11.1,max:18.8}] },
  { key: "electrophor_se_gamma_globulines", label: "Gamma globulines", unit: "g/L", examType: "BLOOD_IMMUNOLOGY", category: "Électrophorèse", aliases: ["gamma globulines g/l","gammaglobulines g/l"], ranges: [{min:6.0,max:16.0}] },

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
  { key: "bia_fat_mass_percent", label: "Masse grasse %", unit: "%", examType: "BIA", category: "Composition corporelle", aliases: ["masse grasse %","% masse grasse","fat mass %","fm %"], ranges: [{min:20,max:30,sex:"FEMALE"},{min:10,max:20,sex:"MALE"}] },
  { key: "bia_phase_angle", label: "Angle de phase", unit: "°", examType: "BIA", category: "Marqueurs bioélectriques", aliases: ["angle de phase","phase angle","pa (50khz)","pa_50khz"], ranges: [{min:5,max:7}], criticalLow: 4 },
  { key: "bia_ffmi", label: "FFMI", unit: "kg/m²", examType: "BIA", category: "Index", aliases: ["ffmi","fat free mass index","indice masse maigre"], ranges: [{min:15,sex:"FEMALE"},{min:17,sex:"MALE"}] },
  { key: "bia_fat_mass_kg", label: "Masse grasse", unit: "kg", examType: "BIA", category: "Composition corporelle", aliases: ["masse grasse (kg)","fat mass","fm (kg)","masse grasse kg","fat mass (fm)"], ranges: [] },
  { key: "bia_fat_free_mass_kg", label: "Masse maigre (FFM)", unit: "kg", examType: "BIA", category: "Composition corporelle", aliases: ["masse maigre","fat-free mass","ffm (kg)","ffm kg","masse maigre (ffm)","lean mass"], ranges: [] },
  { key: "bia_skeletal_muscle_mass", label: "Masse musculaire squelettique", unit: "kg", examType: "BIA", category: "Composition corporelle", aliases: ["masse musculaire squelettique","skeletal muscle mass","smm","smm (kg)","smm kg"], ranges: [] },
  { key: "bia_appendicular_smm", label: "Masse musculaire appendiculaire", unit: "kg", examType: "BIA", category: "Composition corporelle", aliases: ["masse musculaire appendiculaire","appendicular smm","asmm","asmm (kg)"], ranges: [] },
  { key: "bia_total_body_water", label: "Eau corporelle totale (TBW)", unit: "L", examType: "BIA", category: "Hydratation", aliases: ["eau corporelle totale","total body water","tbw","tbw (l)","eau totale"], ranges: [] },
  { key: "bia_extracellular_water", label: "Eau extracellulaire (ECW)", unit: "L", examType: "BIA", category: "Hydratation", aliases: ["eau extracellulaire","extracellular water","ecw","ecw (l)","eau extra-cellulaire"], ranges: [] },
  { key: "bia_intracellular_water", label: "Eau intracellulaire (ICW)", unit: "L", examType: "BIA", category: "Hydratation", aliases: ["eau intracellulaire","intracellular water","icw","icw (l)"], ranges: [] },
  { key: "bia_ecw_tbw_ratio", label: "Ratio ECW/TBW", unit: "%", examType: "BIA", category: "Hydratation", aliases: ["ratio ecw/tbw","ecw/tbw","ecw tbw ratio","taux hydratation extracellulaire"], ranges: [{min:39,max:45}] },
  { key: "bia_bone_mineral_content", label: "Contenu minéral osseux", unit: "kg", examType: "BIA", category: "Composition corporelle", aliases: ["contenu minéral osseux","bone mineral content","bmc","minéral osseux"], ranges: [] },
  { key: "bia_total_protein_mass", label: "Masse protéique totale", unit: "kg", examType: "BIA", category: "Composition corporelle", aliases: ["masse protéique totale","total protein mass","protein mass","masse protéique"], ranges: [] },
  { key: "bia_body_cell_mass", label: "Masse cellulaire active (BCM)", unit: "kg", examType: "BIA", category: "Composition corporelle", aliases: ["masse cellulaire active","body cell mass","bcm","bcm (kg)"], ranges: [] },
  { key: "bia_ecm_bcm_ratio", label: "Ratio ECM/BCM", unit: "", examType: "BIA", category: "Marqueurs bioélectriques", aliases: ["ratio ecm/bcm","ecm/bcm","ecm bcm ratio"], ranges: [{max:1.0}] },
  { key: "bia_fmi", label: "FMI (Fat Mass Index)", unit: "kg/m²", examType: "BIA", category: "Index", aliases: ["fmi","fat mass index","indice masse grasse"], ranges: [] },
  { key: "bia_asmi", label: "ASMI (Appendicular SMM Index)", unit: "kg/m²", examType: "BIA", category: "Index", aliases: ["asmi","appendicular skeletal muscle index","asmi (kg/m²)"], ranges: [{min:5.7,sex:"FEMALE"},{min:7.0,sex:"MALE"}] },
  { key: "bia_smi", label: "SMI (Skeletal Muscle Index)", unit: "kg/m²", examType: "BIA", category: "Index", aliases: ["smi","skeletal muscle index","smi (kg/m²)"], ranges: [] },
  { key: "bia_basal_metabolic_rate", label: "Métabolisme de base", unit: "kcal", examType: "BIA", category: "Métabolisme", aliases: ["métabolisme de base","basal metabolic rate","bmr","mb (kcal)","mb kcal"], ranges: [] },
  { key: "bia_impedance_ratio", label: "Ratio d'impédance (Z200/Z5)", unit: "", examType: "BIA", category: "Marqueurs bioélectriques", aliases: ["ratio impédance","impedance ratio","z200/z5","ir","ratio z200/z5"], ranges: [{min:0.75,max:0.85}] },
  { key: "bia_z50_impedance", label: "Impédance Z50", unit: "Ω", examType: "BIA", category: "Marqueurs bioélectriques", aliases: ["impédance z50","z50","z50 (ω)","impedance z50"], ranges: [] },
  { key: "bia_smm_weight_ratio", label: "Ratio SMM/Poids", unit: "%", examType: "BIA", category: "Composition corporelle", aliases: ["ratio smm/poids","smm/weight","smm weight ratio"], ranges: [] },
  // Masses supplémentaires
  { key: "bia_dry_fat_free_mass", label: "Masse maigre sèche", unit: "kg", examType: "BIA", category: "Composition corporelle", aliases: ["masse maigre sèche","dry fat free mass","dry ffm","dry lean mass"], ranges: [] },
  { key: "bia_metabolic_protein_mass", label: "Masse protéique métabolique", unit: "kg", examType: "BIA", category: "Composition corporelle", aliases: ["masse protéique métabolique","metabolic protein mass","metabolic protein"], ranges: [] },
  { key: "bia_soft_lean_mass", label: "Masse maigre molle", unit: "kg", examType: "BIA", category: "Composition corporelle", aliases: ["masse maigre molle","soft lean mass","slm"], ranges: [] },
  { key: "bia_total_minerals", label: "Minéraux totaux", unit: "kg", examType: "BIA", category: "Composition corporelle", aliases: ["minéraux totaux","total minerals","minerals","tbm"], ranges: [] },
  { key: "bia_extracellular_solids", label: "Solides extracellulaires", unit: "kg", examType: "BIA", category: "Composition corporelle", aliases: ["solides extracellulaires","extracellular solids","ecs"], ranges: [] },
  // Hydratation supplémentaire
  { key: "bia_fat_free_water", label: "Eau de masse maigre", unit: "L", examType: "BIA", category: "Hydratation", aliases: ["eau masse maigre","fat free water","ffm water"], ranges: [] },
  { key: "bia_ffm_hydration", label: "Hydratation masse maigre (TBW/FFM)", unit: "%", examType: "BIA", category: "Hydratation", aliases: ["hydratation masse maigre","tbw/ffm","fat free mass hydration","ffm hydration"], ranges: [{min:71,max:74}] },
  { key: "bia_hydration_level", label: "Niveau d'hydratation global", unit: "%", examType: "BIA", category: "Hydratation", aliases: ["niveau d'hydratation","hydration level","niveau hydratation"], ranges: [] },
  { key: "bia_fat_free_hydration_level", label: "Hydratation masse maigre (niveau)", unit: "%", examType: "BIA", category: "Hydratation", aliases: ["fat free hydration level","hydratation masse maigre niveau"], ranges: [] },
  // Impédances brutes par fréquence
  { key: "bia_z500_impedance", label: "Impédance Z500 (500kHz)", unit: "Ω", examType: "BIA", category: "Marqueurs bioélectriques", aliases: ["impédance z500","z500","z 500","500khz impedance"], ranges: [] },
  { key: "bia_z200_impedance", label: "Impédance Z200 (200kHz)", unit: "Ω", examType: "BIA", category: "Marqueurs bioélectriques", aliases: ["impédance z200","z200","z 200","200khz impedance"], ranges: [] },
  { key: "bia_z100_impedance", label: "Impédance Z100 (100kHz)", unit: "Ω", examType: "BIA", category: "Marqueurs bioélectriques", aliases: ["impédance z100","z100","z 100","100khz impedance"], ranges: [] },
  { key: "bia_z20_impedance", label: "Impédance Z20 (20kHz)", unit: "Ω", examType: "BIA", category: "Marqueurs bioélectriques", aliases: ["impédance z20","z20","z 20","20khz impedance"], ranges: [] },
  { key: "bia_z5_impedance", label: "Impédance Z5 (5kHz)", unit: "Ω", examType: "BIA", category: "Marqueurs bioélectriques", aliases: ["impédance z5","z5","z 5","5khz impedance"], ranges: [] },
  // Ratios supplémentaires
  { key: "bia_e_i_ratio", label: "Ratio E/I (ECW/ICW)", unit: "", examType: "BIA", category: "Marqueurs bioélectriques", aliases: ["ratio e/i","e/i ratio","ecw/icw","ratio extracellulaire/intracellulaire"], ranges: [] },
  { key: "bia_tbw_ffm_ratio", label: "Ratio TBW/FFM", unit: "%", examType: "BIA", category: "Hydratation", aliases: ["tbw/ffm","ratio tbw/ffm","tbw ffm ratio"], ranges: [{min:71,max:74}] },
  { key: "bia_fat_lean_ratio", label: "Ratio Graisse/Maigre", unit: "", examType: "BIA", category: "Composition corporelle", aliases: ["ratio graisse/maigre","fat/lean ratio","fat lean ratio"], ranges: [] },
  // Métabolisme
  { key: "bia_basal_metabolic_rate_ref", label: "Métabolisme de base référence", unit: "kcal", examType: "BIA", category: "Métabolisme", aliases: ["métabolisme de base référence","reference bmr","estimated reference","bmr reference","mb référence"], ranges: [] },
  { key: "bia_total_energy_expenditure", label: "Dépense énergétique totale", unit: "kcal", examType: "BIA", category: "Métabolisme", aliases: ["dépense énergétique totale","total energy expenditure","dee","tee","energy expenditure"], ranges: [] },
  { key: "bia_recommended_intake_min", label: "Apport recommandé minimum", unit: "kcal", examType: "BIA", category: "Métabolisme", aliases: ["apport recommandé minimum","recomm. intake min","recommended intake min","apport min"], ranges: [] },
  { key: "bia_recommended_intake_max", label: "Apport recommandé maximum", unit: "kcal", examType: "BIA", category: "Métabolisme", aliases: ["apport recommandé maximum","recomm. intake max","recommended intake max","apport max"], ranges: [] },
  // Gaps théoriques
  { key: "bia_fat_mass_gap", label: "Écart masse grasse (gap théorique)", unit: "kg", examType: "BIA", category: "Gaps théoriques", aliases: ["écart masse grasse","theoretical gap fat mass","fat mass gap","gap fm"], ranges: [] },
  { key: "bia_muscle_mass_gap", label: "Écart masse musculaire (gap théorique)", unit: "kg", examType: "BIA", category: "Gaps théoriques", aliases: ["écart masse musculaire","theoretical gap muscle mass","muscle mass gap","gap smm"], ranges: [] },
  { key: "bia_water_volume_gap", label: "Écart volume d'eau (gap théorique)", unit: "L", examType: "BIA", category: "Gaps théoriques", aliases: ["écart volume d'eau","theoretical gap water volume","water volume gap","gap water"], ranges: [] },
  { key: "bia_bone_mineral_gap", label: "Écart minéral osseux (gap théorique)", unit: "kg", examType: "BIA", category: "Gaps théoriques", aliases: ["écart minéral osseux","theoretical gap bone mineral","bone mineral gap","gap bmc"], ranges: [] },
  // Scores de risque
  { key: "bia_cardiovascular_risk_score", label: "Score risque cardiovasculaire", unit: "/3", examType: "BIA", category: "Scores de risque", aliases: ["score risque cardiovasculaire","cardiovascular risk score","cardiovascular risk","risque cardio"], ranges: [{min:0,max:1}] },
  { key: "bia_metabolic_risk_score", label: "Score risque métabolique", unit: "/3", examType: "BIA", category: "Scores de risque", aliases: ["score risque métabolique","metabolic risk score","metabolic risk","risque métabolique"], ranges: [{min:0,max:1}] },

  // ══ DXA ══
  { key: "dxa_tscore_spine", label: "T-score rachis", unit: "DS", examType: "DXA_BONE", category: "Densité osseuse", aliases: ["t-score rachis","t-score l1-l4","t score rachis lombaire","t-score lombaire"], ranges: [{min:-1}] },
  { key: "dxa_zscore_spine", label: "Z-score rachis", unit: "DS", examType: "DXA_BONE", category: "Densité osseuse", aliases: ["z-score rachis","z-score l1-l4","z score rachis lombaire"], ranges: [{min:-2}] },
  { key: "dxa_tscore_hip", label: "T-score hanche totale", unit: "DS", examType: "DXA_BONE", category: "Densité osseuse", aliases: ["t-score hanche","t-score hanche totale","t score hanche"], ranges: [{min:-1}] },
  { key: "dxa_tscore_neck", label: "T-score col fémoral", unit: "DS", examType: "DXA_BONE", category: "Densité osseuse", aliases: ["t-score col fémoral","t-score col du fémur","t score col femoral"], ranges: [{min:-1}] },
  { key: "dxa_zscore_hip", label: "Z-score hanche", unit: "DS", examType: "DXA_BONE", category: "Densité osseuse", aliases: ["z-score hanche","z score hanche"], ranges: [{min:-2}] },
  { key: "dxa_bmd_spine", label: "DMO rachis (L1-L4)", unit: "g/cm²", examType: "DXA_BONE", category: "Densité osseuse", aliases: ["dmo rachis","bmd spine","bmd l1-l4","densité minérale osseuse rachis"], ranges: [] },
  { key: "dxa_bmd_hip", label: "DMO hanche totale", unit: "g/cm²", examType: "DXA_BONE", category: "Densité osseuse", aliases: ["dmo hanche","bmd hip","densité minérale osseuse hanche"], ranges: [] },
  { key: "dxa_bmd_neck", label: "DMO col fémoral", unit: "g/cm²", examType: "DXA_BONE", category: "Densité osseuse", aliases: ["dmo col fémoral","bmd neck","bmd femoral neck","densité col"], ranges: [] },
  { key: "dxa_total_fat_pct", label: "Masse grasse totale DXA", unit: "%", examType: "DXA_BODY", category: "Composition corporelle", aliases: ["masse grasse totale dxa","dxa fat %","% masse grasse dxa","total fat %"], ranges: [] },
  { key: "dxa_trunk_fat_pct", label: "Masse grasse tronculaire", unit: "%", examType: "DXA_BODY", category: "Composition corporelle", aliases: ["masse grasse tronculaire","trunk fat","% graisse tronc"], ranges: [] },
  { key: "dxa_lean_mass", label: "Masse maigre DXA", unit: "kg", examType: "DXA_BODY", category: "Composition corporelle", aliases: ["masse maigre dxa","dxa lean mass","lean tissue mass"], ranges: [] },
  { key: "dxa_vat_volume", label: "Volume graisse viscérale (VAT)", unit: "cm³", examType: "DXA_BODY", category: "Composition corporelle", aliases: ["graisse viscérale","vat","volume graisse viscérale","visceral adipose tissue"], ranges: [] },

  // ══ CALORIMÉTRIE ══
  { key: "calori_rq", label: "Quotient respiratoire", unit: "", examType: "CALORIMETRY", category: "Métabolisme", aliases: ["qr","rq","quotient respiratoire"], ranges: [{min:0.7,max:1}] },

  // ══ ECG ══
  { key: "ecg_qtc_ms", label: "QTc", unit: "ms", examType: "ECG", category: "Repolarisation", aliases: ["qtc","qt corrigé","qtc bazett","qtc (ms)"], ranges: [{max:440,sex:"MALE"},{max:460,sex:"FEMALE"}], criticalHigh: 500 },
  { key: "ecg_pr_ms", label: "Intervalle PR", unit: "ms", examType: "ECG", category: "Conduction", aliases: ["intervalle pr","pr","pr (ms)","pr interval"], ranges: [{min:120,max:200}] },
  { key: "ecg_qrs_ms", label: "QRS", unit: "ms", examType: "ECG", category: "Conduction", aliases: ["durée qrs","qrs","qrs (ms)","qrs duration"], ranges: [{max:120}] },
  { key: "ecg_heart_rate", label: "FC (ECG)", unit: "bpm", examType: "ECG", category: "Rythme", aliases: ["fc ecg","fréquence cardiaque ecg","heart rate ecg","fc (ecg)","rythme sinusal"], ranges: [{min:60,max:100}], criticalLow: 40, criticalHigh: 150 },
  { key: "ecg_qt_ms", label: "Intervalle QT", unit: "ms", examType: "ECG", category: "Repolarisation", aliases: ["intervalle qt","qt","qt (ms)","qt interval"], ranges: [] },
  { key: "ecg_axis_degrees", label: "Axe QRS", unit: "°", examType: "ECG", category: "Axe", aliases: ["axe qrs","axe électrique","axis","qrs axis","axe cardiaque"], ranges: [{min:-30,max:90}] },

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
  { key: "eat26_score",         label: "EAT-26",                      unit: "", examType: "PSYCHIATRY_SCALES", category: "TCA",      aliases: ["eat-26","eat26"],            ranges: [{max:20,label:"Normal"}] },
  { key: "scoff_score",         label: "SCOFF",                       unit: "", examType: "PSYCHIATRY_SCALES", category: "TCA",      aliases: ["scoff"],                    ranges: [{max:1, label:"Négatif"}] },
  { key: "edeq_global",         label: "EDE-Q (global)",              unit: "/6", examType: "PSYCHIATRY_SCALES", category: "TCA",    aliases: ["ede-q","edeq","ede_q global"], ranges: [{max:1.74,label:"Normal"}] },
  { key: "edeq_restraint",      label: "EDE-Q — Restriction",         unit: "/6", examType: "PSYCHIATRY_SCALES", category: "TCA",    aliases: ["edeq restriction"],         ranges: [{max:1.74,label:"Normal"}] },
  { key: "edeq_eating_concern", label: "EDE-Q — Préocc. alimentaire", unit: "/6", examType: "PSYCHIATRY_SCALES", category: "TCA",    aliases: ["edeq eating concern"],      ranges: [{max:1.74,label:"Normal"}] },
  { key: "edeq_shape_concern",  label: "EDE-Q — Préocc. corporelle",  unit: "/6", examType: "PSYCHIATRY_SCALES", category: "TCA",    aliases: ["edeq shape concern"],       ranges: [{max:1.74,label:"Normal"}] },
  { key: "edeq_weight_concern", label: "EDE-Q — Préocc. pondérale",   unit: "/6", examType: "PSYCHIATRY_SCALES", category: "TCA",    aliases: ["edeq weight concern"],      ranges: [{max:1.74,label:"Normal"}] },

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
