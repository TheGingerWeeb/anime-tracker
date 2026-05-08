import { describe, it, expect } from "vitest";

describe("Frontend Sorting Logic", () => {
  it("should sort groups by primary site status (Active first)", () => {
    const testGroups = [
      {
        name: "Group1",
        sites: [
          { status: "Down", name: "Site1" },
          { status: "Active", name: "Site2" },
        ],
      },
      {
        name: "Group2",
        sites: [{ status: "Active", name: "Site3" }],
      },
      {
        name: "Group3",
        sites: [{ status: "Unknown", name: "Site4" }],
      },
    ];

    const statusOrder = { Active: 0, Down: 1, Unknown: 2 };

    const sorted = testGroups.sort((groupA, groupB) => {
      const primaryA = groupA.sites.find((s) => s.status === "Active") || groupA.sites[0];
      const primaryB = groupB.sites.find((s) => s.status === "Active") || groupB.sites[0];

      const orderA = statusOrder[primaryA.status as keyof typeof statusOrder] ?? 3;
      const orderB = statusOrder[primaryB.status as keyof typeof statusOrder] ?? 3;

      return orderA - orderB;
    });

    expect(sorted[0].name).toBe("Group1");
    expect(sorted[1].name).toBe("Group2");
    expect(sorted[2].name).toBe("Group3");
  });

  it("should prioritize Active status over Down", () => {
    const testGroups = [
      { name: "AllDown", sites: [{ status: "Down", name: "Site1" }] },
      { name: "AllActive", sites: [{ status: "Active", name: "Site2" }] },
    ];

    const statusOrder = { Active: 0, Down: 1, Unknown: 2 };

    const sorted = testGroups.sort((groupA, groupB) => {
      const primaryA = groupA.sites[0];
      const primaryB = groupB.sites[0];

      const orderA = statusOrder[primaryA.status as keyof typeof statusOrder] ?? 3;
      const orderB = statusOrder[primaryB.status as keyof typeof statusOrder] ?? 3;

      return orderA - orderB;
    });

    expect(sorted[0].name).toBe("AllActive");
    expect(sorted[1].name).toBe("AllDown");
  });

  it("should prioritize Down status over Unknown", () => {
    const testGroups = [
      { name: "AllUnknown", sites: [{ status: "Unknown", name: "Site1" }] },
      { name: "AllDown", sites: [{ status: "Down", name: "Site2" }] },
    ];

    const statusOrder = { Active: 0, Down: 1, Unknown: 2 };

    const sorted = testGroups.sort((groupA, groupB) => {
      const primaryA = groupA.sites[0];
      const primaryB = groupB.sites[0];

      const orderA = statusOrder[primaryA.status as keyof typeof statusOrder] ?? 3;
      const orderB = statusOrder[primaryB.status as keyof typeof statusOrder] ?? 3;

      return orderA - orderB;
    });

    expect(sorted[0].name).toBe("AllDown");
    expect(sorted[1].name).toBe("AllUnknown");
  });
});
