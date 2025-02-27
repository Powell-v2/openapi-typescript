import { expect } from "chai";
import { execSync } from "child_process";
import eol from "eol";
import fs from "fs";

// Note(drew): OpenAPI support is already well-tested in v2/index.test.ts and
// v3/index.test.ts. Only use these tests for testing CLI flags.

const cmd = `node ../../bin/cli.js`;
const cwd = new URL(".", import.meta.url);

describe("cli", () => {
  it("--prettier-config (JSON)", async () => {
    execSync(`${cmd} specs/petstore.yaml -o generated/prettier-json.ts --prettier-config fixtures/.prettierrc`, {
      cwd,
    });
    const generated = fs.readFileSync(new URL("./generated/prettier-json.ts", cwd), "utf8");
    const expected = eol.lf(fs.readFileSync(new URL("./expected/prettier-json.ts", cwd), "utf8"));
    expect(generated).to.equal(expected);
  });

  it("--prettier-config (.js)", async () => {
    execSync(`${cmd} specs/petstore.yaml -o generated/prettier-js.ts --prettier-config fixtures/prettier.config.js`, {
      cwd,
    });
    const generated = fs.readFileSync(new URL("./generated/prettier-js.ts", cwd), "utf8");
    const expected = eol.lf(fs.readFileSync(new URL("./expected/prettier-js.ts", cwd), "utf8"));
    expect(generated).to.equal(expected);
  });

  it("stdout", async () => {
    const generated = execSync(`${cmd} specs/petstore.yaml`, { cwd });
    const expected = eol.lf(fs.readFileSync(new URL("./expected/stdout.ts", cwd), "utf8"));
    expect(generated.toString("utf8")).to.equal(expected);
  });

  it("stdin", async () => {
    execSync(`${cmd} - -o generated/stdin.ts < ./specs/petstore.yaml`, {
      cwd,
    });
    const generated = fs.readFileSync(new URL("./generated/stdin.ts", cwd), "utf8");
    const expected = eol.lf(fs.readFileSync(new URL("./expected/stdin.ts", cwd), "utf8"));
    expect(generated).to.equal(expected);
  });

  it("supports glob paths", async () => {
    execSync(`${cmd} "specs/*.yaml" -o generated/`, { cwd }); // Quotes are necessary because shells like zsh treats glob weirdly
    const generatedPetstore = fs.readFileSync(new URL("./generated/specs/petstore.ts", cwd), "utf8");
    const expectedPetstore = eol.lf(fs.readFileSync(new URL("./expected/specs/petstore.ts", cwd), "utf8"));
    expect(generatedPetstore).to.equal(expectedPetstore);

    const generatedManifold = fs.readFileSync(new URL("./generated/specs/manifold.ts", cwd), "utf8");
    const expectedManifold = eol.lf(fs.readFileSync(new URL("./expected/specs/manifold.ts", cwd), "utf8"));
    expect(generatedManifold).to.equal(expectedManifold);
  });

  it("--header", async () => {
    // note: we can’t check headers passed to fetch() without mocking (and overcomplicating/flake-ifying the tests). simply testing the parsing is the biggest win.
    expect(() =>
      execSync(
        `${cmd} https://raw.githubusercontent.com/drwpow/openapi-typescript/main/test/v2/specs/manifold.yaml --header "x-openapi-format:json" --header "x-openapi-version:3.0.1"`,
        { cwd }
      ).toString("utf8")
    ).not.to.throw();
  });

  it("--headersObject", async () => {
    // note: same as above—testing the parser is the biggest win; values can be tested trivially with manual debugging
    expect(() => {
      execSync(
        `${cmd} https://raw.githubusercontent.com/drwpow/openapi-typescript/main/test/v2/specs/manifold.yaml --headersObject "{\\"x-boolean\\":true, \\"x-number\\":3.0, \\"x-string\\": \\"openapi\\"}"`,
        { cwd }
      );
    }).not.to.throw();
  });
});
