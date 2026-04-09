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

describe("rating validation", () => {
  test("accepts all three ratings omitted (null)", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      colleaguesRating: null,
      workLifeBalanceRating: null,
      excitementRating: null,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts all three ratings omitted (undefined)", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts valid ratings of 1 (minimum)", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      colleaguesRating: 1,
      workLifeBalanceRating: 1,
      excitementRating: 1,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts valid ratings of 10 (maximum)", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      colleaguesRating: 10,
      workLifeBalanceRating: 10,
      excitementRating: 10,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a mix of rated and unrated fields", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      colleaguesRating: 7,
      workLifeBalanceRating: null,
      excitementRating: 5,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects colleaguesRating of 0 (below minimum)", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      colleaguesRating: 0,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Colleagues rating must be an integer between 1 and 10");
  });

  test("rejects workLifeBalanceRating of 11 (above maximum)", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      workLifeBalanceRating: 11,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Work/life balance rating must be an integer between 1 and 10");
  });

  test("rejects excitementRating of -1 (negative)", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      excitementRating: -1,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Excitement rating must be an integer between 1 and 10");
  });

  test("rejects a non-integer rating (decimal)", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      colleaguesRating: 5.5,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Colleagues rating must be an integer between 1 and 10");
  });

  test("reports errors for multiple invalid ratings simultaneously", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      colleaguesRating: 0,
      workLifeBalanceRating: 11,
      excitementRating: 5.5,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(3);
    expect(result.errors).toContain("Colleagues rating must be an integer between 1 and 10");
    expect(result.errors).toContain("Work/life balance rating must be an integer between 1 and 10");
    expect(result.errors).toContain("Excitement rating must be an integer between 1 and 10");
  });
});
