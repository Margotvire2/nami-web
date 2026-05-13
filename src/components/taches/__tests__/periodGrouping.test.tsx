import { describe, it, expect } from "vitest";
import type { TaskWithContext } from "@/lib/api";
import {
  getTaskPeriod,
  groupTasksByPeriod,
  isOverdue,
  isToday,
  buildCancelDescription,
  applyOwnershipFilter,
} from "../_utils";

function makeTask(overrides: Partial<TaskWithContext> = {}): TaskWithContext {
  return {
    id: "t1",
    title: "Test",
    taskType: "OTHER",
    status: "PENDING",
    priority: "MEDIUM",
    description: null,
    dueDate: null,
    createdAt: new Date().toISOString(),
    assignedTo: null,
    createdBy: { id: "u1", firstName: "Alice", lastName: "Test" },
    careCase: {
      id: "cc1",
      caseTitle: "Suivi",
      patient: { id: "p1", firstName: "Jean", lastName: "Patient" },
    },
    ...overrides,
  };
}

function isoDaysFromNow(delta: number): string {
  const d = new Date();
  d.setDate(d.getDate() + delta);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

describe("getTaskPeriod", () => {
  it("classe une tâche dueDate=hier PENDING en 'overdue'", () => {
    const t = makeTask({ dueDate: isoDaysFromNow(-1) });
    expect(getTaskPeriod(t)).toBe("overdue");
  });

  it("classe une tâche dueDate=aujourd'hui PENDING en 'today'", () => {
    const t = makeTask({ dueDate: isoDaysFromNow(0) });
    expect(getTaskPeriod(t)).toBe("today");
  });

  it("classe une tâche dueDate=demain PENDING en 'upcoming'", () => {
    const t = makeTask({ dueDate: isoDaysFromNow(1) });
    expect(getTaskPeriod(t)).toBe("upcoming");
  });

  it("classe une tâche sans dueDate en 'upcoming'", () => {
    const t = makeTask({ dueDate: null });
    expect(getTaskPeriod(t)).toBe("upcoming");
  });

  it("classe COMPLETED en 'completed' même si dueDate aujourd'hui", () => {
    const t = makeTask({ status: "COMPLETED", dueDate: isoDaysFromNow(0) });
    expect(getTaskPeriod(t)).toBe("completed");
  });

  it("classe CANCELLED en 'completed' même si dueDate hier", () => {
    const t = makeTask({ status: "CANCELLED", dueDate: isoDaysFromNow(-3) });
    expect(getTaskPeriod(t)).toBe("completed");
  });
});

describe("groupTasksByPeriod", () => {
  it("groupe correctement 4 tâches sur les 4 périodes", () => {
    const tasks = [
      makeTask({ id: "a", dueDate: isoDaysFromNow(-2) }),
      makeTask({ id: "b", dueDate: isoDaysFromNow(0) }),
      makeTask({ id: "c", dueDate: isoDaysFromNow(3) }),
      makeTask({ id: "d", status: "COMPLETED" }),
    ];
    const groups = groupTasksByPeriod(tasks);
    expect(groups.overdue.map((t) => t.id)).toEqual(["a"]);
    expect(groups.today.map((t) => t.id)).toEqual(["b"]);
    expect(groups.upcoming.map((t) => t.id)).toEqual(["c"]);
    expect(groups.completed.map((t) => t.id)).toEqual(["d"]);
  });

  it("retourne 4 groupes vides sur input vide", () => {
    const g = groupTasksByPeriod([]);
    expect(g.overdue).toEqual([]);
    expect(g.today).toEqual([]);
    expect(g.upcoming).toEqual([]);
    expect(g.completed).toEqual([]);
  });
});

describe("isOverdue / isToday", () => {
  it("isOverdue=false si COMPLETED même avec dueDate passée", () => {
    const t = makeTask({ status: "COMPLETED", dueDate: isoDaysFromNow(-5) });
    expect(isOverdue(t)).toBe(false);
  });

  it("isOverdue=false sans dueDate", () => {
    expect(isOverdue(makeTask())).toBe(false);
  });

  it("isToday détecte le jour calendaire local", () => {
    const t = makeTask({ dueDate: isoDaysFromNow(0) });
    expect(isToday(t)).toBe(true);
  });
});

describe("buildCancelDescription", () => {
  it("préfixe seul si description vide", () => {
    const r = buildCancelDescription(null, "doublon avec autre tâche");
    expect(r).toMatch(/\[Annulée le \d{2}\/\d{2}\/\d{4} — doublon avec autre tâche\]/);
  });

  it("concatène à la description existante avec séparateur", () => {
    const r = buildCancelDescription(
      "Vérifier le bilan biologique",
      "patient non joignable depuis 2 mois",
    );
    expect(r).toMatch(/^Vérifier le bilan biologique\n\n\[Annulée le/);
    expect(r).toContain("patient non joignable depuis 2 mois");
  });

  it("trim les espaces et préserve le motif tel quel", () => {
    const r = buildCancelDescription("   ", "  motif testé  ");
    expect(r).toContain("motif testé");
    expect(r.startsWith("[")).toBe(true);
  });
});

describe("applyOwnershipFilter", () => {
  const me = "me-id";
  const tasks = [
    makeTask({
      id: "a",
      assignedTo: { id: me, firstName: "A", lastName: "B" },
    }),
    makeTask({
      id: "b",
      assignedTo: { id: "other", firstName: "C", lastName: "D" },
    }),
    makeTask({ id: "c", assignedTo: null }),
  ];

  it("'all' retourne tout", () => {
    expect(applyOwnershipFilter(tasks, "all", me).map((t) => t.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("'mine' ne retient que les tâches assignedTo=me", () => {
    expect(applyOwnershipFilter(tasks, "mine", me).map((t) => t.id)).toEqual([
      "a",
    ]);
  });

  it("'team' = pas assignées à me (incl. unassigned)", () => {
    expect(applyOwnershipFilter(tasks, "team", me).map((t) => t.id)).toEqual([
      "b",
      "c",
    ]);
  });

  it("fallback : myPersonId absent → no-op", () => {
    expect(
      applyOwnershipFilter(tasks, "mine", undefined).map((t) => t.id),
    ).toEqual(["a", "b", "c"]);
  });
});
