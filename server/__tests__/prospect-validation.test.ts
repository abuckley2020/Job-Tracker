import { validateProspect } from "../prospect-helpers";

describe("prospect creation validation", () => {
  test("rejects a blank company name", () => {
    const result = validateProspect({
      companyName: "",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Company name is required");
  });

  test("rejects a blank role title", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Role title is required");
  });
});

describe("salary validation", () => {
  test("accepts a valid single salary like $120,000", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salary: "$120,000",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a valid salary range like $80,000 - $100,000", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salary: "$80,000 - $100,000",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts when salary is omitted", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts when salary is null", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salary: null,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts when salary is an empty string", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salary: "",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects a salary without dollar sign", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salary: "120000",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Salary must be in the format $XXX,XXX or a range like $XXX,XXX - $XXX,XXX",
    );
  });

  test("rejects a salary with incorrect comma placement", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salary: "$1200,00",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Salary must be in the format $XXX,XXX or a range like $XXX,XXX - $XXX,XXX",
    );
  });

  test("rejects a malformed salary range", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salary: "$80000 to $100000",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Salary must be in the format $XXX,XXX or a range like $XXX,XXX - $XXX,XXX",
    );
  });
});
